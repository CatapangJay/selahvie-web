"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

export default function GallerySection({ config, accent }: Props) {
  const images = config.galleryImageUrls?.filter(Boolean) ?? [];
  if (images.length === 0) return null;

  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{ background: "#0f0d0b" }}
    >
      {/* Top rule */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accent}20, transparent)` }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel eyebrow="Our Album" title="Gallery" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {images.map((url, i) => {
            /* Vary aspect ratios for a masonry feel */
            const isWide  = i % 5 === 1;
            const isTall  = i % 5 === 0;
            const aspect  = isTall ? "3/4" : isWide ? "4/3" : "1/1";
            const colSpan = isWide && images.length > 3 ? "md:col-span-2" : "";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: "easeOut", delay: (i % 4) * 0.08 }}
                className={`relative overflow-hidden group ${colSpan}`}
                style={{ aspectRatio: aspect }}
              >
                <Image
                  src={url}
                  alt={`Gallery ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-108"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Dark overlay lifts on hover */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "rgba(10,9,8,0.45)" }}
                  whileHover={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Gold border frame appears on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ border: `1px solid ${accent}40` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accent}20, transparent)` }}
      />
    </section>
  );
}
