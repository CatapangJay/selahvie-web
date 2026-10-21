import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";

/** Engraved classical caps for headings, an old-book serif for reading, a pen script for names. */
export const DISPLAY = "var(--wedding-serif, Marcellus), Marcellus, 'Trajan Pro', Georgia, serif";
export const SERIF = "'EB Garamond', Garamond, Georgia, serif";
export const SCRIPT = "'Mrs Saint Delafield', 'Snell Roundhand', cursive";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Marcellus&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Mrs+Saint+Delafield&display=swap";

export interface Palette {
  /** Dark narra wood: panels, text on light grounds. */
  narra: string;
  narraDeep: string;
  /** Mid molave brown for grain highlights. */
  molave: string;
  /** Warm light brown (sawali, kraft). */
  latte: string;
  /** Sand-coloured banig ground. */
  sand: string;
  /** Pearly capiz shell. */
  capiz: string;
  /** Antique brass for nibs, rules and keyline accents. */
  brass: string;
  ink: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

/** Wood comes from the couple's primary colour and brass from the accent; shell and sand are fixed. */
export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  const narra = config.primaryColor || "#6B3E1F";
  return {
    narra,
    narraDeep: mix(narra, 62, "#120700"),
    molave: mix(narra, 70, "#C9A27C"),
    latte: "#C9A27C",
    sand: "#EADBC2",
    capiz: "#F7EFE1",
    brass: config.accentColor || "#B48A3C",
    ink: "#2B190C",
  };
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const GRAIN = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.012 .32' numOctaves='3' seed='7'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
);

/** Planed narra panel: long horizontal grain over a lit-to-shadow wash. */
export function woodStyle(p: Palette): CSSProperties {
  return {
    backgroundColor: p.narra,
    backgroundImage: `${GRAIN}, linear-gradient(175deg, ${p.molave} 0%, ${p.narra} 45%, ${p.narraDeep} 100%)`,
    backgroundSize: "400px 400px, auto",
    backgroundBlendMode: "soft-light, normal",
    color: p.capiz,
  };
}

/** Woven banig mat: two crossing strip directions in faint sand tones. */
export function banigStyle(p: Palette): CSSProperties {
  const strip = mix(p.latte, 18, "transparent");
  return {
    backgroundColor: p.sand,
    backgroundImage: `repeating-linear-gradient(45deg, ${strip} 0 10px, transparent 10px 20px), repeating-linear-gradient(-45deg, ${mix(p.narra, 6, "transparent")} 0 10px, transparent 10px 20px)`,
    color: p.ink,
  };
}

/** Pearly capiz shell: soft sheen across a translucent cream. */
export function capizStyle(p: Palette, alpha = 92): CSSProperties {
  return {
    backgroundColor: mix(p.capiz, alpha, "transparent"),
    backgroundImage: "linear-gradient(135deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 38%, rgba(255,240,215,.35) 62%, rgba(255,255,255,0) 100%)",
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

export function mapsUrl(config: Pick<WeddingConfig, "venueName" | "venueAddress" | "venueCity">): string | null {
  const query = [config.venueName, config.venueAddress, config.venueCity].filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

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
  /** Sabado */
  weekday: string;
  /** 13 March 2027 */
  dayMonthYear: string;
  /** Saturday, March 13, 2027 (or the raw text) */
  long: string;
}

export function dateParts(raw?: string): DateParts {
  const date = parseWeddingDate(raw);
  if (!date) {
    const text = raw?.trim() ?? "";
    return { date: null, weekday: "", dayMonthYear: text, long: text };
  }
  return {
    date,
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    dayMonthYear: date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    long: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  };
}
