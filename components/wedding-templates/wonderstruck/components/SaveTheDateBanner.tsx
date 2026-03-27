"use client";

import { motion, type Variants } from "framer-motion";

interface Props {
  accent: string;
  gold: string;
  weddingDateFormatted: string;
}

const shimmer: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  show:   { x: "100%",  opacity: [0, 0.8, 0], transition: { duration: 1.6, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 3.5 } },
};

const slide: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export default function SaveTheDateBanner({ accent, gold, weddingDateFormatted }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      className="relative overflow-hidden py-5 px-6 text-center"
      style={{
        background: `linear-gradient(135deg, ${accent}18 0%, ${accent}28 50%, ${accent}18 100%)`,
        borderTop:    `1px solid ${accent}25`,
        borderBottom: `1px solid ${accent}25`,
      }}
    >
      {/* Shimmer sweep */}
      <motion.div
        variants={shimmer}
        initial="hidden"
        animate="show"
        className="absolute inset-y-0 w-40 pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, ${gold}25, transparent)`, zIndex: 0 }}
      />

      <motion.p
        variants={slide}
        className="relative tracking-[0.28em] uppercase text-sm"
        style={{ color: gold, fontFamily: "var(--font-sans)", zIndex: 1 }}
      >
        {weddingDateFormatted
          ? `Save The Date  ·  ${weddingDateFormatted}`
          : "Save The Date"}
      </motion.p>
    </motion.div>
  );
}
