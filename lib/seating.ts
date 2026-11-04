/**
 * Seating chart helpers (types/wedding.ts → SeatingPlan). Pure functions; the
 * planner UI saves the result with updateConfig({ seatingPlan }).
 */
import type { GuestListEntry, SeatingPlan, GuestSide, SeatingTable, VenueElement, VenueElementKind, WeddingConfig } from "@/types/wedding";

export const MIN_SEATS = 1;
export const MAX_SEATS = 24;
export const MAX_TABLES = 80;
export const MAX_ELEMENTS = 40;

export const EMPTY_PLAN: SeatingPlan = { tables: [], elements: [], assignments: {}, sides: {} };

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

/** Chairs a new table of this shape starts with. */
export const DEFAULT_SEATS: Record<SeatingTable["shape"], number> = { round: 8, rect: 10, arc: 6, curve: 12 };

export const MIN_SWEEP = 30;
export const MAX_SWEEP = 180;
export const clampSweep = (deg: number) => Math.max(MIN_SWEEP, Math.min(MAX_SWEEP, Math.round(Number(deg) || 90)));

export function addTable(plan: SeatingPlan, id: string, shape: SeatingTable["shape"] = "round", seats = DEFAULT_SEATS[shape]): SeatingPlan {
  const table: SeatingTable = {
    id,
    name: nextTableName(plan.tables),
    shape,
    seats: clampSeats(seats),
    ...(shape === "curve" ? { sweep: 90, sBend: true } : {}),
    ...freeSpot(plan.tables),
  };
  return { ...plan, tables: [...plan.tables, table] };
}

/** Add several tables at once (stops at MAX_TABLES). `ids` sets how many. */
export function addTables(plan: SeatingPlan, ids: string[], shape: SeatingTable["shape"], seats: number): SeatingPlan {
  return ids.reduce((p, id) => (p.tables.length >= MAX_TABLES ? p : addTable(p, id, shape, seats)), plan);
}

/** A copy of a table beside the original, with the next free name and no guests. */
export function duplicateTable(plan: SeatingPlan, id: string, newId: string): SeatingPlan {
  const src = plan.tables.find((t) => t.id === id);
  if (!src || plan.tables.length >= MAX_TABLES) return plan;
  const copy: SeatingTable = { ...src, id: newId, name: nextTableName(plan.tables), x: clampPos(src.x + 6), y: clampPos(src.y + 6) };
  return { ...plan, tables: [...plan.tables, copy] };
}

export const clampRotation = (deg: number) => ((Math.round(Number(deg) || 0) % 360) + 360) % 360;

/** Tags already used on this plan, for suggestions. */
export const planTags = (plan: SeatingPlan) =>
  [...new Set(plan.tables.map((t) => t.tag?.trim()).filter((t): t is string => Boolean(t)))].sort((a, b) => a.localeCompare(b));

/** "Table 12" → "12"; anything else → its first three characters. Fits in a seat-sized badge. */
export function tableShortLabel(t: Pick<SeatingTable, "name">): string {
  const name = t.name.trim();
  const n = /^table\s+(\S{1,3})$/i.exec(name);
  if (n) return n[1];
  return Array.from(name).slice(0, 3).join("") || "?";
}

/** "Abigail Morris" → "AM", "Cher" → "C", "Dr. Ana de la Cruz" → "AC". */
export function initials(name: string): string {
  const words = name
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/^(mr|mrs|ms|dr|atty|engr|sr|jr)\.?$/i.test(w) && /\p{L}/u.test(w));
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] ?? "" : "";
  return (first + last).toUpperCase();
}

// ─── Venue features ──────────────────────────────────────────────────────────

export interface ElementPreset {
  kind: VenueElementKind;
  label: string;
  shape: VenueElement["shape"];
  w: number;
  h: number;
}

/** Sizes are in floor-plan width units, sized against an 8-seat round table (~10.6 wide). */
export const ELEMENT_PRESETS: ElementPreset[] = [
  { kind: "stage", label: "Stage", shape: "rect", w: 34, h: 8 },
  { kind: "danceFloor", label: "Dance floor", shape: "rect", w: 20, h: 14 },
  { kind: "grazing", label: "Grazing table", shape: "rect", w: 18, h: 5 },
  { kind: "photobooth", label: "Photo booth", shape: "rect", w: 9, h: 7 },
  { kind: "bar", label: "Bar", shape: "rect", w: 14, h: 4.5 },
  { kind: "cake", label: "Cake table", shape: "ellipse", w: 6, h: 6 },
  { kind: "music", label: "DJ / band", shape: "rect", w: 11, h: 6 },
  { kind: "buffet", label: "Buffet", shape: "rect", w: 22, h: 4.5 },
  { kind: "gifts", label: "Gift table", shape: "rect", w: 9, h: 4 },
  { kind: "entrance", label: "Entrance", shape: "rect", w: 10, h: 2.5 },
];

export const CUSTOM_PRESETS: Record<VenueElement["shape"], ElementPreset> = {
  rect: { kind: "custom", label: "Custom area", shape: "rect", w: 12, h: 8 },
  ellipse: { kind: "custom", label: "Custom area", shape: "ellipse", w: 10, h: 10 },
};

export const ELEMENT_MIN = { w: 2, h: 1.5 };
export const ELEMENT_MAX = { w: 90, h: 56 };

export const clampElementSize = (n: number, axis: "w" | "h") =>
  Math.max(ELEMENT_MIN[axis], Math.min(ELEMENT_MAX[axis], Math.round((Number(n) || 0) * 10) / 10));

export const elementsOf = (plan: SeatingPlan): VenueElement[] => plan.elements ?? [];

export function addElement(plan: SeatingPlan, id: string, preset: ElementPreset): SeatingPlan {
  const elements = elementsOf(plan);
  if (elements.length >= MAX_ELEMENTS) return plan;
  // Stages and entrances belong at the room's edges; everything else starts in the middle, staggered.
  const y = preset.kind === "stage" ? 10 : preset.kind === "entrance" ? 95 : 50;
  const offset = (elements.length % 5) * 3;
  const element: VenueElement = { id, ...preset, x: clampPos(50 + offset), y: clampPos(y + (y === 50 ? offset : 0)) };
  return { ...plan, elements: [...elements, element] };
}

export function patchElement(plan: SeatingPlan, id: string, data: Partial<VenueElement>): SeatingPlan {
  return { ...plan, elements: elementsOf(plan).map((e) => (e.id === id ? { ...e, ...data } : e)) };
}

export function removeElement(plan: SeatingPlan, id: string): SeatingPlan {
  return { ...plan, elements: elementsOf(plan).filter((e) => e.id !== id) };
}

export function duplicateElement(plan: SeatingPlan, id: string, newId: string): SeatingPlan {
  const elements = elementsOf(plan);
  const src = elements.find((e) => e.id === id);
  if (!src || elements.length >= MAX_ELEMENTS) return plan;
  return { ...plan, elements: [...elements, { ...src, id: newId, x: clampPos(src.x + 4), y: clampPos(src.y + 4) }] };
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
