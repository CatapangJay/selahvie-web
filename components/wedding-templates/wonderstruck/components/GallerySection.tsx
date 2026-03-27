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

const imgVar: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const ASPECT_CLASSES = [
  "aspect-[3/4]", "aspect-square", "aspect-[4/3]",
  "aspect-[3/4]", "aspect-[4/3]", "aspect-square",
];

const COL_SPANS = [
  "col-span-1", "col-span-2", "col-span-1",
  "col-span-2", "col-span-1", "col-span-1",
];

export default function GallerySection({ config, accent, gold }: Props) {
  const images = (config.galleryImageUrls ?? []).filter(Boolean).slice(0, 6);

  if (!images.length) return null;

  return (
    <section
      className="py-24 px-6"
      style={{ background: "#0e0f1e", borderTop: `1px solid ${accent}10` }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Moments
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              color: "#f0ecf8",
            }}
          >
            Gallery
          </h2>
          <Divider accent={accent} gold={gold} />
        </motion.div>

        {/* Masonry-ish grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {images.map((src, i) => (
            <motion.div
              key={i}
              variants={imgVar}
              whileHover={{ scale: 1.02, zIndex: 2 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-xl group ${COL_SPANS[i % 6]} ${ASPECT_CLASSES[i % 6]}`}
            >
              <Image
                src={src}
                alt={`Gallery ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Dark overlay lifts on hover */}
              <div
                className="absolute inset-0 transition-opacity duration-400 group-hover:opacity-0"
                style={{ background: "rgba(12,13,26,0.25)" }}
              />
              {/* Gold sparkle border on hover */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ border: `1px solid ${gold}50`, boxShadow: `inset 0 0 20px ${gold}10` }}
              />
              {/* Tiny sparkle icon on hover */}
              <div
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill={gold} aria-hidden>
                  <path d="M6 0 L7 4.5 L12 6 L7 7.5 L6 12 L5 7.5 L0 6 L5 4.5 Z" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
