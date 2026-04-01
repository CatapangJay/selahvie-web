"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import Divider from "./Divider";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

/* Grid layout assignments for up to 6 images */
const SPANS = ["col-span-1 row-span-2", "col-span-2", "col-span-1 row-span-2", "col-span-2", "col-span-1", "col-span-1"];

/* Each image gets a slightly different parallax Y range for depth */
const PARALLAX_RANGES: Array<[string, string]> = [
  ["-30px", "30px"],
  ["-20px", "20px"],
  ["-40px", "40px"],
  ["-15px", "15px"],
  ["-25px", "25px"],
  ["-35px", "35px"],
];

function ParallaxImage({ src, alt, span, parallaxRange, gold, accent }: {
  src: string; alt: string; span: string;
  parallaxRange: [string, string]; gold: string; accent: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], parallaxRange);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
      whileHover={{ scale: 1.02, zIndex: 5 }}
      className={`relative overflow-hidden rounded-2xl group ${span}`}
      style={{ minHeight: "200px" }}
    >
      {/* Image with its own parallax */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale: 1.15 }}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </motion.div>

      {/* Enchanted overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
        style={{ background: "rgba(6,14,18,0.2)" }}
      />

      {/* Gold magic border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ border: `1px solid ${gold}50`, boxShadow: `inset 0 0 30px ${gold}08, 0 0 20px ${accent}15` }}
      />

      {/* Firefly particle that appears on hover */}
      <motion.div
        className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: gold, boxShadow: `0 0 8px ${gold}` }}
      />
    </motion.div>
  );
}

const containerVar: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

export default function GallerySection({ config, gold, accent }: Props) {
  const images = (config.galleryImageUrls ?? []).filter(Boolean).slice(0, 6);
  if (!images.length) return null;

  return (
    <section
      className="py-28 px-6"
      style={{ background: "#060e12", borderTop: `1px solid ${gold}10` }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.26em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Captured Moments
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#eef5ee" }}>
            Gallery
          </h2>
          <Divider gold={gold} accent={accent} />
        </motion.div>

        <motion.div
          variants={containerVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-3 gap-3"
          style={{ gridAutoRows: "220px" }}
        >
          {images.map((src, i) => (
            <ParallaxImage
              key={i}
              src={src}
              alt={`Gallery ${i + 1}`}
              span={SPANS[i % SPANS.length]}
              parallaxRange={PARALLAX_RANGES[i % PARALLAX_RANGES.length]}
              gold={gold}
              accent={accent}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
