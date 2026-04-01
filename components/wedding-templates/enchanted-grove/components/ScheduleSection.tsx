"use client";

import { motion, type Variants } from "framer-motion";
import Divider from "./Divider";

interface Props {
  gold: string;
  accent: string;
}

const SCHEDULE = [
  { time: "3:30 PM",  title: "Guests Welcomed",          desc: "Guided through the enchanted garden" },
  { time: "4:30 PM",  title: "Ceremony",                  desc: "Vows spoken beneath the ancient oak" },
  { time: "6:00 PM",  title: "Cocktail Hour",             desc: "Champagne & wild herb canapés" },
  { time: "8:00 PM",  title: "Dinner",                    desc: "A feast by lantern light" },
  { time: "10:00 PM", title: "Bonfire & Dancing",         desc: "Music, magic, and memories" },
  { time: "Midnight", title: "Farewell Under the Stars",  desc: "A send-off the forest will remember" },
];

const itemVar: Variants = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" as const } },
};
const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

export default function ScheduleSection({ gold, accent }: Props) {
  return (
    <section
      className="py-28 px-6"
      style={{ background: "#08110e", borderTop: `1px solid ${gold}10` }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-center mb-16"
        >
          <p className="uppercase tracking-[0.26em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Day Of
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#eef5ee" }}>
            The Schedule
          </h2>
          <Divider gold={gold} accent={accent} />
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="relative"
        >
          {/* Glowing vertical rail */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: "6.5rem",
              top: 0,
              bottom: 0,
              width: 1,
              background: `linear-gradient(to bottom, transparent, ${accent}40 10%, ${gold}30 50%, ${accent}40 90%, transparent)`,
            }}
            aria-hidden
          />

          {SCHEDULE.map((item, i) => (
            <motion.div
              key={i}
              variants={itemVar}
              className="flex items-start gap-6 mb-10 last:mb-0 group"
            >
              {/* Time */}
              <div className="shrink-0 text-right pt-0.5" style={{ width: "5.5rem" }}>
                <span className="text-xs tabular-nums" style={{ color: gold, letterSpacing: "0.06em", fontFamily: "var(--font-sans)" }}>
                  {item.time}
                </span>
              </div>

              {/* Glowing node */}
              <div className="relative shrink-0 mt-1" style={{ width: 14, height: 14 }}>
                <motion.div
                  className="w-full h-full rounded-full"
                  style={{ background: `radial-gradient(circle, ${gold} 30%, ${accent}40 100%)` }}
                  animate={{ boxShadow: [`0 0 6px ${gold}60`, `0 0 18px ${gold}90`, `0 0 6px ${gold}60`] }}
                  transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Content */}
              <div className="pb-4">
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "#eef5ee", marginBottom: "0.25rem" }}>
                  {item.title}
                </p>
                <p className="text-sm" style={{ color: `${accent}55`, lineHeight: 1.65 }}>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
