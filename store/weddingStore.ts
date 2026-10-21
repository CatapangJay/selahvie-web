"use client";

import { create } from "zustand";
import type { GuestGroup, GuestListEntry, RSVPEntry, WeddingConfig } from "@/types/wedding";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNT } from "@/lib/constants";
import { generateInviteCode, normalizeName, stripFromAudiences } from "@/lib/invitations";
import { stripGuest } from "@/lib/seating";
import { fetchAllRows } from "@/lib/db/paging";
import {
  fromGroupRow,
  fromGuestRow,
  fromRsvpRow,
  fromWeddingRow,
  groupRow,
  guestColumns,
  guestRow,
  memberRows,
  membershipIndex,
  weddingPatch,
  type GroupRow,
  type GuestRow,
  type MemberRow,
  type RsvpRow,
  type WeddingRow,
} from "@/lib/db/mappers";

/** Summary of RSVP activity for one wedding, derived from stored entries. */
export interface RsvpSummary {
  total: number;
  attending: number;
  declined: number;
  guestCount: number; // attending heads incl. plus-ones
  mealTally: Record<string, number>;
}

export type NewGuest = Omit<GuestListEntry, "id" | "createdAt" | "inviteCode" | "groupIds"> & {
  groupIds?: string[];
};

export interface ImportGuestRow {
  name: string;
  email?: string;
  partySize: number;
  status?: GuestListEntry["status"];
  side?: GuestListEntry["side"];
  note?: string;
  groupNames: string[];
}

export interface ImportResult {
  added: number;
  skipped: number;
  groupsCreated: number;
}

export type LoadStatus = "idle" | "loading" | "ready" | "error";

interface WeddingState {
  /** Loading state of the signed-in user's websites. */
  status: LoadStatus;
  /** Why loading failed, or the last change that couldn't be saved. */
  error: string | null;
  userId: string | null;
  /** Lowercased email of the signed-in owner. */
  email: string | null;
  configs: Record<string, WeddingConfig>;
  rsvps: RSVPEntry[];
  guests: GuestListEntry[];
  groups: GuestGroup[];

  /** Load this user's websites, guest lists and RSVPs from Supabase (no-op if already loaded). */
  load: (user: { id: string; email: string }) => Promise<void>;
  /** Re-fetch everything after saving pending edits. */
  reload: () => Promise<void>;
  /** Forget everything (signed out). */
  reset: () => void;
  /** Save pending edits now and wait for every queued write. */
  flush: () => Promise<void>;
  dismissError: () => void;

  // Config lifecycle (edits are saved shortly after the last change)
  updateConfig: (id: string, data: Partial<WeddingConfig>) => void;
  /** Publish under `baseSlug` (or `baseSlug-2`, `-3`… if taken). Resolves to the slug used. */
  publishConfig: (id: string, baseSlug: string) => Promise<string>;
  getConfig: (id: string) => WeddingConfig | undefined;

  // RSVPs (written by public wedding sites, read by the dashboard)
  getRsvps: (weddingId: string) => RSVPEntry[];
  getRsvpSummary: (weddingId: string) => RsvpSummary;

  // Guest list (managed from the dashboard)
  addGuest: (entry: NewGuest) => string;
  updateGuest: (id: string, data: Partial<GuestListEntry>) => void;
  removeGuest: (id: string) => void;
  getGuests: (weddingId: string) => GuestListEntry[];
  /** Bulk add from CSV. Creates missing groups by name; skips rows already on the list. */
  importGuests: (weddingId: string, rows: ImportGuestRow[]) => ImportResult;

  // Guest groups
  addGroup: (weddingId: string, name: string) => string;
  renameGroup: (id: string, name: string) => void;
  removeGroup: (id: string) => void;
}

const SAVE_DELAY_MS = 600;
const CHUNK = 500;
const UNIQUE_VIOLATION = "23505";
const SAVE_ERROR = "We couldn't save your last change. Your websites were reloaded — please try again.";
/** Where websites lived before they moved to Supabase (zustand persist blob). */
const LEGACY_KEY = "selahvie-weddings";

const empty = { configs: {}, rsvps: [], guests: [], groups: [] };

const takenCodes = (guests: GuestListEntry[], groups: GuestGroup[]) =>
  new Set([...guests.map((g) => g.inviteCode), ...groups.map((g) => g.inviteCode)]);

async function must(request: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await request;
  if (error) throw new Error(error.message);
}

async function insertChunked(table: string, rows: object[]) {
  const supabase = createClient();
  for (let i = 0; i < rows.length; i += CHUNK) {
    await must(supabase.from(table).insert(rows.slice(i, i + CHUNK)));
  }
}

async function fetchOwned(userId: string, email: string) {
  const supabase = createClient();
  const weddings = await fetchAllRows<WeddingRow>((from, to) =>
    supabase.from("weddings").select("*").eq("owner_id", userId).order("created_at").order("id").range(from, to)
  );
  const ids = weddings.map((w) => w.id);
  if (ids.length === 0) return empty;

  const [guestRows, groupRows, members, rsvpRows] = await Promise.all([
    fetchAllRows<GuestRow>((from, to) =>
      supabase.from("guests").select("*").in("wedding_id", ids).order("created_at").order("id").range(from, to)
    ),
    fetchAllRows<GroupRow>((from, to) =>
      supabase.from("guest_groups").select("*").in("wedding_id", ids).order("created_at").order("id").range(from, to)
    ),
    fetchAllRows<MemberRow>((from, to) =>
      supabase.from("guest_group_members").select("*").in("wedding_id", ids).order("guest_id").order("group_id").range(from, to)
    ),
    fetchAllRows<RsvpRow>((from, to) =>
      supabase.from("rsvps").select("*").in("wedding_id", ids).order("submitted_at").order("id").range(from, to)
    ),
  ]);
  const index = membershipIndex(members);
  return {
    configs: Object.fromEntries(weddings.map((w) => [w.id, fromWeddingRow(w, email)])),
    guests: guestRows.map((g) => fromGuestRow(g, index.get(g.id) ?? [])),
    groups: groupRows.map(fromGroupRow),
    rsvps: rsvpRows.map(fromRsvpRow),
  };
}

interface LegacyState {
  configs?: Record<string, WeddingConfig>;
  groups?: GuestGroup[];
  guests?: GuestListEntry[];
  rsvps?: RSVPEntry[];
  guestbook?: { weddingId: string }[];
}

/**
 * Websites made before accounts moved to Supabase were saved in this browser.
 * Copy the signed-in user's into their account once, then drop them locally.
 * Failures leave the local copy in place so the next sign-in can retry.
 */
async function importLegacyData(email: string) {
  let parsed: { state?: LegacyState } | null;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    parsed = JSON.parse(raw) as { state?: LegacyState } | null;
  } catch {
    return;
  }
  const state = parsed?.state ?? {};
  const mine = Object.values(state.configs ?? {}).filter(
    // The old demo seed is recreated server-side, so it isn't imported.
    (c) => c?.ownerEmail?.toLowerCase() === email && !String(c.id).startsWith("demo-")
  );
  if (mine.length === 0) return;

  const ids = new Set(mine.map((c) => c.id));
  const belongs = (x: { weddingId: string }) => ids.has(x.weddingId);
  const res = await fetch("/api/import-local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      configs: mine,
      groups: (state.groups ?? []).filter(belongs),
      guests: (state.guests ?? []).filter(belongs),
      rsvps: (state.rsvps ?? []).filter(belongs),
      guestbook: (state.guestbook ?? []).filter(belongs),
    }),
  });
  if (!res.ok) return;
  const { imported } = (await res.json()) as { imported: { oldId: string; newId: string }[] };
  const done = new Set(imported.map((i) => i.oldId));
  if (done.size === 0) return;

  const keep = (x: { weddingId: string }) => !done.has(x.weddingId);
  const configs = Object.fromEntries(Object.entries(state.configs ?? {}).filter(([id]) => !done.has(id)));
  if (Object.keys(configs).length === 0) {
    window.localStorage.removeItem(LEGACY_KEY);
    return;
  }
  window.localStorage.setItem(
    LEGACY_KEY,
    JSON.stringify({
      ...parsed,
      state: {
        ...state,
        configs,
        groups: (state.groups ?? []).filter(keep),
        guests: (state.guests ?? []).filter(keep),
        rsvps: (state.rsvps ?? []).filter(keep),
        guestbook: (state.guestbook ?? []).filter(keep),
      },
    })
  );
}

// ─── Write queue ─────────────────────────────────────────────────────────────
// Writes run one at a time in the order they were made, so a guest is always
// inserted before its group memberships, edits land in order, and so on.

let queue: Promise<void> = Promise.resolve();
/** Bumped on every load/reset so stale fetches and writes are ignored. */
let generation = 0;
const pendingKeys = new Map<string, Set<keyof WeddingConfig>>();
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useWeddingStore = create<WeddingState>()((set, get) => {
  const enqueue = (write: () => Promise<void>) => {
    const gen = generation;
    queue = queue
      .then(() => (gen === generation ? write() : undefined))
      .catch((err: unknown) => {
        if (gen !== generation) return;
        console.error("[weddingStore] save failed:", err instanceof Error ? err.message : err);
        set({ error: SAVE_ERROR });
        // Bring the screen back in line with what's actually saved.
        void get().reload();
      });
  };

  const saveConfig = (id: string) => {
    clearTimeout(saveTimers.get(id));
    saveTimers.delete(id);
    const keys = pendingKeys.get(id);
    pendingKeys.delete(id);
    const config = get().configs[id];
    if (!keys?.size || !config) return;
    const patch = weddingPatch(config, keys);
    if (Object.keys(patch).length === 0) return;
    enqueue(() => must(createClient().from("weddings").update(patch).eq("id", id)));
  };

  const cancelPendingSaves = () => {
    for (const timer of saveTimers.values()) clearTimeout(timer);
    saveTimers.clear();
    pendingKeys.clear();
  };

  return {
    status: "idle",
    error: null,
    userId: null,
    email: null,
    ...empty,

    load: async (user) => {
      const { userId, status } = get();
      if (userId === user.id && (status === "loading" || status === "ready")) return;
      const gen = ++generation;
      cancelPendingSaves();
      set({ status: "loading", error: null, userId: user.id, email: user.email, ...(userId === user.id ? {} : empty) });

      try {
        await importLegacyData(user.email).catch((err: unknown) => {
          console.error("[weddingStore] import of browser data failed:", err instanceof Error ? err.message : err);
        });
        let data = await fetchOwned(user.id, user.email);
        if (Object.keys(data.configs).length === 0 && user.email === DEMO_ACCOUNT.email) {
          const res = await fetch("/api/demo/seed", { method: "POST" });
          if (res.ok) data = await fetchOwned(user.id, user.email);
        }
        if (gen !== generation) return;
        set({ status: "ready", ...data });
      } catch (err) {
        if (gen !== generation) return;
        console.error("[weddingStore] load failed:", err instanceof Error ? err.message : err);
        set({ status: "error", error: "We couldn't load your websites. Check your connection and try again." });
      }
    },

    reload: async () => {
      const { userId, email } = get();
      if (!userId || !email) return;
      await get().flush();
      const gen = generation;
      try {
        const data = await fetchOwned(userId, email);
        if (gen === generation && get().userId === userId) set({ status: "ready", ...data });
      } catch (err) {
        console.error("[weddingStore] reload failed:", err instanceof Error ? err.message : err);
      }
    },

    reset: () => {
      generation += 1;
      cancelPendingSaves();
      set({ status: "idle", error: null, userId: null, email: null, ...empty });
    },

    flush: async () => {
      for (const id of [...pendingKeys.keys()]) saveConfig(id);
      await queue;
    },

    dismissError: () => set({ error: null }),

    // ─── Config ───
    updateConfig: (id, data) => {
      if (!get().configs[id]) return;
      set((state) => ({ configs: { ...state.configs, [id]: { ...state.configs[id], ...data } } }));
      const keys = pendingKeys.get(id) ?? new Set<keyof WeddingConfig>();
      for (const key of Object.keys(data) as (keyof WeddingConfig)[]) keys.add(key);
      pendingKeys.set(id, keys);
      clearTimeout(saveTimers.get(id));
      saveTimers.set(id, setTimeout(() => saveConfig(id), SAVE_DELAY_MS));
    },

    publishConfig: async (id, baseSlug) => {
      await get().flush();
      const supabase = createClient();
      for (let n = 1; n <= 50; n++) {
        const slug = n === 1 ? baseSlug : `${baseSlug}-${n}`;
        const { error } = await supabase.from("weddings").update({ slug, status: "published" }).eq("id", id);
        if (!error) {
          set((state) => ({ configs: { ...state.configs, [id]: { ...state.configs[id], slug, status: "published" } } }));
          return slug;
        }
        if (error.code !== UNIQUE_VIOLATION) throw new Error(error.message);
      }
      throw new Error("No free web address for this name.");
    },

    getConfig: (id) => get().configs[id],

    // ─── RSVP ───
    getRsvps: (weddingId) => get().rsvps.filter((r) => r.weddingId === weddingId),

    getRsvpSummary: (weddingId) => {
      const entries = get().rsvps.filter((r) => r.weddingId === weddingId);
      const summary: RsvpSummary = { total: entries.length, attending: 0, declined: 0, guestCount: 0, mealTally: {} };
      for (const r of entries) {
        if (r.attending) {
          summary.attending += 1;
          summary.guestCount += 1 + (r.additionalGuests ?? (r.plusOne ? 1 : 0));
          if (r.mealChoice) summary.mealTally[r.mealChoice] = (summary.mealTally[r.mealChoice] ?? 0) + 1;
        } else {
          summary.declined += 1;
        }
      }
      return summary;
    },

    // ─── Guest list ───
    addGuest: (entry) => {
      const { guests, groups } = get();
      const guest: GuestListEntry = {
        ...entry,
        groupIds: entry.groupIds ?? [],
        id: crypto.randomUUID(),
        inviteCode: generateInviteCode(takenCodes(guests, groups)),
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ guests: [...state.guests, guest] }));
      enqueue(async () => {
        await must(createClient().from("guests").insert(guestRow(guest)));
        if (guest.groupIds.length) await must(createClient().from("guest_group_members").insert(memberRows(guest, guest.groupIds)));
      });
      return guest.id;
    },

    updateGuest: (id, data) => {
      const before = get().guests.find((g) => g.id === id);
      if (!before) return;
      set((state) => ({ guests: state.guests.map((g) => (g.id === id ? { ...g, ...data } : g)) }));

      const columns = guestColumns(data);
      const added = data.groupIds?.filter((gid) => !before.groupIds.includes(gid)) ?? [];
      const removed = data.groupIds ? before.groupIds.filter((gid) => !data.groupIds?.includes(gid)) : [];
      enqueue(async () => {
        const supabase = createClient();
        if (Object.keys(columns).length) await must(supabase.from("guests").update(columns).eq("id", id));
        if (removed.length) await must(supabase.from("guest_group_members").delete().eq("guest_id", id).in("group_id", removed));
        if (added.length) await must(supabase.from("guest_group_members").insert(memberRows(before, added)));
      });
    },

    removeGuest: (id) => {
      const guest = get().guests.find((g) => g.id === id);
      if (!guest) return;
      set((state) => ({
        guests: state.guests.filter((g) => g.id !== id),
        rsvps: state.rsvps.map((r) => (r.guestId === id ? { ...r, guestId: undefined } : r)),
      }));
      const config = get().configs[guest.weddingId];
      if (config) {
        const seatingPlan = stripGuest(config.seatingPlan, id);
        get().updateConfig(config.id, {
          ...stripFromAudiences(config, { guestId: id }),
          ...(seatingPlan ? { seatingPlan } : {}),
        });
      }
      enqueue(() => must(createClient().from("guests").delete().eq("id", id)));
    },

    getGuests: (weddingId) => get().guests.filter((g) => g.weddingId === weddingId),

    importGuests: (weddingId, rows) => {
      const state = get();
      const newGroups: GuestGroup[] = [];
      const codes = takenCodes(state.guests, state.groups);
      const now = new Date().toISOString();
      const result: ImportResult = { added: 0, skipped: 0, groupsCreated: 0 };
      const keyOf = (name: string, email?: string) => `${normalizeName(name)}|${(email ?? "").toLowerCase()}`;
      const existingKeys = new Set(
        state.guests.filter((g) => g.weddingId === weddingId).map((g) => keyOf(g.name, g.email))
      );

      const groupIdFor = (name: string) => {
        const key = name.trim().toLowerCase();
        const found = [...state.groups, ...newGroups].find(
          (g) => g.weddingId === weddingId && g.name.trim().toLowerCase() === key
        );
        if (found) return found.id;
        const inviteCode = generateInviteCode(codes);
        codes.add(inviteCode);
        const created: GuestGroup = { id: crypto.randomUUID(), weddingId, name: name.trim(), inviteCode, createdAt: now };
        newGroups.push(created);
        result.groupsCreated += 1;
        return created.id;
      };

      const added: GuestListEntry[] = [];
      for (const row of rows) {
        const name = row.name.trim();
        const email = row.email?.trim() || undefined;
        const key = keyOf(name, email);
        // Only de-dupe against the existing list, so a file may still contain
        // two different guests who share a name.
        if (!name || existingKeys.has(key)) {
          result.skipped += 1;
          continue;
        }
        const inviteCode = generateInviteCode(codes);
        codes.add(inviteCode);
        added.push({
          id: crypto.randomUUID(),
          weddingId,
          name,
          email,
          partySize: Math.max(1, Math.min(20, row.partySize || 1)),
          status: row.status ?? "invited",
          side: row.side,
          note: row.note?.trim() || undefined,
          groupIds: [...new Set(row.groupNames.filter((n) => n.trim()).map(groupIdFor))],
          inviteCode,
          createdAt: now,
        });
        result.added += 1;
      }

      if (added.length === 0 && newGroups.length === 0) return result;
      set((s) => ({ guests: [...s.guests, ...added], groups: [...s.groups, ...newGroups] }));
      enqueue(async () => {
        await insertChunked("guest_groups", newGroups.map(groupRow));
        await insertChunked("guests", added.map(guestRow));
        await insertChunked("guest_group_members", added.flatMap((g) => memberRows(g, g.groupIds)));
      });
      return result;
    },

    // ─── Groups ───
    addGroup: (weddingId, name) => {
      const { guests, groups } = get();
      const group: GuestGroup = {
        id: crypto.randomUUID(),
        weddingId,
        name: name.trim(),
        inviteCode: generateInviteCode(takenCodes(guests, groups)),
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ groups: [...state.groups, group] }));
      enqueue(() => must(createClient().from("guest_groups").insert(groupRow(group))));
      return group.id;
    },

    renameGroup: (id, name) => {
      set((state) => ({ groups: state.groups.map((g) => (g.id === id ? { ...g, name: name.trim() } : g)) }));
      enqueue(() => must(createClient().from("guest_groups").update({ name: name.trim() }).eq("id", id)));
    },

    removeGroup: (id) => {
      const group = get().groups.find((g) => g.id === id);
      if (!group) return;
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
        guests: state.guests.map((g) =>
          g.groupIds.includes(id) ? { ...g, groupIds: g.groupIds.filter((x) => x !== id) } : g
        ),
      }));
      const config = get().configs[group.weddingId];
      if (config) get().updateConfig(config.id, stripFromAudiences(config, { groupId: id }));
      enqueue(() => must(createClient().from("guest_groups").delete().eq("id", id)));
    },
  };
});

if (typeof window !== "undefined") {
  // Don't lose an edit made just before the tab closes or navigates away.
  window.addEventListener("pagehide", () => void useWeddingStore.getState().flush());
}
