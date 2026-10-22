import type { FaqItem } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO, paperStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  items: FaqItem[];
  palette: Palette;
}

/** Questions as caption cards: a red Q, tap to read the answer typed underneath. */
export default function FaqSection({ items, palette: p }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="ss-faq-title" style={{ ...paperStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="ss-faq-title" caption="Good to know" title="Questions" color={p.ink} accent={p.film} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <details key={item.id} className="group" style={{ background: p.print, borderRadius: 6, boxShadow: "0 8px 16px -12px rgba(10,12,20,.45)" }}>
              <summary
                className="flex cursor-pointer list-none items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
                style={{ padding: "1.1rem 1.1rem", minHeight: 56, fontFamily: DISPLAY, fontSize: "clamp(18px, 4.8vw, 21px)", color: p.ink, outlineColor: p.ink }}
              >
                <span aria-hidden style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: p.film }}>Q.</span>
                <span style={{ flex: 1 }}>{item.question}</span>
                <span aria-hidden className="shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ fontFamily: MONO, fontSize: 22, lineHeight: 1, color: p.film }}>
                  +
                </span>
              </summary>
              <p style={{ whiteSpace: "pre-line", fontFamily: MONO, fontSize: "clamp(15px, 4.2vw, 17px)", lineHeight: 1.6, color: p.text, margin: 0, padding: "0 1.1rem 1.2rem 3.1rem" }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
