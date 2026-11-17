/**
 * Small sRGB colour helpers for themed guest surfaces and print (table finder,
 * QR codes). Hex in, hex out; contrast per WCAG 2.1.
 */

export type Rgb = [number, number, number];

export function parseHex(hex: string | undefined | null): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const toHex = ([r, g, b]: Rgb) =>
  `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`.toUpperCase();

/** `a` mixed toward `b` by `t` (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const x = parseHex(a) ?? [0, 0, 0];
  const y = parseHex(b) ?? [0, 0, 0];
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

export function luminance(hex: string): number {
  const c = parseHex(hex) ?? [0, 0, 0];
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * `color` moved toward `toward` (usually black or white) in small steps until it
 * reaches `ratio` against `against`. Keeps the hue; returns `color` untouched
 * when it already passes.
 */
export function ensureContrast(color: string, against: string, ratio: number, toward = luminance(against) > 0.4 ? "#000000" : "#FFFFFF"): string {
  let c = color;
  for (let i = 0; i < 40 && contrast(c, against) < ratio; i++) c = mix(color, toward, (i + 1) / 40);
  return c;
}
