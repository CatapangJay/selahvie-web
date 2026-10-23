"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BOOK, CAPS, capsLabel, slateStyle } from "../theme";
import { EASE, SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** The day as a timetable: each moment marked by a small gold diamond on a hairline rail. */
export default function ScheduleSection({ config, palette: p }: Props) {
  const reduce = useReducedMotion();
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;

  return (
    <section id="timetable" aria-labelledby="wv-schedule-title" style={{ ...slateStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="wv-schedule-title" kicker="The order of the day" title="The Timetable" color={p.chalk} accent={p.gilt} />
        <div style={{ position: "relative" }}>
        {/* The rail the candles stand along */}
        <span aria-hidden style={{ position: "absolute", left: 21, top: 12, bottom: 18, width: 1, background: `linear-gradient(${p.gilt}, color-mix(in srgb, ${p.gilt} 10%, transparent))` }} />
        <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
          {events.map((event) => (
            <motion.li
              key={event.id}
              initial={reduce ? false : { opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ position: "relative", display: "grid", gridTemplateColumns: "44px 1fr", gap: "1rem", alignItems: "start", padding: "0 0 1.9rem" }}
            >
              <span aria-hidden style={{ display: "flex", justifyContent: "center", alignSelf: "start", paddingTop: 6 }}>
                <span style={{ width: 9, height: 9, rotate: "45deg", border: `1px solid ${p.gilt}`, background: p.slate }} />
              </span>
              <div style={{ minWidth: 0, paddingBottom: "1.1rem", borderBottom: `1px solid color-mix(in srgb, ${p.chalk} 14%, transparent)` }}>
                {event.time && <p style={{ ...capsLabel(p.gilt, 13), paddingLeft: 0, margin: 0 }}>{event.time}</p>}
                <p style={{ fontFamily: CAPS, fontWeight: 600, fontSize: "clamp(21px, 5.8vw, 26px)", lineHeight: 1.25, color: p.chalk, margin: "0.2rem 0 0" }}>{event.title}</p>
                {event.description && (
                  <p style={{ whiteSpace: "pre-line", fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.5, color: `color-mix(in srgb, ${p.chalk} 80%, transparent)`, margin: "0.25rem 0 0" }}>
                    {event.description}
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}
