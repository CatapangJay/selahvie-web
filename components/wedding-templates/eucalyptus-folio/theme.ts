import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";

/** A bookish transitional serif for names and headings, a quiet grotesk for text, a typewriter for specimen labels. */
export const DISPLAY = "var(--wedding-serif, 'Newsreader'), 'Newsreader', 'Iowan Old Style', Georgia, serif";
export const SANS = "'Hanken Grotesk', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, 'Courier New', monospace";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

export const EASE = [0.22, 1, 0.36, 1] as const;

export interface Palette {
  /** Olive ink: headings, rules, filled buttons. */
  ink: string;
  inkDeep: string;
  /** Muted ink for labels and hairlines. */
  inkSoft: string;
  /** Rust: numbers, the ampersand, small accents. */
  rust: string;
  /** Unbleached rag paper (page). */
  paper: string;
  /** Lighter mounting card (labels, form, plates). */
  sheet: string;
  /** Linen tape. */
  tape: string;
  text: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

/** Ink follows the couple's primary colour and rust their accent; the paper stays fixed. */
export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  const ink = config.primaryColor || "#39432F";
  return {
    ink,
    inkDeep: mix(ink, 72, "#0B0D09"),
    inkSoft: mix(ink, 62, "#EEE8DA"),
    rust: config.accentColor || "#A4532F",
    paper: "#EEE8DA",
    sheet: "#F7F3EA",
    tape: "rgba(226, 216, 192, 0.86)",
    text: "#262B22",
  };
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** Rag-paper fibres: a faint, warm, low-frequency mottle. */
const FIBRE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' seed='11'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .40  0 0 0 0 .30  0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>"
);

export function paperStyle(p: Palette): CSSProperties {
  return { backgroundColor: p.paper, backgroundImage: FIBRE, backgroundSize: "260px 260px", color: p.text };
}

export function sheetStyle(p: Palette): CSSProperties {
  return {
    backgroundColor: p.sheet,
    backgroundImage: FIBRE,
    backgroundSize: "260px 260px",
    color: p.text,
    boxShadow: "0 1px 0 rgba(255,255,255,.6) inset, 0 18px 30px -24px rgba(30,34,24,.55)",
  };
}

/** A strip of linen hinge tape, laid over a corner or seam. */
export function tapeStyle(p: Palette, rotate = 0): CSSProperties {
  return {
    position: "absolute",
    width: "clamp(56px, 18cqw, 84px)",
    height: 22,
    background: `linear-gradient(90deg, ${p.tape}, rgba(236,228,206,.92) 50%, ${p.tape})`,
    boxShadow: "0 1px 2px rgba(40,36,24,.18)",
    transform: `rotate(${rotate}deg)`,
    // Torn ends
    clipPath: "polygon(3% 0, 97% 4%, 100% 30%, 96% 62%, 99% 100%, 2% 96%, 0 70%, 4% 38%)",
  };
}

/** Small typed label text. */
export function labelText(p: Palette, size = 11): CSSProperties {
  return { fontFamily: MONO, fontSize: size, letterSpacing: "0.16em", textTransform: "uppercase", color: p.inkSoft };
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
  /** Saturday */
  weekday: string;
  /** Saturday, 12 June 2027 (or the raw text) */
  long: string;
  /** 12 June 2027 */
  dayMonthYear: string;
  /** 12 · VI · 2027, the way a collector dates a sheet */
  collected: string;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function dateParts(raw?: string): DateParts {
  const date = parseWeddingDate(raw);
  if (!date) {
    const text = raw?.trim() ?? "";
    return { date: null, weekday: "", long: text, dayMonthYear: text, collected: text };
  }
  const dayMonthYear = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return {
    date,
    weekday,
    long: `${weekday}, ${dayMonthYear}`,
    dayMonthYear,
    collected: `${date.getDate()} · ${ROMAN[date.getMonth()]} · ${date.getFullYear()}`,
  };
}
