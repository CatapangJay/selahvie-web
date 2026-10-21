import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, HEADING } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
}

/** Numbered questions down a hairline-ruled column. */
export default function FaqSection({ config, palette: p, index }: Props) {
  const items = (config.faq ?? []).filter((f) => f.question.trim());
  if (items.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="mc-faq-title" style={{ background: p.ink, padding: "6rem 1.25rem", textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="mc-faq-title" index={index} eyebrow="Notes for guests" title="Good to Know" color="#fff" muted="rgba(255,255,255,.55)" />
        <dl style={{ margin: 0, textAlign: "left", borderTop: "1px solid rgba(255,255,255,.4)" }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2.75rem 1fr", padding: "1.6rem 0.25rem", borderBottom: "1px solid rgba(255,255,255,.18)" }}>
              <span aria-hidden style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: "0.1em", color: "rgba(255,255,255,.5)", paddingTop: "0.3rem" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <dt style={{ fontFamily: HEADING, fontSize: "clamp(19px, 5.2vw, 23px)", fontWeight: 300, color: "#fff", margin: 0 }}>{item.question}</dt>
                <dd style={{ whiteSpace: "pre-line", fontFamily: HEADING, fontSize: "clamp(15px, 4vw, 16px)", fontWeight: 300, lineHeight: 1.65, color: "rgba(255,255,255,.7)", margin: "0.5rem 0 0" }}>
                  {item.answer}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
