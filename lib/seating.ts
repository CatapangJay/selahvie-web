/**
 * Seating chart helpers (types/wedding.ts → SeatingPlan). Pure functions; the
 * planner UI saves the result with updateConfig({ seatingPlan }).
 */
import type { GuestListEntry, SeatingPlan, GuestSide, SeatingTable, WeddingConfig } from "@/types/wedding";

export const MIN_SEATS = 1;
export const MAX_SEATS = 24;
export const MAX_TABLES = 80;

export const EMPTY_PLAN: SeatingPlan = { tables: [], assignments: {}, sides: {} };

export const planOf = (config: WeddingConfig): SeatingPlan => config.seatingPlan ?? EMPTY_PLAN;

/** Declined guests don't need a seat. */
export const needsSeat = (g: GuestListEntry) => g.status !== "declined";

/** Seats a guest list entry takes: the whole party sits together. */
export const seatsFor = (g: GuestListEntry) => Math.max(1, g.partySize);

export const clampSeats = (n: number) => Math.max(MIN_SEATS, Math.min(MAX_SEATS, Math.round(Number(n) || MIN_SEATS)));

export const MAX_END_SEATS = 6;

/** Chairs on each long side and each end of a four-sided long table (opposite sides match). */
export function fourSideCounts(t: SeatingTable): { long: number; ends: number } {
  const ends = Math.max(1, Math.min(MAX_END_SEATS, Math.round(t.endSeats ?? (t.seats >= 12 ? 2 : 1))));
  const long = Math.max(1, Math.min(maxLongSeats(ends), Math.round((t.seats - ends * 2) / 2)));
  return { long, ends };
}

/** Most chairs per long side that keep the table within MAX_SEATS. */
export const maxLongSeats = (ends: number) => Math.max(1, Math.floor(MAX_SEATS / 2) - ends);

/** Table fields for a four-sided long table with these per-side counts. */
export function fourSided(long: number, ends: number): Pick<SeatingTable, "seatSides" | "endSeats" | "seats"> {
  const e = Math.max(1, Math.min(MAX_END_SEATS, ends));
  const l = Math.max(1, Math.min(maxLongSeats(e), long));
  return { seatSides: 4, endSeats: e, seats: 2 * (l + e) };
}

/** Keep a table's centre inside the floor plan. */
export const clampPos = (n: number) => Math.max(4, Math.min(96, Math.round(n * 10) / 10));

/** "Table 1", "Table 2", … using the lowest free number. */
export function nextTableName(tables: SeatingTable[]): string {
  const used = new Set(tables.map((t) => t.name.trim().toLowerCase()));
  let n = 1;
  while (used.has(`table ${n}`)) n++;
  return `Table ${n}`;
}

/** A free spot on a loose grid, so new tables don't stack on top of each other. */
export function freeSpot(tables: SeatingTable[]): { x: number; y: number } {
  const xs = [14, 32, 50, 68, 86];
  const ys = [16, 39, 62, 85];
  for (const y of ys) {
    for (const x of xs) {
      if (tables.every((t) => Math.hypot(t.x - x, t.y - y) > 10)) return { x, y };
    }
  }
  return { x: 50, y: 50 };
}

export function addTable(plan: SeatingPlan, id: string, shape: SeatingTable["shape"] = "round"): SeatingPlan {
  const table: SeatingTable = {
    id,
    name: nextTableName(plan.tables),
    shape,
    seats: shape === "round" ? 8 : 10,
    ...freeSpot(plan.tables),
  };
  return { ...plan, tables: [...plan.tables, table] };
}

export function patchTable(plan: SeatingPlan, id: string, data: Partial<SeatingTable>): SeatingPlan {
  return { ...plan, tables: plan.tables.map((t) => (t.id === id ? { ...t, ...data } : t)) };
}

/** Delete a table; its guests go back to the unseated list. */
export function removeTable(plan: SeatingPlan, id: string): SeatingPlan {
  return {
    ...plan,
    tables: plan.tables.filter((t) => t.id !== id),
    assignments: Object.fromEntries(Object.entries(plan.assignments).filter(([, tableId]) => tableId !== id)),
  };
}

/** Seat a guest at a table, or unseat them with `tableId = null`. */
export function assign(plan: SeatingPlan, guestId: string, tableId: string | null): SeatingPlan {
  const assignments = { ...plan.assignments };
  if (tableId) assignments[guestId] = tableId;
  else delete assignments[guestId];
  return { ...plan, assignments };
}

export function setSide(plan: SeatingPlan, guestId: string, side: GuestSide | null): SeatingPlan {
  const sides = { ...plan.sides };
  if (side) sides[guestId] = side;
  else delete sides[guestId];
  return { ...plan, sides };
}

/** Drop a deleted guest from the plan. Returns null when they weren't in it. */
export function stripGuest(plan: SeatingPlan | undefined, guestId: string): SeatingPlan | null {
  if (!plan || (!(guestId in plan.assignments) && !(guestId in plan.sides))) return null;
  return setSide(assign(plan, guestId, null), guestId, null);
}

/** Guests seated at each table (unknown tables and guests are ignored). */
export function guestsByTable(plan: SeatingPlan, guests: GuestListEntry[]): Map<string, GuestListEntry[]> {
  const map = new Map<string, GuestListEntry[]>(plan.tables.map((t) => [t.id, []]));
  for (const g of guests) {
    const tableId = plan.assignments[g.id];
    if (tableId) map.get(tableId)?.push(g);
  }
  for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name));
  return map;
}

/** Seats taken at a table, counting only guests who still need a seat. */
export const seatsTaken = (seated: GuestListEntry[]) =>
  seated.filter(needsSeat).reduce((n, g) => n + seatsFor(g), 0);
