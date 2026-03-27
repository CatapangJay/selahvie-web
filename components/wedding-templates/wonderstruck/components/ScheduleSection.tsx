"use client";

import { motion, type Variants } from "framer-motion";
import Divider from "./Divider";

interface Props {
  accent: string;
  gold: string;
}

const SCHEDULE = [
  { time: "4:00 PM", title: "Guests Arrive",            desc: "Welcome drinks & garden stroll" },
  { time: "5:00 PM", title: "Ceremony",                  desc: "Exchange of vows under the stars" },
  { time: "6:30 PM", title: "Cocktail Hour",             desc: "Champagne, canapés & celebration" },
  { time: "8:00 PM", title: "Dinner & Dancing",          desc: "An evening of feasting and enchantment" },
  { time: "11:00 PM", title: "Midnight Sparkle Send-off", desc: "Bid the couple a sparkling farewell" },
];

const itemVar: Variants = {
  hidden: { opacity: 0, x: -30 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" as const } },
};

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export default function ScheduleSection({ accent, gold }: Props) {
  return (
    <section
      className="py-24 px-6"
      style={{ background: "#0c0d1a", borderTop: `1px solid ${accent}10` }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Day Of
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              color: "#f0ecf8",
            }}
          >
            The Schedule
          </h2>
          <Divider accent={accent} gold={gold} />
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="relative"
        >
          {/* Vertical rail */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: "6.5rem",
              width: 1,
              background: `linear-gradient(to bottom, transparent, ${accent}40 15%, ${accent}40 85%, transparent)`,
            }}
            aria-hidden
          />

          {SCHEDULE.map((item, i) => (
            <motion.div
              key={i}
              variants={itemVar}
              className="flex items-start gap-6 mb-10 last:mb-0"
            >
              {/* Time */}
              <div
                className="shrink-0 text-right"
                style={{ width: "5.5rem", paddingTop: "0.2rem" }}
              >
                <span
                  className="text-xs tabular-nums"
                  style={{ color: gold, letterSpacing: "0.08em", fontFamily: "var(--font-sans)" }}
                >
                  {item.time}
                </span>
              </div>

              {/* Node */}
              <motion.div
                whileHover={{ scale: 1.5 }}
                className="relative shrink-0 mt-1"
                style={{ width: 14, height: 14 }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{ background: gold, boxShadow: `0 0 12px ${gold}80` }}
                />
              </motion.div>

              {/* Content */}
              <div className="pb-4">
                <p
                  className="mb-1"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "#f0ecf8" }}
                >
                  {item.title}
                </p>
                <p className="text-sm" style={{ color: `${accent}60`, lineHeight: 1.6 }}>
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
