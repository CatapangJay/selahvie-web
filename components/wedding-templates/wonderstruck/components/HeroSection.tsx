"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import Countdown from "./Countdown";
import Sparkles from "./Sparkles";

interface Props {
  config: WeddingConfig;
  accent: string;
  gold: string;
  weddingDateFormatted: string;
}

/* ── Animation variants ──────────────────────────────────────────────────── */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.5 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.9, ease: "easeOut" as const } },
};

const floatDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const, delay: 2 } },
};

export default function HeroSection({ config, accent, gold, weddingDateFormatted }: Props) {
  const hasImage = !!config.heroImageUrl;
  const hasDate  = !!config.weddingDate;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ background: "#0c0d1a" }}
    >
      {/* Background image */}
      {hasImage && (
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image src={config.heroImageUrl} alt="Hero" fill className="object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(12,13,26,0.72) 0%, rgba(12,13,26,0.55) 50%, rgba(12,13,26,0.85) 100%)" }}
          />
        </div>
      )}

      {/* Deep radial moonlight glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 40%, ${accent}12 0%, transparent 70%)`,
          zIndex: 1,
        }}
      />

      {/* Floating sparkle particles overlay */}
      <Sparkles />

      {/* Thin horizontal glimmer line */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent 0%, ${gold}60 30%, ${gold}90 50%, ${gold}60 70%, transparent 100%)`, zIndex: 2 }}
      />

      {/* Main content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative flex flex-col items-center gap-6 px-6 py-20"
        style={{ zIndex: 3 }}
      >
        {/* Four-pointed star ornament */}
        <motion.div variants={fadeIn}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path
              d="M14 0 L16 11 L28 14 L16 17 L14 28 L12 17 L0 14 L12 11 Z"
              fill={gold}
              style={{ filter: `drop-shadow(0 0 8px ${gold})` }}
            />
          </svg>
        </motion.div>

        {/* Overture label */}
        <motion.p
          variants={rise}
          className="uppercase tracking-[0.3em] text-xs"
          style={{ color: `${accent}80`, fontFamily: "var(--font-sans)" }}
        >
          You Are Cordially Invited
        </motion.p>

        {/* Couple names */}
        <motion.h1
          variants={rise}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.6rem, 9vw, 7rem)",
            lineHeight: 1.1,
            color: "#f0ecf8",
            textShadow: `0 0 60px ${accent}30`,
            letterSpacing: "-0.01em",
          }}
        >
          {config.partner1Name || "Alyssa"}
          <span style={{ color: gold, margin: "0 0.25em", fontSize: "0.7em" }}>&</span>
          {config.partner2Name || "James"}
        </motion.h1>

        {/* Decorative accent line */}
        <motion.div variants={fadeIn} className="flex items-center gap-3">
          <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${gold}80)` }} />
          <div className="h-1 w-1 rounded-full" style={{ background: gold }} />
          <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${gold}80)` }} />
        </motion.div>

        {/* Date */}
        {weddingDateFormatted && (
          <motion.p
            variants={rise}
            className="text-sm sm:text-base tracking-widest uppercase"
            style={{ color: `${accent}90`, fontFamily: "var(--font-sans)", letterSpacing: "0.18em" }}
          >
            {weddingDateFormatted}
          </motion.p>
        )}

        {/* Venue */}
        {config.venueName && (
          <motion.div variants={rise} className="flex items-center gap-2">
            <MapPin size={13} style={{ color: gold }} />
            <span className="text-sm" style={{ color: `${accent}70`, letterSpacing: "0.1em" }}>
              {config.venueName}
              {config.venueCity && `, ${config.venueCity}`}
            </span>
          </motion.div>
        )}

        {/* Enchanted quote */}
        <motion.p
          variants={fadeIn}
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: `${accent}60`,
            fontSize: "0.95rem",
            letterSpacing: "0.04em",
            maxWidth: "28rem",
          }}
        >
          "This night is sparkling, don't you let it go"
        </motion.p>

        {/* Countdown */}
        {hasDate && (
          <motion.div
            variants={rise}
            className="mt-4 px-8 py-5 rounded-2xl"
            style={{
              background: "rgba(12,13,26,0.6)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${accent}20`,
              boxShadow: `0 0 40px ${accent}08`,
            }}
          >
            <Countdown targetDate={config.weddingDate} accent={accent} gold={gold} />
          </motion.div>
        )}
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        variants={floatDown}
        initial="hidden"
        animate="show"
        className="absolute bottom-8 flex flex-col items-center gap-1"
        style={{ zIndex: 3 }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: `${accent}40`, letterSpacing: "0.2em" }}>Scroll</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} style={{ color: `${accent}50` }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
