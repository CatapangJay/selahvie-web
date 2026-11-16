/**
 * Day-of "Find your table" (Premium, seating module). A guest scans a printed QR
 * code, types their name, and sees the room with their table and a walking route.
 *
 * The seating chart stays owner-only: guests get the room's shape (tables and
 * venue features, no tags) and their own table id, never who sits elsewhere.
 * Lookups run on the server (app/api/sites/[site]/seat).
 */
import { findInviteeByCode, matchByName, normalizeCode } from "@/lib/invitations";
import { elementsOf, needsSeat, roomOf, type Room } from "@/lib/seating";
import type { GuestListEntry, GuestGroup, RSVPEntry, SeatingPlan, SeatingTable, VenueElement, WeddingConfig } from "@/types/wedding";

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
  primaryColor?: string;
  accentColor?: string;
  /** Where the reception is, for the header. */
  venueName?: string;
  entrances: { id: string; label: string }[];
}

/** POST /api/sites/[site]/seat */
export type FinderResult =
  | { status: "found"; guestName: string; partySize: number; tableId: string; floor: FinderFloor }
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
  rsvps: Pick<RSVPEntry, "guestId" | "plusOneName" | "additionalGuestNames">[]
): FinderResult {
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
    const match = matchByName(input, names, (n) => n.name, (n) => n.guestId);
    if (match.status !== "match") return match;
    guest = byId.get(match.item.guestId) ?? null;
    if (!guest) return { status: "none" };
  }

  const tableId = plan.assignments[guest.id];
  const table = tableId ? plan.tables.find((t) => t.id === tableId) : undefined;
  if (!table || !needsSeat(guest)) return { status: "unseated", guestName: guest.name };
  return { status: "found", guestName: guest.name, partySize: Math.max(1, guest.partySize), tableId: table.id, floor: publicFloor(plan) };
}
