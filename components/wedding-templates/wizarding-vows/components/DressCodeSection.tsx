"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Palette } from "../theme";
import { BOOK, capsLabel, parchmentStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  title?: string;
  description: string;
  /** The couple's palette (hex), knitted into the scarves. Without it the scarves use the template colours. */
  swatches?: string[];
  palette: Palette;
}

/**
 * What to wear, as a row of striped house scarves knitted from the couple's
 * colours, swinging gently on their hooks above the dress-code note.
 */
export default function DressCodeSection({ title, description, swatches, palette: p }: Props) {
  const reduce = useReducedMotion();
  const own = Boolean(swatches?.length);
  const scarves: [string, string][] = swatches?.length
    ? swatches.slice(0, 6).map((hex, i) => [hex, i % 2 ? p.giltSoft : p.gilt])
    : [
        [p.wax, p.giltSoft],
        [p.slate, p.gilt],
        [p.quill, p.parchment],
        [p.parchmentDeep, p.quill],
      ];

  return (
    <section id="robes" aria-labelledby="wv-dress-title" style={{ ...parchmentStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="wv-dress-title" kicker="What to wear" title="Robes & Attire" color={p.ink} accent={p.wax} />
        <ul aria-hidden={!own} aria-label={own ? "Suggested colors" : undefined} style={{ listStyle: "none", padding: "14px 0 0", position: "relative", display: "flex", justifyContent: "center", gap: "clamp(14px, 5vw, 26px)", marginBottom: "2.4rem" }}>
          <span style={{ position: "absolute", top: 6, left: "8%", right: "8%", height: 6, borderRadius: 3, background: `linear-gradient(${p.inkSoft}, ${p.ink})` }} />
          {scarves.map(([base, stripe], i) => (
            <motion.li
              key={i}
              role={own ? "img" : undefined}
              aria-label={own ? `Color ${base.toUpperCase()}` : undefined}
              initial={reduce ? false : { rotate: -2.5, y: -30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              animate={reduce ? undefined : { rotate: [-2.5, 2.5, -2.5] }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ y: { duration: 0.8, delay: i * 0.1 }, opacity: { duration: 0.8, delay: i * 0.1 }, rotate: { duration: 3.6 + i * 0.4, repeat: Infinity, ease: "easeInOut" } }}
              style={{ position: "relative", width: "clamp(44px, 13vw, 60px)", transformOrigin: "50% 0" }}
            >
              <div
                style={{
                  height: "clamp(150px, 40vw, 190px)",
                  borderRadius: "6px 6px 2px 2px",
                  backgroundColor: base,
                  backgroundImage: `linear-gradient(180deg, transparent 0 62%, ${stripe} 62% 66%, transparent 66% 70%, ${stripe} 70% 74%, transparent 74%), repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 2px, transparent 2px 5px)`,
                  boxShadow: "inset -6px 0 10px -6px rgba(0,0,0,.4), 0 12px 18px -12px rgba(0,0,0,.55)",
                }}
              />
              {/* Fringe */}
              <div style={{ height: 16, backgroundImage: `repeating-linear-gradient(90deg, ${stripe} 0 2px, transparent 2px 5px)` }} />
            </motion.li>
          ))}
        </ul>
        {title && <p style={{ ...capsLabel(p.wax, 12), fontWeight: 700, margin: "0 0 0.75rem" }}>{title}</p>}
        {description && <p style={{ whiteSpace: "pre-line", fontFamily: BOOK, fontSize: "clamp(18px, 5vw, 22px)", lineHeight: 1.6, color: p.ink, margin: "0 auto", maxWidth: 460, textWrap: "pretty" }}>{description}</p>}
      </div>
    </section>
  );
}
