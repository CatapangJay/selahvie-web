"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { MapPin } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalCorner from "./BotanicalCorner";

interface Props {
  config: WeddingConfig;
  gold: string;
  sage: string;
  weddingDateFormatted: string;
  dateShort: string; /* DD / MM / YYYY */
}

const rise: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16,1,0.3,1] as [number,number,number,number] } },
};
const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export default function HeroSection({ config, gold, sage, weddingDateFormatted, dateShort }: Props) {
  const hasImage = !!config.heroImageUrl;
  const BG = "#2a3830";

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-16 text-center"
      style={{ background: BG }}
    >
      {/* ── Botanical corner overlays ── */}
      <div className="absolute top-0 left-0 z-10">
        <BotanicalCorner corner="top-left" scale={1.1} />
      </div>
      <div className="absolute top-0 right-0 z-10">
        <BotanicalCorner corner="top-right" scale={1.1} />
      </div>
      <div className="absolute bottom-0 left-0 z-10">
        <BotanicalCorner corner="bottom-left" scale={1.1} />
      </div>
      <div className="absolute bottom-0 right-0 z-10">
        <BotanicalCorner corner="bottom-right" scale={1.1} />
      </div>

      {/* ── Gold border frame ── */}
      <div
        className="absolute inset-6 rounded-3xl pointer-events-none"
        style={{ border: `1px solid ${gold}40`, zIndex: 5 }}
      />

      {/* ── Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative flex flex-col items-center gap-5 w-full max-w-md mx-auto"
        style={{ zIndex: 6 }}
      >
        {/* Small label */}
        <motion.p
          variants={fadeIn}
          className="uppercase tracking-[0.25em] text-xs"
          style={{ color: `rgba(255,255,255,0.55)`, fontFamily: "var(--font-sans)" }}
        >
          The Wedding of
        </motion.p>

        {/* Couple photo — large rounded card,  wider on desktop */}
        {hasImage ? (
          <motion.div
            variants={rise}
            className="relative w-full rounded-3xl overflow-hidden"
            style={{
              aspectRatio: "3/4",
              maxHeight: "60vh",
              border: `1px solid ${gold}40`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            <Image src={config.heroImageUrl} alt="Couple" fill className="object-cover" priority />
            {/* Bottom gradient for text overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 45%, rgba(26,38,30,0.88) 100%)" }}
            />
            {/* Over-image names */}
            <div className="absolute bottom-6 inset-x-4 text-center">
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                  lineHeight: 1.1,
                  color: "#ffffff",
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                }}
              >
                {config.partner1Name || "Bride"} &amp; {config.partner2Name || "Groom"}
              </p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="h-px flex-1" style={{ background: gold, maxWidth: "4rem" }} />
                <p className="text-sm tracking-widest" style={{ color: gold, fontFamily: "var(--font-sans)" }}>
                  {dateShort}
                </p>
                <div className="h-px flex-1" style={{ background: gold, maxWidth: "4rem" }} />
              </div>
            </div>
          </motion.div>
        ) : (
          /* No-image fallback */
          <motion.div variants={rise} className="text-center">
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(2.4rem, 9vw, 5rem)",
                color: "#ffffff",
                lineHeight: 1.1,
                textShadow: `0 0 40px ${gold}40`,
              }}
            >
              {config.partner1Name || "Bride"} &amp; {config.partner2Name || "Groom"}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12" style={{ background: gold }} />
              <p className="text-sm tracking-widest" style={{ color: gold }}>{dateShort}</p>
              <div className="h-px w-12" style={{ background: gold }} />
            </div>
          </motion.div>
        )}

        {/* Venue pin */}
        {config.venueName && (
          <motion.div variants={fadeIn} className="flex items-center gap-1.5">
            <MapPin size={12} style={{ color: gold }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em" }}>
              {config.venueName}{config.venueCity ? `, ${config.venueCity}` : ""}
            </span>
          </motion.div>
        )}

        {/* Decorative dots */}
        <motion.div variants={fadeIn} className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.35)", transform: `scale(${0.7 + i * 0.15})` }}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
