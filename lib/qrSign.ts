/**
 * Signs and cards with a code (the table finder, RSVP, directions, registry, the
 * invitation): tucked in with invitations, posted at the entrance, on an easel by
 * the cocktail hour, or shown on a screen between the ceremony and the reception.
 * Drawn on canvas in the wedding's own theme (lib/weddingTheme), in one of six
 * styles, four of them built around the couple's own photo. The preview and the
 * export run the same drawing code. Browser only.
 *
 * Whatever the style, the code sits on its own light panel with a clear margin
 * (dark-on-light, 7:1), so phones read it in a dim room.
 */
import { canvasToBlob, drawQr, qrExtent, qrMatrix } from "@/lib/qr";
import { mix } from "@/lib/color";
import type { GuestTheme } from "@/lib/weddingTheme";

// ─── Formats ──────────────────────────────────────────────────────────────────

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
  { id: "a5", label: "Card · A5", use: "Invitation insert, welcome table, small frame", width: 1748, height: 2480, print: { width: "148mm", height: "210mm" } },
  { id: "a4", label: "Poster · A4", use: "Door or wall", width: 2480, height: 3508, print: { width: "210mm", height: "297mm" } },
  { id: "a3", label: "Poster · A3", use: "Entrance, seen from across the room", width: 3508, height: 4961, print: { width: "297mm", height: "420mm" } },
  { id: "easel", label: "Easel board · 18 × 24 in", use: "Foam board on an easel by the door", width: 3600, height: 4800, print: { width: "18in", height: "24in" } },
  { id: "social", label: "Phone · 4:5", use: "Send to guests or post in the group chat", width: 1080, height: 1350 },
  { id: "screen", label: "Screen · 16:9", use: "TV or projector in the hallway or cocktail area", width: 1920, height: 1080 },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

export type SignStyleId = "band" | "cover" | "vellum" | "duotone" | "arch" | "stationery";

export interface SignStyle {
  id: SignStyleId;
  label: string;
  /** One line on the look. */
  note: string;
  /** Built around a photo (still works without one). */
  photo: boolean;
}

export const SIGN_STYLES: SignStyle[] = [
  { id: "band", label: "Band", note: "Your colour across the top, like the table finder", photo: false },
  { id: "cover", label: "Cover", note: "Your photo full-bleed, names set on it", photo: true },
  { id: "vellum", label: "Vellum", note: "Your photo softly behind a translucent wash", photo: true },
  { id: "duotone", label: "Duotone", note: "Your colour throughout, the photo printed in two tones of it", photo: true },
  { id: "arch", label: "Arch", note: "Your photo in an arched window, names beneath", photo: true },
  { id: "stationery", label: "Stationery", note: "A monogram and a double-ruled border; your photo in a circle if you pick one", photo: false },
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
  style?: SignStyleId;
  /** A loaded photo (see `loadSignPhoto`); null = the style's photo-free version. */
  photo?: HTMLImageElement | null;
}

type Opts = Required<Pick<SignOptions, "url" | "theme" | "names" | "headline" | "message" | "showLink" | "style">> &
  Pick<SignOptions, "meta" | "entrance"> & { photo: HTMLImageElement | null };

type Ctx = CanvasRenderingContext2D;
type Rect = { x: number; y: number; w: number; h: number };

// ─── Fonts and photos ─────────────────────────────────────────────────────────

/** First family in a CSS stack, for `document.fonts.load`. */
const firstFamily = (stack: string) => stack.split(",")[0].trim().replace(/^['"]|['"]$/g, "");

/** Loads the theme's fonts so canvas can draw them. Call before drawing. */
export async function prepareSign(theme: GuestTheme) {
  const serif = firstFamily(theme.serif);
  const sans = firstFamily(theme.sans);
  await Promise.all(
    [`400 120px ${serif}`, `italic 400 120px ${serif}`, `500 60px ${sans}`, `400 60px ${sans}`].map((f) => document.fonts?.load(f).catch(() => undefined))
  );
}

const photoCache = new Map<string, Promise<HTMLImageElement | null>>();

/**
 * Loads a photo for drawing. Resolves null when it can't be used in an export:
 * it failed to load, or its host doesn't allow it to be drawn and saved (CORS).
 */
export function loadSignPhoto(url: string | undefined): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  const cached = photoCache.get(url);
  if (cached) return cached;
  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        // A photo that would taint the canvas can't be exported; find out now.
        const c = document.createElement("canvas");
        c.width = c.height = 1;
        const ctx = c.getContext("2d");
        ctx?.drawImage(img, 0, 0, 1, 1);
        ctx?.getImageData(0, 0, 1, 1);
        resolve(img);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
  photoCache.set(url, p);
  return p;
}

type Tone = "color" | "vellum" | "duotone";
const toneCache = new WeakMap<HTMLImageElement, Map<string, HTMLCanvasElement>>();
const TONE_MAX = 1800;

/** The photo, scaled to at most TONE_MAX px and toned; cached per photo and colours. */
function toned(img: HTMLImageElement, tone: Tone, theme: GuestTheme): HTMLCanvasElement {
  const key = `${tone}|${theme.primary}|${theme.background}`;
  let byKey = toneCache.get(img);
  if (!byKey) toneCache.set(img, (byKey = new Map()));
  const hit = byKey.get(key);
  if (hit) return hit;

  const k = Math.min(1, TONE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * k));
  c.height = Math.max(1, Math.round(img.naturalHeight * k));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return c;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  if (tone !== "color") {
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    // Duotone: shadows in a deep shade of the couple's colour, highlights in a pale one.
    const lo = rgb(mix(theme.primary, "#000000", 0.55));
    const hi = rgb(mix(theme.primary, "#FFFFFF", 0.6));
    for (let i = 0; i < px.length; i += 4) {
      const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
      if (tone === "duotone") {
        const t = Math.pow(l, 0.9);
        px[i] = lo[0] + (hi[0] - lo[0]) * t;
        px[i + 1] = lo[1] + (hi[1] - lo[1]) * t;
        px[i + 2] = lo[2] + (hi[2] - lo[2]) * t;
      } else {
        // Vellum: mostly desaturated, a little colour left in.
        const g = l * 255;
        px[i] = g + (px[i] - g) * 0.3;
        px[i + 1] = g + (px[i + 1] - g) * 0.3;
        px[i + 2] = g + (px[i + 2] - g) * 0.3;
      }
    }
    ctx.putImageData(data, 0, 0);
  }
  byKey.set(key, c);
  return c;
}

/** Draws `src` to fill the rect, cropped like CSS `object-fit: cover`, biased to `focusY`. */
function cover(ctx: Ctx, src: CanvasImageSource & { width: number; height: number }, r: Rect, focusY = 0.38) {
  const s = Math.max(r.w / src.width, r.h / src.height);
  const sw = r.w / s;
  const sh = r.h / s;
  const sx = (src.width - sw) / 2;
  const sy = Math.max(0, Math.min(src.height - sh, (src.height - sh) * focusY));
  ctx.drawImage(src, sx, sy, sw, sh, r.x, r.y, r.w, r.h);
}

// ─── Text ─────────────────────────────────────────────────────────────────────

function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
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
function fitLine(ctx: Ctx, text: string, font: (px: number) => string, start: number, maxWidth: number, min: number): number {
  let px = start;
  ctx.font = font(px);
  while (px > min && ctx.measureText(text).width > maxWidth) {
    px = Math.max(min, px * 0.95);
    ctx.font = font(px);
  }
  return px;
}

/** Draws one line, shrunk to fit; returns the size used. */
function line(ctx: Ctx, text: string, x: number, y: number, maxWidth: number, font: (px: number) => string, px: number, min: number) {
  const size = fitLine(ctx, text, font, px, maxWidth, min);
  ctx.fillText(text, x, y);
  return size;
}

/**
 * Wrapped lines; returns the baseline after the last one. Text that would need
 * more than `maxLines` is set a little smaller (down to 80%), then given
 * extra lines; it is never cut.
 */
function para(ctx: Ctx, text: string, x: number, y: number, maxWidth: number, font: string, leading: number, maxLines: number) {
  const size = Number(/([\d.]+)px/.exec(font)?.[1] ?? 0);
  let k = 1;
  ctx.font = font;
  let lines = wrap(ctx, text, maxWidth);
  while (lines.length > maxLines && k > 0.8 && size) {
    k *= 0.94;
    ctx.font = font.replace(/[\d.]+px/, `${size * k}px`);
    lines = wrap(ctx, text, maxWidth);
  }
  for (const l of lines.slice(0, Math.max(maxLines, lines.length))) {
    ctx.fillText(l, x, y);
    y += leading * k;
  }
  return y;
}

const entranceLine = (entrance: string) => `You're at the ${entrance.trim().replace(/^the\s+/i, "")}`;
const shortLink = (url: string) => url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");

/** "Isabel & Marco" → ["I", "M"]. */
function initials(names: string): string[] {
  return names
    .split(/\s*(?:&|and|\+)\s*/i)
    .map((n) => Array.from(n.trim())[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .slice(0, 2);
}

// ─── Shapes ───────────────────────────────────────────────────────────────────

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** An arched window: a semicircle on straight sides. */
function arch(ctx: Ctx, r: Rect) {
  const rad = r.w / 2;
  ctx.beginPath();
  ctx.moveTo(r.x, r.y + r.h);
  ctx.lineTo(r.x, r.y + rad);
  ctx.arc(r.x + rad, r.y + rad, rad, Math.PI, 0);
  ctx.lineTo(r.x + r.w, r.y + r.h);
  ctx.closePath();
}

/** The round-table motif from the finder's welcome. */
function motif(ctx: Ctx, cx: number, cy: number, scale: number, color: string, alpha = 0.18) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
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
function qrPanel(ctx: Ctx, theme: GuestTheme, url: string, x: number, y: number, size: number, ring = false) {
  ctx.save();
  ctx.fillStyle = theme.qrLight;
  roundRect(ctx, x, y, size, size, size * 0.055);
  ctx.fill();
  if (ring || theme.qrLight.toUpperCase() === theme.background.toUpperCase()) {
    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = Math.max(2, size * 0.004);
    ctx.stroke();
  }
  ctx.restore();
  const matrix = qrMatrix(url);
  const n = qrExtent(matrix);
  // Whole pixels per module, so the code prints crisply.
  const side = Math.max(n, Math.floor((size * 0.9) / n) * n);
  drawQr(ctx, matrix, Math.round(x + (size - side) / 2), Math.round(y + (size - side) / 2), side, theme.qrDark, null);
}

/** Entrance line and short link under a code. Returns the baseline after them. */
function footer(ctx: Ctx, o: Opts, x: number, y: number, maxWidth: number, colors: { link: string; ink2: string }, u: number, align: CanvasTextAlign = "center") {
  ctx.textAlign = align;
  if (o.entrance) {
    ctx.fillStyle = colors.link;
    line(ctx, entranceLine(o.entrance), x, y, maxWidth, (px) => `500 ${px}px ${o.theme.sans}`, 58 * u, 28 * u);
    y += 92 * u;
  }
  if (o.showLink) {
    ctx.fillStyle = colors.ink2;
    line(ctx, shortLink(o.url), x, y, maxWidth, (px) => `400 ${px}px ${o.theme.sans}`, 42 * u, 22 * u);
    y += 70 * u;
  }
  return y;
}

/** Height `footer` will take. */
const footerH = (o: Opts, u: number) => (o.entrance ? 92 * u : 0) + (o.showLink ? 70 * u : 0);

/** Text over a photo: a soft shadow keeps it legible on any picture. */
function onPhoto(ctx: Ctx, u: number, draw: () => void) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.38)";
  ctx.shadowBlur = 28 * u;
  ctx.shadowOffsetY = 4 * u;
  draw();
  ctx.restore();
}

// ─── Portrait styles ──────────────────────────────────────────────────────────
// Design unit `u`: one pixel of the A5 layout (1748 wide), so every size scales.

function band(ctx: Ctx, W: number, H: number, o: Opts) {
  const { theme } = o;
  const u = W / 1748;
  const pad = 150 * u;
  const inner = W - pad * 2;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);

  const bandH = Math.min(760 * u, H * 0.31);
  ctx.fillStyle = theme.primary;
  ctx.fillRect(0, 0, W, bandH);
  motif(ctx, W - 120 * u, 140 * u, 3.4 * u, theme.onPrimary);
  ctx.fillStyle = theme.onPrimary;
  ctx.textAlign = "left";
  let y = bandH * 0.4;
  ctx.globalAlpha = 0.88;
  line(ctx, "Welcome to the wedding of", pad, y, inner, (px) => `400 ${px}px ${theme.sans}`, 58 * u, 30 * u);
  ctx.globalAlpha = 1;
  const namePx = fitLine(ctx, o.names, (px) => `400 ${px}px ${theme.serif}`, 150 * u, inner, 70 * u);
  y += namePx * 1.15;
  ctx.fillText(o.names, pad, y);
  if (o.meta) {
    ctx.globalAlpha = 0.88;
    line(ctx, o.meta, pad, y + 110 * u, inner, (px) => `400 ${px}px ${theme.sans}`, 54 * u, 30 * u);
    ctx.globalAlpha = 1;
  }

  // Sheet rising over the band, like the finder screen.
  ctx.fillStyle = theme.background;
  roundRect(ctx, 0, bandH - 90 * u, W, H - bandH + 90 * u, 90 * u);
  ctx.fill();

  y = bandH + 130 * u;
  ctx.fillStyle = theme.ink;
  const headPx = line(ctx, o.headline, pad, y, inner, (px) => `400 ${px}px ${theme.serif}`, 128 * u, 64 * u);
  y += Math.max(90 * u, headPx * 0.7);
  ctx.fillStyle = theme.inkVariant;
  y = para(ctx, o.message, pad, y, inner, `400 ${56 * u}px ${theme.sans}`, 76 * u, 4);

  const size = Math.max(300 * u, Math.min(1080 * u, H - y - 60 * u - footerH(o, u) - 150 * u));
  qrPanel(ctx, theme, o.url, (W - size) / 2, y + 30 * u, size);
  footer(ctx, o, W / 2, y + 30 * u + size + 110 * u, inner, { link: theme.link, ink2: theme.inkVariant }, u);
}

/**
 * Cover: the photo full-bleed across the top with the names set on it, like a
 * magazine cover; below, the words on the left and the code on the right.
 */
function coverStyle(ctx: Ctx, W: number, H: number, o: Opts) {
  const { theme } = o;
  const u = W / 1748;
  const pad = 140 * u;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);

  // Squarer pages (phone 4:5, easel 3:4) give the photo less height, so the code keeps its room.
  const photoH = Math.round(H * (H / W < 1.38 ? 0.46 : 0.54));
  if (o.photo) cover(ctx, toned(o.photo, "color", theme), { x: 0, y: 0, w: W, h: photoH });
  else {
    ctx.fillStyle = theme.primary;
    ctx.fillRect(0, 0, W, photoH);
    motif(ctx, W * 0.78, photoH * 0.36, 7 * u, theme.onPrimary, 0.14);
  }
  // Scrim for the names: dark at the bottom of the photo, clear at the top.
  const scrim = ctx.createLinearGradient(0, photoH * 0.35, 0, photoH);
  scrim.addColorStop(0, "rgba(0,0,0,0)");
  scrim.addColorStop(1, o.photo ? "rgba(0,0,0,0.62)" : "rgba(0,0,0,0)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, W, photoH);

  const onImage = o.photo ? "#FFFFFF" : theme.onPrimary;
  ctx.fillStyle = onImage;
  ctx.textAlign = "left";
  onPhoto(ctx, o.photo ? u : 0, () => {
    let y = photoH - (o.meta ? 200 : 130) * u;
    ctx.globalAlpha = 0.92;
    line(ctx, "Welcome to the wedding of", pad, y - 200 * u, W - pad * 2, (px) => `400 ${px}px ${theme.sans}`, 56 * u, 28 * u);
    ctx.globalAlpha = 1;
    ctx.font = `400 ${168 * u}px ${theme.serif}`;
    const names = wrap(ctx, o.names, W - pad * 2).slice(0, 2);
    if (names.length > 1) y -= 150 * u;
    for (const n of names) {
      line(ctx, n, pad, y, W - pad * 2, (px) => `400 ${px}px ${theme.serif}`, 168 * u, 80 * u);
      y += 160 * u;
    }
    if (o.meta) {
      ctx.globalAlpha = 0.92;
      line(ctx, o.meta, pad, y - 40 * u, W - pad * 2, (px) => `400 ${px}px ${theme.sans}`, 52 * u, 28 * u);
      ctx.globalAlpha = 1;
    }
  });

  // Below: words left, code right, centred in the space under the photo.
  const qr = Math.min(W * 0.44, H - photoH - 260 * u);
  const top = photoH + Math.max(130 * u, (H - photoH - qr) / 2);
  const qx = W - pad - qr;
  const textW = qx - pad - 80 * u;
  ctx.textAlign = "left";
  ctx.fillStyle = theme.ink;
  ctx.font = `400 ${112 * u}px ${theme.serif}`;
  let y = top + 60 * u;
  for (const l of wrap(ctx, o.headline, textW).slice(0, 2)) {
    line(ctx, l, pad, y, textW, (px) => `400 ${px}px ${theme.serif}`, 112 * u, 60 * u);
    y += 118 * u;
  }
  ctx.fillStyle = theme.inkVariant;
  y = para(ctx, o.message, pad, y + 6 * u, textW, `400 ${50 * u}px ${theme.sans}`, 70 * u, 6);
  qrPanel(ctx, theme, o.url, qx, top, qr, true);
  footer(ctx, o, pad, Math.max(y + 50 * u, top + qr - footerH(o, u) + 70 * u), textW, { link: theme.link, ink2: theme.inkVariant }, u, "left");
}

/**
 * Vellum: the photo behind everything, softened under a translucent wash of the
 * background colour (strongest behind the words), like a vellum overlay on an
 * invitation suite. A centred composition inside a fine keyline.
 */
function vellum(ctx: Ctx, W: number, H: number, o: Opts) {
  const { theme } = o;
  const u = W / 1748;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);
  if (o.photo) {
    cover(ctx, toned(o.photo, "vellum", theme), { x: 0, y: 0, w: W, h: H }, 0.4);
    const wash = ctx.createRadialGradient(W / 2, H * 0.52, Math.min(W, H) * 0.18, W / 2, H * 0.52, Math.max(W, H) * 0.72);
    wash.addColorStop(0, hexA(theme.background, 0.94));
    wash.addColorStop(0.55, hexA(theme.background, 0.85));
    wash.addColorStop(1, hexA(theme.background, 0.56));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);
  }
  // Keyline.
  const inset = 70 * u;
  ctx.strokeStyle = theme.line;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 3 * u;
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  ctx.globalAlpha = 1;

  const inner = W - 340 * u;
  let y = Math.max(260 * u, H * 0.11);
  ctx.textAlign = "center";
  ctx.fillStyle = theme.inkVariant;
  line(ctx, "Welcome to the wedding of", W / 2, y, inner, (px) => `400 ${px}px ${theme.sans}`, 54 * u, 28 * u);
  y += 170 * u;
  ctx.fillStyle = theme.ink;
  const namePx = line(ctx, o.names, W / 2, y, inner, (px) => `400 ${px}px ${theme.serif}`, 160 * u, 72 * u);
  y += Math.max(90 * u, namePx * 0.62);
  if (o.meta) {
    ctx.fillStyle = theme.inkVariant;
    line(ctx, o.meta, W / 2, y, inner, (px) => `400 ${px}px ${theme.sans}`, 50 * u, 26 * u);
    y += 60 * u;
  }
  // A short rule between the welcome and the instruction.
  ctx.fillStyle = theme.line;
  ctx.fillRect(W / 2 - 80 * u, y + 30 * u, 160 * u, 3 * u);
  y += 190 * u;
  ctx.fillStyle = theme.ink;
  line(ctx, o.headline, W / 2, y, inner, (px) => `italic 400 ${px}px ${theme.serif}`, 116 * u, 60 * u);
  y += 90 * u;
  ctx.fillStyle = theme.inkVariant;
  y = para(ctx, o.message, W / 2, y, Math.min(inner, 1240 * u), `400 ${50 * u}px ${theme.sans}`, 70 * u, 3);
  const size = Math.max(300 * u, Math.min(980 * u, H - y - 40 * u - footerH(o, u) - 190 * u));
  qrPanel(ctx, theme, o.url, (W - size) / 2, y + 20 * u, size, true);
  footer(ctx, o, W / 2, y + 20 * u + size + 105 * u, inner, { link: theme.link, ink2: theme.inkVariant }, u);
}

/**
 * Duotone: the page is the couple's colour; the photo is printed in two tones
 * of it and melts into the page, like a screen-printed poster.
 */
function duotone(ctx: Ctx, W: number, H: number, o: Opts) {
  const { theme } = o;
  const u = W / 1748;
  const ink = theme.onPrimary;
  ctx.fillStyle = theme.primary;
  ctx.fillRect(0, 0, W, H);
  const photoH = Math.round(H * (H / W < 1.38 ? 0.4 : 0.5));
  if (o.photo) {
    cover(ctx, toned(o.photo, "duotone", theme), { x: 0, y: 0, w: W, h: photoH });
    const melt = ctx.createLinearGradient(0, photoH * 0.55, 0, photoH);
    melt.addColorStop(0, hexA(theme.primary, 0));
    melt.addColorStop(1, hexA(theme.primary, 1));
    ctx.fillStyle = melt;
    ctx.fillRect(0, 0, W, photoH + 1);
  } else {
    motif(ctx, W / 2, photoH * 0.5, 9 * u, ink, 0.16);
  }

  const inner = W - 300 * u;
  ctx.textAlign = "center";
  ctx.fillStyle = ink;
  let y = photoH - 20 * u;
  ctx.globalAlpha = 0.9;
  line(ctx, "Welcome to the wedding of", W / 2, y - 190 * u, inner, (px) => `400 ${px}px ${theme.sans}`, 54 * u, 28 * u);
  ctx.globalAlpha = 1;
  const namePx = line(ctx, o.names, W / 2, y, inner, (px) => `400 ${px}px ${theme.serif}`, 176 * u, 80 * u);
  y += Math.max(80 * u, namePx * 0.55);
  if (o.meta) {
    ctx.globalAlpha = 0.9;
    line(ctx, o.meta, W / 2, y, inner, (px) => `400 ${px}px ${theme.sans}`, 50 * u, 26 * u);
    ctx.globalAlpha = 1;
    y += 40 * u;
  }
  y += 140 * u;
  line(ctx, o.headline, W / 2, y, inner, (px) => `italic 400 ${px}px ${theme.serif}`, 104 * u, 56 * u);
  y += 78 * u;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.9;
  y = para(ctx, o.message, W / 2, y, Math.min(inner, 1300 * u), `400 ${46 * u}px ${theme.sans}`, 64 * u, 3);
  ctx.globalAlpha = 1;
  const size = Math.max(300 * u, Math.min(920 * u, H - y - 40 * u - footerH(o, u) - 150 * u));
  qrPanel(ctx, theme, o.url, (W - size) / 2, y + 10 * u, size);
  footer(ctx, o, W / 2, y + 10 * u + size + 100 * u, inner, { link: ink, ink2: ink }, u);
}

/**
 * Arch: the photo in an arched window with a fine keyline echoing it, names
 * centred beneath; the welcome sign you'd set on an easel.
 */
function archStyle(ctx: Ctx, W: number, H: number, o: Opts) {
  const { theme } = o;
  const u = W / 1748;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);

  const aw = W * 0.56;
  const ah = Math.min(H * (H / W < 1.38 ? 0.28 : 0.33), aw * 1.2);
  const window: Rect = { x: (W - aw) / 2, y: 150 * u, w: aw, h: ah };
  // Keyline arch, offset outside the window.
  const k = 26 * u;
  arch(ctx, { x: window.x - k, y: window.y - k, w: window.w + k * 2, h: window.h + k * 2 });
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 3 * u;
  ctx.stroke();
  ctx.save();
  arch(ctx, window);
  ctx.clip();
  if (o.photo) cover(ctx, toned(o.photo, "color", theme), window, 0.35);
  else {
    ctx.fillStyle = theme.surface;
    ctx.fillRect(window.x, window.y, window.w, window.h);
    motif(ctx, W / 2, window.y + window.h * 0.55, 3.2 * u, theme.ink, 0.12);
  }
  ctx.restore();

  const inner = W - 300 * u;
  let y = window.y + window.h + k + 150 * u;
  ctx.textAlign = "center";
  ctx.fillStyle = theme.ink;
  const namePx = line(ctx, o.names, W / 2, y, inner, (px) => `400 ${px}px ${theme.serif}`, 140 * u, 70 * u);
  y += Math.max(84 * u, namePx * 0.62);
  if (o.meta) {
    ctx.fillStyle = theme.inkVariant;
    line(ctx, o.meta, W / 2, y, inner, (px) => `400 ${px}px ${theme.sans}`, 48 * u, 26 * u);
    y += 50 * u;
  }
  y += 120 * u;
  ctx.fillStyle = theme.link;
  line(ctx, o.headline, W / 2, y, inner, (px) => `italic 400 ${px}px ${theme.serif}`, 96 * u, 52 * u);
  y += 70 * u;
  ctx.fillStyle = theme.inkVariant;
  y = para(ctx, o.message, W / 2, y, Math.min(inner, 1300 * u), `400 ${44 * u}px ${theme.sans}`, 62 * u, 3);
  const size = Math.max(300 * u, Math.min(860 * u, H - y - 40 * u - footerH(o, u) - 150 * u));
  qrPanel(ctx, theme, o.url, (W - size) / 2, y + 10 * u, size, true);
  footer(ctx, o, W / 2, y + 10 * u + size + 100 * u, inner, { link: theme.link, ink2: theme.inkVariant }, u);
}

/** A monogram (or the photo in a circle) inside a fine ring. */
function seal(ctx: Ctx, o: Opts, cx: number, cy: number, r: number, u: number) {
  const { theme } = o;
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 3 * u;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 22 * u, 0, Math.PI * 2);
  ctx.stroke();
  if (o.photo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    cover(ctx, toned(o.photo, "color", theme), { x: cx - r, y: cy - r, w: r * 2, h: r * 2 }, 0.3);
    ctx.restore();
    return;
  }
  const [a, b] = initials(o.names);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.ink;
  ctx.font = `400 ${r * 0.78}px ${theme.serif}`;
  if (a && b) {
    ctx.fillText(a, cx - r * 0.42, cy - r * 0.08);
    ctx.fillText(b, cx + r * 0.42, cy + r * 0.12);
    ctx.fillStyle = theme.link;
    ctx.font = `italic 400 ${r * 0.5}px ${theme.serif}`;
    ctx.fillText("&", cx, cy + r * 0.02);
  } else if (a) ctx.fillText(a, cx, cy);
  ctx.textBaseline = "alphabetic";
}

/**
 * Stationery: a double-ruled border and a monogram, like engraved stationery.
 * With a photo, the monogram becomes a round portrait.
 */
function stationery(ctx: Ctx, W: number, H: number, o: Opts) {
  const { theme } = o;
  const u = W / 1748;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 4 * u;
  ctx.strokeRect(80 * u, 80 * u, W - 160 * u, H - 160 * u);
  ctx.lineWidth = 1.6 * u;
  ctx.strokeRect(104 * u, 104 * u, W - 208 * u, H - 208 * u);

  const inner = W - 380 * u;
  const r = Math.min(W * 0.12, H * 0.085);
  let y = 300 * u + r;
  seal(ctx, o, W / 2, y, r, u);
  y += r + 190 * u;
  ctx.textAlign = "center";
  ctx.fillStyle = theme.ink;
  const namePx = line(ctx, o.names, W / 2, y, inner, (px) => `400 ${px}px ${theme.serif}`, 132 * u, 64 * u);
  y += Math.max(80 * u, namePx * 0.62);
  if (o.meta) {
    ctx.fillStyle = theme.inkVariant;
    line(ctx, o.meta, W / 2, y, inner, (px) => `400 ${px}px ${theme.sans}`, 46 * u, 24 * u);
    y += 50 * u;
  }
  // Three small dots, the stationer's divider.
  ctx.fillStyle = theme.line;
  for (const dx of [-36, 0, 36]) {
    ctx.beginPath();
    ctx.arc(W / 2 + dx * u, y + 50 * u, 6 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  y += 200 * u;
  ctx.fillStyle = theme.ink;
  line(ctx, o.headline, W / 2, y, inner, (px) => `400 ${px}px ${theme.serif}`, 104 * u, 56 * u);
  y += 76 * u;
  ctx.fillStyle = theme.inkVariant;
  y = para(ctx, o.message, W / 2, y, Math.min(inner, 1240 * u), `400 ${46 * u}px ${theme.sans}`, 64 * u, 3);
  const size = Math.max(300 * u, Math.min(820 * u, H - y - 40 * u - footerH(o, u) - 220 * u));
  qrPanel(ctx, theme, o.url, (W - size) / 2, y + 10 * u, size, true);
  footer(ctx, o, W / 2, y + 10 * u + size + 100 * u, inner, { link: theme.link, ink2: theme.inkVariant }, u);
}

// ─── Landscape (screens) ──────────────────────────────────────────────────────

/** The words and code for a wide sign, in the given rect. */
function wideContent(ctx: Ctx, o: Opts, r: Rect, colors: { ink: string; ink2: string; link: string }, u: number, withNames: boolean) {
  const { theme } = o;
  const size = Math.min(r.h - (o.showLink ? 70 * u : 20 * u), r.w * 0.44);
  const qx = r.x + r.w - size;
  const qy = r.y + (r.h - size) / 2 - (o.showLink ? 26 * u : 0);
  qrPanel(ctx, theme, o.url, qx, qy, size, true);
  if (o.showLink) {
    ctx.textAlign = "center";
    ctx.fillStyle = colors.ink2;
    line(ctx, shortLink(o.url), qx + size / 2, qy + size + 50 * u, size, (px) => `400 ${px}px ${theme.sans}`, 26 * u, 14 * u);
  }

  const textW = qx - r.x - 70 * u;
  ctx.textAlign = "left";
  let y = r.y + r.h * (withNames ? 0.3 : 0.36);
  if (withNames) {
    ctx.fillStyle = colors.ink2;
    line(ctx, "Welcome to the wedding of", r.x, y - 92 * u, textW, (px) => `400 ${px}px ${theme.sans}`, 32 * u, 18 * u);
    ctx.fillStyle = colors.ink;
    line(ctx, o.names, r.x, y, textW, (px) => `400 ${px}px ${theme.serif}`, 88 * u, 44 * u);
    y += 66 * u;
    if (o.meta) {
      ctx.fillStyle = colors.ink2;
      line(ctx, o.meta, r.x, y, textW, (px) => `400 ${px}px ${theme.sans}`, 28 * u, 16 * u);
      y += 40 * u;
    }
    y += 70 * u;
  }
  ctx.fillStyle = colors.ink;
  const headPx = fitLine(ctx, o.headline, (px) => `400 ${px}px ${theme.serif}`, withNames ? 64 * u : 88 * u, textW, 44 * u);
  for (const l of ctx.measureText(o.headline).width <= textW ? [o.headline] : wrap(ctx, o.headline, textW).slice(0, 2)) {
    ctx.fillText(l, r.x, y);
    y += headPx * 1.1;
  }
  ctx.fillStyle = colors.ink2;
  // Shrink the message until it fits in six lines, rather than cutting it.
  let msgPx = 30 * u;
  ctx.font = `400 ${msgPx}px ${theme.sans}`;
  while (msgPx > 20 * u && wrap(ctx, o.message, textW).length > 6) {
    msgPx *= 0.94;
    ctx.font = `400 ${msgPx}px ${theme.sans}`;
  }
  y = para(ctx, o.message, r.x, y + 4 * u, textW, ctx.font, msgPx * 1.45, 6);
  if (o.entrance) {
    ctx.fillStyle = colors.link;
    line(ctx, entranceLine(o.entrance), r.x, y + 30 * u, textW, (px) => `500 ${px}px ${theme.sans}`, 32 * u, 18 * u);
  }
}

/** Names over a photo or colour panel on the left of a wide sign. */
function wideNames(ctx: Ctx, o: Opts, r: Rect, color: string, u: number, shadow: boolean) {
  const pad = 90 * u;
  const w = r.w - pad * 2;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  onPhoto(ctx, shadow ? u * 0.6 : 0, () => {
    const y = r.y + r.h - (o.meta ? 200 : 130) * u;
    ctx.globalAlpha = 0.9;
    line(ctx, "Welcome to the wedding of", r.x + pad, y - 104 * u, w, (px) => `400 ${px}px ${o.theme.sans}`, 34 * u, 20 * u);
    ctx.globalAlpha = 1;
    line(ctx, o.names, r.x + pad, y, w, (px) => `400 ${px}px ${o.theme.serif}`, 96 * u, 48 * u);
    if (o.meta) {
      ctx.globalAlpha = 0.9;
      line(ctx, o.meta, r.x + pad, y + 62 * u, w, (px) => `400 ${px}px ${o.theme.sans}`, 30 * u, 18 * u);
      ctx.globalAlpha = 1;
    }
  });
}

function wide(ctx: Ctx, W: number, H: number, o: Opts) {
  const { theme } = o;
  const u = H / 1080;
  const pad = 110 * u;
  const plain = { ink: theme.ink, ink2: theme.inkVariant, link: theme.link };
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);

  switch (o.style) {
    case "cover": {
      const art: Rect = { x: 0, y: 0, w: W * 0.46, h: H };
      if (o.photo) cover(ctx, toned(o.photo, "color", theme), art);
      else {
        ctx.fillStyle = theme.primary;
        ctx.fillRect(art.x, art.y, art.w, art.h);
      }
      const scrim = ctx.createLinearGradient(0, H * 0.35, 0, H);
      scrim.addColorStop(0, "rgba(0,0,0,0)");
      scrim.addColorStop(1, o.photo ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)");
      ctx.fillStyle = scrim;
      ctx.fillRect(art.x, art.y, art.w, art.h);
      wideNames(ctx, o, art, o.photo ? "#FFFFFF" : theme.onPrimary, u, Boolean(o.photo));
      wideContent(ctx, o, { x: art.w + pad, y: pad, w: W - art.w - pad * 2, h: H - pad * 2 }, plain, u, false);
      return;
    }
    case "vellum": {
      if (o.photo) {
        cover(ctx, toned(o.photo, "vellum", theme), { x: 0, y: 0, w: W, h: H });
        const wash = ctx.createRadialGradient(W * 0.55, H / 2, H * 0.2, W * 0.55, H / 2, W * 0.7);
        wash.addColorStop(0, hexA(theme.background, 0.94));
        wash.addColorStop(0.6, hexA(theme.background, 0.86));
        wash.addColorStop(1, hexA(theme.background, 0.64));
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.strokeStyle = theme.line;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2 * u;
      ctx.strokeRect(44 * u, 44 * u, W - 88 * u, H - 88 * u);
      ctx.globalAlpha = 1;
      wideContent(ctx, o, { x: pad + 40 * u, y: pad, w: W - pad * 2 - 80 * u, h: H - pad * 2 }, plain, u, true);
      return;
    }
    case "duotone": {
      ctx.fillStyle = theme.primary;
      ctx.fillRect(0, 0, W, H);
      const art: Rect = { x: 0, y: 0, w: W * 0.44, h: H };
      if (o.photo) {
        cover(ctx, toned(o.photo, "duotone", theme), art);
        const melt = ctx.createLinearGradient(art.w * 0.55, 0, art.w, 0);
        melt.addColorStop(0, hexA(theme.primary, 0));
        melt.addColorStop(1, hexA(theme.primary, 1));
        ctx.fillStyle = melt;
        ctx.fillRect(0, 0, art.w + 1, H);
      } else motif(ctx, art.w / 2, H / 2, 5 * u, theme.onPrimary, 0.16);
      const ink = theme.onPrimary;
      wideContent(ctx, o, { x: art.w + 20 * u, y: pad, w: W - art.w - pad - 20 * u, h: H - pad * 2 }, { ink, ink2: ink, link: ink }, u, true);
      return;
    }
    case "arch": {
      const aw = H * 0.6;
      const window: Rect = { x: pad, y: pad * 0.9, w: aw, h: H - pad * 1.8 };
      const k = 16 * u;
      arch(ctx, { x: window.x - k, y: window.y - k, w: window.w + k * 2, h: window.h + k * 2 });
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = 2 * u;
      ctx.stroke();
      ctx.save();
      arch(ctx, window);
      ctx.clip();
      if (o.photo) cover(ctx, toned(o.photo, "color", theme), window, 0.35);
      else {
        ctx.fillStyle = theme.surface;
        ctx.fillRect(window.x, window.y, window.w, window.h);
      }
      ctx.restore();
      const x = window.x + window.w + k + 90 * u;
      wideContent(ctx, o, { x, y: pad, w: W - x - pad, h: H - pad * 2 }, plain, u, true);
      return;
    }
    case "stationery": {
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = 3 * u;
      ctx.strokeRect(40 * u, 40 * u, W - 80 * u, H - 80 * u);
      ctx.lineWidth = 1.2 * u;
      ctx.strokeRect(58 * u, 58 * u, W - 116 * u, H - 116 * u);
      const r = H * 0.17;
      seal(ctx, o, pad + 60 * u + r, H / 2, r, u);
      const x = pad + 60 * u + r * 2 + 120 * u;
      wideContent(ctx, o, { x, y: pad, w: W - x - pad, h: H - pad * 2 }, plain, u, true);
      return;
    }
    default: {
      // Band: the couple's colour down the left.
      const bandW = W * 0.36;
      ctx.fillStyle = theme.primary;
      ctx.fillRect(0, 0, bandW, H);
      motif(ctx, bandW - 40 * u, 90 * u, 2.2 * u, theme.onPrimary);
      wideNames(ctx, o, { x: 0, y: 0, w: bandW, h: H * 0.62 }, theme.onPrimary, u, false);
      wideContent(ctx, o, { x: bandW + pad, y: pad, w: W - bandW - pad * 2, h: H - pad * 2 }, plain, u, false);
    }
  }
}

/** `#RRGGBB` at an alpha, for gradients. */
function hexA(hex: string, a: number): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Entry points ─────────────────────────────────────────────────────────────

const PORTRAIT: Record<SignStyleId, (ctx: Ctx, W: number, H: number, o: Opts) => void> = {
  band,
  cover: coverStyle,
  vellum,
  duotone,
  arch: archStyle,
  stationery,
};

/**
 * Draws the sign into `canvas` at `scale` × the format's pixel size (1 for export,
 * less for a preview). Call `prepareSign` (fonts) and `loadSignPhoto` first.
 */
export function drawSign(canvas: HTMLCanvasElement, format: SignFormat, opts: SignOptions, scale = 1) {
  const W = Math.round(format.width * scale);
  const H = Math.round(format.height * scale);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  const o: Opts = {
    ...opts,
    names: opts.names.trim() || "the happy couple",
    headline: opts.headline?.trim() || DEFAULT_HEADLINE,
    message: opts.message?.trim() || DEFAULT_MESSAGE,
    showLink: opts.showLink ?? true,
    style: opts.style ?? "band",
    photo: opts.photo ?? null,
  };
  ctx.textBaseline = "alphabetic";
  ctx.imageSmoothingQuality = "high";
  if (W > H) wide(ctx, W, H, o);
  else PORTRAIT[o.style](ctx, W, H, o);
}

export async function signPng(format: SignFormat, opts: SignOptions): Promise<Blob> {
  await prepareSign(opts.theme);
  const canvas = document.createElement("canvas");
  drawSign(canvas, format, opts);
  return canvasToBlob(canvas);
}
