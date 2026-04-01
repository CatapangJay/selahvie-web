"use client";

import { motion, type Variants } from "framer-motion";

interface Props {
  gold: string;
  accent: string;
  weddingDateFormatted: string;
}

const shimmer: Variants = {
  loop: {
    x: ["−100%", "200%"],
    transition: { duration: 2.2, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 4 },
  },
};

export default function SaveTheDateBanner({ gold, accent, weddingDateFormatted }: Props) {
  return (
    <div
      className="relative overflow-hidden py-5 px-6 text-center"
      style={{
        background: `linear-gradient(135deg, ${accent}12, ${gold}08, ${accent}12)`,
        borderTop:    `1px solid ${gold}20`,
        borderBottom: `1px solid ${gold}20`,
      }}
    >
      {/* Left vine ornament */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" aria-hidden>
        <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
          <path d="M2 12 Q10 4, 20 8 Q30 12, 38 4" stroke={gold} strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <circle cx="8" cy="7" r="2" fill={gold} opacity="0.5"/>
          <circle cx="22" cy="9" r="1.5" fill={gold} opacity="0.5"/>
        </svg>
      </div>
      {/* Right vine ornament (mirrored) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 scale-x-[-1]" aria-hidden>
        <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
          <path d="M2 12 Q10 4, 20 8 Q30 12, 38 4" stroke={gold} strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <circle cx="8" cy="7" r="2" fill={gold} opacity="0.5"/>
          <circle cx="22" cy="9" r="1.5" fill={gold} opacity="0.5"/>
        </svg>
      </div>

      {/* Shimmer sweep */}
      <motion.div
        variants={shimmer}
        animate="loop"
        className="pointer-events-none absolute inset-y-0 w-32"
        style={{ background: `linear-gradient(to right, transparent, ${gold}30, transparent)`, zIndex: 0 }}
      />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: "easeOut" as const }}
        className="relative tracking-[0.28em] uppercase text-sm"
        style={{ color: gold, fontFamily: "var(--font-sans)", zIndex: 1 }}
      >
        {weddingDateFormatted ? `Save The Date  ·  ${weddingDateFormatted}` : "Save The Date"}
      </motion.p>
    </div>
  );
}
