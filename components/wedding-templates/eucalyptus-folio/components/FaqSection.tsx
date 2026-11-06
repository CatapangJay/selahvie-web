import type { FaqItem } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SANS, paperStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

/** Questions as an annotated list: each opens in place (native disclosure, so it works by keyboard and without JavaScript). */
export default function FaqSection({ items, palette: p }: { items: FaqItem[]; palette: Palette }) {
  const faq = items.filter((f) => f.question.trim());
  if (faq.length === 0) return null;
  return (
    <section id="faq" aria-labelledby="ef-faq-title" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ef-faq-title" caption="Annotations" title="Good to know" ink={p.ink} soft={p.inkSoft} rust={p.rust} />
        <div style={{ borderBottom: `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)` }}>
          {faq.map((f, i) => (
            <details key={f.id} className="group" style={{ borderTop: `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)` }}>
              <summary className="flex cursor-pointer list-none items-baseline gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden" style={{ padding: "1.05rem 0", minHeight: 48, outlineColor: p.ink }}>
                <span aria-hidden style={{ fontFamily: MONO, fontSize: 12, color: p.rust, flexShrink: 0 }}>Q{i + 1}</span>
                <span style={{ flex: 1, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.1rem, 4.8cqw, 1.3rem)", lineHeight: 1.35, color: p.ink }}>{f.question}</span>
                <span aria-hidden className="transition-transform duration-500 group-open:rotate-45" style={{ fontFamily: MONO, fontSize: 18, color: p.inkSoft }}>+</span>
              </summary>
              <p style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.2cqw, 16.5px)", lineHeight: 1.7, color: p.text, margin: 0, padding: "0 0 1.2rem 2.1rem", whiteSpace: "pre-line" }}>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
