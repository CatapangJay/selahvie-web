"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import GalleryLightbox, { type LightboxPhoto } from "@/components/wedding-templates/_shared/GalleryLightbox";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { DISPLAY, capizStyle, cssImage, woodStyle } from "../theme";
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
  const [open, setOpen] = useState<number | null>(null);
  const hasAlbums = galleryHasAlbums(config);
  const groups = (hasAlbums ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls ?? [] }])
    .map((g) => ({ ...g, srcs: g.urls.filter((u) => Boolean(cssImage(u))) }))
    .map((g) => ({ ...g, images: g.srcs.map((u) => cssImage(u) as string) }))
    .filter((g) => g.images.length > 0);
  if (groups.length === 0) return null;
  const altFor = (label: string, i: number) => `${label ? `${label} photo` : "Gallery photo"} ${i + 1} of ${config.partner1Name} and ${config.partner2Name}`;
  // Every window in page order, so the viewer walks the whole gallery.
  const photos: LightboxPhoto[] = groups.flatMap((g) => g.srcs.map((src, i) => ({ src, album: g.label, alt: altFor(g.label, i) })));
  let n = 0;
  const shutter = (side: "left" | "right") => ({
    ...capizStyle(p, 96),
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    width: "50%",
    [side]: 0,
    backgroundSize: "40% 25%",
    boxShadow: `inset 0 0 0 2px ${p.narraDeep}`,
    backgroundImage: `linear-gradient(${p.narraDeep} 2px, transparent 2px), linear-gradient(90deg, ${p.narraDeep} 2px, transparent 2px), linear-gradient(135deg, rgba(255,255,255,.5), rgba(255,255,255,0) 60%)`,
  });

  return (
    <section aria-labelledby="nk-gallery-title" style={{ ...woodStyle(p), padding: "6rem 1rem" }}>
      <SectionHeading id="nk-gallery-title" eyebrow="Mga alaala" title="Through the Window" color={p.capiz} accent={p.brass} />
      {groups.map((group) => (
        <div key={group.key} style={{ maxWidth: 960, margin: "0 auto 3rem" }}>
          {group.label && (
            <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 15, letterSpacing: "0.26em", paddingLeft: "0.26em", textTransform: "uppercase", textAlign: "center", color: p.brass, margin: "0 0 1.25rem" }}>
              {group.label}
            </h3>
          )}
          <ul aria-label={group.label || "Gallery"} className="grid grid-cols-2 gap-3 sm:grid-cols-3" style={{ maxWidth: 960, listStyle: "none", padding: 0, margin: "0 auto" }}>
            {group.images.map((image, i) => {
              const at = n++;
              return (
              <li key={i} className="group" style={{ position: "relative", aspectRatio: "3 / 4", overflow: "hidden", border: `7px solid ${p.narraDeep}`, boxShadow: `inset 0 0 0 1px ${p.brass}, 0 14px 24px -14px rgba(0,0,0,.8)` }}>
                <div
                  aria-hidden
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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
                      style={shutter(side)}
                    />
                  ))}
                {/* The whole window is the button; muntins and shutters stay decoration underneath. */}
                <button
                  type="button"
                  onClick={() => setOpen(at)}
                  aria-haspopup="dialog"
                  aria-label={`Enlarge ${altFor(group.label, i).charAt(0).toLowerCase()}${altFor(group.label, i).slice(1)}`}
                  className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-4"
                  style={{ padding: 0, border: 0, background: "transparent", cursor: "zoom-in", outlineColor: p.capiz }}
                />
              </li>
              );
            })}
          </ul>
        </div>
      ))}

      <GalleryLightbox
        photos={photos}
        index={open}
        onIndex={setOpen}
        theme={{
          backdrop: { ...woodStyle(p), backgroundColor: p.narraDeep },
          text: p.capiz,
          accent: p.capiz,
          font: DISPLAY,
          // Dark narra under the controls so they read against the grain.
          controlFill: `color-mix(in srgb, ${p.narraDeep} 88%, transparent)`,
          controlRing: `color-mix(in srgb, ${p.brass} 60%, transparent)`,
        }}
        imageFilter="sepia(.3) saturate(.9)"
        windowStyle={{ background: p.narraDeep }}
        reserve={{ x: "5rem", y: "15rem" }}
        renderFrame={(photo, { photo: current }) => (
          <>
            {/* A narra sash with a brass bead, the capiz shutters parting as each photo opens. */}
            <div style={{ position: "relative", padding: "clamp(10px, 1.6vw, 16px)", background: p.narraDeep, boxShadow: `inset 0 0 0 1px ${p.brass}, inset 0 0 0 4px ${p.narraDeep}, inset 0 0 0 5px color-mix(in srgb, ${p.brass} 55%, transparent), 0 40px 80px -30px rgba(0,0,0,.85)` }}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                {photo}
                {!reduce &&
                  (["left", "right"] as const).map((side) => (
                    <motion.span
                      key={side}
                      aria-hidden
                      initial={{ x: "0%" }}
                      animate={{ x: side === "left" ? "-101%" : "101%" }}
                      transition={{ duration: 1, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
                      style={{ ...shutter(side), pointerEvents: "none" }}
                    />
                  ))}
              </div>
            </div>
            <figcaption
              className="mt-5 text-center"
              style={{ fontFamily: DISPLAY, fontSize: 14, letterSpacing: "0.26em", textTransform: "uppercase", color: p.brass, background: p.narraDeep, padding: "0.5rem 1rem 0.5rem 1.26rem", boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.brass} 60%, transparent)` }}
            >
              {config.partner1Name} &amp; {config.partner2Name}
              {current.album && <span style={{ color: p.capiz }}> · {current.album}</span>}
            </figcaption>
          </>
        )}
      />
    </section>
  );
}
