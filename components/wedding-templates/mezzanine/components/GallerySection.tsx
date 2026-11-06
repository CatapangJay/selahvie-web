"use client";

import { useCallback, useContext, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { ENGRAVED, SANS, cssImage } from "../theme";
import { Floor, FloorHeading, PortalTarget } from "./Motion";

/**
 * Photographs hung like a hotel corridor: the first in a white mount with a
 * thin bronze frame, the rest in two staggered columns. Any photo opens
 * enlarged, with previous / next and Escape. Sorted albums get tabs.
 */
export default function GallerySection({ config, floor, palette: p }: { config: WeddingConfig; floor: number; palette: Palette }) {
  const reduce = useReducedMotion();
  const portal = useContext(PortalTarget);
  const uid = useId();
  const albums = (galleryHasAlbums(config) ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls ?? [] }])
    .map((a) => ({ ...a, images: a.urls.map((u) => ({ url: u, css: cssImage(u) })).filter((x): x is { url: string; css: string } => Boolean(x.css)) }))
    .filter((a) => a.images.length > 0);

  const [albumIdx, setAlbumIdx] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const album = albums[Math.min(albumIdx, albums.length - 1)];
  const images = album?.images ?? [];
  const count = images.length;
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  const isOpen = open !== null;

  // Move focus into the viewer when it opens (not on every photo change).
  useEffect(() => {
    if (isOpen) dialog.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialog.current) {
        // Keep Tab inside the viewer: the page behind it is covered.
        const items = [...dialog.current.querySelectorAll<HTMLElement>("button")];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialog.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialog.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close, step]);

  if (!album) return null;
  const [lead, ...rest] = images;
  const names = `${config.partner1Name} and ${config.partner2Name}`;

  const thumb = (i: number, img: { url: string }, style: CSSProperties, eager = false) => (
    <button
      key={`${album.key}-${i}`}
      type="button"
      aria-label={`Enlarge photo ${i + 1} of ${count}`}
      onClick={(e) => {
        opener.current = e.currentTarget;
        setOpen(i);
      }}
      className="group block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ padding: 0, border: 0, background: `color-mix(in srgb, ${p.bronze} 25%, ${p.linen})`, cursor: "zoom-in", outlineColor: p.oxblood, ...style }}
    >
      {/* Couples paste photos from any host, which next/image remote patterns cannot cover. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.url} alt="" loading={eager ? "eager" : "lazy"} decoding="async" className="block h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
    </button>
  );

  const ctrl: CSSProperties = { minWidth: 48, minHeight: 48, borderRadius: 999, border: `1px solid color-mix(in srgb, ${p.linenOn} 45%, transparent)`, background: "transparent", color: p.linenOn, fontFamily: SANS, fontSize: 15, cursor: "pointer", outlineColor: p.linenOn, padding: "0 1rem" };

  return (
    <Floor id="gallery" labelledBy="mz-gallery-title" background={p.linen} maxWidth={680}>
      <FloorHeading id="mz-gallery-title" floor={floor} title="Photographs" palette={p} />

      {albums.length > 1 && (
        <div role="group" aria-label="Albums" className="flex flex-wrap" style={{ gap: "0.5rem", margin: "-0.6rem 0 1.6rem" }}>
          {albums.map((a, i) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={i === albumIdx}
              aria-controls={`${uid}-panel`}
              onClick={() => setAlbumIdx(i)}
              className="transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ minHeight: 44, padding: "0 1rem", borderRadius: 999, border: `1px solid ${i === albumIdx ? p.oxblood : `color-mix(in srgb, ${p.bronze} 60%, transparent)`}`, background: i === albumIdx ? p.oxblood : "transparent", color: i === albumIdx ? p.linenOn : p.ink, fontFamily: SANS, fontSize: 15, cursor: "pointer", outlineColor: p.oxblood }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div id={`${uid}-panel`} role="region" aria-label={albums.length > 1 ? `${album.label} photos` : undefined}>
        {/* The lead photograph, mounted and framed */}
        <div style={{ background: "#FFFFFF", padding: "clamp(0.9rem, 4.5cqw, 1.6rem)", border: `1px solid ${p.bronze}`, boxShadow: `0 0 0 4px ${p.linen}, 0 0 0 5px color-mix(in srgb, ${p.bronze} 40%, transparent), 0 24px 40px -30px rgba(31,21,23,.6)` }}>
          {thumb(0, lead, { aspectRatio: "4 / 5" })}
        </div>

        {rest.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "clamp(0.6rem, 3cqw, 1rem)", marginTop: "clamp(1.2rem, 5cqw, 1.8rem)" }}>
            {[0, 1].map((col) => (
              <div key={col} style={{ display: "flex", flexDirection: "column", gap: "clamp(0.6rem, 3cqw, 1rem)", paddingTop: col === 1 ? "clamp(1.5rem, 9cqw, 3rem)" : 0 }}>
                {rest.map((img, i) => (i % 2 === col ? thumb(i + 1, img, { aspectRatio: (i >> 1) % 2 === col ? "3 / 4" : "4 / 5" }) : null))}
              </div>
            ))}
          </div>
        )}
      </div>

      {portal && createPortal(
      <AnimatePresence>
        {open !== null && images[open] && (
          <motion.div
            ref={dialog}
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Photo ${open + 1} of ${count}`}
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
            style={{ position: "fixed", inset: 0, bottom: "var(--preview-chrome-bottom, 0px)", zIndex: "var(--z-modal, 80)" as unknown as number, background: `color-mix(in srgb, ${p.oxbloodDeep} 94%, transparent)`, display: "flex", flexDirection: "column", outline: "none" }}
          >
            <div style={{ flex: 1, minHeight: 0, padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Couples paste photos from any host, which next/image remote patterns cannot cover. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[open].url} alt={`${names}, photo ${open + 1} of ${count}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
            </div>
            <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center" style={{ gap: "0.8rem", padding: "0 1rem 1.25rem" }}>
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={ctrl}>←</button>
              <span aria-live="polite" style={{ fontFamily: ENGRAVED, fontSize: 13, letterSpacing: "0.14em", color: p.linenOn, minWidth: "4.5rem", textAlign: "center" }}>
                {open + 1} / {count}
              </span>
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={ctrl}>→</button>
              <button type="button" onClick={close} className="focus-visible:outline-2 focus-visible:outline-offset-2" style={{ ...ctrl, marginLeft: "0.6rem" }}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      portal
      )}
    </Floor>
  );
}
