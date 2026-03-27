"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import Divider from "./Divider";

interface Props {
  config: WeddingConfig;
  accent: string;
  gold: string;
}

const fromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const fromRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function StorySection({ config, accent, gold }: Props) {
  const has1 = !!config.partner1Name;
  const has2 = !!config.partner2Name;

  return (
    <section
      className="relative overflow-hidden py-24 px-6"
      style={{
        background: "#0c0d1a",
        borderTop: `1px solid ${accent}10`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${accent}08, transparent 70%)` }}
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Our Story
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              color: "#f0ecf8",
              textShadow: `0 0 40px ${accent}20`,
            }}
          >
            {has1 && has2 ? `${config.partner1Name} & ${config.partner2Name}` : "Two Hearts, One Story"}
          </h2>
          <Divider accent={accent} gold={gold} />
        </motion.div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Text side */}
          <motion.div
            variants={fromLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Giant decorative quote mark */}
            <p
              aria-hidden
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "8rem",
                lineHeight: 0.8,
                color: `${gold}15`,
                marginBottom: "-2rem",
                userSelect: "none",
              }}
            >
              "
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
                lineHeight: 1.85,
                color: `${accent}90`,
              }}
            >
              {config.coupleStory ||
                "From the first hello to forever, every chapter of our love story has felt like a fairytale. Two souls finding each other in the most wonderstruck of ways — and choosing each other, again and again."}
            </p>

            {/* Small gold ornament */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-8" style={{ background: `${gold}60` }} />
              <svg width="12" height="12" viewBox="0 0 12 12" fill={gold} aria-hidden>
                <path d="M6 0 L7 4.5 L12 6 L7 7.5 L6 12 L5 7.5 L0 6 L5 4.5 Z" />
              </svg>
              <div className="h-px w-8" style={{ background: `${gold}60` }} />
            </div>
          </motion.div>

          {/* Photo side */}
          <motion.div
            variants={fromRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            {config.heroImageUrl ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <Image src={config.heroImageUrl} alt="Couple" fill className="object-cover" />
                {/* Overlay sheen */}
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to bottom, transparent 60%, ${accent}20 100%)` }}
                />
                {/* Corner accents */}
                {[
                  "top-3 left-3 border-t border-l",
                  "top-3 right-3 border-t border-r",
                  "bottom-3 left-3 border-b border-l",
                  "bottom-3 right-3 border-b border-r",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-6 h-6 ${cls}`}
                    style={{ borderColor: `${gold}70` }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="w-full rounded-2xl flex items-center justify-center"
                style={{
                  aspectRatio: "4/5",
                  background: `${accent}08`,
                  border: `1px solid ${accent}20`,
                }}
              >
                <p style={{ color: `${accent}40`, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                  Photo coming soon
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
