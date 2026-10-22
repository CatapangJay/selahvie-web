import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SCRIPT, paperStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** The story typed on the back of a print, with a drop cap and a signed-off caption. */
export default function StorySection({ config, palette: p }: Props) {
  const paragraphs = config.coupleStory?.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) ?? [];
  if (paragraphs.length === 0) return null;

  return (
    <section id="story" aria-labelledby="ss-story-title" style={{ ...paperStyle(p), padding: "5.5rem 1.5rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="ss-story-title" caption="How it started" title="Our |Story" color={p.ink} accent={p.film} />
        {paragraphs.map((text, i) => (
          <p
            key={i}
            className={i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-[3.5em] first-letter:leading-[0.8]" : undefined}
            style={{ fontFamily: DISPLAY, fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.7, color: p.text, margin: "0 0 1.2em", textWrap: "pretty" }}
          >
            {text}
          </p>
        ))}
        <p style={{ textAlign: "right", margin: "1.5rem 0 0" }}>
          <span style={{ display: "block", fontFamily: MONO, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: p.inkSoft }}>With love,</span>
          <span style={{ display: "block", fontFamily: SCRIPT, fontSize: "clamp(2.4rem, 11vw, 3.2rem)", lineHeight: 1.2, color: p.film }}>
            {config.partner1Name} &amp; {config.partner2Name}
          </span>
        </p>
      </div>
    </section>
  );
}
