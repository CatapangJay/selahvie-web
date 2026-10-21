import type { WeddingConfig } from "@/types/wedding";

/** Soft-serif display (italic for flourishes) and a rounded geometric sans. Both ship with the app layout. */
export const DISPLAY = "var(--wedding-serif, Fraunces), Fraunces, Georgia, serif";
export const SANS = "Outfit, ui-sans-serif, system-ui, sans-serif";

export interface Palette {
  /** Couple's warm colour: ribbons, buttons, the sun. */
  apricot: string;
  apricotDeep: string;
  apricotSoft: string;
  /** Couple's dusk colour: ink on light panels, the night sky at the end. */
  dusk: string;
  duskDeep: string;
  /** The page's light, top to bottom: morning, noon, golden hour, sunset. */
  morning: string;
  butter: string;
  golden: string;
  sunset: string;
  ink: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  const apricot = config.primaryColor || "#E07A3F";
  const dusk = config.accentColor || "#5B2C3A";
  return {
    apricot,
    apricotDeep: mix(apricot, 72, "#3a1408"),
    apricotSoft: mix(apricot, 22, "#FFF6EC"),
    dusk,
    duskDeep: mix(dusk, 70, "#000"),
    morning: "#FFF6EC",
    butter: "#FBE9C6",
    golden: mix(apricot, 38, "#FBE3B8"),
    sunset: mix(apricot, 70, dusk),
    ink: mix(dusk, 80, "#1a0c08"),
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
  /** March 13 */
  monthDay: string;
  year: string;
  /** Saturday, March 13, 2027 (or the raw text) */
  long: string;
}

export function dateParts(raw?: string): DateParts {
  const date = parseWeddingDate(raw);
  if (!date) {
    const text = raw?.trim() ?? "";
    return { date: null, weekday: "", monthDay: text, year: "", long: text };
  }
  return {
    date,
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    monthDay: date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    year: String(date.getFullYear()),
    long: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  };
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "&";
}
