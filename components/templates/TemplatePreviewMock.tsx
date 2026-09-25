import type { WeddingTemplate } from "@/types/template";

interface Props {
  template: WeddingTemplate;
  /** Sample couple shown in the mock (varies per card for life). */
  couple?: [string, string];
  date?: string;
}

/**
 * A generated, always-sharp preview "thumbnail" for a template card. Instead of
 * a random stock photo (or a heavy live iframe), it renders a miniature
 * invitation using the template's OWN palette + serif — so each card visibly
 * represents that template's look, and it can never ship a broken image.
 *
 * Dark templates (low-luminance background) get light type; light templates get
 * dark type, computed from the palette so contrast always holds.
 */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 1;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export default function TemplatePreviewMock({
  template,
  couple = ["Ava", "Liam"],
  date = "IX · XXVI · MMXXVI",
}: Props) {
  const palette = template.colorPalettes[0] ?? {
    primary: "#7c5454",
    accent: "#c99999",
    background: "#fdf9f6",
  };
  const isDark = luminance(palette.background) < 0.4;
  const ink = isDark ? "rgba(255,255,255,0.92)" : "#2f1e26";
  const inkSoft = isDark ? "rgba(255,255,255,0.6)" : "rgba(47,30,38,0.6)";

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background: palette.background,
        // Soft radial glow in the accent for depth (subtle, not decorative noise).
        backgroundImage: `radial-gradient(ellipse 90% 70% at 50% 35%, ${palette.accent}22, transparent 70%)`,
      }}
      aria-hidden
    >
      {/* Eyebrow */}
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.5rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: inkSoft,
        }}
      >
        Together with their families
      </span>

      {/* Couple names */}
      <span
        className="mt-4"
        style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 5vw, 2.4rem)", lineHeight: 1.05, color: ink }}
      >
        {couple[0]}
      </span>
      <span
        className="my-1"
        style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.9rem", color: palette.primary }}
      >
        &amp;
      </span>
      <span
        style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 5vw, 2.4rem)", lineHeight: 1.05, color: ink }}
      >
        {couple[1]}
      </span>

      {/* Divider with accent center dot */}
      <span className="mt-5 flex items-center gap-2" style={{ width: "60%" }}>
        <span style={{ flex: 1, height: 1, background: `${palette.primary}40` }} />
        <span style={{ width: 5, height: 5, borderRadius: 9999, background: palette.accent }} />
        <span style={{ flex: 1, height: 1, background: `${palette.primary}40` }} />
      </span>

      {/* Date */}
      <span
        className="mt-4"
        style={{ fontFamily: "var(--font-sans)", fontSize: "0.5rem", letterSpacing: "0.24em", textTransform: "uppercase", color: inkSoft }}
      >
        {date}
      </span>
    </div>
  );
}
