import QRCode from "qrcode";

/**
 * QR codes for print: high error correction (they survive a crease or a
 * smudge), dark modules on a light ground, and a four-module quiet zone.
 * Everything renders from one module matrix, so the on-screen SVG, the SVG
 * download, the PNG download and the invitation canvas are the same code.
 */

export const QR_QUIET_ZONE = 4;

export interface QrMatrix {
  /** Modules per side, without the quiet zone. */
  size: number;
  isDark: (row: number, col: number) => boolean;
}

/**
 * High error correction survives smudged prints; links too long for it step down
 * to lower levels. Throws only when even level L can't hold the text (~2.9 KB).
 */
export function qrMatrix(text: string): QrMatrix {
  let lastError: unknown;
  for (const errorCorrectionLevel of ["H", "Q", "M", "L"] as const) {
    try {
      const { modules } = QRCode.create(text, { errorCorrectionLevel });
      return { size: modules.size, isDark: (row, col) => Boolean(modules.get(row, col)) };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/** SVG path (one unit per module, quiet zone included in the offset) for every dark module. */
export function qrPath(matrix: QrMatrix, offset = QR_QUIET_ZONE): string {
  let d = "";
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.isDark(row, col)) continue;
      // Join horizontal runs into one rectangle, so the file stays small and seams don't show.
      let run = 1;
      while (col + run < matrix.size && matrix.isDark(row, col + run)) run++;
      d += `M${col + offset} ${row + offset}h${run}v1h-${run}z`;
      col += run - 1;
    }
  }
  return d;
}

/** Side length in modules, quiet zone included. */
export const qrExtent = (matrix: QrMatrix) => matrix.size + QR_QUIET_ZONE * 2;

export function qrSvgMarkup(text: string, dark = "#1a1416", light = "#ffffff"): string {
  const matrix = qrMatrix(text);
  const n = qrExtent(matrix);
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${n * 16}" height="${n * 16}" shape-rendering="crispEdges">` +
    `<rect width="${n}" height="${n}" fill="${light}"/>` +
    `<path d="${qrPath(matrix)}" fill="${dark}"/>` +
    `</svg>\n`
  );
}

/**
 * Draws the code (quiet zone included) into a square at (x, y). Module edges
 * snap to whole pixels so the PNG prints crisply.
 */
export function drawQr(
  ctx: CanvasRenderingContext2D,
  matrix: QrMatrix,
  x: number,
  y: number,
  side: number,
  dark: string,
  light: string | null
) {
  const n = qrExtent(matrix);
  const edge = (i: number) => Math.round((i / n) * side);
  if (light) {
    ctx.fillStyle = light;
    ctx.fillRect(x, y, side, side);
  }
  ctx.fillStyle = dark;
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.isDark(row, col)) continue;
      const x0 = edge(col + QR_QUIET_ZONE);
      const y0 = edge(row + QR_QUIET_ZONE);
      ctx.fillRect(x + x0, y + y0, edge(col + QR_QUIET_ZONE + 1) - x0, edge(row + QR_QUIET_ZONE + 1) - y0);
    }
  }
}

/** A PNG of the code, `px` pixels square (rounded up to whole pixels per module). */
export function qrPngBlob(text: string, px = 1200, dark = "#1a1416", light = "#ffffff"): Promise<Blob> {
  const matrix = qrMatrix(text);
  const n = qrExtent(matrix);
  const side = Math.ceil(px / n) * n;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas is not available"));
  drawQr(ctx, matrix, 0, 0, side, dark, light);
  return canvasToBlob(canvas);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png"): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image"))), type)
  );
}

/** Saves a Blob as a file. */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "Alex", "Sam" → "alex-sam", for download filenames. */
export function fileStem(...parts: (string | undefined)[]): string {
  return (
    parts
      .map((p) => (p ?? "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-"))
      .join("-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "wedding"
  );
}
