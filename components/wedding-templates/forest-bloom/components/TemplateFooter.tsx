"use client";

import { motion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalCorner from "./BotanicalCorner";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
  weddingDateFormatted: string;
}

export default function TemplateFooter({ config, gold, accent, weddingDateFormatted }: Props) {
  const BG = "#1d2820";

  return (
    <footer
      className="relative overflow-hidden py-14 px-6 text-center"
      style={{ background: BG, borderTop: `1px solid ${gold}15` }}
    >
      {/* Corner botanicals */}
      <div className="absolute bottom-0 left-0 z-0"><BotanicalCorner corner="bottom-left" scale={0.7} opacity={0.5} /></div>
      <div className="absolute bottom-0 right-0 z-0"><BotanicalCorner corner="bottom-right" scale={0.7} opacity={0.5} /></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: "easeOut" as const }}
        className="relative flex flex-col items-center gap-4"
        style={{ zIndex: 1 }}
      >
        {/* Botanical leaf ornament (inline SVG) */}
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" style={{ opacity: 0.6 }}>
          <path d="M40 20 C30 10, 10 14, 4 20 C10 26, 30 30, 40 20Z" fill={accent} />
          <path d="M40 20 C50 10, 70 14, 76 20 C70 26, 50 30, 40 20Z" fill={accent} />
          <line x1="4" y1="20" x2="76" y2="20" stroke={gold} strokeWidth="0.7" opacity="0.6" />
        </svg>

        {/* Names */}
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            color: "#ffffff",
            lineHeight: 1.15,
          }}
        >
          {config.partner1Name || "Partner 1"} &amp; {config.partner2Name || "Partner 2"}
        </p>

        {/* Gold separator */}
        <div className="flex items-center gap-3" style={{ width: "200px" }}>
          <div className="h-px flex-1" style={{ background: `${gold}45` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: gold }} />
          <div className="h-px flex-1" style={{ background: `${gold}45` }} />
        </div>

        {/* Date */}
        {weddingDateFormatted && (
          <p className="text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)" }}>
            {weddingDateFormatted}
          </p>
        )}

        {/* Built-with tagline */}
        <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans)" }}>
          Created with Selah Vie
        </p>
      </motion.div>
    </footer>
  );
}
