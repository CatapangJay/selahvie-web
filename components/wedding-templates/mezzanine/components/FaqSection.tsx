import type { FaqItem } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, SANS } from "../theme";
import { Floor, FloorHeading } from "./Motion";

/** Questions as native disclosure rows; the round plus turns to a minus when open. */
export default function FaqSection({ items, floor, palette: p }: { items: FaqItem[]; floor: number; palette: Palette }) {
  const list = items.filter((f) => f.question.trim());
  if (list.length === 0) return null;
  return (
    <Floor id="faq" labelledBy="mz-faq-title" background={p.linen}>
      <style>{`
.mz-faq summary::-webkit-details-marker { display: none; }
.mz-faq details[open] .mz-faq-v { transform: scaleY(0); }
.mz-faq-v { transition: transform .35s cubic-bezier(.16,1,.3,1); }
@media (prefers-reduced-motion: reduce) { .mz-faq-v { transition: none; } }
`}</style>
      <FloorHeading id="mz-faq-title" floor={floor} title="Questions" palette={p} />
      <div className="mz-faq" style={{ borderBottom: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
        {list.map((f) => (
          <details key={f.id} style={{ borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
            <summary className="flex cursor-pointer items-center focus-visible:outline-2 focus-visible:outline-offset-2" style={{ listStyle: "none", gap: "1rem", minHeight: 60, padding: "0.9rem 0", fontFamily: SANS, fontWeight: 600, fontSize: BODY, lineHeight: 1.4, color: p.ink, outlineColor: p.oxblood }}>
              <span style={{ flex: 1 }}>{f.question}</span>
              <span aria-hidden style={{ position: "relative", flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: `1px solid ${p.bronzeText}` }}>
                <span style={{ position: "absolute", left: 8, right: 8, top: 13, height: 1, background: p.bronzeText }} />
                <span className="mz-faq-v" style={{ position: "absolute", top: 8, bottom: 8, left: 13, width: 1, background: p.bronzeText }} />
              </span>
            </summary>
            <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.65, color: p.inkSoft, margin: 0, padding: "0 2.8rem 1.3rem 0", maxWidth: "60ch", whiteSpace: "pre-line" }}>{f.answer}</p>
          </details>
        ))}
      </div>
    </Floor>
  );
}
