"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO, paperStyle, stampText } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/**
 * The programme as a contact sheet: each moment is a numbered frame on a
 * length of negative, the time burned in like the camera's date.
 */
export default function ScheduleSection({ config, palette: p }: Props) {
  const reduce = useReducedMotion();
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;
  // Sprocket holes running down both edges of the negative.
  const rail = { backgroundImage: `linear-gradient(transparent 0 6px, ${p.paper} 6px 16px, transparent 16px 24px)`, backgroundSize: "9px 24px", backgroundRepeat: "repeat-y", backgroundPosition: "50% 0" } as const;

  return (
    <section aria-labelledby="ss-schedule-title" style={{ ...paperStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ss-schedule-title" caption="The running order" title="On the |Day" color={p.ink} accent={p.film} />
        <ol style={{ listStyle: "none", padding: 0, margin: 0, background: p.inkDeep, borderRadius: 4, overflow: "hidden", boxShadow: "0 24px 34px -26px rgba(10,12,20,.8)" }}>
          {events.map((event, i) => (
            <motion.li
              key={event.id}
              initial={reduce ? false : { opacity: 0, x: i % 2 ? 14 : -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "grid", gridTemplateColumns: "22px 1fr 22px" }}
            >
              <span aria-hidden style={rail} />
              <div style={{ background: p.print, margin: "6px 0", padding: "1.1rem 1.1rem 1rem", display: "flex", gap: "1rem", alignItems: "baseline" }}>
                <span aria-hidden style={{ fontFamily: MONO, fontSize: 12, color: p.inkSoft, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}A</span>
                <div style={{ minWidth: 0 }}>
                  {event.time && <p style={{ ...stampText(p), color: p.film, textShadow: "none", fontSize: 15, margin: 0 }}>{event.time}</p>}
                  <p style={{ fontFamily: DISPLAY, fontSize: "clamp(22px, 6vw, 28px)", lineHeight: 1.2, color: p.ink, margin: "0.15rem 0 0" }}>{event.title}</p>
                  {event.description && (
                    <p style={{ whiteSpace: "pre-line", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.5, color: p.text, margin: "0.25rem 0 0" }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
              <span aria-hidden style={rail} />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
