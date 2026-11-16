"use client";

import { useState } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { DISPLAY, cssImage } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";
import Lightbox, { type LightboxPhoto } from "./Lightbox";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

// Alternate arch, round and soft-square windows so the grid reads like a row of garden doors.
const SHAPES = ["999px 999px 1rem 1rem", "1.25rem", "999px", "1rem 1rem 999px 999px"];

export default function GallerySection({ config, palette: p, band }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const t = tones(band, p);
  const sources = galleryHasAlbums(config) ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls }];
  const albums = sources.map((a) => ({ ...a, images: a.urls.filter((u) => Boolean(cssImage(u))) })).filter((a) => a.images.length > 0);
  if (albums.length === 0) return null;

  const names = `${config.partner1Name} and ${config.partner2Name}`;
  // Every photo in page order, so the viewer steps through all the albums in turn.
  const photos: LightboxPhoto[] = albums.flatMap((album) =>
    album.images.map((src, i) => ({ src, album: album.label, alt: `${album.label ? `${album.label}, photo` : "Photo"} ${i + 1} of ${names}` })),
  );
  // Small albums (a pair of photos each) sit side by side on wide screens instead of each leaving a row half empty.
  const compact = albums.length > 1 && albums.every((a) => a.images.length <= 2);
  const cols = (count: number) => (compact || count <= 2 ? "grid-cols-2" : count === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3");
  let frame = 0;

  return (
    <section id="gallery" aria-labelledby="ah-gallery-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <SectionTitle id="ah-gallery-title" eyebrow="A few favourites" title="Through the window" band={band} palette={p} />
      <div className={compact ? "mx-auto max-w-[900px] lg:grid lg:max-w-[72rem] lg:grid-cols-3 lg:gap-10" : undefined}>
        {albums.map((album) => (
          <div
            key={album.key}
            className={compact ? "mx-auto mb-12 w-full max-w-[560px] lg:mb-0 lg:max-w-none" : album.images.length <= 2 ? "mx-auto mb-12 max-w-[640px]" : "mx-auto mb-12 max-w-[900px] lg:max-w-[66rem]"}
          >
            {album.label && (
              <h3 style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: "1.7rem", textAlign: "center", color: t.text, margin: "0 0 1.5rem" }}>{album.label}</h3>
            )}
            <ul className={`grid gap-3 sm:gap-4 ${compact ? "" : "lg:gap-6"} ${cols(album.images.length)}`} style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {album.images.map((src, i) => {
                const n = frame++;
                const shape = SHAPES[i % SHAPES.length];
                return (
                  <li key={n} style={{ marginTop: i % 2 === 1 ? "1.5rem" : 0 }}>
                    <button
                      type="button"
                      onClick={() => setOpen(n)}
                      aria-haspopup="dialog"
                      aria-label={`Enlarge ${photos[n].alt.charAt(0).toLowerCase()}${photos[n].alt.slice(1)}`}
                      className="group block w-full overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      style={{
                        padding: 0,
                        border: 0,
                        cursor: "zoom-in",
                        aspectRatio: shape === "999px" ? "1" : "3 / 4",
                        borderRadius: shape,
                        backgroundColor: p.apricotSoft,
                        boxShadow: `0 0 0 4px color-mix(in srgb, ${p.morning} ${band.dark ? 22 : 100}%, transparent)`,
                        outlineColor: band.dark ? p.butter : p.dusk,
                      }}
                    >
                      <span
                        aria-hidden
                        className="block size-full transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        style={{ backgroundImage: cssImage(src), backgroundSize: "cover", backgroundPosition: "center" }}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <Lightbox photos={photos} index={open} onIndex={setOpen} palette={p} couple={`${config.partner1Name} & ${config.partner2Name}`} />
    </section>
  );
}
