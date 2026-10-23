import type { FaqItem } from "@/types/wedding";
import type { Palette } from "../theme";
import { BOOK, CAPS, parchmentStyle } from "../theme";
import DriedSpray from "./DriedFlowers";
import { SectionHeading } from "./Motion";

interface Props {
  items: FaqItem[];
  palette: Palette;
}

/** Questions folded like notes passed in class: tap one to unfold the answer. */
export default function FaqSection({ items, palette: p }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="wv-faq-title" style={{ ...parchmentStyle(p), position: "relative", overflow: "hidden", padding: "5.5rem 1.25rem" }}>
      <DriedSpray tone="dark" flip style={{ position: "absolute", right: 0, bottom: 0, width: "min(40vw, 15rem)" }} />
      <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="wv-faq-title" kicker="Before you apparate" title="Curious Questions" color={p.ink} accent={p.wax} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <details
              key={item.id}
              className="group"
              style={{ background: `color-mix(in srgb, ${p.parchment} 70%, #FFF9EA)`, borderRadius: 3, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.inkSoft} 28%, transparent), 0 10px 18px -14px rgba(30,18,6,.6)` }}
            >
              <summary
                className="flex cursor-pointer list-none items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
                style={{ padding: "1.1rem 1.1rem", minHeight: 56, fontFamily: BOOK, fontSize: "clamp(18px, 4.8vw, 21px)", color: p.ink, outlineColor: p.ink }}
              >
                <span aria-hidden style={{ fontFamily: CAPS, fontSize: 14, color: p.wax }}>✦</span>
                <span style={{ flex: 1 }}>{item.question}</span>
                <span aria-hidden className="shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ fontFamily: CAPS, fontSize: 22, lineHeight: 1, color: p.wax }}>
                  +
                </span>
              </summary>
              <p style={{ whiteSpace: "pre-line", fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(16px, 4.4vw, 18px)", lineHeight: 1.6, color: p.ink, margin: 0, padding: "0 1.1rem 1.2rem 2.9rem" }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
