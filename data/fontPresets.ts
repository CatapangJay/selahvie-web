/**
 * Font pairing presets for the customization studio (deeper customization).
 * Each preset maps to a serif (display) + sans (body) family already loaded,
 * or web-safe fallbacks. Applied on the published site via CSS variables
 * `--wedding-serif` / `--wedding-sans` on the template root.
 */
export interface FontPreset {
  id: string;
  name: string;
  serif: string; // display / headings
  sans: string; // body / UI
}

export const fontPresets: FontPreset[] = [
  {
    id: "default",
    name: "Template Default",
    serif: "var(--font-serif)",
    sans: "var(--font-sans)",
  },
  {
    id: "editorial",
    name: "Editorial (Fraunces · Inter)",
    serif: "'Fraunces', 'Playfair Display', Georgia, serif",
    sans: "'Inter', system-ui, sans-serif",
  },
  {
    id: "classic",
    name: "Classic (Playfair · Outfit)",
    serif: "'Playfair Display', Georgia, serif",
    sans: "'Outfit', system-ui, sans-serif",
  },
  {
    id: "timeless",
    name: "Timeless (Georgia · System)",
    serif: "Georgia, 'Times New Roman', serif",
    sans: "system-ui, -apple-system, sans-serif",
  },
];

export function resolveFontPreset(id?: string): FontPreset {
  return fontPresets.find((p) => p.id === id) ?? fontPresets[0];
}
