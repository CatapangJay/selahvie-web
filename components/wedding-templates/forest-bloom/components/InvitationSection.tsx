"use client";

import { motion, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalCorner from "./BotanicalCorner";
import GoldPillButton from "./GoldPillButton";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
  weddingDateFormatted: string;
  dateShort: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

export default function InvitationSection({ config, gold, accent, weddingDateFormatted, dateShort }: Props) {
  const BG = "#2a3830";

  // Parse date parts for large display
  let day = "", month = "", year = "";
  if (config.weddingDate) {
    const d = new Date(config.weddingDate);
    day   = String(d.getDate()).padStart(2, "0");
    month = String(d.getMonth() + 1).padStart(2, "0");
    year  = String(d.getFullYear());
  }

  const dayOfWeek = config.weddingDate
    ? new Date(config.weddingDate).toLocaleDateString("en-US", { weekday: "long" })
    : "";

  return (
    <section
      className="relative overflow-hidden py-20 px-6"
      style={{ background: BG, borderTop: `1px solid ${gold}18` }}
    >
      {/* Botanical top clusters (centered) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-0">
        <BotanicalCorner corner="top-center" scale={0.9} opacity={0.85} />
      </div>
      <div className="absolute bottom-0 left-0 z-0"><BotanicalCorner corner="bottom-left" scale={0.75} opacity={0.6} /></div>
      <div className="absolute bottom-0 right-0 z-0"><BotanicalCorner corner="bottom-right" scale={0.75} opacity={0.6} /></div>

      <motion.div
        variants={cont}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative max-w-xl mx-auto text-center"
        style={{ zIndex: 1 }}
      >
        <motion.p
          variants={rise}
          className="text-xs uppercase tracking-[0.3em] mb-2"
          style={{ color: `${accent}70`, fontFamily: "var(--font-sans)" }}
        >
          The Reception
        </motion.p>
        <motion.h2
          variants={rise}
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "2rem",
          }}
        >
          Wedding Day
        </motion.h2>

        {/* Date card */}
        <motion.div
          variants={rise}
          className="inline-block mx-auto px-10 py-8 rounded-3xl mb-6 w-full"
          style={{
            background: "rgba(20,30,22,0.55)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${gold}25`,
            boxShadow: `0 0 60px rgba(0,0,0,0.3)`,
          }}
        >
          {dayOfWeek && (
            <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>{dayOfWeek}</p>
          )}

          {day && month && year ? (
            <div className="flex items-baseline justify-center gap-3">
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(3.5rem, 10vw, 6rem)", lineHeight: 1, color: "#ffffff", fontWeight: 400 }}>{day}</span>
              <span style={{ color: gold, fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontFamily: "var(--font-serif)", lineHeight: 1 }}>/</span>
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(3.5rem, 10vw, 6rem)", lineHeight: 1, color: "#ffffff", fontWeight: 400 }}>{month}</span>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", color: "#fff" }}>Date TBA</p>
          )}

          {year && (
            <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(1.5rem, 4vw, 2.4rem)", color: "rgba(255,255,255,0.7)", marginTop: "0.2rem" }}>{year}</p>
          )}

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px flex-1" style={{ background: `${gold}55` }} />
            <div className="w-1 h-1 rounded-full" style={{ background: gold }} />
            <div className="h-px flex-1" style={{ background: `${gold}55` }} />
          </div>

          {/* Times */}
          <div className="flex justify-center gap-8 text-sm" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans)" }}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Ceremony</span>
              <span>07:00 – 08:00 AM</span>
            </div>
            <div className="w-px" style={{ background: `${gold}25` }} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Reception</span>
              <span>13:00 – 18:00 PM</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={rise} className="flex justify-center">
          <GoldPillButton gold={gold}>Save the Date</GoldPillButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
