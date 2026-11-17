/**
 * A printable "Find your table" sign for the venue door (A5 portrait, 300 dpi),
 * in the wedding's own theme: a band in the couple's colour with their names,
 * then the QR code and a line on what to do. Browser only (canvas).
 */
import { canvasToBlob, drawQr, qrExtent, qrMatrix } from "@/lib/qr";
import type { GuestTheme } from "@/lib/weddingTheme";

export interface SignOptions {
  url: string;
  theme: GuestTheme;
  names: string;
  /** "October 31, 2026 · The Grand Hall" */
  meta?: string;
  /** Where this copy hangs, e.g. "Main entrance". */
  entrance?: string;
}

const W = 1748;
const H = 2480;

/** First family in a CSS stack, for `document.fonts.load`. */
const firstFamily = (stack: string) => stack.split(",")[0].trim().replace(/^['"]|['"]$/g, "");

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Shrinks a single line's font until it fits. Returns the size used. */
function fitLine(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, maxWidth: number, min = 40): number {
  let px = start;
  ctx.font = font(px);
  while (px > min && ctx.measureText(text).width > maxWidth) {
    px -= 4;
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
  ctx.lineWidth = 6;
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

export async function tableFinderSignPng({ url, theme, names, meta, entrance }: SignOptions): Promise<Blob> {
  const serif = theme.serif;
  const sans = theme.sans;
  // Canvas only draws web fonts that have already loaded.
  await Promise.all(
    [`400 120px ${firstFamily(serif)}`, `500 60px ${firstFamily(sans)}`, `400 60px ${firstFamily(sans)}`].map((f) =>
      document.fonts?.load(f).catch(() => undefined)
    )
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  const pad = 150;
  const inner = W - pad * 2;

  // Page.
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, W, H);

  // Band: the couple's colour, their names.
  const bandH = 760;
  ctx.fillStyle = theme.primary;
  ctx.fillRect(0, 0, W, bandH);
  motif(ctx, W - 120, 140, 3.4, theme.onPrimary);

  ctx.fillStyle = theme.onPrimary;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.globalAlpha = 0.88;
  ctx.font = `400 58px ${sans}`;
  ctx.fillText("Welcome to the wedding of", pad, 300);
  ctx.globalAlpha = 1;
  const nameText = names || "the happy couple";
  const namePx = fitLine(ctx, nameText, (px) => `400 ${px}px ${serif}`, 150, inner);
  ctx.fillText(nameText, pad, 300 + namePx * 1.15);
  if (meta) {
    ctx.globalAlpha = 0.88;
    ctx.font = `400 54px ${sans}`;
    fitLine(ctx, meta, (px) => `400 ${px}px ${sans}`, 54, inner, 34);
    ctx.fillText(meta, pad, 300 + namePx * 1.15 + 120);
    ctx.globalAlpha = 1;
  }

  // Sheet: rounded top over the band, like the finder screen.
  ctx.fillStyle = theme.background;
  roundRect(ctx, 0, bandH - 90, W, H - bandH + 90, 90);
  ctx.fill();

  let y = bandH + 130;
  ctx.fillStyle = theme.ink;
  ctx.font = `400 128px ${serif}`;
  ctx.fillText("Find your table", pad, y);
  y += 90;
  ctx.fillStyle = theme.inkVariant;
  ctx.font = `400 56px ${sans}`;
  for (const line of wrap(ctx, "Scan with your phone camera and type your name. We'll show you your table and the way there.", inner)) {
    ctx.fillText(line, pad, y);
    y += 76;
  }

  // The code on its own light panel (dark palettes too: phones need dark-on-light).
  const qrSide = 980;
  const panel = qrSide + 100;
  const px0 = (W - panel) / 2;
  const py0 = y + 50;
  ctx.fillStyle = theme.qrLight;
  roundRect(ctx, px0, py0, panel, panel, 56);
  ctx.fill();
  if (theme.qrLight.toUpperCase() === theme.background.toUpperCase()) {
    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  const matrix = qrMatrix(url);
  const side = Math.floor(qrSide / qrExtent(matrix)) * qrExtent(matrix);
  drawQr(ctx, matrix, Math.round((W - side) / 2), Math.round(py0 + (panel - side) / 2), side, theme.qrDark, null);

  // Where this copy hangs, and a short link for anyone without a camera.
  y = py0 + panel + 120;
  ctx.textAlign = "center";
  if (entrance) {
    ctx.fillStyle = theme.link;
    ctx.font = `500 58px ${sans}`;
    fitLine(ctx, `You're at the ${entrance.replace(/^the\s+/i, "")}`, (px) => `500 ${px}px ${sans}`, 58, inner, 36);
    ctx.fillText(`You're at the ${entrance.replace(/^the\s+/i, "")}`, W / 2, y);
    y += 90;
  }
  ctx.fillStyle = theme.inkVariant;
  const short = url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  fitLine(ctx, short, (px) => `400 ${px}px ${sans}`, 44, inner, 28);
  ctx.fillText(short, W / 2, Math.max(y, H - 150));

  return canvasToBlob(canvas);
}
