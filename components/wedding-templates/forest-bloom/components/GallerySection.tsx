"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalCorner from "./BotanicalCorner";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.85, ease: "easeOut" as const } },
};

const PLACEHOLDER_HEIGHTS = [280, 320, 280, 300, 320, 280];

export default function GallerySection({ config, gold, accent }: Props) {
  const BG = "#243028";
  const images = config.galleryImageUrls ?? [];
  const displayCount = Math.min(images.length || 6, 6);
  const cards = Array.from({ length: displayCount }, (_, i) => images[i] ?? null);

  return (
    <section
      className="relative overflow-hidden py-20 px-6"
      style={{ background: BG, borderTop: `1px solid ${gold}15` }}
    >
      {/* Botanical top-center decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-0">
        <BotanicalCorner corner="top-center" scale={0.85} opacity={0.7} />
      </div>

      <motion.div
        variants={cont}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="relative max-w-6xl mx-auto"
        style={{ zIndex: 1 }}
      >
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.p
            variants={rise}
            className="text-xs uppercase tracking-[0.3em] mb-1"
            style={{ color: `${accent}70`, fontFamily: "var(--font-sans)" }}
          >
            Memories
          </motion.p>
          <motion.h2
            variants={rise}
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(2.2rem, 7vw, 3.8rem)",
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}
          >
            Love Story
          </motion.h2>
          <motion.p
            variants={rise}
            className="text-sm tracking-wider uppercase"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)" }}
          >
            Captured in Pictures
          </motion.p>
          <motion.div variants={rise} className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16" style={{ background: `${gold}50` }} />
            <div className="w-1 h-1 rounded-full" style={{ background: gold }} />
            <div className="h-px w-16" style={{ background: `${gold}50` }} />
          </motion.div>
        </div>

        {/* Gallery grid */}
        {cards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 gap-4">
            {cards.map((src, i) => (
              <motion.div
                key={i}
                variants={rise}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  height: PLACEHOLDER_HEIGHTS[i % PLACEHOLDER_HEIGHTS.length],
                  border: `1px solid ${gold}18`,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.35)`,
                }}
              >
                {src ? (
                  <Image src={src} alt={`Gallery ${i + 1}`} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: "rgba(58,92,67,0.35)" }}
                  >
                    <span
                      style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "rgba(255,255,255,0.25)", fontSize: "1.5rem" }}
                    >
                      Photo {i + 1}
                    </span>
                  </div>
                )}
                {/* Subtle overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(42,56,48,0.6) 0%, transparent 55%)" }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {cards.length === 0 && (
          <motion.p
            variants={rise}
            className="text-center"
            style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic", fontFamily: "var(--font-serif)" }}
          >
            Gallery photos will appear here.
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
