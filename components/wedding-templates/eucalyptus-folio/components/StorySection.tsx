import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SANS, paperStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";
import { Sprig } from "./Specimens";

/** The story as field notes: the first paragraph opens with a large italic initial, later ones run on a ruled margin. */
export default function StorySection({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const paragraphs = (config.coupleStory ?? "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;
  const [first, ...rest] = paragraphs;

  return (
    <section id="story" aria-labelledby="ef-story-title" style={{ ...paperStyle(p), position: "relative", overflow: "hidden", padding: SHEET_PAD }}>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ef-story-title" caption="Field notes" title="How we grew together" ink={p.ink} soft={p.inkSoft} rust={p.rust} />
        <p style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(1.3rem, 5.6cqw, 1.6rem)", lineHeight: 1.5, color: p.ink, margin: 0 }}>
          <span aria-hidden style={{ float: "left", fontStyle: "italic", fontSize: "3.4em", lineHeight: 0.82, color: p.rust, margin: "0.06em 0.1em 0 0" }}>{first[0]}</span>
          <span className="sr-only">{first[0]}</span>
          {first.slice(1)}
        </p>
        {rest.length > 0 && (
          <div style={{ marginTop: "1.6rem", paddingLeft: "1.1rem", borderLeft: `1px solid color-mix(in srgb, ${p.ink} 25%, transparent)` }}>
            {rest.map((para, i) => (
              <p key={i} style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.2cqw, 17px)", lineHeight: 1.75, color: p.text, margin: i ? "1rem 0 0" : 0 }}>
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
      <Sprig which={2} width="40cqw" rotate={-200} style={{ right: "-12%", bottom: "-6%", maxWidth: 240, opacity: 0.85 }} />
    </section>
  );
}
