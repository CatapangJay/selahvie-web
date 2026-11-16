"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import GalleryLightbox from "@/components/wedding-templates/_shared/GalleryLightbox";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { MONO, cssImage, labelText, paperStyle, sheetStyle, tapeStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

const SLIDE_MS = 5200;

/**
 * Mounted plates that turn on their own: one photograph at a time on a card,
 * crossfading every few seconds with a hairline timer underneath. The guest
 * can pause, step, pick a thumbnail, or enlarge the plate. Sorted albums get
 * typed tabs. Under reduced motion the plates never turn by themselves.
 */
export default function GallerySection({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const hasAlbums = galleryHasAlbums(config);
  const albums = (hasAlbums ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls ?? [] }])
    .map((a) => ({ ...a, srcs: a.urls.filter((u) => Boolean(cssImage(u))) }))
    .map((a) => ({ ...a, images: a.srcs.map((u) => cssImage(u) as string) }))
    .filter((a) => a.images.length > 0);

  const [albumIdx, setAlbumIdx] = useState(0);
  const [rawIndex, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  // Index of the plate open in the viewer, or null.
  const [open, setOpen] = useState<number | null>(null);
  const enlarged = open !== null;
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLElement>(null);

  const album = albums[Math.min(albumIdx, albums.length - 1)];
  const count = album?.images.length ?? 0;
  const at = count ? ((rawIndex % count) + count) % count : 0;
  const playing = !reduce && !userPaused && !enlarged && visible && count > 1;

  // The raw index runs freely; it is wrapped to the album when read.
  const go = useCallback((delta: number) => setIndex((i) => i + delta), []);

  // Only turn plates while the gallery is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(id);
  }, [playing, rawIndex, go]);

  // Stepping in the viewer moves the plate on the card too, so closing lands where the guest left off.
  const view = useCallback((i: number | null) => {
    setOpen(i);
    if (i !== null) setIndex(i);
  }, []);

  if (!album) return null;
  const current = album.images[at];
  const label = `${album.label ? `${album.label}, ` : ""}photo ${at + 1} of ${count}`;
  const control: CSSProperties = { minWidth: 44, minHeight: 44, display: "inline-grid", placeItems: "center", border: `1px solid color-mix(in srgb, ${p.ink} 35%, transparent)`, borderRadius: 2, background: "transparent", color: p.ink, fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", outlineColor: p.ink, padding: "0 0.7rem" };

  return (
    <section ref={root} id="gallery" aria-labelledby="ef-gallery-title" aria-roledescription="carousel" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="ef-gallery-title" caption="Plates" title="A few pressed moments" ink={p.ink} soft={p.inkSoft} rust={p.rust} />

        {albums.length > 1 && (
          <div role="tablist" aria-label="Albums" className="flex flex-wrap gap-x-5 gap-y-1" style={{ marginBottom: "1.2rem" }}>
            {albums.map((a, i) => (
              <button
                key={a.key}
                role="tab"
                type="button"
                aria-selected={i === albumIdx}
                aria-controls={`${uid}-plate`}
                onClick={() => {
                  setAlbumIdx(i);
                  setIndex(0);
                }}
                className="focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ ...labelText(p, 11), color: i === albumIdx ? p.ink : p.inkSoft, background: "none", border: 0, borderBottom: `1px solid ${i === albumIdx ? p.rust : "transparent"}`, padding: "0.6rem 0", minHeight: 44, cursor: "pointer", outlineColor: p.ink }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        <figure id={`${uid}-plate`} style={{ ...sheetStyle(p), margin: 0, padding: "0.8rem 0.8rem 0.9rem", border: `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)` }}>
          <div onClick={() => view(at)} style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", background: "#CFCBBA", cursor: "zoom-in" }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={`${album.key}-${at}`}
                role="img"
                aria-label={label}
                initial={reduce ? false : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", inset: 0, backgroundImage: current, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            </AnimatePresence>
          </div>
          {/* Hairline timer: refills for each plate while playing. */}
          <div aria-hidden style={{ height: 1, marginTop: "0.8rem", background: `color-mix(in srgb, ${p.ink} 18%, transparent)`, overflow: "hidden" }}>
            <motion.div
              key={`${album.key}-${rawIndex}-${playing}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: playing ? 1 : 0 }}
              transition={{ duration: playing ? SLIDE_MS / 1000 : 0, ease: "linear" }}
              style={{ height: "100%", background: p.rust, transformOrigin: "left" }}
            />
          </div>
          <figcaption style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginTop: "0.6rem" }}>
            <span aria-live={playing ? "off" : "polite"} style={{ ...labelText(p, 10), color: p.text }}>
              Plate {String(at + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <span className="flex gap-2">
              {count > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="focus-visible:outline-2" style={control}>←</button>
                  {!reduce && (
                    <button type="button" onClick={() => setUserPaused((v) => !v)} aria-pressed={userPaused} aria-label={userPaused ? "Play slideshow" : "Pause slideshow"} className="focus-visible:outline-2" style={control}>
                      {userPaused ? "Play" : "Pause"}
                    </button>
                  )}
                  <button type="button" onClick={() => go(1)} aria-label="Next photo" className="focus-visible:outline-2" style={control}>→</button>
                </>
              )}
              <button type="button" onClick={() => view(at)} aria-haspopup="dialog" aria-label="Enlarge photo" className="focus-visible:outline-2" style={control}>
                Enlarge
              </button>
            </span>
          </figcaption>
        </figure>

        {count > 1 && (
          <ul aria-label="Choose a photo" className="flex gap-2 overflow-x-auto" style={{ listStyle: "none", padding: "0.9rem 0 0.3rem", margin: 0, scrollbarWidth: "thin" }}>
            {album.images.map((img, i) => (
              <li key={i} style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === at ? "true" : undefined}
                  className="focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ display: "block", width: 56, height: 70, padding: 0, border: 0, cursor: "pointer", backgroundImage: img, backgroundSize: "cover", backgroundPosition: "center", opacity: i === at ? 1 : 0.55, boxShadow: i === at ? `0 0 0 1px ${p.sheet}, 0 0 0 2px ${p.rust}` : "none", transition: "opacity .4s", outlineColor: p.ink }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <GalleryLightbox
        photos={album.srcs.map((src, i) => ({ src, album: album.label, alt: `${album.label ? `${album.label}, ` : ""}photo ${i + 1} of ${count}, ${config.partner1Name} and ${config.partner2Name}` }))}
        index={open}
        onIndex={view}
        theme={{ backdrop: `color-mix(in srgb, ${p.inkDeep} 96%, transparent)`, text: p.sheet, accent: p.tape, font: MONO }}
        windowStyle={{ background: "#CFCBBA" }}
        reserve={{ x: "4.5rem", y: "16rem" }}
        renderFrame={(photo, { index: i, count: total }) => (
          // The plate lifted off the folio: mounted on its fibre sheet, held by two strips of linen tape.
          <div style={{ ...sheetStyle(p), position: "relative", padding: "clamp(10px, 1.6vw, 16px) clamp(10px, 1.6vw, 16px) 0", border: `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)`, boxShadow: "0 40px 80px -30px rgba(0,0,0,.75)" }}>
            <span aria-hidden style={{ ...tapeStyle(p, -6), top: -11, left: -18, zIndex: 1 }} />
            <span aria-hidden style={{ ...tapeStyle(p, 5), top: -11, right: -18, zIndex: 1 }} />
            {photo}
            <figcaption className="flex items-center justify-between gap-4" style={{ padding: "0.7rem 0 0.8rem" }}>
              <span style={{ ...labelText(p, 10), color: p.text }}>
                Plate {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <span style={{ ...labelText(p, 10), color: p.inkSoft }}>{album.label || `${config.partner1Name} & ${config.partner2Name}`}</span>
            </figcaption>
          </div>
        )}
      />
    </section>
  );
}
