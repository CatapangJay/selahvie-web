/**
 * Day-of "Find your table" (Premium, seating module). A guest scans a printed QR
 * code, types their name, and sees the room with their table, the way there,
 * and who else is at their table.
 *
 * The seating chart stays owner-only: guests get the room's shape (tables and
 * venue features, no tags), their own table, and the names of the people at that
 * one table (so they know their seatmates), never who sits at other tables.
 * Lookups run on the server (app/api/sites/[site]/seat).
 */
import { findInviteeByCode, matchByName, normalizeCode } from "@/lib/invitations";
import { chairLayout, chairsOf, elementsOf, needsSeat, roomOf, type Room } from "@/lib/seating";
import type { GuestTheme } from "@/lib/weddingTheme";
import type { FinderLookup, GuestListEntry, GuestGroup, RSVPEntry, SeatingPlan, SeatingTable, VenueElement, WeddingConfig } from "@/types/wedding";

/** Query param on the finder link: which entrance the printed code hangs at. */
export const FROM_PARAM = "from";

export function seatFinderPath(config: Pick<WeddingConfig, "slug" | "id">, entranceId?: string): string {
  const base = `/wedding/${encodeURIComponent(config.slug || config.id)}/seat`;
  return entranceId ? `${base}?${FROM_PARAM}=${encodeURIComponent(entranceId)}` : base;
}

/** A table as guests see it: geometry and name only. */
export type FinderTable = Pick<SeatingTable, "id" | "name" | "shape" | "seats" | "seatSides" | "endSeats" | "sweep" | "sBend" | "rotation" | "x" | "y">;

export interface FinderFloor {
  /** Room size in plan units. */
  room: Room;
  tables: FinderTable[];
  elements: VenueElement[];
}

/** GET /api/sites/[site]/seat */
export interface FinderSite {
  /** Guests can look themselves up. Owners can always preview. */
  enabled: boolean;
  isOwner: boolean;
  partner1Name: string;
  partner2Name: string;
  weddingDate?: string;
  /** The wedding's look (lib/weddingTheme): colours as the couple chose them, fonts. */
  theme: GuestTheme;
  /** Where the reception is, for the header. */
  venueName?: string;
  /** The couple's hero photo from their website, for the welcome. */
  heroImageUrl?: string;
  entrances: { id: string; label: string }[];
  /** How guests type their name: full name, first name, or nickname. */
  lookup: FinderLookup;
}

/** Someone else seated at the guest's table. */
export interface Seatmate {
  name: string;
  /** The guests they named on their RSVP. */
  plusOnes: string[];
  /** Seats they take beyond the named ones ("+2 guests"). */
  more: number;
  /** A group (family, friends, entourage) they share with the guest, by name. */
  group?: string;
  /** In a chair right next to the guest's party (only when the couple chose the guest's seat). */
  beside?: boolean;
}

/** POST /api/sites/[site]/seat */
export type FinderResult =
  | {
      status: "found";
      guestName: string;
      partySize: number;
      tableId: string;
      floor: FinderFloor;
      /** The guest's own named plus-ones, sitting with them. */
      party: string[];
      /** Everyone else at the table: people in the guest's groups first, then by name. */
      seatmates: Seatmate[];
      /** The guest's party's chairs (0-based), only when the couple chose the guest's seat. */
      chairs?: number[];
      /** The guest's own chair (0-based), when the couple chose it. */
      seat?: number;
    }
  /** On the list but not given a table yet (or declined). */
  | { status: "unseated"; guestName: string }
  | { status: "needs-code" }
  | { status: "none" };

export const entrancesOf = (plan: SeatingPlan) =>
  elementsOf(plan)
    .filter((e) => e.kind === "entrance")
    .map((e, i, all) => ({ id: e.id, label: e.label.trim() || (all.length > 1 ? `Entrance ${i + 1}` : "Entrance") }));

export function publicFloor(plan: SeatingPlan): FinderFloor {
  return {
    room: roomOf(plan),
    tables: plan.tables.map(({ id, name, shape, seats, seatSides, endSeats, sweep, sBend, rotation, x, y }) => ({
      id, name, shape, seats, seatSides, endSeats, sweep, sBend, rotation, x, y,
    })),
    elements: elementsOf(plan),
  };
}

/**
 * Finds the guest by their name or a plus-one's name (from their RSVP), or by
 * invite code in the `code` step. Same tolerance and ambiguity rules as
 * "Find your invitation": two equally likely people ask for the code instead.
 */
export function findSeat(
  input: string,
  step: "lookup" | "code",
  plan: SeatingPlan,
  guests: GuestListEntry[],
  groups: GuestGroup[],
  rsvps: Pick<RSVPEntry, "guestId" | "plusOneName" | "additionalGuestNames">[],
  lookup: FinderLookup = plan.finderLookup ?? "full"
): FinderResult {
  // Named plus-ones per guest, from their RSVP (the latest one wins).
  const namedBy = new Map<string, string[]>();
  for (const r of rsvps) {
    if (!r.guestId) continue;
    const named = [r.plusOneName, ...(r.additionalGuestNames ?? [])].map((n) => n?.trim()).filter((n): n is string => Boolean(n));
    namedBy.set(r.guestId, named);
  }
  const byCode = () => {
    const invitee = findInviteeByCode(input, guests, groups);
    return invitee?.guestId ? guests.find((g) => g.id === invitee.guestId) ?? null : null;
  };

  let guest: GuestListEntry | null = null;
  if (step === "code" || normalizeCode(input).length === 8) guest = byCode();
  if (!guest && step === "code") return { status: "none" };

  if (!guest) {
    const byId = new Map(guests.map((g) => [g.id, g]));
    const names: { guestId: string; name: string }[] = guests.map((g) => ({ guestId: g.id, name: g.name }));
    for (const r of rsvps) {
      if (!r.guestId || !byId.has(r.guestId)) continue;
      for (const name of [r.plusOneName, ...(r.additionalGuestNames ?? [])]) {
        if (name?.trim()) names.push({ guestId: r.guestId, name });
      }
    }
    const match = matchByName(input, names, (n) => n.name, (n) => n.guestId, { firstNames: lookup !== "full" });
    if (match.status !== "match") return match;
    guest = byId.get(match.item.guestId) ?? null;
    if (!guest) return { status: "none" };
  }

  const tableId = plan.assignments[guest.id];
  const table = tableId ? plan.tables.find((t) => t.id === tableId) : undefined;
  if (!table || !needsSeat(guest)) return { status: "unseated", guestName: guest.name };
  const me = guest;
  // The chairs as the planner lays them out (same order: guests by name).
  const atTable = guests.filter((g) => plan.assignments[g.id] === table.id).sort((a, b) => a.name.localeCompare(b.name));
  const layout = chairLayout(table, atTable, plan.chairs);
  const chosen = Boolean(plan.chairs && me.id in plan.chairs && chairsOf(layout, me.id).length);
  return {
    status: "found",
    guestName: me.name,
    partySize: Math.max(1, me.partySize),
    tableId: table.id,
    floor: publicFloor(plan),
    party: namedBy.get(me.id) ?? [],
    seatmates: seatmatesOf(me, table.id, plan, guests, groups, namedBy, chosen ? layout : null),
    // Only a seat the couple chose: automatic placement can shift as the chart changes.
    ...(chosen ? { chairs: chairsOf(layout, me.id), seat: plan.chairs![me.id] } : {}),
  };
}

/**
 * Who else sits at `tableId`: guests still coming (declined guests are left
 * out), each with the plus-ones they named. People who share a group with the
 * guest come first, grouped by that group, then everyone else by name.
 */
function seatmatesOf(
  me: GuestListEntry,
  tableId: string,
  plan: SeatingPlan,
  guests: GuestListEntry[],
  groups: GuestGroup[],
  namedBy: Map<string, string[]>,
  /** The table's chairs, when the guest's seat was chosen; null = nobody is "beside" anyone yet. */
  layout: (GuestListEntry | null)[] | null
): Seatmate[] {
  const groupName = new Map(groups.map((g) => [g.id, g.name.trim()]));
  const mine = new Set(me.groupIds);
  // Who sits in the chairs on either side of the guest's party.
  const besideIds = new Set<string>();
  if (layout) {
    const n = layout.length;
    const ours = chairsOf(layout, me.id);
    for (const i of ours) {
      for (const j of [(i - 1 + n) % n, (i + 1) % n]) {
        const g = layout[j];
        if (g && g.id !== me.id) besideIds.add(g.id);
      }
    }
  }
  const list = guests
    .filter((g) => g.id !== me.id && plan.assignments[g.id] === tableId && needsSeat(g))
    .map((g) => {
      const plusOnes = namedBy.get(g.id) ?? [];
      const shared = g.groupIds.find((id) => mine.has(id) && groupName.get(id));
      return {
        name: g.name.trim(),
        plusOnes,
        more: Math.max(0, Math.max(1, g.partySize) - 1 - plusOnes.length),
        ...(shared ? { group: groupName.get(shared) } : {}),
        ...(besideIds.has(g.id) ? { beside: true } : {}),
      } satisfies Seatmate;
    });
  // The people beside you first, then your groups, then everyone else.
  return list.sort((a, b) => {
    if (Boolean(a.beside) !== Boolean(b.beside)) return a.beside ? -1 : 1;
    if (Boolean(a.group) !== Boolean(b.group)) return a.group ? -1 : 1;
    if (a.group && b.group && a.group !== b.group) return a.group.localeCompare(b.group);
    return a.name.localeCompare(b.name);
  });
}
