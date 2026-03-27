"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { MapPin } from "lucide-react";
import Countdown from "./Countdown";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  weddingDateFormatted: string;
}

/* ── Starfield background (pure CSS via random box-shadows) ─────────────── */
const STAR_COUNT = 80;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  top:  `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() < 0.2 ? 2 : 1,
  delay: Math.random() * 4,
  dur:   2.5 + Math.random() * 3,
}));

/* ── Animation variants ──────────────────────────────────────────────────── */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } },
};

const line: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export default function HeroSection({ config, primary, accent, weddingDateFormatted }: Props) {
  const hasImage = !!config.heroImageUrl;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ background: "#0a0908" }}
    >
      {/* ── Background hero image ── */}
      {hasImage && (
        <div className="absolute inset-0">
          <Image
            src={config.heroImageUrl}
            alt="Wedding hero"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            style={{ opacity: 0.28 }}
          />
          {/* Deep vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(10,9,8,0.2) 0%, rgba(10,9,8,0.85) 70%, rgba(10,9,8,1) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Starfield ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {stars.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              background: "#fff",
              opacity: 0,
              animation: `starTwinkle ${s.dur}s ${s.delay}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* ── Gold glow orb background ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "60vw",
          height: "60vw",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${accent}08 0%, transparent 65%)`,
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      {/* ── Animated content ── */}
      <motion.div
        className="relative z-10 px-6 py-28 max-w-3xl w-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          className="label-luxury mb-10 tracking-[0.3em]"
          style={{ color: "rgba(201,168,76,0.7)" }}
        >
          Together with their families
        </motion.p>

        {/* Partner 1 */}
        <motion.h1
          variants={line}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3.5rem, 9vw, 7rem)",
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: "#f5f0e8",
          }}
        >
          {config.partner1Name || "Partner One"}
        </motion.h1>

        {/* Gold & ornament divider */}
        <motion.div
          variants={fadeUp}
          className="my-5 flex items-center justify-center gap-3"
        >
          <div
            className="h-px flex-1 max-w-[5rem]"
            style={{ background: `linear-gradient(to right, transparent, ${accent}80)` }}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill={accent} style={{ opacity: 0.9 }}>
            <polygon points="10,0 20,10 10,20 0,10" />
          </svg>
          <div
            className="h-px flex-1 max-w-[5rem]"
            style={{ background: `linear-gradient(to left, transparent, ${accent}80)` }}
          />
        </motion.div>

        {/* Partner 2 */}
        <motion.h1
          variants={line}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3.5rem, 9vw, 7rem)",
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: "#f5f0e8",
          }}
        >
          {config.partner2Name || "Partner Two"}
        </motion.h1>

        {/* Date */}
        {weddingDateFormatted && (
          <motion.p
            variants={fadeUp}
            className="mt-9 text-base font-light tracking-widest"
            style={{ color: "rgba(245,240,232,0.55)", letterSpacing: "0.14em" }}
          >
            {weddingDateFormatted}
          </motion.p>
        )}

        {/* Venue */}
        {(config.venueName || config.venueCity) && (
          <motion.p
            variants={fadeUp}
            className="mt-2 flex items-center justify-center gap-1.5 text-sm"
            style={{ color: "rgba(201,168,76,0.55)" }}
          >
            <MapPin size={12} />
            {[config.venueName, config.venueCity].filter(Boolean).join(" · ")}
          </motion.p>
        )}

        {/* Thin gold rule */}
        <motion.div
          variants={fadeUp}
          className="mx-auto my-10 h-px w-24"
          style={{ background: `linear-gradient(to right, transparent, ${accent}70, transparent)` }}
        />

        {/* Countdown */}
        {config.weddingDate && (
          <motion.div variants={fadeUp}>
            <p
              className="label-luxury mb-6"
              style={{ color: "rgba(201,168,76,0.45)", letterSpacing: "0.2em" }}
            >
              Counting Down
            </p>
            <Countdown targetDate={config.weddingDate} />
          </motion.div>
        )}

        {/* RSVP CTA */}
        <motion.div variants={fadeUp} className="mt-14">
          <a
            href="#rsvp"
            className="inline-flex items-center gap-3 rounded-none px-8 py-3 text-sm font-light tracking-widest transition-all hover:opacity-80"
            style={{
              color: accent,
              border: `1px solid ${accent}50`,
              letterSpacing: "0.2em",
              background: "rgba(201,168,76,0.05)",
              backdropFilter: "blur(8px)",
            }}
          >
            RSVP NOW
          </a>
        </motion.div>
      </motion.div>

      {/* ── Scroll hint ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-8 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${accent}60)` }} />
        <svg width="8" height="8" viewBox="0 0 10 10" fill={accent} style={{ opacity: 0.5 }}>
          <polygon points="5,0 10,10 0,10" />
        </svg>
      </motion.div>

      {/* ── Keyframe for stars (injected globally once) ── */}
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0; }
          50%       { opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
