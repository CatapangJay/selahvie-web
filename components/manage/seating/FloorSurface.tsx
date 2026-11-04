"use client";

import { forwardRef, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { clampElementSize, clampPos, elementsOf, fourSideCounts, initials, needsSeat, seatsFor, seatsTaken } from "@/lib/seating";
import type { GuestListEntry, GuestSide, SeatingPlan, SeatingTable, VenueElement } from "@/types/wedding";
import { ELEMENT_ICON, GUEST_MIME, SEAT_FILL, isGuestDrag, plural } from "./shared";

export type Selection = { type: "table" | "element"; id: string };

// ─── Geometry ────────────────────────────────────────────────────────────────
// Sizes are in container-width units (cqw) so the plan scales as a whole, and
// zooming is just a wider container.

export const SEAT = 2.3; // seat disc diameter
const SEAT_GAP = 1.75; // table edge → seat centre

const CURVE_DEPTH = 5; // band width of a curved table
const CURVE_STEPS = 48;

interface CurveGeometry {
  w: number;
  h: number;
  /** Outline in the table's own box, in cqw. */
  d: string;
  seats: { x: number; y: number }[];
  label: { x: number; y: number };
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

function seatPositions(t: SeatingTable): { left: string; top: string }[] {
  if (t.shape === "curve") return curveGeometry(t).seats.map((p) => ({ left: `${p.x.toFixed(2)}cqw`, top: `${p.y.toFixed(2)}cqw` }));
  const { w, h } = tableSize(t);
  if (t.shape === "round") {
    const r = w / 2 + SEAT_GAP;
    return Array.from({ length: t.seats }, (_, i) => {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      return { left: `calc(50% + ${(Math.cos(a) * r).toFixed(2)}cqw)`, top: `calc(50% + ${(Math.sin(a) * r).toFixed(2)}cqw)` };
    });
  }
  if (t.shape === "arc") {
    // Chairs follow the curve, left to right; the flat side faces the room.
    const r = w / 2 + SEAT_GAP;
    return Array.from({ length: t.seats }, (_, i) => {
      const a = Math.PI + ((i + 0.5) / t.seats) * Math.PI;
      return { left: `calc(50% + ${(Math.cos(a) * r).toFixed(2)}cqw)`, top: `calc(100% + ${(Math.sin(a) * r).toFixed(2)}cqw)` };
    });
  }
  const row = (count: number, top: string) =>
    Array.from({ length: count }, (_, i) => ({ left: `${((i + 0.5) / count) * 100}%`, top }));
  const column = (count: number, left: string) =>
    Array.from({ length: count }, (_, i) => ({ left, top: `${((i + 0.5) / count) * 100}%` }));

  if (t.seatSides === 1) return row(t.seats, `-${SEAT_GAP}cqw`);
  const bottomTop = `calc(${h}cqw + ${SEAT_GAP}cqw)`;
  if (t.seatSides === 4) {
    const { long, ends } = fourSideCounts(t);
    return [
      ...row(long, `-${SEAT_GAP}cqw`),
      ...column(ends, `calc(100% + ${SEAT_GAP}cqw)`),
      ...row(long, bottomTop).reverse(),
      ...column(ends, `-${SEAT_GAP}cqw`).reverse(),
    ];
  }
  const top = Math.ceil(t.seats / 2);
  return [...row(top, `-${SEAT_GAP}cqw`), ...row(t.seats - top, bottomTop).reverse()];
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
  onMoveTable?: (id: string, x: number, y: number) => void;
  onPatchElement?: (id: string, data: Partial<VenueElement>) => void;
  onDropGuest?: (guestId: string, tableId: string) => void;
  onDeleteSelected?: () => void;
}

type Draft = { id: string; x: number; y: number; w?: number; h?: number };
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
    plan, byTable, sideOf, readOnly, selection, picking, homeTableId, query = "", locked, style, emptyState,
    onSelect, onTableClick, onMoveTable, onPatchElement, onDropGuest, onDeleteSelected,
  },
  ref
) {
  const planRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const elements = elementsOf(plan);

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
    if (d.mode === "move") {
      setDraft({ id: d.id, x: clampPos(d.x0 + (dx / rect.width) * 100), y: clampPos(d.y0 + (dy / rect.height) * 100) });
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
      w: clampElementSize(d.w0 + ((2 * lx) / rect.width) * 100, "w"),
      h: clampElementSize(d.h0 + ((2 * ly) / rect.width) * 100, "h"),
    });
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    if (d?.moved && draft) {
      if (d.kind === "table") onMoveTable?.(d.id, draft.x, draft.y);
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

  const onItemKey = (e: KeyboardEvent<HTMLElement>, x: number, y: number, move: (x: number, y: number) => void) => {
    if ((e.key === "Delete" || e.key === "Backspace") && !locked) {
      e.preventDefault();
      onDeleteSelected?.();
      return;
    }
    const delta = NUDGE[e.key];
    if (!delta || locked) return;
    e.preventDefault();
    const step = e.shiftKey ? 5 : 1;
    move(clampPos(x + delta[0] * step), clampPos(y + delta[1] * step));
  };

  const isSel = (type: Selection["type"], id: string) => selection?.type === type && selection.id === id;
  const hovered = !draft && hoverId ? plan.tables.find((t) => t.id === hoverId) : undefined;
  const interactive = !readOnly;

  return (
    <div
      ref={setRefs}
      className="relative select-none"
      onClick={(e) => {
        if (interactive && e.target === e.currentTarget) onSelect?.(null);
      }}
      style={{ aspectRatio: "16 / 10", containerType: "inline-size", ...style }}
    >
      {/* Dot grid, sized in cqw so it zooms with the plan. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-outline) 0.09cqw, transparent 0.12cqw)",
          backgroundSize: "2.5cqw 2.5cqw",
          opacity: readOnly ? 0 : 1,
        }}
      />

      {plan.tables.length === 0 && elements.length === 0 && emptyState}

      {elements.map((el) => {
        const d = draft?.id === el.id ? draft : null;
        const x = d?.x ?? el.x;
        const y = d?.y ?? el.y;
        const w = d?.w ?? el.w;
        const h = d?.h ?? el.h;
        const rot = el.rotation ?? 0;
        const selected = isSel("element", el.id);
        const Icon = ELEMENT_ICON[el.kind];
        const lw = labelWidth(w, h, rot);
        const compact = Math.min(w, h) < 3.2;
        return (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
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
              onKeyDown={(e) => onItemKey(e, el.x, el.y, (nx, ny) => onPatchElement?.(el.id, { x: nx, y: ny }))}
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
                  width: `${lw}cqw`,
                  transform: `translate(-50%, -50%) rotate(${-rot}deg)`,
                  fontSize: "max(8px, 0.95cqw)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <Icon aria-hidden className="shrink-0" style={{ width: "max(10px, 1.15cqw)", height: "max(10px, 1.15cqw)" }} />
                {!compact && <span className="truncate">{el.label}</span>}
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
        const rot = t.rotation ?? 0;
        const perSeat = seated.filter(needsSeat).flatMap((g) => Array<GuestListEntry>(seatsFor(g)).fill(g));
        const selected = isSel("table", t.id);
        const isDrop = dropId === t.id;
        const isHome = homeTableId === t.id;
        const name = t.name || "Untitled";
        const q = query.trim();
        const matches = !q || name.toLowerCase().includes(q) || (t.tag ?? "").toLowerCase().includes(q);
        const curve = t.shape === "curve" ? curveGeometry(t) : null;
        const lw = curve ? 11 : labelWidth(w, h, rot);
        const ring = selected || isDrop || isHome ? "var(--color-primary)" : over ? "var(--color-error)" : "var(--color-outline)";
        const fill = isDrop ? "var(--color-primary-container-strong)" : "var(--color-surface-container-lowest)";

        return (
          <div
            key={t.id}
            className="absolute transition-opacity duration-150"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
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
              return (
                <span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute flex items-center justify-center font-semibold tabular-nums leading-none"
                  style={{
                    ...p,
                    width: `${SEAT}cqw`,
                    height: `${SEAT}cqw`,
                    transform: `translate(-50%, -50%) rotate(${-rot}deg)`,
                    borderRadius: "var(--radius-full)",
                    background: g ? SEAT_FILL[sideOf(g) ?? "none"] : "var(--color-surface-container-lowest)",
                    border: g ? "none" : "1px solid var(--color-outline)",
                    color: g ? "#fff" : "var(--color-on-surface-muted)",
                    fontSize: g ? "max(6px, 0.82cqw)" : "max(5px, 0.7cqw)",
                    fontWeight: g ? 600 : 400,
                    letterSpacing: "0.01em",
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
              onKeyDown={(e) => onItemKey(e, t.x, t.y, (nx, ny) => onMoveTable?.(t.id, nx, ny))}
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

      {hovered && <HoverCard table={hovered} seated={byTable.get(hovered.id) ?? []} sideOf={sideOf} />}
    </div>
  );
});

export default FloorSurface;

/** Who's at a table, shown beside it on hover or keyboard focus. */
function HoverCard({ table, seated, sideOf }: { table: SeatingTable; seated: GuestListEntry[]; sideOf: (g: GuestListEntry) => GuestSide | undefined }) {
  const reach = tableReach(table) + 1;
  const flip = table.x > 62;
  const ty = table.y < 22 ? "-12%" : table.y > 78 ? "-88%" : "-50%";
  const list = seated.filter(needsSeat);
  const shown = list.slice(0, 10);
  const taken = seatsTaken(seated);

  return (
    <div
      aria-hidden
      className="popover-in pointer-events-none absolute w-56 p-3"
      style={{
        left: flip ? `calc(${table.x}% - ${reach}cqw)` : `calc(${table.x}% + ${reach}cqw)`,
        top: `${table.y}%`,
        transform: `translate(${flip ? "-100%" : "0"}, ${ty})`,
        zIndex: 6,
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 16px 40px -12px rgb(47 30 38 / 0.22), 0 2px 6px rgb(47 30 38 / 0.06)",
      }}
    >
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
              {g.partySize > 1 && <span className="shrink-0 tabular-nums" style={{ color: "var(--color-on-surface-variant)" }}>×{g.partySize}</span>}
            </li>
          ))}
          {list.length > shown.length && (
            <li className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>and {plural(list.length - shown.length, "more guest")}</li>
          )}
        </ul>
      )}
    </div>
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
