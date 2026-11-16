"use client";

import { useId, useState, type CSSProperties } from "react";
import GalleryLightbox, { type LightboxPhoto } from "@/components/wedding-templates/_shared/GalleryLightbox";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { ENGRAVED, SANS, cssImage } from "../theme";
import { Floor, FloorHeading } from "./Motion";

/**
 * Photographs hung like a hotel corridor: the first in a white mount with a
 * thin bronze frame, the rest in two staggered columns. Any photo opens
 * in the shared viewer to zoom and step through. Sorted albums get tabs.
 */
export default function GallerySection({ config, floor, palette: p }: { config: WeddingConfig; floor: number; palette: Palette }) {
  const uid = useId();
  const albums = (galleryHasAlbums(config) ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls ?? [] }])
    .map((a) => ({ ...a, images: a.urls.map((u) => ({ url: u, css: cssImage(u) })).filter((x): x is { url: string; css: string } => Boolean(x.css)) }))
    .filter((a) => a.images.length > 0);

  const [albumIdx, setAlbumIdx] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  const album = albums[Math.min(albumIdx, albums.length - 1)];
  const images = album?.images ?? [];
  const count = images.length;

  if (!album) return null;
  const [lead, ...rest] = images;
  const names = `${config.partner1Name} and ${config.partner2Name}`;

  const thumb = (i: number, img: { url: string }, style: CSSProperties, eager = false) => (
    <button
      key={`${album.key}-${i}`}
      type="button"
      aria-label={`Enlarge photo ${i + 1} of ${count}`}
      onClick={() => setOpen(i)}
      aria-haspopup="dialog"
      className="group block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ padding: 0, border: 0, background: `color-mix(in srgb, ${p.bronze} 25%, ${p.linen})`, cursor: "zoom-in", outlineColor: p.oxblood, ...style }}
    >
      {/* Couples paste photos from any host, which next/image remote patterns cannot cover. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.url} alt="" loading={eager ? "eager" : "lazy"} decoding="async" className="block h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
    </button>
  );

  const photos: LightboxPhoto[] = images.map((img, i) => ({ src: img.url, album: album.label, alt: `${names}, photo ${i + 1} of ${count}` }));

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

      <GalleryLightbox
        photos={photos}
        index={open}
        onIndex={setOpen}
        theme={{ backdrop: `color-mix(in srgb, ${p.oxbloodDeep} 96%, transparent)`, text: p.linenOn, accent: p.bronzeLight, font: ENGRAVED }}
        windowStyle={{ background: `color-mix(in srgb, ${p.bronze} 25%, ${p.linen})` }}
        reserve={{ x: "5rem", y: "16rem" }}
        renderFrame={(photo, { index: i, count: total }) => (
          <>
            {/* Off the corridor wall: the white mount and thin bronze frame of the lead photograph. */}
            <div style={{ background: "#FFFFFF", padding: "clamp(0.9rem, 2.4vw, 1.6rem)", border: `1px solid ${p.bronze}`, boxShadow: `0 0 0 5px ${p.oxbloodDeep}, 0 0 0 6px color-mix(in srgb, ${p.bronzeLight} 55%, transparent), 0 40px 80px -30px rgba(0,0,0,.8)` }}>
              {photo}
            </div>
            <figcaption className="mt-5 text-center" style={{ fontFamily: ENGRAVED, fontSize: 13, letterSpacing: "0.18em", paddingLeft: "0.18em", color: p.linenOn }}>
              {config.partner1Name} &amp; {config.partner2Name}
              <span style={{ color: p.bronzeLight }}>
                {" "}
                · {album.label ? `${album.label} · ` : ""}No. {i + 1} of {total}
              </span>
            </figcaption>
          </>
        )}
      />
    </Floor>
  );
}
