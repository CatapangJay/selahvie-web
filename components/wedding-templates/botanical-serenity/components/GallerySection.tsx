"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  bg: string;
  textDeep: string;
}

/** Isolated card with per-card tilt spring (client island) */
function GalleryCard({
  src,
  alt,
  className,
  delay,
}: {
  src: string;
  alt: string;
  className?: string;
  delay: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-60, 60], [4, -4]);
  const rotY = useTransform(mx, [-80, 80], [-6, 6]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 80, damping: 18, delay }}
      className={`relative overflow-hidden cursor-pointer ${className ?? ""}`}
      style={{ perspective: "800px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: rotX, rotateY: rotY }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="relative w-full h-full"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </motion.div>
    </motion.div>
  );
}

export default function GallerySection({ config, green, floral, bg, textDeep }: Props) {
  const images = config.galleryImageUrls ?? [];

  const slots = [
    images[0] || "/placeholder-gallery-1.jpg",
    images[1] || "/placeholder-gallery-2.jpg",
    images[2] || "/placeholder-gallery-3.jpg",
    images[3] || "/placeholder-gallery-4.jpg",
    images[4] || "/placeholder-gallery-5.jpg",
  ];

  return (
    <section className="py-32" style={{ background: bg }}>
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="mb-16"
        >
          <p className="text-xs tracking-[0.22em] uppercase mb-4" style={{ color: floral }}>
            Moments
          </p>
          <h2
            className="text-3xl lg:text-5xl font-light"
            style={{ color: textDeep, letterSpacing: "-0.02em" }}
          >
            Our Gallery
          </h2>
        </motion.div>

        {/* Asymmetric grid — row 1: [2fr 1fr 1fr] */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "auto auto",
          }}
        >
          {/* Slot 0 — large hero cell, spans 2 rows */}
          <div className="relative" style={{ gridRow: "1 / 3", minHeight: "480px" }}>
            <GalleryCard src={slots[0]} alt="Gallery 1" delay={0} className="absolute inset-0 h-full" />
          </div>

          {/* Slot 1 */}
          <div className="relative aspect-square">
            <GalleryCard src={slots[1]} alt="Gallery 2" delay={0.1} className="absolute inset-0 h-full" />
          </div>

          {/* Slot 2 */}
          <div className="relative aspect-square">
            <GalleryCard src={slots[2]} alt="Gallery 3" delay={0.18} className="absolute inset-0 h-full" />
          </div>

          {/* Slot 3 */}
          <div className="relative aspect-video">
            <GalleryCard src={slots[3]} alt="Gallery 4" delay={0.26} className="absolute inset-0 h-full" />
          </div>

          {/* Slot 4 */}
          <div className="relative aspect-video">
            <GalleryCard src={slots[4]} alt="Gallery 5" delay={0.33} className="absolute inset-0 h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
