/**
 * Walking route from an entrance to a table on the seating floor plan.
 *
 * Works in plan units: x 0–room.w, y 0–room.h (table sizes are already in
 * plan units; the original room is 100 × 62.5). The room is rasterised into a grid where
 * tables (chairs included) and solid venue features are blocked, A* finds the
 * shortest aisle walk, line-of-sight pulling straightens it, and the turns are
 * described against landmarks the guest can see.
 */
import { SEAT, SEAT_GAP, curveGeometry, tableSize } from "@/components/manage/seating/FloorSurface";
import { Y_SCALE, type Room } from "@/lib/seating";
import type { FinderFloor, FinderTable } from "@/lib/seatFinder";
import type { VenueElement, VenueElementKind } from "@/types/wedding";

/** Stored y → plan units (see lib/seating Y_SCALE). */
const ASPECT = Y_SCALE;

export interface Pt {
  x: number;
  y: number;
}

/** A table's or element's centre in width units. */
export const centreOf = (o: { x: number; y: number }): Pt => ({ x: o.x, y: o.y * ASPECT });

// ─── Obstacles ───────────────────────────────────────────────────────────────

// The grid is sized per search from the room (findRoute calls sizeGrid first; the
// search is synchronous, so these never change mid-search). Cells grow in big halls
// to keep the search around 30k cells.
let CELL = 0.5;
let COLS = 200;
let ROWS = 125;
function sizeGrid(room: Room) {
  CELL = Math.max(0.5, Math.ceil(Math.sqrt((room.w * room.h) / 30000) * 4) / 4);
  COLS = Math.ceil(room.w / CELL);
  ROWS = Math.ceil(room.h / CELL);
}
/** Table edge to the outside of its chairs. */
const CHAIR_REACH = SEAT_GAP + SEAT / 2;
const WALL_GAP = 1.5;

/** Features guests walk across rather than around. */
const WALKABLE: ReadonlySet<VenueElementKind> = new Set(["danceFloor", "entrance"]);

type Hit = { cx: number; cy: number; radius: number; rot: number; inside: (lx: number, ly: number) => boolean };

function parseOutline(d: string): Pt[] {
  return d
    .replace(/^M|Z$/g, "")
    .split("L")
    .map((pair) => {
      const [x, y] = pair.trim().split(" ").map(Number);
      return { x, y };
    });
}

function inPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function distToPolygon(p: Pt, poly: Pt[]): number {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j];
    const b = poly[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
    best = Math.min(best, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return best;
}

/** The table and its chairs, grown by `margin`. Local coordinates are centred on the table, unrotated. */
function tableHit(t: FinderTable, margin: number, chairs = true): Hit {
  const { w, h } = tableSize(t);
  const grow = (chairs ? CHAIR_REACH : 0) + margin;
  const { x: cx, y: cy } = centreOf(t);
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const radius = Math.hypot(w, h) / 2 + grow;
  if (t.shape === "round") return { cx, cy, rot, radius, inside: (lx, ly) => Math.hypot(lx, ly) <= w / 2 + grow };
  if (t.shape === "curve") {
    const poly = parseOutline(curveGeometry(t).d);
    return {
      cx, cy, rot, radius,
      inside: (lx, ly) => {
        const p = { x: lx + w / 2, y: ly + h / 2 };
        return inPolygon(p, poly) || distToPolygon(p, poly) <= grow;
      },
    };
  }
  return { cx, cy, rot, radius, inside: (lx, ly) => Math.abs(lx) <= w / 2 + grow && Math.abs(ly) <= h / 2 + grow };
}

function elementHit(e: VenueElement, margin: number): Hit {
  const { x: cx, y: cy } = centreOf(e);
  const rot = ((e.rotation ?? 0) * Math.PI) / 180;
  const hw = e.w / 2 + margin;
  const hh = e.h / 2 + margin;
  return {
    cx, cy, rot,
    radius: Math.hypot(hw, hh),
    inside: e.shape === "ellipse" ? (lx, ly) => (lx / hw) ** 2 + (ly / hh) ** 2 <= 1 : (lx, ly) => Math.abs(lx) <= hw && Math.abs(ly) <= hh,
  };
}

function paint(grid: Uint8Array, hit: Hit) {
  const c0 = Math.max(0, Math.floor((hit.cx - hit.radius) / CELL));
  const c1 = Math.min(COLS - 1, Math.ceil((hit.cx + hit.radius) / CELL));
  const r0 = Math.max(0, Math.floor((hit.cy - hit.radius) / CELL));
  const r1 = Math.min(ROWS - 1, Math.ceil((hit.cy + hit.radius) / CELL));
  const cos = Math.cos(-hit.rot);
  const sin = Math.sin(-hit.rot);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const dx = (c + 0.5) * CELL - hit.cx;
      const dy = (r + 0.5) * CELL - hit.cy;
      if (hit.inside(dx * cos - dy * sin, dx * sin + dy * cos)) grid[r * COLS + c] = 1;
    }
  }
}

function obstacleGrid(floor: FinderFloor, targetId: string, margin: number, withElements: boolean, chairs = true): Uint8Array {
  const grid = new Uint8Array(COLS * ROWS);
  // Keep off the walls: nobody walks with a shoulder against them.
  const wall = Math.round(WALL_GAP / CELL);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r < wall || c < wall || r >= ROWS - wall || c >= COLS - wall) grid[r * COLS + c] = 1;
    }
  }
  for (const t of floor.tables) if (t.id !== targetId) paint(grid, tableHit(t, margin, chairs));
  if (withElements) for (const e of floor.elements) if (!WALKABLE.has(e.kind)) paint(grid, elementHit(e, Math.min(margin, 0.6)));
  return grid;
}

// ─── Search ──────────────────────────────────────────────────────────────────

const cellOf = (p: Pt) => ({
  c: Math.max(0, Math.min(COLS - 1, Math.floor(p.x / CELL))),
  r: Math.max(0, Math.min(ROWS - 1, Math.floor(p.y / CELL))),
});
const centreOfCell = (i: number): Pt => ({ x: ((i % COLS) + 0.5) * CELL, y: (Math.floor(i / COLS) + 0.5) * CELL });

/** Nearest open cell to `p` (the entrance may sit on a wall or under a feature). */
function nearestOpen(grid: Uint8Array, p: Pt): number | null {
  const { c, r } = cellOf(p);
  const start = r * COLS + c;
  if (!grid[start]) return start;
  const seen = new Uint8Array(grid.length);
  const queue = [start];
  seen[start] = 1;
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    if (!grid[i]) return i;
    const ic = i % COLS;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = ic + dc;
      const nr = Math.floor(i / COLS) + dr;
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
      const n = nr * COLS + nc;
      if (!seen[n]) {
        seen[n] = 1;
        queue.push(n);
      }
    }
  }
  return null;
}

/** Min-heap of cell indices keyed by f-score. */
class Heap {
  private items: number[] = [];
  constructor(private readonly f: Float32Array) {}
  get size() {
    return this.items.length;
  }
  push(i: number) {
    const a = this.items;
    a.push(i);
    let k = a.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (this.f[a[p]] <= this.f[a[k]]) break;
      [a[p], a[k]] = [a[k], a[p]];
      k = p;
    }
  }
  pop(): number {
    const a = this.items;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < a.length && this.f[a[l]] < this.f[a[m]]) m = l;
        if (r < a.length && this.f[a[r]] < this.f[a[m]]) m = r;
        if (m === k) break;
        [a[m], a[k]] = [a[k], a[m]];
        k = m;
      }
    }
    return top;
  }
}

const STEPS: [number, number, number][] = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

/**
 * A* over open cells to any cell in `goal`. `near` cells (close to furniture)
 * cost a little more, so routes keep to the middle of aisles.
 */
function search(grid: Uint8Array, near: Uint8Array, goal: Uint8Array, start: number, aim: Pt): number[] | null {
  const n = grid.length;
  const g = new Float32Array(n).fill(Infinity);
  const f = new Float32Array(n).fill(Infinity);
  const from = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const h = (i: number) => {
    const p = centreOfCell(i);
    const dx = Math.abs(p.x - aim.x) / CELL;
    const dy = Math.abs(p.y - aim.y) / CELL;
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  };
  const heap = new Heap(f);
  g[start] = 0;
  f[start] = h(start);
  heap.push(start);
  while (heap.size) {
    const i = heap.pop();
    if (closed[i]) continue;
    closed[i] = 1;
    if (goal[i]) {
      const path = [i];
      while (from[path[0]] !== -1) path.unshift(from[path[0]]);
      return path;
    }
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    for (const [dc, dr, cost] of STEPS) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
      const j = nr * COLS + nc;
      if (grid[j] || closed[j]) continue;
      // No squeezing diagonally between two blocked corners.
      if (dc && dr && (grid[r * COLS + nc] || grid[nr * COLS + c])) continue;
      const tentative = g[i] + cost * (near[j] ? 1.6 : 1);
      if (tentative < g[j]) {
        g[j] = tentative;
        // Weighted heuristic: a hair less optimal, much faster on big rooms.
        f[j] = tentative + h(j) * 1.05;
        from[j] = i;
        heap.push(j);
      }
    }
  }
  return null;
}

function lineOfSight(grid: Uint8Array, a: Pt, b: Pt): boolean {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (CELL / 3));
  for (let s = 1; s < steps; s++) {
    const { c, r } = cellOf({ x: a.x + ((b.x - a.x) * s) / steps, y: a.y + ((b.y - a.y) * s) / steps });
    if (grid[r * COLS + c]) return false;
  }
  return true;
}

/** Keep only the corners: from each point, jump to the farthest point still in plain view. */
function straighten(grid: Uint8Array, pts: Pt[]): Pt[] {
  if (pts.length <= 2) return pts;
  const out = [pts[0]];
  let i = 0;
  while (i < pts.length - 1) {
    let j = pts.length - 1;
    while (j > i + 1 && !lineOfSight(grid, pts[i], pts[j])) j--;
    out.push(pts[j]);
    i = j;
  }
  return out;
}

// ─── Route ───────────────────────────────────────────────────────────────────

export interface Route {
  /** Corners of the walk, entrance first, ending beside the table. */
  points: Pt[];
  /** Direction the guest faces on walking in (unit vector). */
  facing: Pt;
}

const AXES: Pt[] = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

/**
 * Which way the guest faces on walking in, as one of the room's four axes, chosen
 * so the map can put the door at the bottom and the walk going up ("forward").
 * Weighs, in order of trust:
 *  - the door itself: a long, thin entrance opens across its short side, into the room;
 *  - the walls it's against: a door by a wall faces away from it;
 *  - the walk: where the table is, and which way the route first heads.
 * `path` is the walk (entrance first); without a route, entrance → table is enough.
 */
export function facingFrom(entrance: VenueElement, room: Room, path: Pt[] = []): Pt {
  const at = centreOf(entrance);
  const centre = { x: room.w / 2, y: room.h / 2 };
  const scores = AXES.map(() => 0);
  const add = (v: Pt, weight: number) => AXES.forEach((axis, i) => (scores[i] += (axis.x * v.x + axis.y * v.y) * weight));

  // The door: its short side, the half that looks into the room.
  const long = Math.max(entrance.w, entrance.h);
  const short = Math.min(entrance.w, entrance.h);
  if (long >= short * 1.5) {
    const r = (((entrance.rotation ?? 0) + (entrance.w >= entrance.h ? 90 : 0)) * Math.PI) / 180;
    let n = { x: Math.cos(r), y: Math.sin(r) };
    if (n.x * (centre.x - at.x) + n.y * (centre.y - at.y) < 0) n = { x: -n.x, y: -n.y };
    add(n, 2);
  }

  // The walls: the closer, the stronger the pull away from them.
  const reach = Math.max(6, Math.min(room.w, room.h) * 0.15);
  const walls: [number, Pt][] = [
    [at.y, { x: 0, y: 1 }],
    [room.h - at.y, { x: 0, y: -1 }],
    [at.x, { x: 1, y: 0 }],
    [room.w - at.x, { x: -1, y: 0 }],
  ];
  for (const [d, inward] of walls) add(inward, 1.5 * Math.max(0, 1 - d / reach));

  // The walk: overall towards the table, and the first stretch of the route.
  if (path.length >= 2) {
    add(unit(path[0], path[path.length - 1]), 1);
    const first = path.find((p, i) => i > 0 && Math.hypot(p.x - path[0].x, p.y - path[0].y) > 2) ?? path[1];
    add(unit(path[0], first), 0.75);
  }

  const best = scores.indexOf(Math.max(...scores));
  return AXES[best];
}

/**
 * The route from `entrance` to table `targetId`, or null when the table can't
 * be reached. Tries generous aisles first, then tighter ones, then ignores venue
 * features, so a crowded plan still gets the best line we can draw.
 */
export function findRoute(floor: FinderFloor, entrance: VenueElement, targetId: string): Route | null {
  const target = floor.tables.find((t) => t.id === targetId);
  if (!target) return null;
  sizeGrid(floor.room);
  const aim = centreOf(target);
  const begin = centreOf(entrance);
  // [aisle margin, avoid venue features, keep clear of chairs]. Packed rooms often
  // leave no chair-free aisle; guests then squeeze between chairs, so the later
  // attempts only avoid the table tops.
  const attempts: [number, boolean, boolean][] = [
    [0.9, true, true],
    [0.35, true, true],
    [0.3, true, false],
    [0.2, false, false],
  ];

  for (const [margin, withElements, chairs] of attempts) {
    const grid = obstacleGrid(floor, targetId, margin, withElements, chairs);
    const near = obstacleGrid(floor, targetId, margin + 1.4, false, chairs);
    const goal = new Uint8Array(grid.length);
    paint(goal, tableHit(target, margin + 0.7));
    const start = nearestOpen(grid, begin);
    if (start == null) continue;
    if (goal[start]) return { points: [begin, aim], facing: facingFrom(entrance, floor.room, [begin, aim]) };
    const cells = search(grid, near, goal, start, aim);
    if (!cells) continue;
    const raw = [begin, ...cells.map(centreOfCell)];
    const points = straighten(grid, raw);
    return { points, facing: facingFrom(entrance, floor.room, points) };
  }
  return null;
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

/** SVG path through the corners, each corner rounded off. */
export function routePath(points: Pt[], radius = 2.4): string {
  if (points.length < 2) return "";
  const f = (n: number) => n.toFixed(2);
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i - 1];
    const q = points[i];
    const s = points[i + 1];
    const r = Math.min(radius, Math.hypot(q.x - p.x, q.y - p.y) / 2, Math.hypot(s.x - q.x, s.y - q.y) / 2);
    const a = towards(q, p, r);
    const b = towards(q, s, r);
    d += `L${f(a.x)} ${f(a.y)}Q${f(q.x)} ${f(q.y)} ${f(b.x)} ${f(b.y)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${f(last.x)} ${f(last.y)}`;
}

/**
 * Evenly spaced dots along the same rounded path `routePath` draws, door first.
 * The route is drawn as these dots, so it needs no SVG masks (which Chrome renders
 * unreliably inside a turned map).
 */
export function routeDots(points: Pt[], spacing = 1.6, radius = 2.4): Pt[] {
  if (points.length < 2) return points.slice();
  // Rebuild the path as fine line pieces: straight runs, each corner a quadratic curve.
  const fine: Pt[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i - 1];
    const q = points[i];
    const s = points[i + 1];
    const r = Math.min(radius, Math.hypot(q.x - p.x, q.y - p.y) / 2, Math.hypot(s.x - q.x, s.y - q.y) / 2);
    const a = towards(q, p, r);
    const b = towards(q, s, r);
    fine.push(a);
    for (let k = 1; k <= 8; k++) {
      const t = k / 8;
      const u = 1 - t;
      fine.push({ x: u * u * a.x + 2 * u * t * q.x + t * t * b.x, y: u * u * a.y + 2 * u * t * q.y + t * t * b.y });
    }
  }
  fine.push(points[points.length - 1]);

  const dots: Pt[] = [fine[0]];
  let carry = 0;
  for (let i = 1; i < fine.length; i++) {
    const a = fine[i - 1];
    const b = fine[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    let at = spacing - carry;
    while (at <= len) {
      dots.push({ x: a.x + ((b.x - a.x) * at) / len, y: a.y + ((b.y - a.y) * at) / len });
      at += spacing;
    }
    carry = len - (at - spacing);
  }
  return dots;
}

function towards(from: Pt, to: Pt, dist: number): Pt {
  const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: from.x + ((to.x - from.x) / len) * dist, y: from.y + ((to.y - from.y) / len) * dist };
}

/**
 * Turns the map so the guest's entrance sits at the bottom and "ahead" is up,
 * the way you'd hold a paper map. Returns degrees clockwise: 0, 90, 180 or -90.
 */
export function headsUpRotation(facing: Pt): 0 | 90 | 180 | -90 {
  if (facing.y > 0.5) return 180;
  if (facing.x > 0.5) return -90;
  if (facing.x < -0.5) return 90;
  return 0;
}

// ─── Directions ──────────────────────────────────────────────────────────────

export interface Step {
  text: string;
  /** Which way the arrow beside the step points. */
  icon: "enter" | "straight" | "left" | "right" | "slight-left" | "slight-right" | "arrive";
  /** Fraction of the route (by length) where this step begins, for syncing with the animation. */
  at: number;
}

const unit = (a: Pt, b: Pt): Pt => {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
};
/** Signed turn from heading `a` to `b`, degrees. Positive = right (y points down). */
const turnOf = (a: Pt, b: Pt) => (Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y) * 180) / Math.PI;
/** > 0 when `p` is to the right of someone at `at` heading `h`. */
const sideOf = (at: Pt, h: Pt, p: Pt) => h.x * (p.y - at.y) - h.y * (p.x - at.x);

type Landmark = { label: string; at: Pt; size: number };

function landmarks(floor: FinderFloor, targetId: string): Landmark[] {
  const els = floor.elements
    .filter((e) => e.kind !== "entrance" && e.label.trim())
    .map((e) => ({ label: theLabel(e.label), at: centreOf(e), size: Math.max(e.w, e.h) / 2 }));
  const tables = floor.tables
    .filter((t) => t.id !== targetId && t.name.trim())
    .map((t) => ({ label: t.name.trim(), at: centreOf(t), size: Math.max(...Object.values(tableSize(t))) / 2 }));
  // Room features are easier to spot than a numbered table, so they're tried first.
  return [...els, ...tables];
}

/** "Bar" → "the bar"; proper names ("Sweetheart Table", "DJ") keep their capitals. */
function theLabel(label: string): string {
  const l = label.trim();
  // Already has its article: "The garden door" → "the garden door".
  if (/^the\s/i.test(l)) return `the ${l.slice(4).trim()}`;
  const words = l.split(/\s+/);
  const plain = words.every((w, i) => (i === 0 ? /^[A-Z][a-z]*$/.test(w) : /^[a-z]+$/.test(w)));
  return plain ? `the ${l.toLowerCase()}` : `the ${l}`;
}

function nearestLandmark(marks: Landmark[], p: Pt, within: number): Landmark | null {
  let best: Landmark | null = null;
  let bestD = within;
  for (const m of marks) {
    const d = Math.hypot(m.at.x - p.x, m.at.y - p.y) - m.size;
    if (d < bestD) {
      best = m;
      bestD = d;
    }
  }
  return best;
}

/** Plain-language steps for a route, landmarks first, ending at the table. */
export function directions(route: Route, floor: FinderFloor, entranceLabel: string, targetId: string): Step[] {
  const target = floor.tables.find((t) => t.id === targetId);
  const tableName = target?.name.trim() || "your table";
  const marks = landmarks(floor, targetId);

  // Drop corners that barely turn or sit on very short legs; they read as noise.
  const pts = [route.points[0]];
  for (let i = 1; i < route.points.length - 1; i++) {
    const prev = pts[pts.length - 1];
    const here = route.points[i];
    const next = route.points[i + 1];
    if (Math.hypot(here.x - prev.x, here.y - prev.y) < 2.5) continue;
    if (Math.abs(turnOf(unit(prev, here), unit(here, next))) < 20) continue;
    pts.push(here);
  }
  pts.push(route.points[route.points.length - 1]);

  const legs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = legs.reduce((a, b) => a + b, 0) || 1;
  const startOf = (leg: number) => legs.slice(0, leg).reduce((a, b) => a + b, 0) / total;

  const steps: Step[] = [];
  const first = unit(pts[0], pts[1] ?? pts[0]);
  const lean = turnOf(route.facing, first);
  const toward = nearestLandmark(marks, pts[1] ?? pts[0], 7);
  const towardText = toward && pts.length > 2 ? ` toward ${toward.label}` : "";
  const way =
    Math.abs(lean) < 25 ? "walk straight in" : Math.abs(lean) < 65 ? `bear ${lean > 0 ? "right" : "left"}` : `head ${lean > 0 ? "right" : "left"}`;
  steps.push({ text: `Come in through ${theLabel(entranceLabel)} and ${way}${towardText}.`, icon: "enter", at: 0 });

  let lastMark: Landmark | null = toward;
  for (let i = 1; i < pts.length - 1; i++) {
    // The last few steps are covered by "your table is on your left".
    const rest = legs.slice(i).reduce((a, b) => a + b, 0);
    if (rest < 6) break;
    const turn = turnOf(unit(pts[i - 1], pts[i]), unit(pts[i], pts[i + 1]));
    const dir = turn > 0 ? "right" : "left";
    const slight = Math.abs(turn) < 50;
    const mark = nearestLandmark(marks, pts[i], 6);
    const verb = slight ? `bear ${dir}` : `turn ${dir}`;
    // Name a landmark once; the next turn by it is just "then".
    const text = mark && mark !== lastMark ? `At ${mark.label}, ${verb}.` : steps.length > 1 ? `Then ${verb}.` : `${verb[0].toUpperCase()}${verb.slice(1)}.`;
    if (mark) lastMark = mark;
    steps.push({ text, icon: slight ? (turn > 0 ? "slight-right" : "slight-left") : dir, at: startOf(i) });
  }

  const end = pts[pts.length - 1];
  const heading = unit(pts[Math.max(0, pts.length - 2)], end);
  const tc = target ? centreOf(target) : end;
  const rel = turnOf(heading, unit(end, tc));
  const side = Math.abs(rel) < 35 ? "straight ahead" : sideOf(end, heading, tc) > 0 ? "on your right" : "on your left";
  steps.push({ text: `${tableName} is ${side}.`, icon: "arrive", at: 1 });
  return steps;
}
