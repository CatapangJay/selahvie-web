"use client";

import { motion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
  weddingDateFormatted: string;
  show: boolean;
}

export default function TemplateFooter({ config, gold, accent, weddingDateFormatted, show }: Props) {
  const hasNames = config.partner1Name && config.partner2Name;

  return (
    <footer
      className="relative py-20 px-6 text-center overflow-hidden"
      style={{ background: "#040a08", borderTop: `1px solid ${gold}12` }}
    >
      {/* Aurora top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 inset-x-0 h-40"
        style={{ background: `linear-gradient(to bottom, ${accent}10, transparent)` }}
      />

      {/* Moving ambient orb */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: "60vw",
          height: "20vw",
          background: `radial-gradient(ellipse, ${accent}12 0%, transparent 65%)`,
          filter: "blur(24px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" as const }}
        className="relative"
      >
        {/* Rotating leaf ornament */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-6"
        >
          <svg width="34" height="22" viewBox="0 0 30 20" fill="none" aria-hidden>
            <path
              d="M15 1 C7 1, 1 6, 1 10 C1 14, 7 19, 15 19 C23 19, 29 14, 29 10 C29 6, 23 1, 15 1Z"
              fill={`${gold}22`} stroke={gold} strokeWidth="0.8"
              style={{ filter: `drop-shadow(0 0 6px ${gold}60)` }}
            />
            <line x1="15" y1="1" x2="15" y2="19" stroke={gold} strokeWidth="0.7" opacity="0.6"/>
          </svg>
        </motion.div>

        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
            color: "#eef5ee",
            letterSpacing: "-0.01em",
          }}
        >
          {hasNames ? `${config.partner1Name} & ${config.partner2Name}` : "Forever in the Grove"}
        </h2>

        {weddingDateFormatted && (
          <p
            className="mt-2 text-sm uppercase tracking-widest"
            style={{ color: `${accent}45`, letterSpacing: "0.18em", fontFamily: "var(--font-sans)" }}
          >
            {weddingDateFormatted}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mt-6 mb-4">
          <div className="h-px w-14" style={{ background: `linear-gradient(to right, transparent, ${accent}40)` }} />
          <div className="w-1 h-1 rounded-full" style={{ background: `${accent}60` }} />
          <div className="h-px w-14" style={{ background: `linear-gradient(to left, transparent, ${accent}40)` }} />
        </div>

        {show && (
          <p className="text-xs" style={{ color: `${accent}28`, letterSpacing: "0.12em" }}>
            Created with <span style={{ color: gold }}>Selah Vie</span>
          </p>
        )}
      </motion.div>
    </footer>
  );
}
