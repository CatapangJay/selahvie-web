"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FaqItem } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  item: FaqItem;
  palette: Palette;
}

/**
 * What to wear, shown as a colour-lab test card: chips mixed from the
 * couple's palette fan out above the dress-code note from their FAQ.
 */
export default function DressCodeSection({ item, palette: p }: Props) {
  const reduce = useReducedMotion();
  const chips = [p.ink, `color-mix(in srgb, ${p.ink} 55%, ${p.paper})`, p.film, `color-mix(in srgb, ${p.film} 45%, ${p.paper})`, "#D9CBB4"];

  return (
    <section aria-labelledby="ss-dress-title" style={{ background: p.print, color: p.text, padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="ss-dress-title" caption="What to wear" title="Dress |Code" color={p.ink} accent={p.film} />
        <div aria-hidden style={{ display: "flex", justifyContent: "center", height: 150, marginBottom: "2rem" }}>
          {chips.map((color, i) => {
            const angle = (i - (chips.length - 1) / 2) * 9;
            return (
              <motion.div
                key={i}
                initial={reduce ? false : { rotate: 0, y: 20, opacity: 0 }}
                whileInView={{ rotate: angle, y: Math.abs(angle) * 0.8, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 62,
                  height: 132,
                  margin: "0 -6px",
                  transformOrigin: "50% 100%",
                  background: "#FFFFFF",
                  padding: 5,
                  boxShadow: "0 10px 16px -10px rgba(10,12,20,.55)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ flex: 1, background: color }} />
                <span style={{ fontFamily: MONO, fontSize: 10, color: "#6B6B6B", paddingTop: 4 }}>{String(i + 1).padStart(2, "0")}</span>
              </motion.div>
            );
          })}
        </div>
        <p style={{ whiteSpace: "pre-line", fontFamily: DISPLAY, fontSize: "clamp(18px, 5vw, 22px)", lineHeight: 1.6, color: p.text, margin: "0 auto", maxWidth: 460, textWrap: "pretty" }}>{item.answer}</p>
      </div>
    </section>
  );
}
