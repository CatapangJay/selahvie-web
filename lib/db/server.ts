import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  fromGroupRow,
  fromGuestRow,
  groupRow,
  guestRow,
  memberRows,
  membershipIndex,
  rsvpInsert,
  weddingColumns,
  type GroupRow,
  type GuestbookRow,
  type GuestRow,
  type MemberRow,
} from "./mappers";
import { fetchAllRows } from "./paging";
import type { GuestbookEntry, GuestGroup, GuestListEntry, RSVPEntry, WeddingConfig } from "@/types/wedding";

/** The signed-in user for this request, verified with Supabase Auth. */
export async function requireUser(): Promise<{ id: string; email: string } | null> {
  const { data } = await (await createClient()).auth.getUser();
  if (!data.user?.email) return null;
  return { id: data.user.id, email: data.user.email.toLowerCase() };
}

/** A website's guests (with their group ids) and groups. Throws on failure. */
export async function loadGuestList(admin: SupabaseClient, weddingId: string) {
  const [guestRows, groupRows, memberRowsList] = await Promise.all([
    fetchAllRows<GuestRow>((from, to) =>
      admin.from("guests").select("*").eq("wedding_id", weddingId).order("created_at").order("id").range(from, to)
    ),
    fetchAllRows<GroupRow>((from, to) =>
      admin.from("guest_groups").select("*").eq("wedding_id", weddingId).order("created_at").order("id").range(from, to)
    ),
    fetchAllRows<MemberRow>((from, to) =>
      admin.from("guest_group_members").select("*").eq("wedding_id", weddingId).order("guest_id").order("group_id").range(from, to)
    ),
  ]);
  const members = membershipIndex(memberRowsList);
  return {
    guests: guestRows.map((g) => fromGuestRow(g, members.get(g.id) ?? [])),
    groups: groupRows.map(fromGroupRow),
  };
}

/** A website with everything that hangs off it, ids already final (UUIDs). */
export interface WeddingBundle {
  config: WeddingConfig;
  groups: GuestGroup[];
  guests: GuestListEntry[];
  rsvps: RSVPEntry[];
  guestbook: GuestbookEntry[];
}

const UNIQUE_VIOLATION = "23505";
const CHUNK = 500;

async function insertChunked(admin: SupabaseClient, table: string, rows: object[]) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await admin.from(table).insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

/**
 * Create websites for `ownerId` with service-role access. A taken slug falls
 * back to the website's id. If anything fails, the websites created so far are
 * deleted (children cascade) and the error is rethrown.
 */
export async function insertWeddingBundles(admin: SupabaseClient, ownerId: string, bundles: WeddingBundle[]) {
  const created: string[] = [];
  try {
    for (const b of bundles) {
      const row = { id: b.config.id, owner_id: ownerId, tier: b.config.tier ?? "base", ...weddingColumns(b.config) };
      let { error } = await admin.from("weddings").insert(row);
      if (error?.code === UNIQUE_VIOLATION && row.slug !== row.id) {
        ({ error } = await admin.from("weddings").insert({ ...row, slug: row.id }));
      }
      if (error) throw new Error(`weddings: ${error.message}`);
      created.push(b.config.id);

      await insertChunked(admin, "guest_groups", b.groups.map(groupRow));
      await insertChunked(admin, "guests", b.guests.map(guestRow));
      await insertChunked(admin, "guest_group_members", b.guests.flatMap((g) => memberRows(g, g.groupIds)));
      await insertChunked(
        admin,
        "rsvps",
        b.rsvps.map((r) => ({ ...rsvpInsert(r), id: r.id, submitted_at: r.submittedAt }))
      );
      await insertChunked(
        admin,
        "guestbook_entries",
        b.guestbook.map((e): GuestbookRow => ({
          id: e.id,
          wedding_id: e.weddingId,
          name: e.name.trim().slice(0, 200),
          message: e.message.trim().slice(0, 2000),
          created_at: e.createdAt,
        }))
      );
    }
  } catch (error) {
    if (created.length > 0) await admin.from("weddings").delete().in("id", created);
    throw error;
  }
}
