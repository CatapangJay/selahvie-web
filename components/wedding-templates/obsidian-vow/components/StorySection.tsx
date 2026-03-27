"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

export default function StorySection({ config, accent }: Props) {
  if (!config.coupleStory) return null;

  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{ background: "#0d0b09" }}
    >
      {/* Ambient side glow */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "30vw",
          height: "60vh",
          background: `radial-gradient(ellipse at left, ${accent}06, transparent 70%)`,
          filter: "blur(30px)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-5xl px-6">
        <SectionLabel
          eyebrow="Our Story"
          title={`${config.partner1Name} & ${config.partner2Name}`}
        />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Decorative opening quote */}
            <p
              className="mb-4 text-6xl font-serif leading-none"
              style={{ color: `${accent}30`, fontFamily: "var(--font-serif)" }}
              aria-hidden
            >
              &ldquo;
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: "rgba(245,240,232,0.65)", lineHeight: 1.9 }}
            >
              {config.coupleStory}
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          >
            {config.galleryImageUrls?.[0] ? (
              <div
                className="relative overflow-hidden shadow-ambient"
                style={{
                  borderRadius: 0,
                  aspectRatio: "3/4",
                  border: `1px solid ${accent}20`,
                }}
              >
                <Image
                  src={config.galleryImageUrls[0]}
                  alt="The couple"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Gold corner accents */}
                {[
                  "top-0 left-0 border-t border-l",
                  "top-0 right-0 border-t border-r",
                  "bottom-0 left-0 border-b border-l",
                  "bottom-0 right-0 border-b border-r",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-6 h-6 ${cls}`}
                    style={{ borderColor: `${accent}70` }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="flex items-center justify-center"
                style={{
                  aspectRatio: "3/4",
                  background: `${accent}08`,
                  border: `1px solid ${accent}20`,
                }}
              >
                <svg width="48" height="48" viewBox="0 0 20 20" fill={accent} style={{ opacity: 0.2 }}>
                  <polygon points="10,0 20,10 10,20 0,10" />
                </svg>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
