"use client";

import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { SCRIPT, SERIF, banigStyle } from "../theme";
import { SectionHeading, Written } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** The story read on a banig mat, signed off in the couple's hand as it scrolls into view. */
export default function StorySection({ config, palette: p }: Props) {
  const paragraphs = config.coupleStory?.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) ?? [];
  if (paragraphs.length === 0) return null;

  return (
    <section id="story" aria-labelledby="nk-story-title" style={{ ...banigStyle(p), padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="nk-story-title" eyebrow="Ang aming kuwento" title="Our Story" color={p.narraDeep} accent={p.molave} />
        {paragraphs.map((text, i) => (
          <p key={i} style={{ fontFamily: SERIF, fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.75, color: p.ink, margin: "0 0 1.2em", textWrap: "pretty" }}>
            {text}
          </p>
        ))}
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: p.molave, margin: "2rem 0 0" }}>Nagmamahal,</p>
        <p style={{ fontFamily: SCRIPT, fontSize: "clamp(2.6rem, 12vw, 3.6rem)", lineHeight: 1.15, margin: "0.25rem 0 0" }}>
          <Written color={p.narraDeep} nib={p.brass} inView duration={2.4}>
            {config.partner1Name} &amp; {config.partner2Name}
          </Written>
        </p>
      </div>
    </section>
  );
}
