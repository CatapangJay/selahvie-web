import { Plus } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

/** Questions that open in place (native details/summary, so they work without JavaScript). */
export default function FaqSection({ config, palette: p, band }: Props) {
  const items = (config.faq ?? []).filter((f) => f.question.trim());
  if (items.length === 0) return null;
  const t = tones(band, p);

  return (
    <section id="faq" aria-labelledby="ah-faq-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionTitle id="ah-faq-title" eyebrow="Little questions" title="You might wonder" band={band} palette={p} />
        <div style={{ display: "grid", gap: "0.6rem" }}>
          {items.map((item) => (
            <details key={item.id} className="group" style={{ background: t.card, borderRadius: "1.25rem", boxShadow: band.dark ? `inset 0 0 0 1px ${t.rule}` : undefined }}>
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
                style={{ minHeight: 56, padding: "0.9rem 1.25rem", fontFamily: DISPLAY, fontSize: "1.2rem", color: band.dark ? p.morning : p.ink, outlineColor: t.text, borderRadius: "1.25rem" }}
              >
                {item.question}
                <Plus aria-hidden size={18} className="shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ color: t.accent }} />
              </summary>
              <p style={{ whiteSpace: "pre-line", fontFamily: SANS, fontWeight: 300, fontSize: "1rem", lineHeight: 1.65, color: t.soft, margin: 0, padding: "0 1.25rem 1.2rem" }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
