import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BOOK, DISPLAY, QUILL, capsLabel, parchmentStyle } from "../theme";
import DriedSpray from "./DriedFlowers";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** The story as the first chapter of an old book: a ruled page, an illuminated capital, a signed close. */
export default function StorySection({ config, palette: p }: Props) {
  const paragraphs = config.coupleStory?.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) ?? [];
  if (paragraphs.length === 0) return null;
  const [first, ...rest] = paragraphs;

  const body = { fontFamily: BOOK, fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.7, color: p.ink, margin: "0 0 1.15em", textWrap: "pretty" } as const;

  return (
    <section id="story" aria-labelledby="wv-story-title" style={{ ...parchmentStyle(p), position: "relative", overflow: "hidden", padding: "5.5rem 1.25rem" }}>
      <DriedSpray tone="dark" style={{ position: "absolute", top: 0, right: 0, width: "min(40vw, 15rem)", rotate: "180deg" }} />
      <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
        <SectionHeading id="wv-story-title" kicker="Chapter the First" title="Our Tale" color={p.ink} accent={p.wax} />
        <div style={{ position: "relative", padding: "clamp(1.6rem, 6vw, 2.6rem) clamp(1.2rem, 5vw, 2.2rem)", borderTop: `1px solid color-mix(in srgb, ${p.inkSoft} 40%, transparent)`, borderBottom: `1px solid color-mix(in srgb, ${p.inkSoft} 40%, transparent)` }}>
          <p style={body}>
            <span
              aria-hidden
              style={{ float: "left", fontFamily: DISPLAY, fontWeight: 400, fontSize: "4.2em", lineHeight: 0.8, color: p.wax, margin: "0.06em 0.12em 0 0" }}
            >
              {first.charAt(0)}
            </span>
            <span className="sr-only">{first.charAt(0)}</span>
            {first.slice(1)}
          </p>
          {rest.map((text, i) => (
            <p key={i} style={body}>{text}</p>
          ))}
        </div>
        <p style={{ textAlign: "right", margin: "1.5rem 0 0" }}>
          <span style={{ display: "block", ...capsLabel(p.inkSoft, 11) }}>Mischievously yours,</span>
          <span style={{ display: "block", fontFamily: QUILL, fontSize: "clamp(2.2rem, 10vw, 3rem)", lineHeight: 1.25, color: p.quill }}>
            {config.partner1Name} &amp; {config.partner2Name}
          </span>
        </p>
      </div>
    </section>
  );
}
