"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { capizStyle, cssImage, woodStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/**
 * Photos seen through capiz windows: each picture sits in a narra sash with a
 * thin muntin cross, and its two shell panels slide aside as it scrolls in.
 */
export default function GallerySection({ config, palette: p }: Props) {
  const reduce = useReducedMotion();
  const images = config.galleryImageUrls.map(cssImage).filter((u): u is string => Boolean(u));
  if (images.length === 0) return null;

  return (
    <section aria-labelledby="nk-gallery-title" style={{ ...woodStyle(p), padding: "6rem 1rem" }}>
      <SectionHeading id="nk-gallery-title" eyebrow="Mga alaala" title="Through the Window" color={p.capiz} accent={p.brass} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" style={{ maxWidth: 960, listStyle: "none", padding: 0, margin: "0 auto" }}>
        {images.map((image, i) => (
          <li key={i} style={{ position: "relative", aspectRatio: "3 / 4", overflow: "hidden", border: `7px solid ${p.narraDeep}`, boxShadow: `inset 0 0 0 1px ${p.brass}, 0 14px 24px -14px rgba(0,0,0,.8)` }}>
            <div
              role="img"
              aria-label={`Gallery photo ${i + 1}`}
              style={{ position: "absolute", inset: 0, backgroundImage: image, backgroundSize: "cover", backgroundPosition: "center", filter: "sepia(.3) saturate(.9)" }}
            />
            {/* Muntins */}
            <span aria-hidden style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 4, marginLeft: -2, background: p.narraDeep }} />
            <span aria-hidden style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, marginTop: -2, background: p.narraDeep }} />
            {!reduce &&
              (["left", "right"] as const).map((side) => (
                <motion.span
                  key={side}
                  aria-hidden
                  initial={{ x: "0%" }}
                  whileInView={{ x: side === "left" ? "-101%" : "101%" }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1.1, delay: 0.15 + (i % 3) * 0.12, ease: [0.65, 0, 0.35, 1] }}
                  style={{
                    ...capizStyle(p, 96),
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "50%",
                    [side]: 0,
                    backgroundSize: "40% 25%",
                    boxShadow: `inset 0 0 0 2px ${p.narraDeep}`,
                    backgroundImage: `linear-gradient(${p.narraDeep} 2px, transparent 2px), linear-gradient(90deg, ${p.narraDeep} 2px, transparent 2px), linear-gradient(135deg, rgba(255,255,255,.5), rgba(255,255,255,0) 60%)`,
                  }}
                />
              ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
