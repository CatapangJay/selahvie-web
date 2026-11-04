import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import type { Palette } from "../theme";
import { SECTION_PAD, SERIF, paperStyle } from "../theme";
import SectionHeading from "./SectionHeading";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/**
 * Questions on cream paper, each a ruled entry behind a gilt diamond. Native
 * <details> keeps every answer reachable by keyboard and screen reader; the
 * diamond turns as an entry opens.
 */
export default function FaqSection({ config, palette: p }: Props) {
  const faq = (config.faq ?? []).filter((f) => f.question.trim());
  if (faq.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="jt-faq-title" style={{ ...paperStyle(p.cream, p.creamDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "44rem" }}>
        <SectionHeading id="jt-faq-title" eyebrow="Good to Know" title="Questions & Answers" palette={p} tone="light" />

        <ul style={{ borderTop: `1px solid ${p.gold}80` }}>
          {faq.map((item) => (
            <Reveal as="li" key={item.id} index={0} style={{ borderBottom: `1px solid ${p.gold}80` }}>
              <details className="group">
                <summary
                  className="flex cursor-pointer list-none items-start gap-4 py-5 [&::-webkit-details-marker]:hidden"
                  style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(1.2rem, 3vw, 1.4rem)", lineHeight: 1.35, color: p.raspberryDeep }}
                >
                  <span
                    aria-hidden
                    className="mt-[0.55em] shrink-0 rotate-45 motion-safe:transition-transform motion-safe:duration-300 group-open:rotate-[135deg]"
                    style={{ width: 9, height: 9, border: `1.5px solid ${p.goldDeep}`, background: "transparent" }}
                  />
                  <span className="flex-1">{item.question}</span>
                </summary>
                {item.answer.trim() && (
                  <p
                    className="whitespace-pre-line"
                    style={{ fontFamily: SERIF, fontSize: "1.15rem", lineHeight: 1.6, color: p.ink, padding: "0 0 1.5rem 1.6rem" }}
                  >
                    {item.answer}
                  </p>
                )}
              </details>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
