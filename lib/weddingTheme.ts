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
import * as Eucalyptus from "@/components/wedding-templates/eucalyptus-folio/theme";
import * as Mezzanine from "@/components/wedding-templates/mezzanine/theme";
import * as Monochrome from "@/components/wedding-templates/monochrome/theme";
import * as Narra from "@/components/wedding-templates/narra-kapis/theme";
import * as Shutter from "@/components/wedding-templates/shutter-strip/theme";
import * as Wizarding from "@/components/wedding-templates/wizarding-vows/theme";
import * as Jewel from "@/components/wedding-templates/jewel-tones/theme";
import * as Apricot from "@/components/wedding-templates/apricot-hour/theme";

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
  /** CSS font stacks (real family names, so canvas can use them too): the template's own type. */
  serif: string;
  sans: string;
  /** The template's script face, for a single flourish (the couple's names on some templates). */
  script?: string;
  /** Stylesheet that loads the template's fonts, when the app doesn't already. */
  fontsHref?: string;
  /** QR modules and ground: the couple's colour, dark enough to scan. */
  qrDark: string;
  qrLight: string;
}

const SERIF = "'Fraunces', 'Playfair Display', Georgia, serif";
const SANS = "'Inter', 'Outfit', system-ui, sans-serif";

/** A template font stack without CSS variables (canvas can't read them): `var(--x, 'A'), B` → `'A', B`. */
const plain = (stack: string) =>
  stack
    .replace(/var\(--[\w-]+,\s*([^)]+)\)/g, "$1")
    .replace(/var\(--[\w-]+\)\s*,?\s*/g, "")
    .replace(/,\s*,/g, ",")
    .trim();

interface TemplateType {
  serif: string;
  sans: string;
  script?: string;
  fontsHref?: string;
}

/**
 * Each template's own typography, from its theme file. Templates not listed use
 * the app's fonts (the older designs set theirs through --font-serif/--font-sans).
 */
const TEMPLATE_TYPE: Record<string, TemplateType> = {
  // Pinyon Script's ampersand reads as a squiggle at display size; these two use their serif's italic instead.
  t12: { serif: plain(Jewel.SERIF), sans: SANS },
  t13: { serif: plain(Monochrome.HEADING), sans: Monochrome.BODY, script: Monochrome.ACCENT, fontsHref: Monochrome.FONTS_HREF },
  t14: { serif: plain(Apricot.DISPLAY), sans: Apricot.SANS },
  t15: { serif: plain(Narra.DISPLAY), sans: Narra.SERIF, script: Narra.SCRIPT, fontsHref: Narra.FONTS_HREF },
  t16: { serif: plain(Shutter.DISPLAY), sans: SANS, script: Shutter.SCRIPT, fontsHref: Shutter.FONTS_HREF },
  t17: { serif: plain(Wizarding.DISPLAY), sans: Wizarding.CAPS, fontsHref: Wizarding.FONTS_HREF },
  t18: { serif: plain(Eucalyptus.DISPLAY), sans: Eucalyptus.SANS, fontsHref: Eucalyptus.FONTS_HREF },
  t19: { serif: plain(Mezzanine.DISPLAY), sans: Mezzanine.SANS, fontsHref: Mezzanine.FONTS_HREF },
};
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
  // Text on the primary colour: white or our dark ink when either reaches 4.5:1; for mid-tone
  // primaries where neither does, whichever of pure white or pure black reads better.
  const onPrimary =
    white >= 4.5 ? "#FFFFFF" : black >= 4.5 ? INK_LIGHT : contrast("#000000", primary) > white ? "#000000" : "#FFFFFF";

  const font = resolveFontPreset(source.fontPresetId);
  // The couple's font preset wins over the template's own type, as on their website.
  const type: TemplateType = font.id !== "default" ? { serif: font.serif, sans: font.sans } : TEMPLATE_TYPE[source.templateId ?? ""] ?? { serif: SERIF, sans: SANS };
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
    serif: type.serif,
    sans: type.sans,
    script: type.script,
    fontsHref: type.fontsHref,
    // 7:1 keeps codes reliable on phone cameras in dim rooms.
    qrDark: ensureContrast(primary, qrLight, 7, "#000000"),
    qrLight,
  };
}
