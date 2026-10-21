import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SERIF, capizStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** Questions as drawers in an aparador: tap a narra-edged row to pull out the answer. */
export default function FaqSection({ config, palette: p }: Props) {
  const items = (config.faq ?? []).filter((f) => f.question.trim());
  if (items.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="nk-faq-title" style={{ ...capizStyle(p, 100), padding: "6rem 1.25rem", color: p.ink }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="nk-faq-title" eyebrow="Mga tanong" title="Good to Know" color={p.narraDeep} accent={p.molave} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <details key={item.id} className="group" style={{ border: `1px solid ${p.molave}`, borderLeft: `6px solid ${p.narra}`, background: "rgba(255,255,255,.35)" }}>
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
                style={{ padding: "1.1rem 1.1rem", minHeight: 56, fontFamily: DISPLAY, fontSize: "clamp(17px, 4.6vw, 20px)", letterSpacing: "0.03em", color: p.narraDeep, outlineColor: p.narra }}
              >
                {item.question}
                <span aria-hidden className="shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ fontSize: 24, lineHeight: 1, color: p.brass }}>
                  +
                </span>
              </summary>
              <p style={{ whiteSpace: "pre-line", fontFamily: SERIF, fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.6, color: p.ink, margin: 0, padding: "0 1.1rem 1.2rem" }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
