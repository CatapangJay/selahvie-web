"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { MONO, cssImage, labelText, paperStyle, sheetStyle } from "../theme";
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
    .map((a) => ({ ...a, images: a.urls.map(cssImage).filter((u): u is string => Boolean(u)) }))
    .filter((a) => a.images.length > 0);

  const [albumIdx, setAlbumIdx] = useState(0);
  const [rawIndex, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const enlargeBtn = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!enlarged) return;
    const opener = enlargeBtn.current;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnlarged(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus({ preventScroll: true });
    };
  }, [enlarged, go]);

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
          <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", background: "#CFCBBA" }}>
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
              <button ref={enlargeBtn} type="button" onClick={() => setEnlarged(true)} aria-label="Enlarge photo" className="focus-visible:outline-2" style={control}>
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

      <AnimatePresence>
        {enlarged && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setEnlarged(false)}
            style={{ position: "fixed", inset: 0, bottom: "var(--preview-chrome-bottom, 0px)", zIndex: 70, background: "rgba(18,20,14,.92)", display: "grid", placeItems: "center", padding: "3.5rem 1rem 1.5rem" }}
          >
            <div role="img" aria-label={label} onClick={(e) => e.stopPropagation()} style={{ width: "100%", height: "100%", backgroundImage: current, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
            <button ref={closeBtn} type="button" onClick={() => setEnlarged(false)} className="focus-visible:outline-2" style={{ ...control, position: "absolute", top: 10, right: 10, color: p.sheet, borderColor: "rgba(247,243,234,.4)", outlineColor: p.sheet }}>
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
