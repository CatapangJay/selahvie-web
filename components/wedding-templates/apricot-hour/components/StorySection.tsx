import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

export default function StorySection({ config, palette: p, band }: Props) {
  const paragraphs = config.coupleStory?.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) ?? [];
  if (paragraphs.length === 0) return null;
  const t = tones(band, p);
  const [lead, ...rest] = paragraphs;

  return (
    <section aria-labelledby="ah-story-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <SectionTitle id="ah-story-title" eyebrow="How we got here" title="Our little story" band={band} palette={p} />
        <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1.3rem, 5vw, 1.6rem)", lineHeight: 1.55, color: t.text, margin: "0 0 1.5rem" }}>{lead}</p>
        {rest.map((text, i) => (
          <p key={i} style={{ fontFamily: SANS, fontWeight: 300, fontSize: "clamp(1rem, 4.2vw, 1.1rem)", lineHeight: 1.8, color: t.soft, margin: "0 0 1.25rem" }}>
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}
