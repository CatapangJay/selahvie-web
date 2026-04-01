"use client";

import { motion, type Variants } from "framer-motion";
import { MapPin } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalCorner from "./BotanicalCorner";
import GoldPillButton from "./GoldPillButton";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

export default function LocationSection({ config, gold, accent }: Props) {
  const BG = "#243028";
  const hasVenue = !!(config.venueName || config.venueAddress || config.venueCity);

  return (
    <section
      className="relative overflow-hidden py-20 px-6 text-center"
      style={{ background: BG, borderTop: `1px solid ${gold}15` }}
    >
      {/* Corner botanicals */}
      <div className="absolute top-0 right-0 z-0"><BotanicalCorner corner="top-right" scale={0.85} opacity={0.7} /></div>
      <div className="absolute bottom-0 left-0  z-0"><BotanicalCorner corner="bottom-left" scale={0.8} opacity={0.7} /></div>

      <motion.div
        variants={cont}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="relative max-w-md mx-auto text-center"
        style={{ zIndex: 1 }}
      >
        {/* Floating pin icon */}
        <motion.div
          variants={rise}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ background: `${gold}18`, border: `1px solid ${gold}35` }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <MapPin size={20} style={{ color: gold }} />
        </motion.div>

        <motion.h2
          variants={rise}
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "1.5rem",
          }}
        >
          The Location
        </motion.h2>

        {/* Address card */}
        <motion.div
          variants={rise}
          className="rounded-2xl px-8 py-7 mb-6"
          style={{
            background: "rgba(20,30,22,0.55)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${gold}20`,
          }}
        >
          {hasVenue ? (
            <>
              {config.venueName && (
                <p className="mb-2" style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", color: "#ffffff" }}>
                  {config.venueName}
                </p>
              )}
              {config.venueAddress && (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{config.venueAddress}</p>
              )}
              {config.venueCity && (
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{config.venueCity}</p>
              )}
            </>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Venue to be announced</p>
          )}
        </motion.div>

        <motion.div variants={rise} className="flex justify-center">
          <GoldPillButton gold={gold}>
            <MapPin size={13} />
            View Location
          </GoldPillButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
