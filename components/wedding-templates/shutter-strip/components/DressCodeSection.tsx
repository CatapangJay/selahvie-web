"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Palette } from "../theme";
import { DISPLAY, MONO } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  title?: string;
  description: string;
  /** The couple's palette (hex). Without it the chips are mixed from the template colours. */
  swatches?: string[];
  palette: Palette;
}

/**
 * What to wear, shown as a colour-lab test card: chips mixed from the
 * couple's palette fan out above their dress-code note.
 */
export default function DressCodeSection({ title, description, swatches, palette: p }: Props) {
  const reduce = useReducedMotion();
  const own = Boolean(swatches?.length);
  const chips = swatches?.length ? swatches.slice(0, 6) : [p.ink, `color-mix(in srgb, ${p.ink} 55%, ${p.paper})`, p.film, `color-mix(in srgb, ${p.film} 45%, ${p.paper})`, "#D9CBB4"];

  return (
    <section aria-labelledby="ss-dress-title" style={{ background: p.print, color: p.text, padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="ss-dress-title" caption="What to wear" title="Dress |Code" color={p.ink} accent={p.film} />
        <ul aria-hidden={!own} aria-label={own ? "Suggested colors" : undefined} style={{ listStyle: "none", padding: 0, display: "flex", justifyContent: "center", height: 150, marginBottom: "2rem" }}>
          {chips.map((color, i) => {
            const angle = (i - (chips.length - 1) / 2) * 9;
            return (
              <motion.li
                key={i}
                role={own ? "img" : undefined}
                aria-label={own ? `Color ${color.toUpperCase()}` : undefined}
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
              </motion.li>
            );
          })}
        </ul>
        {title && <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, letterSpacing: "0.24em", textTransform: "uppercase", color: p.film, margin: "0 0 0.75rem" }}>{title}</p>}
        {description && <p style={{ whiteSpace: "pre-line", fontFamily: DISPLAY, fontSize: "clamp(18px, 5vw, 22px)", lineHeight: 1.6, color: p.text, margin: "0 auto", maxWidth: 460, textWrap: "pretty" }}>{description}</p>}
      </div>
    </section>
  );
}
