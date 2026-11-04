"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";

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
  const albums = galleryAlbumsOf(config);
  const hasAlbums = galleryHasAlbums(config);
  const [active, setActive] = useState(0);
  const album = albums[Math.min(active, albums.length - 1)];
  const images = hasAlbums ? album.urls : config.galleryImageUrls ?? [];

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

        {hasAlbums && albums.length > 1 && (
          <div role="tablist" aria-label="Photo albums" className="flex flex-wrap gap-x-10 gap-y-2 mb-10 -mt-6">
            {albums.map((a, i) => {
              const on = a.key === album.key;
              return (
                <button
                  key={a.key}
                  id={`serenity-album-tab-${a.key}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="serenity-album-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                    e.preventDefault();
                    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + albums.length) % albums.length;
                    setActive(next);
                    document.getElementById(`serenity-album-tab-${albums[next].key}`)?.focus();
                  }}
                  className="py-2.5 text-xs tracking-[0.22em] uppercase"
                  style={{
                    color: on ? textDeep : `${textDeep}99`,
                    borderBottom: `1px solid ${on ? green : "transparent"}`,
                    transition: "color 0.3s, border-color 0.3s",
                  }}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Asymmetric grid — row 1: [2fr 1fr 1fr] */}
        <div
          id="serenity-album-panel"
          role={hasAlbums && albums.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={hasAlbums && albums.length > 1 ? `serenity-album-tab-${album.key}` : undefined}
          className="grid gap-3"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "auto auto",
          }}
        >
          {/* Slot 0 — large hero cell, spans 2 rows */}
          {(!hasAlbums || images[0]) && (
            <div className="relative" style={{ gridRow: "1 / 3", minHeight: "480px" }}>
              <GalleryCard key={hasAlbums ? album.key : "all"} src={slots[0]} alt={hasAlbums ? `${album.label} photo 1` : "Gallery photo 1"} delay={0} className="absolute inset-0 h-full" />
            </div>
          )}

          {/* Slot 1 */}
          {(!hasAlbums || images[1]) && (
            <div className="relative aspect-square">
              <GalleryCard key={hasAlbums ? album.key : "all"} src={slots[1]} alt={hasAlbums ? `${album.label} photo 2` : "Gallery photo 2"} delay={0.1} className="absolute inset-0 h-full" />
            </div>
          )}

          {/* Slot 2 */}
          {(!hasAlbums || images[2]) && (
            <div className="relative aspect-square">
              <GalleryCard key={hasAlbums ? album.key : "all"} src={slots[2]} alt={hasAlbums ? `${album.label} photo 3` : "Gallery photo 3"} delay={0.18} className="absolute inset-0 h-full" />
            </div>
          )}

          {/* Slot 3 */}
          {(!hasAlbums || images[3]) && (
            <div className="relative aspect-video">
              <GalleryCard key={hasAlbums ? album.key : "all"} src={slots[3]} alt={hasAlbums ? `${album.label} photo 4` : "Gallery photo 4"} delay={0.26} className="absolute inset-0 h-full" />
            </div>
          )}

          {/* Slot 4 */}
          {(!hasAlbums || images[4]) && (
            <div className="relative aspect-video">
              <GalleryCard key={hasAlbums ? album.key : "all"} src={slots[4]} alt={hasAlbums ? `${album.label} photo 5` : "Gallery photo 5"} delay={0.33} className="absolute inset-0 h-full" />
            </div>
          )}
        </div>

        {hasAlbums && images.length > 5 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {images.slice(5).map((src, i) => (
              <div key={src} className="relative aspect-square">
                <GalleryCard src={src} alt={`${album.label} photo ${i + 6}`} delay={0.05 * (i % 3)} className="absolute inset-0 h-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
