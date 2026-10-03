"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WeddingConfig, RSVPEntry, GuestListEntry, GuestbookEntry, GuestGroup, Tier } from "@/types/wedding";
import { generateInviteCode, normalizeName, stripFromAudiences } from "@/lib/invitations";

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
  note?: string;
  groupNames: string[];
}

export interface ImportResult {
  added: number;
  skipped: number;
  groupsCreated: number;
}

interface WeddingState {
  configs: Record<string, WeddingConfig>;
  rsvps: RSVPEntry[];
  guests: GuestListEntry[];
  groups: GuestGroup[];
  guestbook: GuestbookEntry[];

  // Config lifecycle
  updateConfig: (id: string, data: Partial<WeddingConfig>) => void;
  publishConfig: (id: string) => void;
  getConfig: (id: string) => WeddingConfig | undefined;
  createConfig: (templateId: string, ownerEmail?: string, tier?: Tier) => string;
  /** Configs belonging to a given account (by lowercased email). */
  getConfigsByOwner: (ownerEmail: string) => WeddingConfig[];
  /** Seed demo purchases for an owner (idempotent). Used by the demo login. */
  seedDemoConfigs: (ownerEmail: string) => void;

  // RSVP (written by public wedding sites, read by the dashboard)
  addRsvp: (entry: Omit<RSVPEntry, "id" | "submittedAt">) => void;
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

  // Guestbook (well-wishes left by guests on the public site)
  addGuestbookEntry: (entry: Omit<GuestbookEntry, "id" | "createdAt">) => void;
  getGuestbook: (weddingId: string) => GuestbookEntry[];
}

const defaultConfig = (id: string, templateId: string, ownerEmail?: string, tier: Tier = "base"): WeddingConfig => ({
  id,
  templateId,
  slug: id,
  status: "draft",
  ownerEmail,
  tier,
  partner1Name: "",
  partner2Name: "",
  weddingDate: "",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  primaryColor: "#A75463",
  accentColor: "#C69D63",
  themePresetId: "",
  heroImageUrl: `https://picsum.photos/seed/${id}-hero/1200/800`,
  galleryImageUrls: [
    `https://picsum.photos/seed/${id}-g1/800/800`,
    `https://picsum.photos/seed/${id}-g2/800/800`,
    `https://picsum.photos/seed/${id}-g3/800/800`,
    `https://picsum.photos/seed/${id}-g4/800/800`,
  ],
  coupleStory: "",
  rsvpDeadline: "",
  mealOptions: ["Chicken", "Fish", "Vegetarian"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "none",
  musicCustomUrl: "",
  registryLinks: [],
  travel: { accommodations: "", directions: "", notes: "" },
  faq: [],
  weddingParty: [],
  schedule: [],
});

// Small unique-id helper. Date.now + counter avoids collisions within a tick.
let seq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const takenCodes = (guests: GuestListEntry[], groups: GuestGroup[]) =>
  new Set([...guests.map((g) => g.inviteCode), ...groups.map((g) => g.inviteCode)]);

export const useWeddingStore = create<WeddingState>()(
  persist(
    (set, get) => ({
      configs: {},
      rsvps: [],
      guests: [],
      groups: [],
      guestbook: [],

      createConfig: (templateId, ownerEmail, tier = "base") => {
        const id = `w-${Date.now()}-${(seq++).toString(36)}`;
        const owner = ownerEmail ? ownerEmail.trim().toLowerCase() : undefined;
        set((state) => ({
          configs: { ...state.configs, [id]: defaultConfig(id, templateId, owner, tier) },
        }));
        return id;
      },

      getConfigsByOwner: (ownerEmail) => {
        const owner = ownerEmail.trim().toLowerCase();
        return Object.values(get().configs).filter((c) => c.ownerEmail === owner);
      },

      seedDemoConfigs: (ownerEmail) => {
        const owner = ownerEmail.trim().toLowerCase();
        // Idempotent: only seed once per owner.
        const already = Object.values(get().configs).some(
          (c) => c.ownerEmail === owner && c.id.startsWith("demo-")
        );
        if (already) return;

        // A published Personalized site (with a couple's details + a small
        // guest list) and a fresh Base draft to customize or upgrade.
        const published: WeddingConfig = {
          ...defaultConfig("demo-eg", "t8", owner, "personalized"),
          slug: "alex-and-sam",
          status: "published",
          partner1Name: "Alex",
          partner2Name: "Sam",
          weddingDate: "2026-11-14",
          venueName: "The Willow Grove Estate",
          venueAddress: "24 Meadow Lane",
          venueCity: "Tagaytay City",
          primaryColor: "#d4af37",
          accentColor: "#7ec8a4",
          themePresetId: "eg1",
          coupleStory:
            "We met on a rainy afternoon and never really said goodbye. Two years of long walks and longer dinners later, here we are — ready for the rest of it.",
          rsvpDeadline: "2026-10-01",
        };

        const now = new Date().toISOString();
        const codes = takenCodes(get().guests, get().groups);
        const code = () => {
          const c = generateInviteCode(codes);
          codes.add(c);
          return c;
        };
        const family: GuestGroup = { id: "demo-grp-family", weddingId: published.id, name: "Family", inviteCode: code(), createdAt: now };
        const entourage: GuestGroup = { id: "demo-grp-entourage", weddingId: published.id, name: "Entourage", inviteCode: code(), createdAt: now };
        const guest = (id: string, name: string, partySize: number, groupIds: string[], email?: string): GuestListEntry => ({
          id, weddingId: published.id, name, email, partySize, status: "invited", groupIds, inviteCode: code(), createdAt: now,
        });
        const seededGuests = [
          guest("demo-gst-1", "Maria Santos", 2, [family.id], "maria@example.com"),
          guest("demo-gst-2", "Paolo Reyes", 1, [entourage.id]),
          guest("demo-gst-3", "Bea Cruz", 1, [entourage.id, family.id]),
          guest("demo-gst-4", "Jon Lim", 1, []),
        ];
        published.inviteGreeting = { enabled: true, message: "We saved a seat just for you." };
        published.privateSections = [
          {
            id: "demo-ps-1",
            kind: "event",
            title: "Rehearsal dinner",
            body: "An intimate dinner the night before, just us and the people closest to us.",
            eventDate: "2026-11-13",
            eventTime: "7:00 PM",
            eventLocation: "The Glasshouse, Willow Grove Estate",
            audience: { groupIds: [entourage.id], guestIds: [] },
          },
          {
            id: "demo-ps-2",
            kind: "text",
            title: "A note for family",
            body: "Lola's table is reserved at the front. Please arrive by 3:30 PM for family photos.",
            audience: { groupIds: [family.id], guestIds: [] },
          },
        ];

        const draft: WeddingConfig = {
          ...defaultConfig("demo-re", "t1", owner),
          partner1Name: "Alex",
          partner2Name: "Sam",
        };

        set((state) => ({
          configs: { ...state.configs, [published.id]: published, [draft.id]: draft },
          groups: [...state.groups, family, entourage],
          guests: [...state.guests, ...seededGuests],
        }));
      },

      updateConfig: (id, data) =>
        set((state) => ({
          configs: {
            ...state.configs,
            [id]: { ...state.configs[id], ...data },
          },
        })),

      publishConfig: (id) =>
        set((state) => ({
          configs: {
            ...state.configs,
            [id]: { ...state.configs[id], status: "published" },
          },
        })),

      getConfig: (id) => get().configs[id],

      // ─── RSVP ───
      addRsvp: (entry) =>
        set((state) => ({
          rsvps: [
            ...state.rsvps,
            { ...entry, id: uid("rsvp"), submittedAt: new Date().toISOString() },
          ],
        })),

      getRsvps: (weddingId) =>
        get().rsvps.filter((r) => r.weddingId === weddingId),

      getRsvpSummary: (weddingId) => {
        const entries = get().rsvps.filter((r) => r.weddingId === weddingId);
        const summary: RsvpSummary = {
          total: entries.length,
          attending: 0,
          declined: 0,
          guestCount: 0,
          mealTally: {},
        };
        for (const r of entries) {
          if (r.attending) {
            summary.attending += 1;
            summary.guestCount += 1 + (r.additionalGuests ?? (r.plusOne ? 1 : 0));
            if (r.mealChoice) {
              summary.mealTally[r.mealChoice] = (summary.mealTally[r.mealChoice] ?? 0) + 1;
            }
          } else {
            summary.declined += 1;
          }
        }
        return summary;
      },

      // ─── Guest list ───
      addGuest: (entry) => {
        const id = uid("guest");
        set((state) => ({
          guests: [
            ...state.guests,
            {
              ...entry,
              groupIds: entry.groupIds ?? [],
              id,
              inviteCode: generateInviteCode(takenCodes(state.guests, state.groups)),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      updateGuest: (id, data) =>
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      removeGuest: (id) =>
        set((state) => {
          const guest = state.guests.find((g) => g.id === id);
          const config = guest ? state.configs[guest.weddingId] : undefined;
          return {
            guests: state.guests.filter((g) => g.id !== id),
            configs: config
              ? { ...state.configs, [config.id]: { ...config, ...stripFromAudiences(config, { guestId: id }) } }
              : state.configs,
          };
        }),

      getGuests: (weddingId) =>
        get().guests.filter((g) => g.weddingId === weddingId),

      importGuests: (weddingId, rows) => {
        const state = get();
        const groups = [...state.groups];
        const codes = takenCodes(state.guests, state.groups);
        const now = new Date().toISOString();
        const result: ImportResult = { added: 0, skipped: 0, groupsCreated: 0 };

        const existingKeys = new Set(
          state.guests
            .filter((g) => g.weddingId === weddingId)
            .map((g) => `${normalizeName(g.name)}|${(g.email ?? "").toLowerCase()}`)
        );

        const groupIdFor = (name: string) => {
          const key = name.trim().toLowerCase();
          const found = groups.find((g) => g.weddingId === weddingId && g.name.trim().toLowerCase() === key);
          if (found) return found.id;
          const inviteCode = generateInviteCode(codes);
          codes.add(inviteCode);
          const created: GuestGroup = { id: uid("grp"), weddingId, name: name.trim(), inviteCode, createdAt: now };
          groups.push(created);
          result.groupsCreated += 1;
          return created.id;
        };

        const added: GuestListEntry[] = [];
        for (const row of rows) {
          const name = row.name.trim();
          const email = row.email?.trim() || undefined;
          const key = `${normalizeName(name)}|${(email ?? "").toLowerCase()}`;
          // Only de-dupe against the existing list, so a file may still contain
          // two different guests who share a name.
          if (!name || existingKeys.has(key)) {
            result.skipped += 1;
            continue;
          }
          const inviteCode = generateInviteCode(codes);
          codes.add(inviteCode);
          added.push({
            id: uid("guest"),
            weddingId,
            name,
            email,
            partySize: Math.max(1, Math.min(20, row.partySize || 1)),
            status: row.status ?? "invited",
            note: row.note?.trim() || undefined,
            groupIds: [...new Set(row.groupNames.filter((n) => n.trim()).map(groupIdFor))],
            inviteCode,
            createdAt: now,
          });
          result.added += 1;
        }

        set((s) => ({ guests: [...s.guests, ...added], groups }));
        return result;
      },

      // ─── Groups ───
      addGroup: (weddingId, name) => {
        const id = uid("grp");
        set((state) => ({
          groups: [
            ...state.groups,
            {
              id,
              weddingId,
              name: name.trim(),
              inviteCode: generateInviteCode(takenCodes(state.guests, state.groups)),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      renameGroup: (id, name) =>
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, name: name.trim() } : g)),
        })),

      removeGroup: (id) =>
        set((state) => {
          const group = state.groups.find((g) => g.id === id);
          const config = group ? state.configs[group.weddingId] : undefined;
          return {
            groups: state.groups.filter((g) => g.id !== id),
            guests: state.guests.map((g) =>
              g.groupIds.includes(id) ? { ...g, groupIds: g.groupIds.filter((x) => x !== id) } : g
            ),
            configs: config
              ? { ...state.configs, [config.id]: { ...config, ...stripFromAudiences(config, { groupId: id }) } }
              : state.configs,
          };
        }),

      // ─── Guestbook ───
      addGuestbookEntry: (entry) =>
        set((state) => ({
          guestbook: [
            ...state.guestbook,
            { ...entry, id: uid("wish"), createdAt: new Date().toISOString() },
          ],
        })),

      getGuestbook: (weddingId) =>
        get().guestbook.filter((g) => g.weddingId === weddingId),
    }),
    {
      name: "selahvie-weddings",
      version: 4,
      // v1 stored only `configs`; v2 added rsvps/guests; v3 added guestbook;
      // v4 added groups + per-guest invite codes. Preserve prior data and seed
      // any missing slices/fields on upgrade.
      migrate: (persisted: unknown) => {
        const state = (persisted ?? {}) as Partial<WeddingState>;
        const groups = state.groups ?? [];
        const codes = takenCodes([], groups);
        const guests = (state.guests ?? []).map((g) => {
          const inviteCode = g.inviteCode ?? generateInviteCode(codes);
          codes.add(inviteCode);
          return { ...g, groupIds: g.groupIds ?? [], inviteCode };
        });
        return {
          ...state,
          rsvps: state.rsvps ?? [],
          guests,
          groups,
          guestbook: state.guestbook ?? [],
        } as WeddingState;
      },
    }
  )
);
