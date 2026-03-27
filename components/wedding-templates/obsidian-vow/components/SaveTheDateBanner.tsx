"use client";

import { motion } from "framer-motion";

interface Props {
  accent: string;
  weddingDateFormatted: string;
}

export default function SaveTheDateBanner({ accent, weddingDateFormatted }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative text-center overflow-hidden py-4 px-6"
      style={{ background: "rgba(201,168,76,0.08)", borderTop: "1px solid rgba(201,168,76,0.15)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}
    >
      {/* Subtle shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accent}10 50%, transparent 100%)` }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
      />
      <p
        className="label-luxury relative z-10"
        style={{ color: accent, letterSpacing: "0.22em" }}
      >
        {weddingDateFormatted
          ? `Save The Date  ·  ${weddingDateFormatted}`
          : "Save The Date"}
      </p>
    </motion.div>
  );
}
