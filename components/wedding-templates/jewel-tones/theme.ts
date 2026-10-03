import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";

/** Display script (names, flourishes) and book serif (everything else). */
export const SCRIPT = "'Pinyon Script', 'Snell Roundhand', 'Brush Script MT', cursive";
export const SERIF = "'Cormorant Garamond', var(--font-serif), Georgia, serif";

export interface Palette {
  raspberry: string;
  raspberryDeep: string;
  teal: string;
  tealDeep: string;
  gold: string;
  goldLight: string;
  goldDeep: string;
  /** Gold dark enough to read as small text on cream paper. */
  goldInk: string;
  cream: string;
  creamDeep: string;
  kraft: string;
  kraftDeep: string;
  ink: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

/** Raspberry + teal come from the couple's chosen colours; metals and papers are fixed. */
export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  const raspberry = config.primaryColor || "#c4205f";
  const teal = config.accentColor || "#2b6a62";
  return {
    raspberry,
    raspberryDeep: mix(raspberry, 62, "#000"),
    teal,
    tealDeep: mix(teal, 60, "#000"),
    gold: "#d9b45f",
    goldLight: "#f3dc9a",
    goldDeep: "#9c7627",
    goldInk: "#6f5114",
    cream: "#fbf6ec",
    creamDeep: "#efe4cf",
    kraft: "#c9a35a",
    kraftDeep: "#a98434",
    ink: "#2b1018",
  };
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const FELT_NOISE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>"
);

const PAPER_NOISE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.7 .5' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>"
);

/** Craft-felt surface: a lit centre falling off to a deeper edge, with wool-like grain blended in. */
export function feltStyle(base: string, deep: string): CSSProperties {
  return {
    backgroundColor: deep,
    backgroundImage: `${FELT_NOISE}, radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,.3) 100%), radial-gradient(120% 90% at 50% 25%, ${base} 0%, ${deep} 100%)`,
    backgroundSize: "220px 220px, auto, auto",
    backgroundBlendMode: "overlay, normal, normal",
  };
}

/** Fibrous handmade-paper surface (envelope kraft, cards). */
export function paperStyle(base: string, deep: string): CSSProperties {
  return {
    backgroundColor: base,
    backgroundImage: `${PAPER_NOISE}, linear-gradient(160deg, ${base} 0%, ${deep} 100%)`,
    backgroundSize: "300px 300px, auto",
    backgroundBlendMode: "soft-light, normal",
  };
}

/** Section padding: block scales with viewport, inline keeps a safe gutter. */
export const SECTION_PAD = "clamp(4.5rem, 11vw, 8rem) clamp(1.25rem, 5vw, 2.5rem)";

/** Gilt picture-frame fill. */
export function giltStyle(p: Palette): CSSProperties {
  return {
    background: `linear-gradient(135deg, ${p.goldLight} 0%, ${p.gold} 28%, ${p.goldDeep} 52%, ${p.gold} 74%, ${p.goldLight} 100%)`,
  };
}

// ─── Dates ───────────────────────────────────────────────────────────────────

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (n: number) => String(n).padStart(2, "0");

/** ISO dates are read as local calendar days (no timezone shift); other strings fall back to Date parsing. */
export function parseWeddingDate(raw?: string): Date | null {
  if (!raw) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  const date = iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface DateParts {
  date: Date | null;
  /** 02.23.27 */
  dotted: string;
  /** Tuesday */
  weekday: string;
  /** February 23 */
  monthDay: string;
  year: string;
  /** Tuesday, February 23, 2027 */
  long: string;
}

export function dateParts(raw?: string): DateParts {
  const date = parseWeddingDate(raw);
  if (!date) {
    const text = raw?.trim() ?? "";
    return { date: null, dotted: text, weekday: "", monthDay: text, year: "", long: text };
  }
  const monthDay = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  const weekday = WEEKDAYS[date.getDay()];
  return {
    date,
    dotted: `${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${pad(date.getFullYear() % 100)}`,
    weekday,
    monthDay,
    year: String(date.getFullYear()),
    long: `${weekday}, ${monthDay}, ${date.getFullYear()}`,
  };
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "&";
}
