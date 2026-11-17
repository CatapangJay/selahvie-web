"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { curveGeometry, seatPoints, SEAT, tableSize } from "@/components/manage/seating/FloorSurface";
import type { FinderFloor, FinderTable } from "@/lib/seatFinder";
import type { VenueElement } from "@/types/wedding";
import type { Room } from "@/lib/seating";
import { ensureContrast, mix } from "@/lib/color";
import type { GuestTheme } from "@/lib/weddingTheme";
import { centreOf, facingFrom, headsUpRotation, routeDots, routePath, type Pt, type Route } from "./wayfinding";

interface Props {
  floor: FinderFloor;
  targetId: string;
  route: Route | null;
  entrance: VenueElement | null;
  /** The wedding's look: the highlighted table and route use the couple's colour. */
  theme: GuestTheme;
  /** Crop to the route, or show the whole room. */
  focus: boolean;
  /** Bumped to restart the walk. */
  replayKey: number;
  /** Extra quarter turns clockwise the guest asked for, on top of the door-at-the-bottom view. */
  turns?: number;
  /** 0–1 along the route while the walker moves; drives the step list. */
  onProgress?: (t: number) => void;
}

/** Map colours from the wedding's theme. */
interface MapColors {
  floor: string;
  hairline: string;
  ink: string;
  inkVariant: string;
  table: string;
  chair: string;
  feature: string;
  /** The couple's colour: the highlighted table, chairs and pulse. */
  hi: string;
  onHi: string;
  /** Route dots and markers (3:1 on the floor). */
  line: string;
  /** "You are here" and the door's name (4.5:1 on the floor). */
  lineText: string;
}

function mapColors(t: GuestTheme): MapColors {
  return {
    floor: t.card,
    hairline: t.outline,
    ink: t.ink,
    inkVariant: t.inkVariant,
    table: t.dark ? mix(t.card, "#FFFFFF", 0.07) : "#FFFFFF",
    chair: mix(t.card, t.ink, t.dark ? 0.16 : 0.07),
    feature: mix(t.card, t.ink, t.dark ? 0.08 : 0.045),
    hi: t.primary,
    onHi: t.onPrimary,
    line: ensureContrast(t.primary, t.card, 3),
    lineText: ensureContrast(t.primary, t.card, 4.5),
  };
}

const MapTheme = createContext<MapColors | null>(null);
const useColors = () => {
  const c = useContext(MapTheme);
  if (!c) throw new Error("SeatMap colours missing");
  return c;
};

const DRAW_MS = 1600;
/** Each dot's own fade-in; the stagger across the route fills the rest of DRAW_MS. */
const DOT_MS = 280;
const WALK_MIN_MS = 3200;
const REST_MS = 1600;

type Rot = 0 | 90 | 180 | -90;

/** `rot` turned a further `turns` quarter turns clockwise. */
function turnBy(rot: Rot, turns: number): Rot {
  const deg = (((rot + turns * 90) % 360) + 360) % 360;
  return (deg === 270 ? -90 : deg) as Rot;
}

/** Plan point → view point for the turned map (matches `groupTransform`). */
function toView(p: Pt, rot: Rot, room: Room): Pt {
  if (rot === 90) return { x: room.h - p.y, y: p.x };
  if (rot === -90) return { x: p.y, y: room.w - p.x };
  if (rot === 180) return { x: room.w - p.x, y: room.h - p.y };
  return p;
}

function groupTransform(rot: Rot, room: Room): string {
  if (rot === 90) return `translate(${room.h} 0) rotate(90)`;
  if (rot === -90) return `translate(0 ${room.w}) rotate(-90)`;
  if (rot === 180) return `rotate(180 ${room.w / 2} ${room.h / 2})`;
  return "";
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);

export default function SeatMap({ floor, targetId, route, entrance, theme, focus, replayKey, turns = 0, onProgress }: Props) {
  const colors = useMemo(() => mapColors(theme), [theme]);
  const accent = colors.line;
  const target = floor.tables.find((t) => t.id === targetId);
  // Door at the bottom, walk going up. Without a route, still face the table from the door.
  const auto: Rot = route
    ? headsUpRotation(route.facing)
    : entrance && target
      ? headsUpRotation(facingFrom(entrance, floor.room, [centreOf(entrance), centreOf(target)]))
      : 0;
  const rot = turnBy(auto, turns);
  const room = floor.room;
  const viewW = rot === 90 || rot === -90 ? room.h : room.w;
  const viewH = rot === 90 || rot === -90 ? room.w : room.h;
  const d = useMemo(() => (route ? routePath(route.points) : ""), [route]);
  const dots = useMemo(() => (route ? routeDots(route.points) : []), [route]);
  const reduced = usePrefersReducedMotion();

  // Crop to the walk and the table, with room to see what's around them.
  const viewBox = useMemo(() => {
    if (!focus || !target) return `0 0 ${viewW} ${viewH}`;
    const { w, h } = tableSize(target);
    const reach = Math.hypot(w, h) / 2 + 3;
    const c = centreOf(target);
    const pts = [...(route?.points ?? []), { x: c.x - reach, y: c.y - reach }, { x: c.x + reach, y: c.y + reach }, { x: c.x - reach, y: c.y + reach }, { x: c.x + reach, y: c.y - reach }].map(
      (p) => toView(p, rot, room)
    );
    const pad = 5;
    let x0 = Math.min(...pts.map((p) => p.x)) - pad;
    let x1 = Math.max(...pts.map((p) => p.x)) + pad;
    let y0 = Math.min(...pts.map((p) => p.y)) - pad;
    let y1 = Math.max(...pts.map((p) => p.y)) + pad;
    // Never zoom in so far the room loses its shape.
    const grow = (lo: number, hi: number, min: number, max: number) => {
      const need = Math.max(0, min - (hi - lo)) / 2;
      lo -= need;
      hi += need;
      if (lo < 0) [lo, hi] = [0, hi - lo];
      if (hi > max) [lo, hi] = [Math.max(0, lo - (hi - max)), max];
      return [lo, hi] as const;
    };
    [x0, x1] = grow(x0, x1, viewW * 0.55, viewW);
    [y0, y1] = grow(y0, y1, viewH * 0.55, viewH);
    return `${x0.toFixed(2)} ${y0.toFixed(2)} ${(x1 - x0).toFixed(2)} ${(y1 - y0).toFixed(2)}`;
  }, [focus, target, route, rot, viewW, viewH, room]);

  // ── Walk animation: draw the route, then loop a walker along it. ──
  const pathRef = useRef<SVGPathElement | null>(null);
  const walkerRef = useRef<SVGGElement | null>(null);
  const progressRef = useRef(onProgress);
  useEffect(() => {
    progressRef.current = onProgress;
  });

  useEffect(() => {
    const path = pathRef.current;
    const walker = walkerRef.current;
    if (!path || !walker || !d) return;
    const length = path.getTotalLength();
    const place = (t: number) => {
      const p = path.getPointAtLength(Math.max(0, Math.min(1, t)) * length);
      walker.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    };
    if (reduced) {
      walker.style.opacity = "0";
      progressRef.current?.(1);
      return;
    }
    // The dots appear from the door (CSS, staggered), then the walker sets off.
    const walkMs = Math.max(WALK_MIN_MS, length * 55);
    const t0 = performance.now();
    let raf = 0;
    let lastStep = -1;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const tick = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < DRAW_MS) {
        walker.style.opacity = "0";
      } else {
        const cycle = (elapsed - DRAW_MS) % (walkMs + REST_MS);
        const t = Math.min(1, cycle / walkMs);
        place(ease(t));
        walker.style.opacity = cycle > walkMs + REST_MS - 300 ? String((walkMs + REST_MS - cycle) / 300) : "1";
        // Report coarse progress only, so the step list doesn't re-render every frame.
        const step = Math.round(ease(t) * 50);
        if (step !== lastStep) {
          lastStep = step;
          progressRef.current?.(step / 50);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [d, reduced, replayKey]);

  const start = route?.points[0];
  const end = route?.points[route.points.length - 1];

  return (
    <MapTheme.Provider value={colors}>
    <svg
      viewBox={viewBox}
      data-rotation={rot}
      data-testid="seat-map"
      className="block h-auto w-full"
      role="img"
      aria-label={target ? `Floor plan with ${target.name || "your table"} highlighted${route ? " and the way there from the entrance" : ""}` : "Floor plan"}
      style={{ maxHeight: "var(--sf-map-max, min(72vh, 760px))", fontFamily: "var(--font-sans)" }}
    >
      <defs>
        <pattern id="sf-dance" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
          <rect width="1.2" height="1.2" fill={colors.ink} opacity="0.05" />
          <rect x="1.2" y="1.2" width="1.2" height="1.2" fill={colors.ink} opacity="0.05" />
        </pattern>
        <pattern id="sf-stage" width="1" height="1" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="0.12" height="1" fill={colors.ink} opacity="0.08" />
        </pattern>
      </defs>

      <g transform={groupTransform(rot, room)}>
        <rect x={0.25} y={0.25} width={room.w - 0.5} height={room.h - 0.5} rx={1.2} fill={colors.floor} stroke={colors.hairline} strokeWidth={0.3} />

        {floor.elements.map((el) => (
          <Feature key={el.id} el={el} rot={rot} isStart={el.id === entrance?.id} />
        ))}

        {floor.tables.map((t) => (
          <Table key={t.id} t={t} rot={rot} highlighted={t.id === targetId} />
        ))}

        {d && (
          <>
            {/* The walker's track: geometry only. */}
            <path ref={pathRef} d={d} fill="none" stroke="none" />
            {/* The route itself: dots that appear one after another from the door. */}
            <g key={replayKey} data-testid="seat-map-route" fill={accent}>
              {dots.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x.toFixed(2)}
                  cy={p.y.toFixed(2)}
                  r={0.48}
                  className="sf-dot"
                  style={{ animationDelay: `${Math.round((i / Math.max(1, dots.length - 1)) * (DRAW_MS - DOT_MS))}ms` }}
                />
              ))}
            </g>
          </>
        )}
        {start && (
          <g transform={`translate(${start.x} ${start.y})`}>
            <circle r={1.5} fill={colors.floor} stroke={accent} strokeWidth={0.45} />
            <circle r={0.6} fill={accent} />
          </g>
        )}
        {end && <circle cx={end.x} cy={end.y} r={0.55} fill={accent} />}

        {d && (
          <g ref={walkerRef} data-testid="seat-map-walker" style={{ opacity: 0 }} aria-hidden>
            <circle r={2.1} fill={accent} opacity={0.18} />
            <circle r={1.1} fill={accent} stroke={colors.floor} strokeWidth={0.4} />
          </g>
        )}

        {start && (
          <Label at={start} rot={rot} dy={-2.6} size={1.45} weight={600} color={colors.lineText} halo>
            You are here
          </Label>
        )}
      </g>

      <style>{`
        .sf-dot { transform-box: fill-box; transform-origin: center; animation: sf-dot ${DOT_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes sf-dot { from { opacity: 0; transform: scale(0.3); } }
        .sf-pulse { transform-box: fill-box; transform-origin: center; animation: sf-pulse 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @keyframes sf-pulse { 0% { transform: scale(0.92); opacity: 0.55; } 70%, 100% { transform: scale(1.35); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .sf-dot, .sf-pulse { animation: none; } }
      `}</style>
    </svg>
    </MapTheme.Provider>
  );
}

/** Text that stays upright however the map and the table are turned. */
function Label({
  at, rot, spin = 0, dy = 0, size, weight = 500, color, halo, children,
}: {
  at: Pt; rot: Rot; spin?: number; dy?: number; size: number; weight?: number; color?: string;
  /** Outline in this colour (true = the floor colour), so text stays readable off its shape. */
  halo?: boolean | string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <g transform={`translate(${at.x} ${at.y}) rotate(${-rot - spin})`}>
      <text
        y={dy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fontWeight={weight}
        fill={color ?? colors.inkVariant}
        stroke={halo ? (halo === true ? colors.floor : halo) : undefined}
        strokeWidth={halo ? 0.55 : undefined}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {children}
      </text>
    </g>
  );
}

/** Average glyph width of the label font, in em. */
const CHAR_W = 0.56;
const MIN_LABEL = 0.9;

/**
 * Fits a label inside a box as it appears on screen (`angle` = the box's turn in
 * the view): shrink first, then run along a long thin box, then truncate.
 * `spin` 90 reads bottom to top.
 */
function fitLabel(text: string, size: number, w: number, h: number, angle: number): { text: string; size: number; spin: 0 | 90 } {
  const a = ((angle % 180) + 180) % 180;
  const sideways = a > 45 && a < 135;
  const width = (sideways ? h : w) - 0.8;
  const height = (sideways ? w : h) - 0.8;
  const fits = (n: number) => width / (CHAR_W * n);
  if (size <= fits(text.length)) return { text, size, spin: 0 };
  if (fits(text.length) >= MIN_LABEL) return { text, size: fits(text.length), spin: 0 };
  const along = height / (CHAR_W * text.length);
  if (height > width && along >= MIN_LABEL) return { text, size: Math.min(size, along), spin: 90 };
  const room = Math.max(1, Math.floor(Math.max(width, height) / (MIN_LABEL * CHAR_W)) - 1);
  return { text: `${text.slice(0, room).trimEnd()}…`, size: MIN_LABEL, spin: height > width ? 90 : 0 };
}

function FittedLabel({
  text, box, size, ...rest
}: { text: string; box: { w: number; h: number; angle: number }; size: number } & Omit<Parameters<typeof Label>[0], "size" | "children" | "spin">) {
  const fit = fitLabel(text, size, box.w, box.h, box.angle);
  return (
    <Label {...rest} size={fit.size} spin={fit.spin}>
      {fit.text}
    </Label>
  );
}

function Feature({ el, rot, isStart }: { el: VenueElement; rot: Rot; isStart: boolean }) {
  const colors = useColors();
  const accent = colors.line;
  const c = centreOf(el);
  const r = el.rotation ?? 0;
  const fill = el.kind === "danceFloor" ? "url(#sf-dance)" : el.kind === "stage" ? "url(#sf-stage)" : undefined;
  const shape =
    el.shape === "ellipse" ? (
      <ellipse rx={el.w / 2} ry={el.h / 2} />
    ) : (
      <rect x={-el.w / 2} y={-el.h / 2} width={el.w} height={el.h} rx={0.5} />
    );
  const small = Math.min(el.w, el.h) < 3.2;
  return (
    <g>
      <g transform={`translate(${c.x} ${c.y}) rotate(${r})`} fill={isStart ? accent : colors.feature} fillOpacity={isStart ? 0.14 : 1} stroke={isStart ? accent : colors.hairline} strokeWidth={0.25}>
        {shape}
        {fill && (
          <g fill={fill} stroke="none">
            {shape}
          </g>
        )}
      </g>
      {!small && el.label.trim() && (
        <FittedLabel
          text={el.label.trim()}
          at={c}
          rot={rot}
          box={{ w: el.w, h: el.h, angle: r + rot }}
          size={Math.min(1.5, Math.max(1.05, el.h * 0.32))}
          color={isStart ? colors.lineText : colors.inkVariant}
          weight={isStart ? 600 : 500}
        />
      )}
    </g>
  );
}

function Table({ t, rot, highlighted }: { t: FinderTable; rot: Rot; highlighted: boolean }) {
  const colors = useColors();
  const accent = colors.hi;
  const { w, h } = tableSize(t);
  const c = centreOf(t);
  const spin = t.rotation ?? 0;
  const seats = seatPoints(t);
  const fill = highlighted ? accent : colors.table;
  const stroke = highlighted ? accent : colors.hairline;
  const body =
    t.shape === "round" ? (
      <circle cx={w / 2} cy={h / 2} r={w / 2} />
    ) : t.shape === "arc" ? (
      <path d={`M0 ${h}A${w / 2} ${w / 2} 0 0 1 ${w} ${h}Z`} />
    ) : t.shape === "curve" ? (
      <path d={curveGeometry(t).d} />
    ) : (
      <rect width={w} height={h} rx={0.6} />
    );
  const labelAt = t.shape === "curve" ? curveGeometry(t).label : { x: w / 2, y: t.shape === "arc" ? h * 0.62 : h / 2 };

  return (
    <g opacity={highlighted ? 1 : 0.92} data-table-id={t.id} data-highlighted={highlighted || undefined}>
      <g transform={`translate(${c.x} ${c.y}) rotate(${spin}) translate(${-w / 2} ${-h / 2})`}>
        {highlighted && (
          <g className="sf-pulse" fill="none" stroke={accent} strokeWidth={0.5}>
            {body}
          </g>
        )}
        {seats.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={SEAT / 2 - 0.15}
            fill={highlighted ? accent : colors.chair}
            fillOpacity={highlighted ? 0.28 : 1}
            stroke={highlighted ? accent : "none"}
            strokeWidth={0.18}
          />
        ))}
        <g fill={fill} stroke={stroke} strokeWidth={highlighted ? 0.35 : 0.25}>
          {body}
        </g>
      </g>
      <FittedLabel
        text={shortName(t.name)}
        at={toPlan(labelAt, c, w, h, spin)}
        rot={rot}
        // Curved tables: the band, not its bounding box, holds the label.
        box={t.shape === "curve" ? { w: 11, h: 4, angle: rot } : { w, h: t.shape === "arc" ? h * 0.8 : h, angle: spin + rot }}
        size={highlighted ? 1.9 : 1.35}
        weight={highlighted ? 600 : 500}
        color={highlighted ? colors.onHi : colors.inkVariant}
        halo={highlighted ? accent : colors.table}
      />
    </g>
  );
}

/** A point in the table's own box → plan coordinates. */
function toPlan(p: Pt, c: Pt, w: number, h: number, spinDeg: number): Pt {
  const a = (spinDeg * Math.PI) / 180;
  const dx = p.x - w / 2;
  const dy = p.y - h / 2;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
}

/** "Table 12" → "12" fits inside a small table; other names are fitted by `fitLabel`. */
function shortName(name: string): string {
  const n = name.trim();
  const m = /^table\s+(\S{1,4})$/i.exec(n);
  return m ? m[1] : n || "?";
}
