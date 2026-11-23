"use client";

import { forwardRef, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Y_SCALE, chairLabel, chairLayout, chairsOf, clampElementSize, clampRotation, clampX, clampY, elementsOf, fitInside, fourSideCounts, initials, needsSeat, roomOf, roomYMax, seatsTaken, type Room } from "@/lib/seating";
import type { GuestListEntry, GuestSide, SeatingPlan, SeatingTable, VenueElement } from "@/types/wedding";
import { ELEMENT_ICON, GUEST_MIME, SEAT_FILL, isGuestDrag, plural } from "./shared";

export type Selection = { type: "table" | "element"; id: string };

// ─── Geometry ────────────────────────────────────────────────────────────────
// Sizes are in container-width units (cqw) so the plan scales as a whole, and
// zooming is just a wider container.

export const SEAT = 2.3; // seat disc diameter
export const SEAT_GAP = 1.75; // table edge → seat centre

const CURVE_DEPTH = 5; // band width of a curved table
const CURVE_STEPS = 48;

interface CurveGeometry {
  w: number;
  h: number;
  /** Outline in the table's own box, in cqw. */
  d: string;
  seats: { x: number; y: number }[];
  label: { x: number; y: number };
  /** The two open ends, with the heading pointing out of the table (radians). */
  ends: { x: number; y: number; out: number }[];
}

/**
 * A curved banquet table: a band of constant depth bent along a centreline.
 * One bend makes an arc; `sBend` turns back the other way halfway, making an S.
 * Chairs line both edges, left to right along one side, then back along the other.
 */
export function curveGeometry(t: SeatingTable): CurveGeometry {
  const front = Math.ceil(t.seats / 2);
  const back = t.seats - front;
  const sweep = ((t.sweep ?? 90) * Math.PI) / 180;
  // The inside of each bend is shorter than the centreline; lengthen it so those chairs still fit.
  const reach = CURVE_DEPTH / 2 + SEAT_GAP;
  const length = 2 + Math.max(1, front) * 3.2 + (t.sBend ? 2 : 1) * sweep * reach;
  const k = t.sBend ? (2 * sweep) / length : sweep / length;
  const ds = length / CURVE_STEPS;

  // Walk the centreline from a heading that keeps the shape symmetric.
  const line: { x: number; y: number; a: number }[] = [];
  let x = 0;
  let y = 0;
  let a = -sweep / 2;
  for (let i = 0; i <= CURVE_STEPS; i++) {
    line.push({ x, y, a });
    const turn = t.sBend && i >= CURVE_STEPS / 2 ? -k : k;
    const next = a + turn * ds;
    x += Math.cos((a + next) / 2) * ds;
    y += Math.sin((a + next) / 2) * ds;
    a = next;
  }
  /** Point `s` along the centreline, pushed `offset` to its side. */
  const at = (s: number, offset: number) => {
    const f = Math.max(0, Math.min(CURVE_STEPS, (s / length) * CURVE_STEPS));
    const i = Math.min(CURVE_STEPS - 1, Math.floor(f));
    const p = line[i];
    const q = line[i + 1];
    const u = f - i;
    const pa = p.a + (q.a - p.a) * u;
    return { x: p.x + (q.x - p.x) * u - Math.sin(pa) * offset, y: p.y + (q.y - p.y) * u + Math.cos(pa) * offset };
  };

  const half = CURVE_DEPTH / 2;
  const edge = (offset: number) => line.map((_, i) => at((i / CURVE_STEPS) * length, offset));
  const outline = [...edge(-half), ...edge(half).reverse()];
  const minX = Math.min(...outline.map((p) => p.x));
  const minY = Math.min(...outline.map((p) => p.y));
  const shift = (p: { x: number; y: number }) => ({ x: p.x - minX, y: p.y - minY });
  const pts = outline.map(shift);

  return {
    w: Math.max(...pts.map((p) => p.x)),
    h: Math.max(...pts.map((p) => p.y)),
    d: `M${pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("L")}Z`,
    seats: [
      ...Array.from({ length: front }, (_, i) => shift(at(((i + 0.5) / front) * length, -reach))),
      ...Array.from({ length: back }, (_, i) => shift(at(((back - i - 0.5) / back) * length, reach))),
    ],
    label: shift(at(length / 2, 0)),
    ends: [
      { ...shift(line[0]), out: line[0].a + Math.PI },
      { ...shift(line[CURVE_STEPS]), out: line[CURVE_STEPS].a },
    ],
  };
}

// ─── Snapping curved tables end to end ───────────────────────────────────────

/** Converts stored y into plan units. */
const ASPECT = Y_SCALE;
const SNAP_DISTANCE = 3; // width units between ends before they pull together

type End = { x: number; y: number; out: number };

/** A curved table's ends on the plan, in width units, for a given centre and rotation. */
function curveEnds(t: SeatingTable, x: number, y: number, rotation: number): End[] {
  const g = curveGeometry(t);
  const r = (rotation * Math.PI) / 180;
  return g.ends.map((e) => {
    const dx = e.x - g.w / 2;
    const dy = e.y - g.h / 2;
    return { x: x + dx * Math.cos(r) - dy * Math.sin(r), y: y * ASPECT + dx * Math.sin(r) + dy * Math.cos(r), out: e.out + r };
  });
}

/**
 * While a curved table is dragged near the open end of another, line them up:
 * rotate it so the bands continue into each other and move it so the ends meet.
 * Chaining curves this way builds a long serpentine.
 */
export function snapCurve(t: SeatingTable, x: number, y: number, tables: SeatingTable[], room?: Room): { x: number; y: number; rotation: number } | null {
  const mine = curveEnds(t, x, y, t.rotation ?? 0);
  let best: { d: number; i: number; to: End } | null = null;
  for (const o of tables) {
    if (o.id === t.id || o.shape !== "curve") continue;
    for (const to of curveEnds(o, o.x, o.y, o.rotation ?? 0)) {
      for (let i = 0; i < mine.length; i++) {
        const d = Math.hypot(mine[i].x - to.x, mine[i].y - to.y);
        if (d < SNAP_DISTANCE && (!best || d < best.d)) best = { d, i, to };
      }
    }
  }
  if (!best) return null;
  const g = curveGeometry(t);
  const end = g.ends[best.i];
  const rotation = clampRotation(((best.to.out + Math.PI - end.out) * 180) / Math.PI);
  const r = (rotation * Math.PI) / 180;
  const dx = end.x - g.w / 2;
  const dy = end.y - g.h / 2;
  return {
    x: clampX(best.to.x - (dx * Math.cos(r) - dy * Math.sin(r)), room),
    y: clampY((best.to.y - (dx * Math.sin(r) + dy * Math.cos(r))) / ASPECT, room),
    rotation,
  };
}

export function tableSize(t: SeatingTable): { w: number; h: number } {
  if (t.shape === "curve") {
    const { w, h } = curveGeometry(t);
    return { w, h };
  }
  if (t.shape === "round") return { w: 7 + t.seats * 0.45, h: 7 + t.seats * 0.45 };
  if (t.shape === "arc") {
    const w = 8 + t.seats * 1.45;
    return { w, h: w / 2 };
  }
  if (t.seatSides === 1) return { w: 5 + t.seats * 2.7, h: 5 };
  if (t.seatSides === 4) {
    const { long, ends } = fourSideCounts(t);
    return { w: 5 + long * 2.8, h: Math.max(6, 1.5 + ends * 2.8) };
  }
  return { w: 5 + Math.ceil(t.seats / 2) * 2.8, h: 6 };
}

/** Half the table's footprint including chairs, for placing things beside it. */
export const tableReach = (t: SeatingTable) => {
  const { w, h } = tableSize(t);
  return Math.max(w, h) / 2 + SEAT_GAP + SEAT / 2;
};

/** Chair centres in the table's own (unrotated) box, in width units, top-left origin. */
export function seatPoints(t: SeatingTable): { x: number; y: number }[] {
  if (t.shape === "curve") return curveGeometry(t).seats;
  const { w, h } = tableSize(t);
  if (t.shape === "round") {
    const r = w / 2 + SEAT_GAP;
    return Array.from({ length: t.seats }, (_, i) => {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      return { x: w / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r };
    });
  }
  if (t.shape === "arc") {
    // Chairs follow the curve, left to right; the flat side faces the room.
    const r = w / 2 + SEAT_GAP;
    return Array.from({ length: t.seats }, (_, i) => {
      const a = Math.PI + ((i + 0.5) / t.seats) * Math.PI;
      return { x: w / 2 + Math.cos(a) * r, y: h + Math.sin(a) * r };
    });
  }
  const row = (count: number, y: number) => Array.from({ length: count }, (_, i) => ({ x: ((i + 0.5) / count) * w, y }));
  const column = (count: number, x: number) => Array.from({ length: count }, (_, i) => ({ x, y: ((i + 0.5) / count) * h }));

  if (t.seatSides === 1) return row(t.seats, -SEAT_GAP);
  if (t.seatSides === 4) {
    const { long, ends } = fourSideCounts(t);
    return [
      ...row(long, -SEAT_GAP),
      ...column(ends, w + SEAT_GAP),
      ...row(long, h + SEAT_GAP).reverse(),
      ...column(ends, -SEAT_GAP).reverse(),
    ];
  }
  const top = Math.ceil(t.seats / 2);
  return [...row(top, -SEAT_GAP), ...row(t.seats - top, h + SEAT_GAP).reverse()];
}

// ─── Keeping things inside the walls ──────────────────────────────────────────

/** Half the footprint of a table (top and chairs), along the room's axes, at a rotation. */
export function tableHalf(t: SeatingTable, rotation = t.rotation ?? 0): { x: number; y: number } {
  const { w, h } = tableSize(t);
  const corners = t.shape === "curve" ? curveOutline(t) : [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: 0, y: h }, { x: w, y: h }];
  const r = (rotation * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  let hx = 0;
  let hy = 0;
  const reach = (p: { x: number; y: number }, pad: number) => {
    const dx = p.x - w / 2;
    const dy = p.y - h / 2;
    hx = Math.max(hx, Math.abs(dx * cos - dy * sin) + pad);
    hy = Math.max(hy, Math.abs(dx * sin + dy * cos) + pad);
  };
  for (const p of corners) reach(p, 0);
  for (const p of seatPoints(t)) reach(p, SEAT / 2);
  return { x: hx, y: hy };
}

function curveOutline(t: SeatingTable): { x: number; y: number }[] {
  return curveGeometry(t)
    .d.replace(/^M|Z$/g, "")
    .split("L")
    .map((pair) => {
      const [x, y] = pair.trim().split(" ").map(Number);
      return { x, y };
    });
}

/** Half the footprint of a venue feature along the room's axes. */
export function elementHalf(e: Pick<VenueElement, "w" | "h" | "shape" | "rotation">): { x: number; y: number } {
  const r = ((e.rotation ?? 0) * Math.PI) / 180;
  const a = e.w / 2;
  const b = e.h / 2;
  const cos = Math.abs(Math.cos(r));
  const sin = Math.abs(Math.sin(r));
  if (e.shape === "ellipse") return { x: Math.hypot(a * cos, b * sin), y: Math.hypot(a * sin, b * cos) };
  return { x: a * cos + b * sin, y: a * sin + b * cos };
}

/**
 * The plan with every table and feature moved just enough to sit inside the
 * walls. Returns the same plan when nothing sticks out.
 */
export function keepInside(plan: SeatingPlan): SeatingPlan {
  const room = roomOf(plan);
  let changed = false;
  const move = <T extends { x: number; y: number }>(item: T, half: { x: number; y: number }): T => {
    const p = fitInside(item.x, item.y, half, room);
    if (p.x === item.x && p.y === item.y) return item;
    changed = true;
    return { ...item, ...p };
  };
  const tables = plan.tables.map((t) => move(t, tableHalf(t)));
  const elements = elementsOf(plan).map((e) => move(e, elementHalf(e)));
  return changed ? { ...plan, tables, ...(plan.elements ? { elements } : {}) } : plan;
}

/** The smallest room that still holds every table (chairs included) and feature, in plan units. */
export function minRoomFor(plan: SeatingPlan): Room {
  let w = 0;
  let h = 0;
  const grow = (item: { x: number; y: number }, half: { x: number; y: number }) => {
    w = Math.max(w, item.x + half.x);
    h = Math.max(h, item.y * Y_SCALE + half.y);
  };
  for (const t of plan.tables) grow(t, tableHalf(t));
  for (const e of elementsOf(plan)) grow(e, elementHalf(e));
  return { w, h };
}

function seatPositions(t: SeatingTable): { left: string; top: string }[] {
  return seatPoints(t).map((p) => ({ left: `${p.x.toFixed(2)}cqw`, top: `${p.y.toFixed(2)}cqw` }));
}

function tableRadius(t: SeatingTable, w: number): string {
  if (t.shape === "round") return "var(--radius-full)";
  if (t.shape === "arc") return `${w / 2}cqw ${w / 2}cqw 0 0`;
  return "var(--radius-sm)";
}

/** Width the upright label can use inside a rotated box without spilling out. */
function labelWidth(w: number, h: number, rotation: number): number {
  const r = rotation % 180;
  if (r === 0) return w;
  if (r === 90) return h;
  return Math.min(w, h) * 1.15;
}

/**
 * Where a feature's name sits in its box: the text's angle relative to the box
 * (which is itself turned by `rot`), the room along the text, and the room across it.
 */
export function featureLabelLayout(mode: VenueElement["labelMode"], w: number, h: number, rot: number): { angle: number; width: number; cross: number } {
  if (mode === "along") return w >= h ? { angle: 0, width: w, cross: h } : { angle: 90, width: h, cross: w };
  // Reads top to bottom on screen; the room is the box's height on screen.
  if (mode === "down") return { angle: 90 - rot, width: labelWidth(h, w, rot), cross: labelWidth(w, h, rot) };
  return { angle: -rot, width: labelWidth(w, h, rot), cross: labelWidth(h, w, rot) };
}

const ELEMENT_PATTERN: Partial<Record<VenueElement["kind"], string>> = {
  stage: "repeating-linear-gradient(135deg, transparent 0 0.55cqw, rgb(47 30 38 / 0.07) 0.55cqw 0.65cqw)",
  danceFloor:
    "conic-gradient(rgb(47 30 38 / 0.06) 25%, transparent 0 50%, rgb(47 30 38 / 0.06) 0 75%, transparent 0) 0 0 / 2.4cqw 2.4cqw",
  entrance: "repeating-linear-gradient(90deg, transparent 0 0.8cqw, rgb(47 30 38 / 0.06) 0.8cqw 1cqw)",
};

// ─── Surface ─────────────────────────────────────────────────────────────────

interface Props {
  plan: SeatingPlan;
  byTable: Map<string, GuestListEntry[]>;
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  /** Static render for print: no handlers, no hover, no focus stops. */
  readOnly?: boolean;
  selection?: Selection | null;
  /** A guest is waiting to be placed ("click a guest, then a table"). */
  picking?: boolean;
  /** The picked guest's current table, outlined so it's easy to find. */
  homeTableId?: string | null;
  /** Lowercased table search; non-matching tables fade. */
  query?: string;
  locked?: boolean;
  style?: CSSProperties;
  emptyState?: ReactNode;
  onSelect?: (sel: Selection | null) => void;
  onTableClick?: (id: string) => void;
  onMoveTable?: (id: string, x: number, y: number, rotation?: number) => void;
  /** Content pinned beside the selected table (who's there, guest details). */
  renderTableCard?: (t: SeatingTable) => ReactNode;
  onPatchElement?: (id: string, data: Partial<VenueElement>) => void;
  /** A guest dropped on a table (`chair` omitted: next free chairs) or on a specific chair (0-based). */
  onDropGuest?: (guestId: string, tableId: string, chair?: number) => void;
  /** A chair clicked while a guest is waiting to be placed ("click a guest, then a chair"). */
  onChairClick?: (tableId: string, chair: number) => void;
  onDeleteSelected?: () => void;
}

type Draft = { id: string; x: number; y: number; w?: number; h?: number; rotation?: number; snapped?: boolean };
type DragState = {
  kind: "table" | "element";
  mode: "move" | "resize";
  id: string;
  px: number;
  py: number;
  x0: number;
  y0: number;
  w0: number;
  h0: number;
  rotation: number;
  moved: boolean;
};

const NUDGE: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

const FloorSurface = forwardRef<HTMLDivElement, Props>(function FloorSurface(
  {
    plan, byTable, sideOf, readOnly, selection, picking, homeTableId, query = "", locked, style, emptyState, renderTableCard,
    onSelect, onTableClick, onMoveTable, onPatchElement, onDropGuest, onChairClick, onDeleteSelected,
  },
  ref
) {
  const planRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  /** The chair a guest is being dragged over, as "tableId:chair". */
  const [dropChair, setDropChair] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const elements = elementsOf(plan);
  const room = roomOf(plan);

  const setRefs = (node: HTMLDivElement | null) => {
    planRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const startDrag = (e: PointerEvent<HTMLElement>, state: Omit<DragState, "px" | "py" | "moved">) => {
    if (readOnly || locked || picking || e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = { ...state, px: e.clientX, py: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    const rect = planRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    setHoverId(null);
    // Pointer pixels → plan units (the floor is room.w units wide at any zoom).
    const unit = room.w / rect.width;
    if (d.mode === "move") {
      const t = d.kind === "table" ? plan.tables.find((tt) => tt.id === d.id) : undefined;
      const el = d.kind === "element" ? elements.find((ee) => ee.id === d.id) : undefined;
      const half = t ? tableHalf(t) : el ? elementHalf(el) : { x: 0, y: 0 };
      const { x, y } = fitInside(d.x0 + dx * unit, d.y0 + (dy * unit) / Y_SCALE, half, room);
      const snap = t?.shape === "curve" ? snapCurve(t, x, y, plan.tables, room) : null;
      const snapped = snap && t ? { ...snap, ...fitInside(snap.x, snap.y, tableHalf(t, snap.rotation), room) } : null;
      setDraft(snapped ? { id: d.id, ...snapped, snapped: true } : { id: d.id, x, y });
      return;
    }
    // Resize from the corner with the centre fixed, measured along the shape's own axes.
    const a = (-d.rotation * Math.PI) / 180;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    setDraft({
      id: d.id,
      x: d.x0,
      y: d.y0,
      w: Math.min(room.w, clampElementSize(d.w0 + 2 * lx * unit, "w")),
      h: Math.min(room.h, clampElementSize(d.h0 + 2 * ly * unit, "h")),
    });
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    if (d?.moved && draft) {
      if (d.kind === "table") onMoveTable?.(d.id, draft.x, draft.y, draft.rotation);
      else if (d.mode === "move") onPatchElement?.(d.id, { x: draft.x, y: draft.y });
      else onPatchElement?.(d.id, { w: draft.w, h: draft.h });
    }
    setDraft(null);
    // Keep `moved` until the click that follows this pointerup has been ignored.
    setTimeout(() => {
      if (dragRef.current === d) dragRef.current = null;
    }, 0);
  };

  const cancelDrag = () => {
    dragRef.current = null;
    setDraft(null);
  };

  const onItemKey = (e: KeyboardEvent<HTMLElement>, x: number, y: number, half: { x: number; y: number }, move: (x: number, y: number) => void) => {
    if ((e.key === "Delete" || e.key === "Backspace") && !locked) {
      e.preventDefault();
      onDeleteSelected?.();
      return;
    }
    const delta = NUDGE[e.key];
    if (!delta || locked) return;
    e.preventDefault();
    const step = e.shiftKey ? 5 : 1;
    const next = fitInside(x + delta[0] * step, y + delta[1] * step, half, room);
    move(next.x, next.y);
    // Bigger rooms scroll; keep the item being nudged in view.
    const item = e.currentTarget;
    requestAnimationFrame(() => item.scrollIntoView({ block: "nearest", inline: "nearest" }));
  };

  const isSel = (type: Selection["type"], id: string) => selection?.type === type && selection.id === id;
  const hovered = !draft && hoverId && !isSel("table", hoverId) ? plan.tables.find((t) => t.id === hoverId) : undefined;
  const pinned = !draft && renderTableCard && selection?.type === "table" ? plan.tables.find((t) => t.id === selection.id) : undefined;
  const interactive = !readOnly;

  return (
    <div
      ref={setRefs}
      className="relative select-none"
      onClick={(e) => {
        if (interactive && e.target === e.currentTarget) onSelect?.(null);
      }}
      style={{
        aspectRatio: `${room.w} / ${room.h}`,
        // The room's walls, so its size reads against the canvas when zoomed out.
        ...(readOnly ? {} : { background: "var(--color-surface-container-lowest)", boxShadow: "0 0 0 1px var(--color-outline)" }),
        ...style,
      }}
    >
      {plan.tables.length === 0 && elements.length === 0 && emptyState}

      {/*
        The ruler: a container exactly 100 plan units wide, so every size inside
        (in cqw) is in plan units however big the room is. It has no height and
        lets clicks through to the floor; items inside are placed in units too.
      */}
      <div className="pointer-events-none absolute left-0 top-0" style={{ width: `${(100 / room.w) * 100}%`, containerType: "inline-size" }}>
      {/* Dot grid, sized in cqw so it zooms with the plan. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0"
        style={{
          width: `${room.w}cqw`,
          height: `${room.h}cqw`,
          backgroundImage: "radial-gradient(circle, var(--color-outline) 0.09cqw, transparent 0.12cqw)",
          backgroundSize: "2.5cqw 2.5cqw",
          opacity: readOnly ? 0 : 1,
        }}
      />

      {elements.map((el) => {
        const d = draft?.id === el.id ? draft : null;
        const x = d?.x ?? el.x;
        const y = d?.y ?? el.y;
        const w = d?.w ?? el.w;
        const h = d?.h ?? el.h;
        const rot = el.rotation ?? 0;
        const selected = isSel("element", el.id);
        const Icon = ELEMENT_ICON[el.kind];
        const mode = el.labelMode ?? "upright";
        const label = featureLabelLayout(mode, w, h, rot);
        // Too little room across the text for a line of it: the icon alone.
        const iconOnly = mode === "icon" || label.cross < 1.8;
        return (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: `${x}cqw`,
              top: `${y * Y_SCALE}cqw`,
              pointerEvents: "auto",
              width: `${w}cqw`,
              height: `${h}cqw`,
              transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              zIndex: d ? 3 : 0,
            }}
          >
            <button
              type="button"
              tabIndex={interactive ? 0 : -1}
              aria-label={`${el.label || "Untitled area"}, room feature`}
              aria-pressed={interactive ? selected : undefined}
              disabled={readOnly}
              onPointerDown={(e) => startDrag(e, { kind: "element", mode: "move", id: el.id, x0: el.x, y0: el.y, w0: el.w, h0: el.h, rotation: rot })}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={cancelDrag}
              onClick={() => {
                if (dragRef.current?.moved || picking) return;
                onSelect?.({ type: "element", id: el.id });
              }}
              onKeyDown={(e) => onItemKey(e, el.x, el.y, elementHalf(el), (nx, ny) => onPatchElement?.(el.id, { x: nx, y: ny }))}
              className="absolute inset-0 touch-none transition-[box-shadow,border-color] duration-150 disabled:cursor-default"
              style={{
                cursor: readOnly ? "default" : picking ? "not-allowed" : locked ? "pointer" : d ? "grabbing" : "grab",
                borderRadius: el.shape === "ellipse" ? "50%" : "var(--radius-sm)",
                background: [ELEMENT_PATTERN[el.kind], "var(--color-surface-container)"].filter(Boolean).join(", "),
                border: `${selected ? 1.5 : 1}px solid ${selected ? "var(--color-primary)" : "var(--color-outline)"}`,
                boxShadow: selected ? "0 0 0 3px var(--color-primary-container-strong)" : "none",
                opacity: picking ? 0.6 : 1,
              }}
            >
              <span
                className="absolute left-1/2 top-1/2 flex items-center justify-center gap-[0.4cqw] overflow-hidden px-[0.4cqw] font-medium leading-tight"
                style={{
                  width: `${label.width}cqw`,
                  transform: `translate(-50%, -50%) rotate(${label.angle}deg)`,
                  fontSize: "max(8px, 0.95cqw)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <Icon
                  aria-hidden
                  className="shrink-0"
                  style={
                    mode === "icon"
                      ? { width: `max(12px, ${Math.min(3, Math.min(w, h) * 0.55)}cqw)`, height: `max(12px, ${Math.min(3, Math.min(w, h) * 0.55)}cqw)` }
                      : { width: "max(10px, 1.15cqw)", height: "max(10px, 1.15cqw)" }
                  }
                />
                {!iconOnly && <span className="truncate">{el.label}</span>}
              </span>
            </button>
            {selected && interactive && !locked && (
              <span
                role="presentation"
                title="Drag to resize"
                onPointerDown={(e) => startDrag(e, { kind: "element", mode: "resize", id: el.id, x0: el.x, y0: el.y, w0: el.w, h0: el.h, rotation: rot })}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={cancelDrag}
                className="absolute touch-none"
                style={{
                  right: -6,
                  bottom: -6,
                  width: 12,
                  height: 12,
                  cursor: rot % 180 === 90 ? "nesw-resize" : "nwse-resize",
                  background: "var(--color-surface-container-lowest)",
                  border: "1.5px solid var(--color-primary)",
                  borderRadius: 3,
                }}
              />
            )}
          </div>
        );
      })}

      {plan.tables.map((t) => {
        const pos = draft?.id === t.id ? draft : t;
        const seated = byTable.get(t.id) ?? [];
        const taken = seatsTaken(seated);
        const over = taken > t.seats;
        const { w, h } = tableSize(t);
        const snapping = draft?.id === t.id && draft.snapped;
        const rot = (draft?.id === t.id ? draft.rotation : undefined) ?? t.rotation ?? 0;
        const perSeat = chairLayout(t, seated, plan.chairs);
        const selected = isSel("table", t.id);
        const isDrop = dropId === t.id;
        const isHome = homeTableId === t.id;
        const name = t.name || "Untitled";
        const q = query.trim();
        const matches = !q || name.toLowerCase().includes(q) || (t.tag ?? "").toLowerCase().includes(q);
        const curve = t.shape === "curve" ? curveGeometry(t) : null;
        const lw = curve ? 11 : labelWidth(w, h, rot);
        const ring = selected || isDrop || isHome || snapping ? "var(--color-primary)" : over ? "var(--color-error)" : "var(--color-outline)";
        const fill = isDrop ? "var(--color-primary-container-strong)" : "var(--color-surface-container-lowest)";

        return (
          <div
            key={t.id}
            className="absolute transition-opacity duration-150"
            style={{
              left: `${pos.x}cqw`,
              top: `${pos.y * Y_SCALE}cqw`,
              pointerEvents: "auto",
              width: `${w}cqw`,
              height: `${h}cqw`,
              transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              zIndex: draft?.id === t.id ? 4 : selected ? 2 : 1,
              opacity: matches ? 1 : 0.3,
            }}
            onPointerEnter={() => interactive && !dragRef.current && setHoverId(t.id)}
            onPointerLeave={() => setHoverId((cur) => (cur === t.id ? null : cur))}
            onDragOver={(e) => {
              if (!interactive || !isGuestDrag(e)) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setDropId(t.id);
            }}
            onDragLeave={() => setDropId((cur) => (cur === t.id ? null : cur))}
            onDrop={(e) => {
              setDropId(null);
              const id = e.dataTransfer.getData(GUEST_MIME);
              if (id) onDropGuest?.(id, t.id);
            }}
          >
            {seatPositions(t).map((p, i) => {
              const g = perSeat[i];
              const key = `${t.id}:${i}`;
              const isDropChair = dropChair === key;
              // Chairs take a guest dropped (or clicked while picking) on them; a seated chair can be dragged on.
              const chairable = interactive && !locked;
              return (
                <span
                  key={i}
                  aria-hidden
                  title={chairable ? (g ? `${g.name}, seat ${i + 1}. Drag to another seat.` : `Seat ${i + 1}`) : undefined}
                  draggable={chairable && Boolean(g)}
                  onDragStart={(e) => {
                    if (!g) return;
                    e.stopPropagation();
                    e.dataTransfer.setData(GUEST_MIME, g.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    if (!chairable || !isGuestDrag(e)) return;
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "move";
                    setDropId(null);
                    setDropChair(key);
                  }}
                  onDragLeave={() => setDropChair((cur) => (cur === key ? null : cur))}
                  onDrop={(e) => {
                    if (!chairable) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setDropChair(null);
                    setDropId(null);
                    const id = e.dataTransfer.getData(GUEST_MIME);
                    if (id) onDropGuest?.(id, t.id, i);
                  }}
                  onClick={(e) => {
                    if (!chairable || !picking) return;
                    e.stopPropagation();
                    onChairClick?.(t.id, i);
                  }}
                  className={`absolute flex items-center justify-center font-semibold tabular-nums leading-none ${chairable ? "" : "pointer-events-none"}`}
                  style={{
                    ...p,
                    width: `${SEAT}cqw`,
                    height: `${SEAT}cqw`,
                    transform: `translate(-50%, -50%) rotate(${-rot}deg) scale(${isDropChair ? 1.3 : 1})`,
                    cursor: chairable ? (picking ? "copy" : g ? "grab" : "default") : undefined,
                    zIndex: isDropChair ? 3 : undefined,
                    boxShadow: isDropChair ? "0 0 0 2px var(--color-surface-container-lowest), 0 0 0 4px var(--color-primary)" : undefined,
                    borderRadius: "var(--radius-full)",
                    background: g ? SEAT_FILL[sideOf(g) ?? "none"] : isDropChair ? "var(--color-primary-container-strong)" : "var(--color-surface-container-lowest)",
                    border: g ? "none" : "1px solid var(--color-outline)",
                    color: g ? "#fff" : "var(--color-on-surface-muted)",
                    fontSize: g ? "max(6px, 0.82cqw)" : "max(5px, 0.7cqw)",
                    fontWeight: g ? 600 : 400,
                    letterSpacing: "0.01em",
                    transition: "background-color 200ms ease-out, border-color 200ms ease-out, color 200ms ease-out, transform 150ms ease-out, box-shadow 150ms ease-out",
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                  }}
                >
                  {g ? initials(g.name) : i + 1}
                </span>
              );
            })}
            <button
              type="button"
              tabIndex={interactive ? 0 : -1}
              aria-label={`${name}, ${taken} of ${t.seats} seats taken${over ? ", over capacity" : ""}`}
              aria-pressed={interactive ? selected : undefined}
              disabled={readOnly}
              onPointerDown={(e) => startDrag(e, { kind: "table", mode: "move", id: t.id, x0: t.x, y0: t.y, w0: 0, h0: 0, rotation: rot })}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={cancelDrag}
              onFocus={() => interactive && setHoverId(t.id)}
              onBlur={() => setHoverId((cur) => (cur === t.id ? null : cur))}
              onClick={() => {
                if (dragRef.current?.moved) return;
                onTableClick?.(t.id);
              }}
              onKeyDown={(e) => onItemKey(e, t.x, t.y, tableHalf(t), (nx, ny) => onMoveTable?.(t.id, nx, ny))}
              className="absolute inset-0 touch-none transition-[box-shadow,background-color,border-color] duration-150 disabled:cursor-default"
              style={{
                cursor: readOnly ? "default" : picking ? "copy" : locked ? "pointer" : draft?.id === t.id ? "grabbing" : "grab",
                borderRadius: tableRadius(t, w),
                background: curve ? "transparent" : fill,
                border: curve ? "none" : `1.5px ${isHome && !selected ? "dashed" : "solid"} ${ring}`,
                boxShadow: curve
                  ? "none"
                  : selected
                  ? "0 0 0 3px var(--color-primary-container-strong)"
                  : picking
                    ? "0 0 0 2px var(--color-primary-container)"
                    : q && matches
                      ? "0 0 0 3px var(--color-primary-container-strong)"
                      : "0 1px 2px rgb(47 30 38 / 0.06)",
              }}
            >
              {curve && (
                <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${w} ${h}`}>
                  {(selected || (q && matches)) && (
                    <path d={curve.d} fill="none" stroke="var(--color-primary-container-strong)" strokeWidth={6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  )}
                  <path
                    d={curve.d}
                    fill={fill}
                    stroke={ring}
                    strokeWidth={1.5}
                    strokeDasharray={isHome && !selected ? "4 3" : undefined}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span
                className={`absolute left-1/2 flex items-center justify-center px-[0.3cqw] text-center leading-tight ${
                  t.shape === "rect" && h < 7 ? "flex-row gap-[0.5cqw]" : "flex-col gap-[0.25cqw]"
                }`}
                style={{
                  top: curve ? `${curve.label.y}cqw` : t.shape === "arc" ? "62%" : "50%",
                  left: curve ? `${curve.label.x}cqw` : undefined,
                  width: `${lw}cqw`,
                  transform: `translate(-50%, -50%) rotate(${-rot}deg)`,
                }}
              >
                {t.tag && (
                  <span
                    className="max-w-full truncate px-[0.55cqw] py-[0.12cqw] font-medium"
                    style={{
                      fontSize: "max(7px, 0.78cqw)",
                      background: "var(--color-on-surface)",
                      color: "#fff",
                      borderRadius: "var(--radius-full)",
                      printColorAdjust: "exact",
                      WebkitPrintColorAdjust: "exact",
                    }}
                  >
                    {t.tag}
                  </span>
                )}
                <span className="block max-w-full truncate font-semibold" style={{ fontSize: "max(9px, 1.1cqw)", color: "var(--color-on-surface)" }}>
                  {name}
                </span>
                <span
                  className="block tabular-nums"
                  style={{ fontSize: "max(8px, 0.88cqw)", color: over ? "var(--color-error)" : "var(--color-on-surface-variant)" }}
                >
                  {taken}/{t.seats}
                </span>
              </span>
            </button>
          </div>
        );
      })}

      {hovered && <HoverCard table={hovered} room={room} seated={byTable.get(hovered.id) ?? []} chairs={plan.chairs} sideOf={sideOf} />}
      {pinned && renderTableCard && (
        <CardFrame table={pinned} room={room} interactive>
          {renderTableCard(pinned)}
        </CardFrame>
      )}
      </div>
    </div>
  );
});

export default FloorSurface;

/** A floating card beside a table, flipped to whichever side has room. */
function CardFrame({ table, room, interactive, children }: { table: SeatingTable; room: Room; interactive?: boolean; children: ReactNode }) {
  const reach = tableReach(table) + 1;
  const flip = table.x > room.w * 0.6;
  const fy = table.y / roomYMax(room);
  const ty = fy < 0.22 ? "-12%" : fy > 0.78 ? "-88%" : "-50%";
  return (
    <div
      aria-hidden={interactive ? undefined : true}
      role={interactive ? "dialog" : undefined}
      aria-label={interactive ? `${table.name || "Table"} guests` : undefined}
      className={`popover-in absolute ${interactive ? "" : "pointer-events-none"}`}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        left: `${flip ? table.x - reach : table.x + reach}cqw`,
        top: `${table.y * Y_SCALE}cqw`,
        pointerEvents: interactive ? "auto" : "none",
        transform: `translate(${flip ? "-100%" : "0"}, ${ty})`,
        zIndex: interactive ? 7 : 6,
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 16px 40px -12px rgb(47 30 38 / 0.22), 0 2px 6px rgb(47 30 38 / 0.06)",
      }}
    >
      {children}
    </div>
  );
}

/** Who's at a table, shown beside it on hover or keyboard focus. */
function HoverCard({ table, room, seated, chairs, sideOf }: { table: SeatingTable; room: Room; seated: GuestListEntry[]; chairs?: Record<string, number>; sideOf: (g: GuestListEntry) => GuestSide | undefined }) {
  const layout = chairLayout(table, seated, chairs);
  const list = seated.filter(needsSeat);
  const shown = list.slice(0, 10);
  const taken = seatsTaken(seated);

  return (
    <CardFrame table={table} room={room}>
    <div className="w-56 p-3">
      <p className="flex items-baseline justify-between gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
        <span className="truncate">{table.name || "Untitled"}</span>
        <span className="shrink-0 text-xs font-normal tabular-nums" style={{ color: taken > table.seats ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
          {taken} of {table.seats}
        </span>
      </p>
      {table.tag && <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{table.tag}</p>}
      {shown.length === 0 ? (
        <p className="mt-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>No one seated yet. Drag a guest here.</p>
      ) : (
        <ul className="mt-2 space-y-1.5" style={{ borderTop: "1px solid var(--color-outline)", paddingTop: "0.5rem" }}>
          {shown.map((g) => (
            <li key={g.id} className="flex items-center gap-2 text-xs" style={{ color: "var(--color-on-surface)" }}>
              <Avatar name={g.name} side={sideOf(g)} size={20} />
              <span className="min-w-0 flex-1 truncate">{g.name}</span>
              <span className="shrink-0 tabular-nums" style={{ color: "var(--color-on-surface-variant)" }}>
                {chairLabel(chairsOf(layout, g.id)).replace(/^Seats? /, "#") || (g.partySize > 1 ? `×${g.partySize}` : "")}
              </span>
            </li>
          ))}
          {list.length > shown.length && (
            <li className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>and {plural(list.length - shown.length, "more guest")}</li>
          )}
        </ul>
      )}
    </div>
    </CardFrame>
  );
}

export function Avatar({ name, side, size = 28 }: { name: string; side: GuestSide | undefined; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center font-semibold leading-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        borderRadius: "var(--radius-full)",
        background: SEAT_FILL[side ?? "none"],
        color: "#fff",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      {initials(name)}
    </span>
  );
}
