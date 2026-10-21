"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SERIF, capizStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** The programme down a narra rail, each moment pinned with a small capiz diamond. */
export default function ScheduleSection({ config, palette: p }: Props) {
  const reduce = useReducedMotion();
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="nk-schedule-title" style={{ ...capizStyle(p, 100), padding: "6rem 1.25rem", color: p.ink }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="nk-schedule-title" eyebrow="Ang programa" title="Order of the Day" color={p.narraDeep} accent={p.molave} />
        <ol style={{ position: "relative", listStyle: "none", padding: "0 0 0 2.75rem", margin: 0 }}>
          <span aria-hidden style={{ position: "absolute", left: "0.9rem", top: 6, bottom: 6, width: 4, background: p.narra, borderRadius: 2, boxShadow: `inset 1px 0 0 ${p.molave}` }} />
          {events.map((event, i) => (
            <motion.li
              key={event.id}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative", padding: "0 0 2.25rem" }}
            >
              <span
                aria-hidden
                style={{
                  ...capizStyle(p, 100),
                  position: "absolute",
                  left: "-2.32rem",
                  top: "0.3rem",
                  width: 18,
                  height: 18,
                  transform: "rotate(45deg)",
                  boxShadow: `0 0 0 3px ${p.narra}, 0 0 0 4px ${p.brass}`,
                }}
              />
              {event.time && (
                <p style={{ fontFamily: DISPLAY, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: p.molave, margin: 0 }}>{event.time}</p>
              )}
              <p style={{ fontFamily: DISPLAY, fontSize: "clamp(22px, 6vw, 28px)", letterSpacing: "0.03em", lineHeight: 1.25, color: p.narraDeep, margin: "0.2rem 0 0" }}>{event.title}</p>
              {event.description && (
                <p style={{ whiteSpace: "pre-line", fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.5, color: p.ink, margin: "0.3rem 0 0" }}>
                  {event.description}
                </p>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
