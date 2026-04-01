"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import Countdown from "./Countdown";
import FloatingParticles from "./FloatingParticles";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
  weddingDateFormatted: string;
}

const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.4 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1.0, ease: "easeOut" as const } },
};

export default function HeroSection({ config, gold, accent, weddingDateFormatted }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  /* Parallax layers — each moves at a different scroll speed */
  const bgY          = useTransform(scrollYProgress, [0, 1], ["0%",   "35%"]); // bg image: slowest
  const orbY1        = useTransform(scrollYProgress, [0, 1], ["0px",  "-80px"]);
  const orbY2        = useTransform(scrollYProgress, [0, 1], ["0px",  "-130px"]);
  const particlesY   = useTransform(scrollYProgress, [0, 1], ["0px",  "-50px"]);
  const textY        = useTransform(scrollYProgress, [0, 1], ["0px",  "60px"]); // text: slightly slower than viewport
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const hasImage = !!config.heroImageUrl;
  const hasDate  = !!config.weddingDate;

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ background: "#060e12" }}
    >
      {/* ── Layer 1: Background image (slowest parallax) ── */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: bgY, scale: 1.15, zIndex: 0 }}
      >
        {hasImage ? (
          <Image
            src={config.heroImageUrl}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse 100% 80% at 50% 40%, ${accent}18 0%, #060e12 70%)`,
            }}
          />
        )}
        {/* Dark enchanted overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: hasImage
              ? "linear-gradient(to bottom, rgba(6,14,18,0.65) 0%, rgba(6,14,18,0.45) 45%, rgba(6,14,18,0.85) 100%)"
              : undefined,
          }}
        />
      </motion.div>

      {/* ── Layer 2: Large ambient glow orbs (medium parallax) ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{ y: orbY1, zIndex: 1 }}
      >
        {/* Top-left glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 rounded-full"
          style={{
            width: "40vw",
            height: "40vw",
            background: `radial-gradient(circle, ${accent}14 0%, transparent 65%)`,
          }}
        />
        {/* Bottom-right glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-10 -right-10 rounded-full"
          style={{
            width: "35vw",
            height: "35vw",
            background: `radial-gradient(circle, ${gold}10 0%, transparent 65%)`,
          }}
        />
      </motion.div>

      {/* ── Layer 3: Faster small orb (for depth) ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{ y: orbY2, zIndex: 2 }}
      >
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 rounded-full"
          style={{
            width: "12vw",
            height: "12vw",
            background: `radial-gradient(circle, ${gold}18 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
      </motion.div>

      {/* ── Layer 4: Floating particles (slow drift up) ── */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: particlesY, zIndex: 3 }}
      >
        <FloatingParticles />
      </motion.div>

      {/* ── Layer 5: Foreground thin glimmer line at top ── */}
      <motion.div
        style={{ opacity: overlayOpacity, zIndex: 4 }}
        className="pointer-events-none absolute top-0 inset-x-0 h-px"
      >
        <div
          className="h-full"
          style={{ background: `linear-gradient(to right, transparent, ${gold}80 30%, ${gold}95 50%, ${gold}80 70%, transparent)` }}
        />
      </motion.div>

      {/* ── Layer 6: Main text content (slight upward drift on scroll) ── */}
      <motion.div
        className="relative flex flex-col items-center gap-5 px-6 py-24 will-change-transform"
        style={{ y: textY, zIndex: 5 }}
      >
        <motion.div
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-5"
        >
          {/* Leaf ornament */}
          <motion.div variants={fadeIn}>
            <svg width="30" height="20" viewBox="0 0 30 20" fill="none" aria-hidden>
              <path
                d="M15 1 C7 1, 1 6, 1 10 C1 14, 7 19, 15 19 C23 19, 29 14, 29 10 C29 6, 23 1, 15 1Z"
                fill={`${gold}20`} stroke={gold} strokeWidth="0.8"
              />
              <line x1="15" y1="1" x2="15" y2="19" stroke={gold} strokeWidth="0.7" opacity="0.6" />
              <line x1="9"  y1="5"  x2="15" y2="10" stroke={gold} strokeWidth="0.5" opacity="0.4" />
              <line x1="21" y1="5"  x2="15" y2="10" stroke={gold} strokeWidth="0.5" opacity="0.4" />
            </svg>
          </motion.div>

          {/* Invitation label */}
          <motion.p
            variants={rise}
            className="uppercase tracking-[0.32em] text-xs"
            style={{ color: `${accent}70`, fontFamily: "var(--font-sans)" }}
          >
            Together With Their Families
          </motion.p>

          {/* Names */}
          <motion.h1
            variants={rise}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3rem, 10vw, 7.5rem)",
              lineHeight: 1.0,
              color: "#eef5ee",
              textShadow: `0 0 80px ${accent}30, 0 2px 40px rgba(0,0,0,0.5)`,
              letterSpacing: "-0.02em",
            }}
          >
            {config.partner1Name || "Amara"}
          </motion.h1>

          {/* Decorative ampersand with vine */}
          <motion.div variants={fadeIn} className="flex items-center gap-4">
            <div className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${gold}70)` }} />
            <span style={{ color: gold, fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem, 4vw, 2.5rem)", textShadow: `0 0 30px ${gold}80` }}>
              &amp;
            </span>
            <div className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${gold}70)` }} />
          </motion.div>

          <motion.h1
            variants={rise}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3rem, 10vw, 7.5rem)",
              lineHeight: 1.0,
              color: "#eef5ee",
              textShadow: `0 0 80px ${accent}30, 0 2px 40px rgba(0,0,0,0.5)`,
              letterSpacing: "-0.02em",
            }}
          >
            {config.partner2Name || "Rowan"}
          </motion.h1>

          {/* Date */}
          {weddingDateFormatted && (
            <motion.p
              variants={rise}
              className="tracking-[0.2em] uppercase text-sm mt-2"
              style={{ color: `${accent}80`, letterSpacing: "0.18em", fontFamily: "var(--font-sans)" }}
            >
              {weddingDateFormatted}
            </motion.p>
          )}

          {/* Venue */}
          {config.venueName && (
            <motion.div variants={rise} className="flex items-center gap-2">
              <MapPin size={13} style={{ color: gold }} />
              <span className="text-sm" style={{ color: `${accent}65`, letterSpacing: "0.08em" }}>
                {config.venueName}{config.venueCity ? `, ${config.venueCity}` : ""}
              </span>
            </motion.div>
          )}

          {/* Countdown */}
          {hasDate && (
            <motion.div
              variants={rise}
              className="mt-4 px-6 py-5 rounded-2xl"
              style={{
                background: "rgba(6,14,18,0.65)",
                backdropFilter: "blur(16px)",
                border: `1px solid ${gold}20`,
                boxShadow: `0 0 40px ${accent}08, 0 8px 32px rgba(0,0,0,0.4)`,
              }}
            >
              <Countdown targetDate={config.weddingDate} gold={gold} accent={accent} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-8 flex flex-col items-center gap-1"
        style={{ zIndex: 6 }}
      >
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: `${accent}35` }}>Scroll</p>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={15} style={{ color: `${accent}45` }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
