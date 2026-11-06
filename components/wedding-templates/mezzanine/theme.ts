import type { WeddingConfig } from "@/types/wedding";

/** A sharp contemporary serif for names, headings and numerals; engraved capitals for floor plates; a clean grotesk for reading. */
export const DISPLAY = "var(--wedding-serif, 'Gloock'), 'Gloock', 'Didot', 'Bodoni 72', Georgia, serif";
export const ENGRAVED = "'Marcellus SC', 'Marcellus', 'Trajan Pro', Georgia, serif";
export const SANS = "'Albert Sans', 'Helvetica Neue', Arial, sans-serif";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=Gloock&family=Marcellus+SC&display=swap";

/** Long, settling ease-out used across the page. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export interface Palette {
  /** Oxblood lacquer: drenched bands, filled buttons on linen. */
  oxblood: string;
  /** Footer and the deepest shadows. */
  oxbloodDeep: string;
  /** Bronze: hairlines and plate rings (decoration only, not text). */
  bronze: string;
  /** Bronze darkened as needed so numerals and times on linen read at AA (≥4.6:1). */
  bronzeText: string;
  /** Bronze lightened for use on oxblood. */
  bronzeLight: string;
  /** Starched table linen (page). */
  linen: string;
  /** Text on oxblood. */
  linenOn: string;
  /** Body text on linen. */
  ink: string;
  /** Secondary text on linen. */
  inkSoft: string;
  /** The lit dial letter and the call-button ring. */
  lamp: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

// ─── Contrast guard ──────────────────────────────────────────────────────────
// Couples pick their own colours. Text sits on the primary (oxblood bands) and
// the accent is used for numerals on linen, so both are darkened, keeping their
// hue, until the text they carry reads at AA.

const LINEN = "#F2F1F0";
const LINEN_ON = "#F6EEEA";

function rgbOf(hex: string): [number, number, number] | null {
  const raw = /^#?([0-9a-f]{3,8})$/i.exec(hex.trim())?.[1];
  if (!raw || ![3, 4, 6, 8].includes(raw.length)) return null;
  const six = raw.length <= 4 ? [...raw.slice(0, 3)].map((c) => c + c).join("") : raw.slice(0, 6);
  const n = parseInt(six, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const toHex = (rgb: number[]) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

/** Lighten `color` toward warm white in small steps until it reaches `min` against `against`. */
export function lightenFor(color: string, against: string, min: number): string {
  const base = rgbOf(color);
  const other = rgbOf(against);
  if (!base || !other) return color;
  const white: [number, number, number] = [246, 238, 234];
  for (let t = 0; t <= 1; t += 0.04) {
    const c = base.map((v, i) => v + (white[i] - v) * t) as [number, number, number];
    if (contrast(c, other) >= min) return toHex(c);
  }
  return toHex(white);
}

/** Darken `color` toward near-black in small steps until it reaches `min` against `against`. */
export function darkenFor(color: string, against: string, min: number): string {
  const base = rgbOf(color);
  const other = rgbOf(against);
  if (!base || !other) return color;
  const ink: [number, number, number] = [18, 8, 10];
  for (let t = 0; t <= 1; t += 0.04) {
    const c = base.map((v, i) => v + (ink[i] - v) * t) as [number, number, number];
    if (contrast(c, other) >= min) return toHex(c);
  }
  return toHex(ink);
}

/** Oxblood follows the couple's primary colour and bronze their accent; the linen stays fixed. */
export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  // A colour that is not hex cannot be checked, so it falls back to the template's own.
  const primary = rgbOf(config.primaryColor ?? "");
  const accent = rgbOf(config.accentColor ?? "");
  const oxblood = darkenFor(primary ? toHex(primary) : "#5A1820", LINEN_ON, 7);
  const bronze = accent ? toHex(accent) : "#8C6B4A";
  const warm = [243, 227, 207];
  const bronzeLightBase = toHex((accent ?? [140, 107, 74]).map((v, i) => v * 0.55 + warm[i] * 0.45));
  return {
    oxblood,
    oxbloodDeep: mix(oxblood, 55, "#120406"),
    bronze,
    bronzeText: darkenFor(bronze, LINEN, 4.6),
    bronzeLight: lightenFor(bronzeLightBase, oxblood, 4.6),
    linen: LINEN,
    linenOn: LINEN_ON,
    ink: "#1F1517",
    inkSoft: "#5C5052",
    lamp: "#F0BE74",
  };
}

/** CSS url() for a remote image; only http(s) URLs are accepted. */
export function cssImage(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? `url(${JSON.stringify(u.href)})` : undefined;
  } catch {
    return undefined;
  }
}

/** Only http(s) links open in a new tab. */
export const isWebLink = (url?: string) => /^https?:\/\//i.test(url?.trim() ?? "");

/** First letter of a name for the door plate. */
export const initialOf = (name: string) => (name.trim()[0] ?? "").toUpperCase();

// ─── Dates ───────────────────────────────────────────────────────────────────

/** ISO dates are read as local calendar days (no timezone shift); other strings fall back to Date parsing. */
export function parseWeddingDate(raw?: string): Date | null {
  if (!raw) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  const date = iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface DateParts {
  date: Date | null;
  /** Saturday, 20 March 2027 (or the raw text) */
  long: string;
  /** 20 March 2027 */
  dayMonthYear: string;
  /** 20 · 03 · 2027 */
  numeric: string;
}

export function dateParts(raw?: string): DateParts {
  const date = parseWeddingDate(raw);
  if (!date) {
    const text = raw?.trim() ?? "";
    return { date: null, long: text, dayMonthYear: text, numeric: text };
  }
  const dayMonthYear = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const two = (n: number) => String(n).padStart(2, "0");
  return {
    date,
    long: `${weekday}, ${dayMonthYear}`,
    dayMonthYear,
    numeric: `${two(date.getDate())} · ${two(date.getMonth() + 1)} · ${date.getFullYear()}`,
  };
}

/** Body copy size shared by every section. */
export const BODY = "clamp(16px, 4.3cqw, 18px)";
/** Horizontal page gutter. */
export const GUTTER = "clamp(1.25rem, 6.5cqw, 2.25rem)";
