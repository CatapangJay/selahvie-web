import { drawQr, qrMatrix, type QrMatrix } from "@/lib/qr";
import { ceremonyVenue, dressCodeOf, hashtagOf, receptionTimeAtCeremony, receptionVenue } from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

/**
 * The printable invitation is laid out once, in card units (a 5 × 7 in card
 * is 1000 × 1400 units), and that one layout is both rendered as HTML for the
 * screen and print, and drawn to a canvas for the PNG. Text is measured and
 * wrapped with the canvas, so both renderings break lines in the same places.
 */

export const CARD_W = 1000;
export const CARD_H = 1400;
/** Card units → pixels for the PNG: 1500 × 2100 px is 5 × 7 in at 300 dpi. */
export const PRINT_SCALE = 1.5;

export type FontRole = "serif" | "sans";

export interface FontSpec {
  role: FontRole;
  size: number;
  weight: number;
  italic?: boolean;
  /** Letter-spacing in em. */
  tracking?: number;
  /** Line box height as a multiple of size. */
  leading: number;
}

export interface TextLine {
  text: string;
  font: FontSpec;
  color: string;
  align: "center" | "left";
  /** Left edge for left-aligned lines; ignored when centered. */
  x: number;
  /** Top of the line box. */
  y: number;
}

export type Shape =
  | { kind: "frame"; inset: number; stroke: number; color: string }
  | { kind: "line"; x1: number; x2: number; y: number; stroke: number; color: string }
  | { kind: "diamond"; cx: number; cy: number; r: number; color: string }
  | { kind: "qr"; matrix: QrMatrix; x: number; y: number; side: number; dark: string; light: string };

export interface CardPalette {
  paper: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accentInk: string;
}

export interface CardLayout {
  palette: CardPalette;
  lines: TextLine[];
  shapes: Shape[];
}

export interface FontFamilies {
  serif: string;
  sans: string;
}

export interface CardContent {
  partner1: string;
  partner2: string;
  /** "Sunday · 3:00 PM" */
  dayLine: string;
  /** "September 20, 2026" */
  date: string;
  venueName: string;
  venueAddress: string;
  reception: { heading: string; name: string; address: string } | null;
  replyBy: string;
  dressCode: string;
  hashtag: string;
  /** Shown under the QR for guests who'd rather type it. */
  visitUrl: string;
  rsvpUrl: string;
}

// ─── Content ─────────────────────────────────────────────────────────────────

const localDate = (iso: string) => {
  const d = iso ? new Date(`${iso}T00:00:00`) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

const join = (...parts: (string | undefined)[]) => parts.map((p) => p?.trim()).filter(Boolean).join(", ");

export function cardContent(config: WeddingConfig, rsvpUrl: string, visitUrl: string): CardContent {
  const day = localDate(config.weddingDate);
  const replyBy = localDate(config.rsvpDeadline);
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionHere = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);

  return {
    partner1: config.partner1Name?.trim() ?? "",
    partner2: config.partner2Name?.trim() ?? "",
    dayLine: [day?.toLocaleDateString("en-US", { weekday: "long" }), ceremony.time].filter(Boolean).join(" · "),
    date: day?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) ?? "",
    venueName: ceremony.name?.trim() ?? "",
    venueAddress: join(ceremony.address, ceremony.city),
    reception: reception
      ? {
          heading: reception.time ? `Reception · ${reception.time}` : "Reception to follow",
          name: reception.name?.trim() ?? "",
          address: join(reception.address, reception.city),
        }
      : receptionHere
        ? { heading: `Reception to follow · ${receptionHere}`, name: "", address: "" }
        : null,
    replyBy: replyBy
      ? `Kindly reply by ${replyBy.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
      : "Kindly reply on our website",
    dressCode: dress?.title ?? "",
    hashtag: hashtagOf(config),
    visitUrl,
    rsvpUrl,
  };
}

// ─── Color ───────────────────────────────────────────────────────────────────

type Rgb = [number, number, number];

function parseHex(hex: string | undefined, fallback: Rgb): Rgb {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex?.trim() ?? "");
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as Rgb;

function luminance(c: Rgb): number {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Darkens `c` toward a near-black of its own hue until it reaches `ratio` against `bg`. */
function deepen(c: Rgb, bg: Rgb, ratio: number): Rgb {
  const floor: Rgb = mix(c, [16, 10, 12], 0.85);
  for (let t = 0; t <= 1; t += 0.05) {
    const next = mix(c, floor, t);
    if (contrast(next, bg) >= ratio) return next;
  }
  return floor;
}

/**
 * The couple's colors, held to print-safe contrast: names and details in a
 * deep version of the primary color, small accent text deepened to 4.5:1, and
 * a paper barely tinted with the accent.
 */
export function cardPalette(config: Pick<WeddingConfig, "primaryColor" | "accentColor">): CardPalette {
  const primary = parseHex(config.primaryColor, [124, 84, 84]);
  const accent = parseHex(config.accentColor, [201, 153, 153]);
  const paper = mix([255, 255, 255], accent, 0.05);
  const ink = deepen(primary, paper, 9);
  return {
    paper: toHex(paper),
    ink: toHex(ink),
    inkSoft: toHex(mix(ink, paper, 0.18)),
    accent: toHex(deepen(accent, paper, 2)),
    accentInk: toHex(deepen(accent, paper, 4.8)),
  };
}

// ─── Fonts ───────────────────────────────────────────────────────────────────

export function fontString(font: FontSpec, families: FontFamilies, scale = 1): string {
  return `${font.italic ? "italic " : ""}${font.weight} ${font.size * scale}px ${families[font.role]}`;
}

/** Applies a font to a 2D context (including letter-spacing where the browser supports it). */
function setFont(ctx: CanvasRenderingContext2D, font: FontSpec, families: FontFamilies, scale = 1) {
  ctx.font = fontString(font, families, scale);
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${(font.tracking ?? 0) * font.size * scale}px`;
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const FRAME_OUTER = 34;
const FRAME_INNER = 46;
const TOP = 130;
const SIDE = 130;
const TEXT_W = CARD_W - SIDE * 2;
const QR_SIDE = 204;
const FOOTER_BOTTOM = CARD_H - 108;
const FOOTER_TOP = FOOTER_BOTTOM - QR_SIDE;
const FOOTER_RULE = FOOTER_TOP - 44;
const STACK_BOTTOM = FOOTER_RULE - 48;
const FOOTER_GAP = 40;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = lines.slice(maxLines - 1).join(" ");
  return kept;
}

/** The largest size (down to `min`) at which `text` fits on one line. */
function fitSize(ctx: CanvasRenderingContext2D, text: string, font: FontSpec, families: FontFamilies, maxWidth: number, min: number) {
  let size = font.size;
  while (size > min) {
    setFont(ctx, { ...font, size }, families);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return Math.max(size, min);
}

interface StackItem {
  gap: number;
  height: number;
  place: (top: number) => void;
}

function buildLayout(
  ctx: CanvasRenderingContext2D,
  content: CardContent,
  families: FontFamilies,
  palette: CardPalette,
  scale: number
): { layout: CardLayout; height: number } {
  const lines: TextLine[] = [];
  const shapes: Shape[] = [
    { kind: "frame", inset: FRAME_OUTER, stroke: 2, color: palette.accent },
    { kind: "frame", inset: FRAME_INNER, stroke: 0.8, color: palette.accent },
  ];
  const s = (n: number) => n * scale;
  const items: StackItem[] = [];

  const text = (value: string, font: FontSpec, color: string, gap: number, maxLines = 2, maxWidth = TEXT_W) => {
    if (!value) return;
    setFont(ctx, font, families);
    const wrapped = wrap(ctx, value, maxWidth, maxLines);
    const lineHeight = font.size * font.leading;
    items.push({
      gap,
      height: lineHeight * wrapped.length,
      place: (top) =>
        wrapped.forEach((t, i) => lines.push({ text: t, font, color, align: "center", x: CARD_W / 2, y: top + i * lineHeight })),
    });
  };

  const caps = (value: string, size: number, color: string, gap: number) =>
    text(value.toUpperCase(), { role: "sans", size: s(size), weight: 500, tracking: 0.28, leading: 1.3 }, color, gap);

  const name = (value: string, gap: number) => {
    const base: FontSpec = { role: "serif", size: s(96), weight: 400, leading: 1.08 };
    const size = fitSize(ctx, value, base, families, TEXT_W, s(64));
    text(value, { ...base, size }, palette.ink, gap);
  };

  caps("The wedding of", 19, palette.accentInk, 0);
  name(content.partner1, s(40));
  text("&", { role: "serif", size: s(58), weight: 400, italic: true, leading: 1.1 }, palette.accentInk, s(2));
  name(content.partner2, s(2));

  items.push({
    gap: s(42),
    height: 14,
    place: (top) => {
      const cy = top + 7;
      shapes.push(
        { kind: "line", x1: CARD_W / 2 - 112, x2: CARD_W / 2 - 18, y: cy, stroke: 1.1, color: palette.accent },
        { kind: "diamond", cx: CARD_W / 2, cy, r: 6, color: palette.accent },
        { kind: "line", x1: CARD_W / 2 + 18, x2: CARD_W / 2 + 112, y: cy, stroke: 1.1, color: palette.accent }
      );
    },
  });

  text("invite you to celebrate their marriage", { role: "serif", size: s(29), weight: 400, italic: true, leading: 1.3 }, palette.inkSoft, s(40));
  caps(content.dayLine, 19, palette.accentInk, s(46));
  text(content.date, { role: "serif", size: s(44), weight: 500, leading: 1.2 }, palette.ink, s(content.dayLine ? 10 : 46));
  text(content.venueName, { role: "serif", size: s(32), weight: 400, leading: 1.25 }, palette.ink, s(42));
  text(content.venueAddress, { role: "sans", size: s(19), weight: 400, leading: 1.45 }, palette.inkSoft, s(8));
  if (content.reception) {
    caps(content.reception.heading, 16, palette.accentInk, s(38));
    text(content.reception.name, { role: "serif", size: s(26), weight: 400, leading: 1.25 }, palette.ink, s(10));
    text(content.reception.address, { role: "sans", size: s(17), weight: 400, leading: 1.45 }, palette.inkSoft, s(6));
  }

  const height = items.reduce((sum, item, i) => sum + (i ? item.gap : 0) + item.height, 0);
  let y = TOP + Math.max(0, (STACK_BOTTOM - TOP - height) / 2);
  items.forEach((item, i) => {
    if (i) y += item.gap;
    item.place(y);
    y += item.height;
  });

  // Footer: the RSVP code beside how to reply, then the dress code and hashtag.
  shapes.push({ kind: "line", x1: SIDE, x2: CARD_W - SIDE, y: FOOTER_RULE, stroke: 0.8, color: palette.accent });
  const columnMax = TEXT_W - QR_SIDE - FOOTER_GAP;
  const column: { text: string; font: FontSpec; color: string; gap: number }[] = [];
  const add = (value: string, font: FontSpec, color: string, gap: number) => {
    if (!value) return;
    setFont(ctx, font, families);
    for (const [i, t] of wrap(ctx, value, columnMax, 2).entries()) column.push({ text: t, font, color, gap: i ? 0 : gap });
  };
  const urlFont: FontSpec = { role: "sans", size: 17, weight: 500, leading: 1.45 };
  add(content.replyBy, { role: "serif", size: 25, weight: 400, italic: true, leading: 1.3 }, palette.ink, 0);
  add("Scan the code, or visit", { role: "sans", size: 17, weight: 400, leading: 1.45 }, palette.inkSoft, 6);
  if (content.visitUrl) {
    const size = fitSize(ctx, content.visitUrl, urlFont, families, columnMax, 12);
    column.push({ text: content.visitUrl, font: { ...urlFont, size }, color: palette.ink, gap: 0 });
  }
  add(content.dressCode ? `Attire: ${content.dressCode}` : "", { role: "sans", size: 17, weight: 400, leading: 1.45 }, palette.inkSoft, 18);
  add(content.hashtag, { role: "serif", size: 22, weight: 400, italic: true, leading: 1.35 }, palette.accentInk, content.dressCode ? 2 : 18);

  const columnWidth = Math.max(
    ...column.map((l) => {
      setFont(ctx, l.font, families);
      return ctx.measureText(l.text).width;
    })
  );
  const groupLeft = (CARD_W - (QR_SIDE + FOOTER_GAP + columnWidth)) / 2;
  shapes.push({ kind: "qr", matrix: qrMatrix(content.rsvpUrl), x: groupLeft, y: FOOTER_TOP, side: QR_SIDE, dark: palette.ink, light: palette.paper });

  const columnHeight = column.reduce((sum, l) => sum + l.gap + l.font.size * l.font.leading, 0);
  let cy = FOOTER_TOP + (QR_SIDE - columnHeight) / 2;
  for (const l of column) {
    cy += l.gap;
    lines.push({ text: l.text, font: l.font, color: l.color, align: "left", x: groupLeft + QR_SIDE + FOOTER_GAP, y: cy });
    cy += l.font.size * l.font.leading;
  }

  return { layout: { palette, lines, shapes }, height };
}

/**
 * Lays out the card, shrinking the upper block when long names or venues
 * would crowd the footer. Fonts must already be loaded.
 */
export function layoutCard(content: CardContent, families: FontFamilies, palette: CardPalette): CardLayout {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  let scale = 1;
  let built = buildLayout(ctx, content, families, palette, scale);
  for (let i = 0; i < 4 && built.height > STACK_BOTTOM - TOP; i++) {
    scale *= (STACK_BOTTOM - TOP) / built.height;
    built = buildLayout(ctx, content, families, palette, scale);
  }
  return built.layout;
}

// ─── Canvas ──────────────────────────────────────────────────────────────────

/** Draws the card at `scale` pixels per card unit. */
export function drawCard(ctx: CanvasRenderingContext2D, layout: CardLayout, families: FontFamilies, scale: number) {
  const k = (n: number) => n * scale;
  ctx.fillStyle = layout.palette.paper;
  ctx.fillRect(0, 0, k(CARD_W), k(CARD_H));

  for (const shape of layout.shapes) {
    if (shape.kind === "frame") {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = k(shape.stroke);
      ctx.strokeRect(k(shape.inset), k(shape.inset), k(CARD_W - shape.inset * 2), k(CARD_H - shape.inset * 2));
    } else if (shape.kind === "line") {
      ctx.fillStyle = shape.color;
      ctx.fillRect(k(shape.x1), k(shape.y - shape.stroke / 2), k(shape.x2 - shape.x1), k(shape.stroke));
    } else if (shape.kind === "diamond") {
      ctx.fillStyle = shape.color;
      ctx.beginPath();
      ctx.moveTo(k(shape.cx), k(shape.cy - shape.r));
      ctx.lineTo(k(shape.cx + shape.r), k(shape.cy));
      ctx.lineTo(k(shape.cx), k(shape.cy + shape.r));
      ctx.lineTo(k(shape.cx - shape.r), k(shape.cy));
      ctx.closePath();
      ctx.fill();
    } else {
      drawQr(ctx, shape.matrix, Math.round(k(shape.x)), Math.round(k(shape.y)), Math.round(k(shape.side)), shape.dark, shape.light);
    }
  }

  ctx.textBaseline = "alphabetic";
  for (const line of layout.lines) {
    setFont(ctx, line.font, families, scale);
    ctx.fillStyle = line.color;
    const m = ctx.measureText(line.text);
    // Same baseline as a CSS line box: half the leading above the font's ascent.
    const box = k(line.font.size * line.font.leading);
    const baseline = k(line.y) + (box - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    // Letter-spacing trails the last letter; nudge centered lines back by half of it, as the HTML does.
    const tracking = k((line.font.tracking ?? 0) * line.font.size);
    ctx.textAlign = line.align;
    ctx.fillText(line.text, line.align === "center" ? k(CARD_W / 2) + tracking / 2 : k(line.x), baseline);
  }
}

