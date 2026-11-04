"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { CAPS, capsLabel, cssImage, giltFrame, slateStyle } from "../theme";
import { EASE, SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** Frame shapes hung in turn along the wall: arched, oval, plain. Each pair is [outer, inner] radius. */
const SHAPES: { ratio: string; outer: string; inner: string }[] = [
  { ratio: "3 / 4", outer: "50% 50% 4px 4px / 30% 30% 4px 4px", inner: "50% 50% 2px 2px / 30% 30% 2px 2px" },
  { ratio: "4 / 5", outer: "50%", inner: "50%" },
  { ratio: "1 / 1", outer: "4px", inner: "2px" },
  { ratio: "4 / 5", outer: "4px", inner: "2px" },
  { ratio: "3 / 4", outer: "50%", inner: "50%" },
  { ratio: "1 / 1", outer: "50% 50% 4px 4px / 30% 30% 4px 4px", inner: "50% 50% 2px 2px / 30% 30% 2px 2px" },
];

const toRoman = (n: number) => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][n] ?? String(n + 1);

/**
 * A corridor of moving portraits: every photograph hangs in a gilt frame and
 * never quite holds still, each drifting on its own slow breath, with a brass
 * plaque underneath.
 */
export default function GallerySection({ config, palette: p }: Props) {
  const reduce = useReducedMotion();
  const hasAlbums = galleryHasAlbums(config);
  const groups = (hasAlbums ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls ?? [] }])
    .map((g) => ({ ...g, images: g.urls.map(cssImage).filter((u): u is string => Boolean(u)) }))
    .filter((g) => g.images.length > 0);
  if (groups.length === 0) return null;

  return (
    <section id="portraits" aria-labelledby="wv-gallery-title" style={{ ...slateStyle(p), padding: "5.5rem 1rem 6rem" }}>
      <SectionHeading id="wv-gallery-title" kicker="From the corridor walls" title="Moving Portraits" subtitle="Look closely. They don't hold still for long." color={p.chalk} accent={p.gilt} />
      {groups.map((group) => (
        <div key={group.key} style={{ maxWidth: 900, margin: "0 auto 3rem" }}>
          {group.label && (
            <h3 style={{ ...capsLabel(p.gilt, 12), fontWeight: 700, textAlign: "center", margin: "0 0 1.6rem" }}>{group.label}</h3>
          )}
          <ul aria-label={group.label || "Gallery"} className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: "2.2rem clamp(1rem, 4vw, 2rem)", listStyle: "none", padding: 0, margin: "0 auto", alignItems: "start" }}>
            {group.images.map((image, i) => {
              const shape = SHAPES[i % SHAPES.length];
              const drift = 9 + (i % 4) * 2.5;
              const frame: CSSProperties = { ...giltFrame(p, 7), borderRadius: shape.outer };
              return (
                <motion.li
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, delay: (i % 3) * 0.12, ease: EASE }}
                  // Every other portrait hangs a little lower, like a gallery wall.
                  style={{ marginTop: i % 2 ? "2.2rem" : 0 }}
                >
                  <div style={frame}>
                    <div style={{ position: "relative", aspectRatio: shape.ratio, overflow: "hidden", borderRadius: shape.inner, background: p.slateSoft }}>
                      <motion.div
                        role="img"
                        aria-label={`${group.label ? `${group.label}, portrait` : "Portrait"} ${i + 1} of ${config.partner1Name} and ${config.partner2Name}`}
                        animate={reduce ? undefined : { scale: [1.05, 1.14, 1.05], x: ["0%", i % 2 ? "2.5%" : "-2.5%", "0%"], y: ["0%", "-2%", "0%"] }}
                        transition={{ duration: drift, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
                        style={{ position: "absolute", inset: 0, backgroundImage: image, backgroundSize: "cover", backgroundPosition: "center", filter: "sepia(.12) saturate(.88)" }}
                      />
                      <div aria-hidden style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 24px rgba(10,8,4,.3)", borderRadius: shape.inner }} />
                    </div>
                  </div>
                  <p
                    aria-hidden
                    style={{ margin: "0.8rem 0 0", textAlign: "center", fontFamily: CAPS, fontWeight: 600, fontSize: 10, letterSpacing: "0.26em", color: p.gilt }}
                  >
                    No. {toRoman(i)}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
