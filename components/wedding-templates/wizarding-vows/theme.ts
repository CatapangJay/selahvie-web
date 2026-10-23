import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";

/**
 * Classic engraved capitals for names and headings, a clean tracked sans for
 * labels, a refined garamond for reading and a quill script for the letters.
 */
export const DISPLAY = "var(--wedding-serif, 'Cinzel'), 'Cinzel', 'Trajan Pro', Georgia, serif";
export const CAPS = "'Josefin Sans', 'Futura', 'Century Gothic', system-ui, sans-serif";
export const BOOK = "'Cormorant Garamond', 'EB Garamond', Garamond, Georgia, serif";
export const QUILL = "'Pinyon Script', 'Snell Roundhand', cursive";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Josefin+Sans:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap";

/** The four house colourways, muted to sit with linen and charcoal: the crest and the robes use them as a set. */
export const HOUSES = [
  { field: "#7A2E2C", charge: "#D4AF5F" },
  { field: "#2F4B3B", charge: "#C9CDCF" },
  { field: "#C99B45", charge: "#2E2823" },
  { field: "#2D3B52", charge: "#B48A55" },
] as const;

export interface Palette {
  /** Wax colour: seals, the drop cap, buttons and small accents. */
  wax: string;
  waxDeep: string;
  /** Antique gold: hairline rules, labels and headings on charcoal. */
  gilt: string;
  giltSoft: string;
  /** Light-brown linen paper and its darker edge. */
  parchment: string;
  parchmentDeep: string;
  /** Warm brown ink for reading text on linen. */
  ink: string;
  inkSoft: string;
  /** Deep cocoa quill ink for handwritten lines. */
  quill: string;
  /** Charcoal chalkboard for the dark sections. */
  slate: string;
  slateSoft: string;
  /** Chalk-white text on charcoal. */
  chalk: string;
}

const mix = (color: string, pct: number, other: string) => `color-mix(in srgb, ${color} ${pct}%, ${other})`;

/** Wax comes from the couple's primary colour and gold from the accent; linen and charcoal are fixed. */
export function makePalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): Palette {
  const wax = config.primaryColor || "#6E2B2B";
  const gilt = config.accentColor || "#CFAE62";
  return {
    wax,
    waxDeep: mix(wax, 70, "#120404"),
    gilt,
    giltSoft: mix(gilt, 62, "#F3EBDD"),
    parchment: "#E8DDCB",
    parchmentDeep: "#CDB898",
    ink: "#3A2A1C",
    inkSoft: "#7A6450",
    quill: "#4A3423",
    slate: "#313132",
    slateSoft: "#3F3F41",
    chalk: "#ECE7DE",
  };
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// Stitched so the tiles meet without a seam.
const MOTTLE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.006' numOctaves='4' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .36 0 0 0 0 .2 0 0 0 .16 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
);
const GRAIN = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85 .35' numOctaves='2' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .18 0 0 0 .16 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
);
/** A faint woven texture, like good linen card stock. */
const WEAVE = "repeating-linear-gradient(0deg, rgba(90,64,38,.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(90,64,38,.03) 0 1px, transparent 1px 3px)";

/** Light-brown linen paper: a soft mottle, a fine weave and grain. */
export function parchmentStyle(p: Palette): CSSProperties {
  return {
    backgroundColor: p.parchment,
    backgroundImage: `${WEAVE}, ${MOTTLE}, ${GRAIN}`,
    backgroundSize: "auto, auto, 600px 600px, 220px 220px",
    color: p.ink,
  };
}

/** Sepia ink for the letter and the envelope address. */
export const SEPIA = "#33210F";

// Damp blotches: low-frequency noise kept only where it peaks, so the stains have soft irregular edges.
const STAINS = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='.011' numOctaves='4' seed='21' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .36 0 0 0 0 .22 0 0 0 0 .09 2.6 0 0 0 -1.3'/></filter><rect width='100%' height='100%' filter='url(#s)' opacity='.45'/></svg>"
);
// Rust and dirt specks: high-frequency noise thresholded to scattered dots.
const SPECKS = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='k'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='1' seed='5' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .42 0 0 0 0 .2 0 0 0 0 .07 10 0 0 0 -7.2'/></filter><rect width='100%' height='100%' filter='url(#k)' opacity='.85'/></svg>"
);

/**
 * An old letter: greyed parchment with damp stains, rust specks, a faint
 * cup ring and edges browned with age. Pair with `agedPaperEdges` for the
 * burnt inner shadow.
 */
export function agedPaperStyle(): CSSProperties {
  return {
    backgroundColor: "#E2D6BE",
    backgroundImage: [
      "radial-gradient(ellipse 78% 72% at 50% 46%, transparent 58%, rgba(104,68,32,.26) 86%, rgba(74,46,20,.55) 100%)",
      "radial-gradient(circle at 84% 13%, transparent 0 8.6%, rgba(112,72,32,.16) 9% 9.8%, transparent 10.6%)",
      "radial-gradient(ellipse 30% 22% at 12% 88%, rgba(110,70,30,.18), transparent 70%)",
      SPECKS,
      STAINS,
      GRAIN,
    ].join(", "),
    backgroundSize: "100% 100%, 100% 100%, 100% 100%, 260px 260px, 520px 520px, 220px 220px",
    color: SEPIA,
  };
}

/** Inner shadow that browns the very edge of an old sheet. */
export const agedPaperEdges = "inset 0 0 28px rgba(92,56,22,.45), inset 0 0 3px rgba(70,40,15,.6)";

const KRAFT_FIBRE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.9 .18' numOctaves='2' seed='12' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3 0 0 0 0 .17 0 0 0 0 .06 0 0 0 .4 0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>"
);

/** Brown kraft envelope paper; `shade` darkens it for the inner folds. */
export function kraftStyle(shade = 0): CSSProperties {
  const base = shade ? mix("#B98B58", 100 - shade, "#3B2410") : "#B98B58";
  return {
    backgroundColor: base,
    backgroundImage: `linear-gradient(160deg, rgba(255,236,200,.22) 0%, transparent 45%, rgba(60,34,12,.22) 100%), ${STAINS}, ${KRAFT_FIBRE}`,
    backgroundSize: "100% 100%, 520px 520px, 240px 240px",
    color: SEPIA,
  };
}

/** Chalk dust: pale noise, very faint, so the charcoal reads as a matte board. */
const CHALK_DUST = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='2' seed='8' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>"
);
const CHALK_SMUDGE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='700' height='700'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='.004' numOctaves='3' seed='14' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>"
);

/** Charcoal chalkboard: matte grey with old wiped smudges and a soft vignette. */
export function slateStyle(p: Palette): CSSProperties {
  return {
    backgroundColor: p.slate,
    backgroundImage: `radial-gradient(120% 80% at 50% 35%, transparent 55%, rgba(0,0,0,.28) 100%), ${CHALK_SMUDGE}, ${CHALK_DUST}`,
    backgroundSize: "100% 100%, 700px 700px, 300px 300px",
    color: p.chalk,
  };
}

/** Antique gold for display type: a flat, slightly warm fill rather than a shine. */
export function giltText(p: Palette): CSSProperties {
  return { color: p.gilt };
}

/** A hairline gold frame with a breath of space inside; put it on the frame's outer box. */
export function giltFrame(p: Palette, width = 8): CSSProperties {
  return {
    padding: width,
    border: `1px solid ${mix(p.gilt, 80, "transparent")}`,
    boxShadow: "0 22px 40px -26px rgba(0,0,0,.6)",
  };
}

/** Small tracked capitals for labels. */
export const capsLabel = (color: string, size = 12): CSSProperties => ({
  fontFamily: CAPS,
  fontWeight: 600,
  fontSize: size,
  letterSpacing: "0.24em",
  paddingLeft: "0.24em",
  textTransform: "uppercase",
  color,
});

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

/** First letters of both names for the crest medallion and wax seal, e.g. "W·C". */
export function monogram(p1: string, p2: string): string {
  const first = (s: string) => s.trim().charAt(0).toUpperCase();
  return [first(p1), first(p2)].filter(Boolean).join("·");
}

/** A FAQ entry about what to wear is shown with the robes instead of in the FAQ. */
// Word boundaries keep "address", "dressing room" and "footwear" out.
export const isDressCodeQuestion = (question: string) => /\b(dress(\s*code)?|attire|wear(ing)?|robes?)\b/i.test(question);

// ─── Dates ───────────────────────────────────────────────────────────────────

/** ISO dates are read as local calendar days (no timezone shift); other strings fall back to Date parsing. */
export function parseWeddingDate(raw?: string): Date | null {
  if (!raw) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  const date = iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

const ORDINAL = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export interface DateParts {
  date: Date | null;
  /** Saturday */
  weekday: string;
  /** Saturday, October 30, 2027 (or the raw text) */
  long: string;
  /** the 30th of October */
  ordinal: string;
  /** 2027 */
  year: string;
  /** XXX · X · MMXXVII */
  roman: string;
}

const ROMAN: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
function toRoman(n: number): string {
  let out = "";
  for (const [value, glyph] of ROMAN) while (n >= value) { out += glyph; n -= value; }
  return out;
}

export function dateParts(raw?: string): DateParts {
  const date = parseWeddingDate(raw);
  if (!date) {
    const text = raw?.trim() ?? "";
    return { date: null, weekday: "", long: text, ordinal: text, year: "", roman: "" };
  }
  return {
    date,
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    long: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    ordinal: `the ${ORDINAL(date.getDate())} of ${date.toLocaleDateString("en-US", { month: "long" })}`,
    year: String(date.getFullYear()),
    roman: `${toRoman(date.getDate())} · ${toRoman(date.getMonth() + 1)} · ${toRoman(date.getFullYear())}`,
  };
}
