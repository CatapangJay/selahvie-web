"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
};

export default function OurStorySection({ config, accent }: Props) {
  const BG = "#faf8f4";
  const story = config.coupleStory || "";
  const paras = story.split("\n").filter(Boolean);
  const gallery = config.galleryImageUrls ?? [];

  // Use first 3 gallery photos as stacked story photos, or placeholder
  const photos = [
    gallery[0] ?? `https://picsum.photos/seed/gd-story-1/500/650`,
    gallery[1] ?? `https://picsum.photos/seed/gd-story-2/500/650`,
    gallery[2] ?? `https://picsum.photos/seed/gd-story-3/500/650`,
  ];

  return (
    <section id="story" className="relative py-24 px-6" style={{ background: BG }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* LEFT: text */}
          <div className="flex flex-col gap-6">
            <motion.p
              variants={rise}
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: accent, fontFamily: "var(--font-sans)" }}
            >
              About Us
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
              Our Story
            </motion.h2>

            {/* Accent underline */}
            <motion.div variants={rise} className="flex items-center gap-3">
              <div className="h-0.5 w-10 rounded-full" style={{ background: accent }} />
              <div className="h-0.5 w-4 rounded-full" style={{ background: `${accent}55` }} />
            </motion.div>

            {paras.length > 0 ? (
              paras.map((p, i) => (
                <motion.p
                  key={i}
                  variants={rise}
                  className="text-sm leading-[1.9]"
                  style={{ color: "rgba(44,24,16,0.65)", fontFamily: "var(--font-sans)" }}
                >
                  {p}
                </motion.p>
              ))
            ) : (
              <motion.p
                variants={rise}
                className="text-sm leading-[1.9]"
                style={{ color: "rgba(44,24,16,0.65)", fontFamily: "var(--font-sans)" }}
              >
                Every love story is beautiful, but ours is our favourite. From the
                moment we met, we knew something special had begun—a friendship that
                grew quietly, until one day it became everything.
              </motion.p>
            )}

            <motion.div variants={rise}>
              <button
                className="mt-2 px-7 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] transition-all hover:opacity-80"
                style={{ background: accent, color: "#ffffff", fontFamily: "var(--font-sans)" }}
              >
                View All
              </button>
            </motion.div>
          </div>

          {/* RIGHT: stacked overlapping photos */}
          <motion.div
            variants={rise}
            className="relative w-full"
            style={{ height: "460px" }}
          >
            {/* Back card — slightly rotated + offset */}
            <div
              className="absolute overflow-hidden rounded-2xl shadow-lg"
              style={{
                width: "65%",
                aspectRatio: "4/5",
                top: "0%",
                right: "0%",
                transform: "rotate(3deg)",
                border: "3px solid #ffffff",
                zIndex: 1,
              }}
            >
              <Image src={photos[1]} alt="Story 2" fill className="object-cover" />
            </div>

            {/* Middle card */}
            <div
              className="absolute overflow-hidden rounded-2xl shadow-xl"
              style={{
                width: "62%",
                aspectRatio: "4/5",
                top: "8%",
                left: "0%",
                transform: "rotate(-2deg)",
                border: "3px solid #ffffff",
                zIndex: 2,
              }}
            >
              <Image src={photos[2]} alt="Story 3" fill className="object-cover" />
            </div>

            {/* Front main card — centred, top */}
            <div
              className="absolute overflow-hidden rounded-2xl shadow-2xl"
              style={{
                width: "68%",
                aspectRatio: "4/5",
                top: "16%",
                left: "16%",
                border: "4px solid #ffffff",
                zIndex: 3,
              }}
            >
              <Image src={photos[0]} alt="Story 1" fill className="object-cover" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
