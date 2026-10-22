import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";

/** A high-contrast didone for names and headings, a typewriter for the photo-lab labels, a script for the ampersand. */
export const DISPLAY = "var(--wedding-serif, 'Bodoni Moda'), 'Bodoni Moda', Didot, 'Bodoni 72', Georgia, serif";
export const MONO = "'Courier Prime', 'Courier New', ui-monospace, monospace";
export const SCRIPT = "'Monsieur La Doulaise', 'Snell Roundhand', cursive";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Monsieur+La+Doulaise&display=swap";

export interface Palette {
  /** Booth cabinet and darkroom ink: panels, headings on paper. */
  ink: string;
  inkDeep: string;
  /** Lighter ink for rules and muted labels on paper. */
  inkSoft: string;
  /** Film red: curtain, ampersand, stamps. */
  film: string;
  /** Oat photo paper. */
  paper: string;
  /** Bright print white for photo borders. */
  print: string;
  /** Camera date-imprint orange. */
  stamp: string;
  text: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

/** Ink comes from the couple's primary colour and film red from the accent; paper and print are fixed. */
export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  const ink = config.primaryColor || "#1E2B45";
  return {
    ink,
    inkDeep: mix(ink, 70, "#05070C"),
    inkSoft: mix(ink, 74, "#F1EADF"),
    film: config.accentColor || "#B4442E",
    paper: "#F1EADF",
    print: "#FBF8F2",
    stamp: "#F08A2C",
    text: "#1C1E26",
  };
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const SPECKLE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='4'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.5'/></svg>"
);

/** Oat photo paper with a faint fibre speckle. */
export function paperStyle(p: Palette): CSSProperties {
  return {
    backgroundColor: p.paper,
    backgroundImage: SPECKLE,
    backgroundSize: "300px 300px",
    backgroundBlendMode: "multiply",
    color: p.text,
  };
}

/** The darkroom: deep ink under a soft safelight glow. */
export function darkroomStyle(p: Palette): CSSProperties {
  return {
    backgroundColor: p.inkDeep,
    backgroundImage: `radial-gradient(120% 60% at 50% 0%, ${mix(p.film, 22, "transparent")} 0%, transparent 60%), linear-gradient(180deg, ${p.ink} 0%, ${p.inkDeep} 100%)`,
    color: p.paper,
  };
}

/** Film-strip sprocket holes as a repeating band; use as a background on a thin strip. */
export function sprocketStyle(p: Palette, height = 22): CSSProperties {
  return {
    height,
    backgroundColor: p.inkDeep,
    backgroundImage: `linear-gradient(90deg, transparent 0 6px, ${p.paper} 6px 18px, transparent 18px 24px)`,
    backgroundSize: `24px ${Math.round(height * 0.42)}px`,
    backgroundRepeat: "repeat-x",
    backgroundPosition: "0 50%",
  };
}

/** Camera date imprint: glowing orange typewriter digits. */
export function stampText(p: Palette): CSSProperties {
  return {
    fontFamily: MONO,
    fontWeight: 700,
    color: p.stamp,
    letterSpacing: "0.08em",
    textShadow: `0 0 6px ${mix(p.stamp, 70, "transparent")}`,
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

/** The booth's four poses: the hero portrait first, then gallery shots, repeating if there are few. */
export function stripFrames(config: Pick<WeddingConfig, "heroImageUrl" | "galleryImageUrls">, count = 4): (string | undefined)[] {
  const pool = [config.heroImageUrl, ...config.galleryImageUrls].map(cssImage).filter((u): u is string => Boolean(u));
  return Array.from({ length: count }, (_, i) => (pool.length ? pool[i % pool.length] : undefined));
}

/** A FAQ entry about what to wear is shown on the colour card instead of in the FAQ. */
// Word boundaries keep "address", "dressing room" and "footwear" out.
export const isDressCodeQuestion = (question: string) => /\b(dress(\s*code)?|attire|wear(ing)?)\b/i.test(question);

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
  /** Saturday, June 12, 2027 (or the raw text) */
  long: string;
  /** June 12, 2027 */
  monthDayYear: string;
  /** 6 12 '27 — the camera date imprint, month first */
  imprint: string;
  /** 06 · 12 · 27 */
  dotted: string;
}

export function dateParts(raw?: string): DateParts {
  const date = parseWeddingDate(raw);
  if (!date) {
    const text = raw?.trim() ?? "";
    return { date: null, weekday: "", long: text, monthDayYear: text, imprint: "", dotted: text };
  }
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return {
    date,
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    long: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    monthDayYear: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    imprint: `${date.getMonth() + 1} ${date.getDate()} '${yy}`,
    dotted: `${mm} · ${dd} · ${yy}`,
  };
}
