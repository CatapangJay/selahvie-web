import type { WeddingConfig } from "@/types/wedding";

/** Light geometric heading, condensed small caps, handwritten flourishes. */
export const HEADING = "var(--wedding-serif, Jost), Jost, ui-sans-serif, system-ui, sans-serif";
export const BODY = "'Barlow Condensed', ui-sans-serif, system-ui, sans-serif";
export const ACCENT = "'Herr Von Muellerhoff', cursive";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500&family=Barlow+Condensed:wght@400;500;600&family=Herr+Von+Muellerhoff&display=swap";

export interface Palette {
  /** Page base and the darkest panels. */
  ink: string;
  /** Raised dark panels (story, RSVP). */
  charcoal: string;
  /** Warm light panels (venue, registry). */
  stone: string;
  /** Cards sitting on stone. */
  paper: string;
  /** Text on light panels. */
  slate: string;
  /** Muted tone for swatches and quiet rules. */
  mist: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

/** Ink and mist come from the couple's chosen colours; the light papers are fixed. */
export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  const ink = config.primaryColor || "#0A0A0A";
  return {
    ink,
    charcoal: mix(ink, 93, "#fff"),
    stone: "#E9E7E3",
    paper: "#F6F5F2",
    slate: "#24272C",
    mist: config.accentColor || "#8E8C88",
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

/** "Thursday, April 1, 2027", or the raw text when it isn't a date. */
export function longDate(raw?: string): string {
  const date = parseWeddingDate(raw);
  if (!date) return raw?.trim() ?? "";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** "04 · 17 · 2027" */
export function numeralDate(raw?: string): string {
  const date = parseWeddingDate(raw);
  if (!date) return raw?.trim() ?? "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)} · ${pad(date.getDate())} · ${date.getFullYear()}`;
}

/** "March 2, 2027" */
export function shortDate(raw?: string): string {
  const date = parseWeddingDate(raw);
  if (!date) return raw?.trim() ?? "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
