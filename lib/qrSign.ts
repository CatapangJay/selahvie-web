/**
 * "Find your table" signs for the day: posted at the entrance, on an easel by the
 * cocktail hour, or shown on a screen between the ceremony and the reception.
 * Drawn on canvas in the wedding's own theme (lib/weddingTheme): a band in the
 * couple's colour with their names, then the code and what to do with it.
 * The preview and the export run the same drawing code. Browser only.
 */
import { canvasToBlob, drawQr, qrExtent, qrMatrix } from "@/lib/qr";
import type { GuestTheme } from "@/lib/weddingTheme";

export type SignFormatId = "a5" | "a4" | "a3" | "easel" | "social" | "screen";

export interface SignFormat {
  id: SignFormatId;
  label: string;
  /** What it's for, shown under the label. */
  use: string;
  /** Pixels of the exported PNG. */
  width: number;
  height: number;
  /** Paper size for printing, when it's a paper format. */
  print?: { width: string; height: string };
}

/** Paper formats at 300 dpi (the easel board at 200 dpi, which prints sharp from a few steps away). */
export const SIGN_FORMATS: SignFormat[] = [
  { id: "a5", label: "Card · A5", use: "Welcome table, small frame", width: 1748, height: 2480, print: { width: "148mm", height: "210mm" } },
  { id: "a4", label: "Poster · A4", use: "Door or wall", width: 2480, height: 3508, print: { width: "210mm", height: "297mm" } },
  { id: "a3", label: "Poster · A3", use: "Entrance, seen from across the room", width: 3508, height: 4961, print: { width: "297mm", height: "420mm" } },
  { id: "easel", label: "Easel board · 18 × 24 in", use: "Foam board on an easel at the entrance", width: 3600, height: 4800, print: { width: "18in", height: "24in" } },
  { id: "social", label: "Phone · 4:5", use: "Send to guests or post in the group chat", width: 1080, height: 1350 },
  { id: "screen", label: "Screen · 16:9", use: "TV or projector in the hallway or cocktail area", width: 1920, height: 1080 },
];

export const DEFAULT_HEADLINE = "Find your table";
export const DEFAULT_MESSAGE = "Scan with your phone camera and type your name. We'll show you your table and the way there.";

export interface SignOptions {
  url: string;
  theme: GuestTheme;
  names: string;
  /** "October 31, 2026 · The Grand Hall" */
  meta?: string;
  /** Where this copy hangs, e.g. "Main entrance". Omitted = no entrance line. */
  entrance?: string;
  headline?: string;
  message?: string;
  /** Print the short link under the code, for anyone without a camera. */
  showLink?: boolean;
}

/** First family in a CSS stack, for `document.fonts.load`. */
const firstFamily = (stack: string) => stack.split(",")[0].trim().replace(/^['"]|['"]$/g, "");

async function loadFonts(theme: GuestTheme) {
  // Canvas only draws web fonts that have already loaded.
  await Promise.all(
    [`400 120px ${firstFamily(theme.serif)}`, `500 60px ${firstFamily(theme.sans)}`, `400 60px ${firstFamily(theme.sans)}`].map((f) =>
      document.fonts?.load(f).catch(() => undefined)
    )
  );
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split(/\n+/)) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** Sets the largest font (down to `min`) at which `text` fits on one line. */
function fitLine(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, maxWidth: number, min: number): number {
  let px = start;
  ctx.font = font(px);
  while (px > min && ctx.measureText(text).width > maxWidth) {
    px = Math.max(min, px * 0.95);
    ctx.font = font(px);
  }
  return px;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The round-table motif from the finder's welcome, faint, off the band's corner. */
function motif(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 1.8 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, 50 * scale, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 74 * scale, cy + Math.sin(a) * 74 * scale, 11 * scale, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** The code on its own light panel: phones need dark-on-light, dark palettes included. */
function qrPanel(ctx: CanvasRenderingContext2D, theme: GuestTheme, url: string, x: number, y: number, size: number) {
  const r = size * 0.055;
  ctx.fillStyle = theme.qrLight;
  roundRect(ctx, x, y, size, size, r);
  ctx.fill();
  if (theme.qrLight.toUpperCase() === theme.background.toUpperCase()) {
    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = Math.max(2, size * 0.004);
    ctx.stroke();
  }
  const matrix = qrMatrix(url);
  const n = qrExtent(matrix);
  // Whole pixels per module, so the code prints crisply.
  const side = Math.max(n, Math.floor((size * 0.9) / n) * n);
  drawQr(ctx, matrix, Math.round(x + (size - side) / 2), Math.round(y + (size - side) / 2), side, theme.qrDark, null);
}

const entranceLine = (entrance: string) => `You're at the ${entrance.trim().replace(/^the\s+/i, "")}`;
const shortLink = (url: string) => url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");

/** A tall sign: band across the top, then headline, message, code, entrance, link. */
function drawPortrait(ctx: CanvasRenderingContext2D, W: number, H: number, o: Required<Omit<SignOptions, "entrance" | "meta">> & Pick<SignOptions, "entrance" | "meta">) {
  const { theme } = o;
  const u = W / 1748; // design unit: the A5 layout's pixel
  const pad = 150 * u;
  const inner = W - pad * 2;

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);

  // Band.
  const bandH = Math.min(760 * u, H * 0.31);
  ctx.fillStyle = theme.primary;
  ctx.fillRect(0, 0, W, bandH);
  motif(ctx, W - 120 * u, 140 * u, 3.4 * u, theme.onPrimary);
  ctx.fillStyle = theme.onPrimary;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let y = bandH * 0.4;
  ctx.globalAlpha = 0.88;
  fitLine(ctx, "Welcome to the wedding of", (px) => `400 ${px}px ${theme.sans}`, 58 * u, inner, 30 * u);
  ctx.fillText("Welcome to the wedding of", pad, y);
  ctx.globalAlpha = 1;
  const nameText = o.names || "the happy couple";
  const namePx = fitLine(ctx, nameText, (px) => `400 ${px}px ${theme.serif}`, 150 * u, inner, 70 * u);
  y += namePx * 1.15;
  ctx.fillText(nameText, pad, y);
  if (o.meta) {
    ctx.globalAlpha = 0.88;
    fitLine(ctx, o.meta, (px) => `400 ${px}px ${theme.sans}`, 54 * u, inner, 30 * u);
    ctx.fillText(o.meta, pad, y + 110 * u);
    ctx.globalAlpha = 1;
  }

  // Sheet rising over the band, like the finder screen.
  ctx.fillStyle = theme.background;
  roundRect(ctx, 0, bandH - 90 * u, W, H - bandH + 90 * u, 90 * u);
  ctx.fill();

  y = bandH + 130 * u;
  ctx.fillStyle = theme.ink;
  const headPx = fitLine(ctx, o.headline, (px) => `400 ${px}px ${theme.serif}`, 128 * u, inner, 64 * u);
  ctx.fillText(o.headline, pad, y);
  y += Math.max(90 * u, headPx * 0.7);
  ctx.fillStyle = theme.inkVariant;
  ctx.font = `400 ${56 * u}px ${theme.sans}`;
  for (const line of wrap(ctx, o.message, inner).slice(0, 4)) {
    ctx.fillText(line, pad, y);
    y += 76 * u;
  }

  // The code takes the room that's left, kept square and centred.
  const footer = (o.entrance ? 120 * u : 0) + (o.showLink ? 110 * u : 0) + 120 * u;
  const size = Math.max(400 * u, Math.min(1080 * u, H - y - 50 * u - footer));
  const qx = (W - size) / 2;
  const qy = y + 50 * u;
  qrPanel(ctx, theme, o.url, qx, qy, size);

  y = qy + size + 120 * u;
  ctx.textAlign = "center";
  if (o.entrance) {
    ctx.fillStyle = theme.link;
    fitLine(ctx, entranceLine(o.entrance), (px) => `500 ${px}px ${theme.sans}`, 58 * u, inner, 32 * u);
    ctx.fillText(entranceLine(o.entrance), W / 2, y);
    y += 100 * u;
  }
  if (o.showLink) {
    ctx.fillStyle = theme.inkVariant;
    fitLine(ctx, shortLink(o.url), (px) => `400 ${px}px ${theme.sans}`, 44 * u, inner, 24 * u);
    ctx.fillText(shortLink(o.url), W / 2, Math.min(H - 90 * u, Math.max(y, H - 150 * u)));
  }
}

/** A wide sign for screens: the band down the left, the code on the right. */
function drawLandscape(ctx: CanvasRenderingContext2D, W: number, H: number, o: Required<Omit<SignOptions, "entrance" | "meta">> & Pick<SignOptions, "entrance" | "meta">) {
  const { theme } = o;
  const u = H / 1080;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);

  const bandW = W * 0.36;
  ctx.fillStyle = theme.primary;
  ctx.fillRect(0, 0, bandW, H);
  motif(ctx, bandW - 40 * u, 90 * u, 2.2 * u, theme.onPrimary);

  const pad = 110 * u;
  const bandInner = bandW - pad * 1.6;
  ctx.fillStyle = theme.onPrimary;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let y = H * 0.42;
  ctx.globalAlpha = 0.88;
  fitLine(ctx, "Welcome to the wedding of", (px) => `400 ${px}px ${theme.sans}`, 38 * u, bandInner, 22 * u);
  ctx.fillText("Welcome to the wedding of", pad, y);
  ctx.globalAlpha = 1;
  const nameText = o.names || "the happy couple";
  ctx.font = `400 ${96 * u}px ${theme.serif}`;
  const nameLines = wrap(ctx, nameText, bandInner).slice(0, 3);
  for (const line of nameLines) {
    y += 104 * u;
    fitLine(ctx, line, (px) => `400 ${px}px ${theme.serif}`, 96 * u, bandInner, 48 * u);
    ctx.fillText(line, pad, y);
  }
  if (o.meta) {
    ctx.globalAlpha = 0.88;
    ctx.font = `400 ${34 * u}px ${theme.sans}`;
    for (const line of wrap(ctx, o.meta, bandInner).slice(0, 2)) {
      y += 52 * u;
      ctx.fillText(line, pad, y + 20 * u);
    }
    ctx.globalAlpha = 1;
  }

  // Right: headline and message beside the code.
  const left = bandW + pad;
  const size = Math.min(H - pad * 1.6 - (o.showLink ? 50 * u : 0), (W - left - pad) * 0.54);
  const qx = W - pad - size;
  const qy = (H - size) / 2 - (o.showLink ? 20 * u : 0);
  qrPanel(ctx, theme, o.url, qx, qy, size);
  if (o.showLink) {
    ctx.textAlign = "center";
    ctx.fillStyle = theme.inkVariant;
    fitLine(ctx, shortLink(o.url), (px) => `400 ${px}px ${theme.sans}`, 26 * u, size + pad, 16 * u);
    ctx.fillText(shortLink(o.url), qx + size / 2, qy + size + 52 * u);
  }

  const textW = qx - left - 70 * u;
  ctx.textAlign = "left";
  y = H * 0.36;
  ctx.fillStyle = theme.ink;
  // One line if it fits at a readable size; otherwise two.
  const headPx = fitLine(ctx, o.headline, (px) => `400 ${px}px ${theme.serif}`, 88 * u, textW, 54 * u);
  const headLines = ctx.measureText(o.headline).width <= textW ? [o.headline] : wrap(ctx, o.headline, textW).slice(0, 2);
  for (const line of headLines) {
    ctx.fillText(line, left, y);
    y += headPx * 1.1;
  }
  ctx.fillStyle = theme.inkVariant;
  ctx.font = `400 ${32 * u}px ${theme.sans}`;
  y += 4 * u;
  for (const line of wrap(ctx, o.message, textW).slice(0, 5)) {
    ctx.fillText(line, left, y);
    y += 48 * u;
  }
  if (o.entrance) {
    y += 30 * u;
    ctx.fillStyle = theme.link;
    fitLine(ctx, entranceLine(o.entrance), (px) => `500 ${px}px ${theme.sans}`, 34 * u, textW, 20 * u);
    ctx.fillText(entranceLine(o.entrance), left, y);
  }
}

/**
 * Draws the sign into `canvas` at `scale` × the format's pixel size (1 for export,
 * less for an on-screen preview). Fonts must already be loaded; see `prepareSign`.
 */
export function drawSign(canvas: HTMLCanvasElement, format: SignFormat, opts: SignOptions, scale = 1) {
  const W = Math.round(format.width * scale);
  const H = Math.round(format.height * scale);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  const o = {
    ...opts,
    headline: opts.headline?.trim() || DEFAULT_HEADLINE,
    message: opts.message?.trim() || DEFAULT_MESSAGE,
    showLink: opts.showLink ?? true,
  };
  if (W > H) drawLandscape(ctx, W, H, o);
  else drawPortrait(ctx, W, H, o);
}

/** Loads the theme's fonts so canvas can draw them. Call once before drawing. */
export const prepareSign = (theme: GuestTheme) => loadFonts(theme);

export async function signPng(format: SignFormat, opts: SignOptions): Promise<Blob> {
  await prepareSign(opts.theme);
  const canvas = document.createElement("canvas");
  drawSign(canvas, format, opts);
  return canvasToBlob(canvas);
}

/** The original A5 sign (kept for callers that only need the default). */
export const tableFinderSignPng = (opts: SignOptions) => signPng(SIGN_FORMATS[0], opts);
