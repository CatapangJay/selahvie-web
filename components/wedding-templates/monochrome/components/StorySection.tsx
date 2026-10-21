import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { ACCENT, HEADING } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
}

/** Story set as a narrow column, opening on a large thin initial, signed by hand. */
export default function StorySection({ config, palette: p, index }: Props) {
  const paragraphs = config.coupleStory?.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) ?? [];
  if (paragraphs.length === 0) return null;

  return (
    <section aria-labelledby="mc-story-title" style={{ background: p.charcoal, padding: "6.5rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="mc-story-title" index={index} eyebrow="How it began" title="Our Story" color="#fff" muted="rgba(255,255,255,.55)" />
        <div style={{ textAlign: "left" }}>
          {paragraphs.map((text, i) => (
            <p
              key={i}
              className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:text-[4.2em] first-letter:leading-[0.85] first-letter:font-extralight" : undefined}
              style={{ fontFamily: HEADING, fontSize: "clamp(16px, 4.4vw, 19px)", fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,.82)", margin: "0 0 1.4em" }}
            >
              {text}
            </p>
          ))}
        </div>
        <p style={{ fontFamily: ACCENT, fontSize: "clamp(44px, 13vw, 64px)", color: "#fff", lineHeight: 1, margin: "1.5rem 0 0" }}>
          {config.partner1Name} &amp; {config.partner2Name}
        </p>
      </div>
    </section>
  );
}
