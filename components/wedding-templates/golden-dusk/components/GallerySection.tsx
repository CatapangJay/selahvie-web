"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

// Masonry-style height classes to create variety
const HEIGHTS = [220, 280, 240, 260, 220, 280, 240, 260, 220];

export default function GallerySection({ config, accent }: Props) {
  const BG = "#faf8f4";
  const images = config.galleryImageUrls ?? [];
  // Pad to at least 9 with placeholders
  const displayImages = Array.from({ length: 9 }, (_, i) =>
    images[i] ?? `https://picsum.photos/seed/gd-gallery-${i + 1}/600/800`
  );

  return (
    <section id="gallery" className="relative py-24 px-6" style={{ background: BG }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Heading */}
          <div className="text-center mb-14">
            <motion.p
              variants={rise}
              className="text-xs uppercase tracking-[0.3em] mb-2"
              style={{ color: accent, fontFamily: "var(--font-sans)" }}
            >
              Our Memories
            </motion.p>
            <motion.h2
              variants={rise}
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "#2c1810",
                lineHeight: 1.2,
              }}
            >
              The Gallery
            </motion.h2>
            <motion.div variants={rise} className="flex items-center justify-center gap-2 mt-3">
              <div className="h-0.5 w-8" style={{ background: accent }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: accent }} />
              <div className="h-0.5 w-8" style={{ background: accent }} />
            </motion.div>
          </div>

          {/* Masonry-style grid: 3 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {displayImages.map((src, i) => (
              <motion.div
                key={i}
                variants={rise}
                whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
                className="relative overflow-hidden rounded-xl shadow-md cursor-pointer"
                style={{ height: HEIGHTS[i % HEIGHTS.length] }}
              >
                <Image
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            ))}
          </div>

          {/* View All button */}
          <motion.div variants={rise} className="flex justify-center mt-10">
            <button
              className="px-7 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] transition-all hover:opacity-80"
              style={{ background: accent, color: "#ffffff", fontFamily: "var(--font-sans)" }}
            >
              View All
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
