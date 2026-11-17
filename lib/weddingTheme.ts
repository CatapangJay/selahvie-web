/**
 * The wedding's own look for surfaces outside its template: the day-of table
 * finder and the printed QR codes. Built from what the couple chose in the
 * studio: their primary and accent colours (used as chosen), the template
 * palette's background, and their font preset. Text colours are derived so
 * every pairing meets WCAG AA; the couple's colours themselves never change,
 * only what's set on them.
 */
import { templates } from "@/data/templates";
import { resolveFontPreset } from "@/data/fontPresets";
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/lib/weddingDefaults";
import { contrast, ensureContrast, luminance, mix, parseHex, toHex } from "@/lib/color";
import type { WeddingConfig } from "@/types/wedding";

export interface GuestTheme {
  /** The palette's background is dark (e.g. "Midnight Gold"). */
  dark: boolean;
  /** The couple's primary colour, exactly as chosen. Fills: buttons, the table band, the highlighted table. */
  primary: string;
  /** Text and icons on `primary`. */
  onPrimary: string;
  /** The couple's accent colour, as chosen. */
  accent: string;
  background: string;
  /** Quiet panels on the background: the map well, notices. */
  surface: string;
  /** Raised fields: inputs, chips, the map floor. */
  card: string;
  ink: string;
  inkVariant: string;
  outline: string;
  /** `primary` as text on the background (4.5:1). */
  link: string;
  /** `primary` as a line or dot on `surface`/`card` (3:1). */
  line: string;
  error: string;
  /** CSS font stacks (real family names, so canvas can use them too). */
  serif: string;
  sans: string;
  /** QR modules and ground: the couple's colour, dark enough to scan. */
  qrDark: string;
  qrLight: string;
}

const SERIF = "'Fraunces', 'Playfair Display', Georgia, serif";
const SANS = "'Inter', 'Outfit', system-ui, sans-serif";
const INK_LIGHT = "#17121A";

type ThemeSource = Pick<WeddingConfig, "templateId" | "themePresetId" | "primaryColor" | "accentColor" | "fontPresetId">;

const valid = (hex: string | undefined, fallback: string) => {
  const rgb = parseHex(hex);
  return rgb ? toHex(rgb) : fallback;
};

export function weddingTheme(source: Partial<ThemeSource>): GuestTheme {
  const primary = valid(source.primaryColor, DEFAULT_PRIMARY_COLOR);
  const accent = valid(source.accentColor, DEFAULT_ACCENT_COLOR);
  const template = templates.find((t) => t.id === source.templateId);
  const palette = template?.colorPalettes.find((p) => p.id === source.themePresetId);
  // The chosen palette's background; custom colours get a whisper of the primary instead.
  const background = palette ? valid(palette.background, "#FDF8F7") : mix(primary, "#FFFFFF", 0.955);
  const dark = luminance(background) < 0.18;

  const surface = dark ? mix(background, "#FFFFFF", 0.05) : mix(background, primary, 0.05);
  const card = dark ? mix(background, "#FFFFFF", 0.09) : mix(background, "#FFFFFF", 0.75);
  const ink = dark
    ? ensureContrast(mix(primary, "#FFFFFF", 0.9), background, 12, "#FFFFFF")
    : ensureContrast(mix(primary, INK_LIGHT, 0.86), background, 12, "#000000");
  const inkBase = dark ? mix(primary, "#FFFFFF", 0.55) : mix(primary, "#3B3236", 0.72);
  // Body text holds 4.5:1 on every surface it sits on, the tinted panels included.
  const inkVariant = [background, surface, card].reduce((c, bg) => ensureContrast(c, bg, 4.6), inkBase);
  const outline = mix(background, dark ? "#FFFFFF" : ink, dark ? 0.2 : 0.14);

  const white = contrast("#FFFFFF", primary);
  const black = contrast(INK_LIGHT, primary);
  const onPrimary = white >= 4.5 || white >= black ? "#FFFFFF" : INK_LIGHT;

  const font = resolveFontPreset(source.fontPresetId);
  const qrLight = !dark && luminance(background) > 0.85 ? background : "#FFFFFF";

  return {
    dark,
    primary,
    onPrimary,
    accent,
    background,
    surface,
    card,
    ink,
    inkVariant,
    outline,
    link: ensureContrast(primary, background, 4.5),
    line: ensureContrast(ensureContrast(primary, surface, 3), card, 3),
    error: dark ? "#F2A08F" : "#AE3F2C",
    serif: font.id === "default" ? SERIF : font.serif,
    sans: font.id === "default" ? SANS : font.sans,
    // 7:1 keeps codes reliable on phone cameras in dim rooms.
    qrDark: ensureContrast(primary, qrLight, 7, "#000000"),
    qrLight,
  };
}
