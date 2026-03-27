"use client";

import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";

interface ScheduleItem {
  time: string;
  event: string;
  detail: string;
}

interface Props {
  accent: string;
  items?: ScheduleItem[];
}

const DEFAULT_ITEMS: ScheduleItem[] = [
  { time: "7:30 PM", event: "Doors Open",      detail: "Welcome champagne & ambient music in the foyer"  },
  { time: "8:00 PM", event: "Ceremony",         detail: "A candlelit exchange of vows"                    },
  { time: "8:45 PM", event: "Cocktail Hour",    detail: "Passed hors d'oeuvres & live jazz on the terrace"},
  { time: "9:30 PM", event: "Reception Dinner", detail: "Six-course tasting menu with wine pairings"       },
  { time: "11:30 PM",event: "Dancing",          detail: "DJ & open bar until 2 AM"                        },
];

export default function ScheduleSection({ accent, items = DEFAULT_ITEMS }: Props) {
  return (
    <section className="py-28" style={{ background: "#0d0b09" }}>
      <div className="mx-auto max-w-2xl px-6">
        <SectionLabel eyebrow="What To Expect" title="Evening Schedule" />

        <div className="relative">
          {/* Vertical rail */}
          <div
            className="absolute left-[5.75rem] top-2 bottom-2 w-px"
            style={{ background: `linear-gradient(to bottom, transparent, ${accent}35, transparent)` }}
          />

          {items.map(({ time, event, detail }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
              className="flex gap-6 mb-10 relative group"
            >
              {/* Time */}
              <div className="text-right w-20 flex-shrink-0 pt-0.5">
                <p
                  className="label-luxury text-[0.6rem]"
                  style={{ color: `${accent}70`, letterSpacing: "0.1em" }}
                >
                  {time}
                </p>
              </div>

              {/* Node — glows on hover */}
              <motion.div
                className="relative flex-shrink-0 w-3 h-3 mt-1"
                style={{
                  background: accent,
                  outline: `3px solid rgba(201,168,76,0.2)`,
                  outlineOffset: "2px",
                  zIndex: 1,
                }}
                whileHover={{ scale: 1.5 }}
                transition={{ type: "spring", stiffness: 400 }}
              />

              {/* Content */}
              <div className="pb-2">
                <p
                  className="font-light text-sm tracking-wide"
                  style={{ color: "rgba(245,240,232,0.9)" }}
                >
                  {event}
                </p>
                <p
                  className="text-sm mt-1 font-light"
                  style={{ color: "rgba(245,240,232,0.4)" }}
                >
                  {detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
