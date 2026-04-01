"use client";

import { motion } from "framer-motion";
import { Phone, MapPin } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

export default function TemplateFooter({ config, accent }: Props) {
  const BG = "#2c1810";
  const year = config.weddingDate
    ? new Date(config.weddingDate).getFullYear()
    : new Date().getFullYear();

  const familyName = config.partner1Name && config.partner2Name
    ? `${config.partner1Name} & ${config.partner2Name}`
    : "The Family";

  return (
    <footer style={{ background: BG }}>
      {/* Main footer */}
      <div className="py-14 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="max-w-lg mx-auto flex flex-col items-center gap-5"
        >
          {/* Ornament */}
          <svg width="60" height="24" viewBox="0 0 60 24" fill="none" style={{ opacity: 0.5 }}>
            <path d="M30 12 C22 6, 8 9, 2 12 C8 15, 22 18, 30 12Z" fill={accent} />
            <path d="M30 12 C38 6, 52 9, 58 12 C52 15, 38 18, 30 12Z" fill={accent} />
            <circle cx="30" cy="12" r="2" fill={accent} />
          </svg>

          <p
            className="text-sm uppercase tracking-[0.2em]"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)" }}
          >
            With Best Compliments of
          </p>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
              color: "#ffffff",
              lineHeight: 1.2,
            }}
          >
            {familyName} Family
          </p>

          {/* Decorative separator */}
          <div className="flex items-center gap-3 w-48">
            <div className="h-px flex-1" style={{ background: `${accent}40` }} />
            <div className="w-1 h-1 rotate-45" style={{ background: `${accent}70` }} />
            <div className="h-px flex-1" style={{ background: `${accent}40` }} />
          </div>

          {/* Contact details */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)" }}>
            {config.venueName && (
              <div className="flex items-center gap-1.5">
                <MapPin size={11} style={{ color: accent }} />
                <span>{config.venueName}{config.venueCity ? `, ${config.venueCity}` : ""}</span>
              </div>
            )}
          </div>

          {/* Wedding date */}
          {config.weddingDate && (
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans)" }}
            >
              {new Date(config.weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}

          <p
            className="text-xs mt-2"
            style={{ color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-sans)" }}
          >
            Wedding Design by Selah Vie
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
