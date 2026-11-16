"use client";

import { useState } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import GalleryLightbox, { type LightboxPhoto } from "@/components/wedding-templates/_shared/GalleryLightbox";
import type { Palette } from "../theme";
import { BODY, cssImage } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
  /** Images already used as full-bleed breaks elsewhere on the page. */
  skip: number;
}

const frameNo = (n: number) => `${String(n).padStart(2, "0")}A`;

/** A contact sheet: black-and-white frames on the ink, each numbered like a negative strip. Any frame opens under the loupe. */
export default function GallerySection({ config, palette: p, index, skip }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  // The full-bleed break takes the first photo, so it's dropped from whichever album holds it.
  const breakUrl = skip ? config.galleryImageUrls[0] : undefined;
  const sources = galleryHasAlbums(config)
    ? galleryAlbumsOf(config)
    : [{ key: "all", label: "", urls: config.galleryImageUrls }];
  const breakAlbum = breakUrl ? sources.findIndex((a) => a.urls.includes(breakUrl)) : -1;
  const albums = sources
    .map((a, ai) => ({
      ...a,
      images: a.urls.filter((u, ui) => !(ai === breakAlbum && ui === a.urls.indexOf(u) && u === breakUrl)).filter((u) => Boolean(cssImage(u))),
    }))
    .filter((a) => a.images.length > 0);
  if (albums.length === 0) return null;
  const photos: LightboxPhoto[] = albums.flatMap((a) => a.images.map((src) => ({ src, album: a.label, alt: "" })));
  photos.forEach((ph, i) => (ph.alt = `${ph.album ? `${ph.album}, ` : ""}gallery photo ${i + 1} of ${config.partner1Name} and ${config.partner2Name}`));
  let frame = 0;

  return (
    <section id="gallery" aria-labelledby="mc-gallery-title" style={{ background: p.ink, padding: "6rem 1rem", textAlign: "center" }}>
      <SectionHeading id="mc-gallery-title" index={index} eyebrow="Contact sheet" title="Frames" color="#fff" muted="rgba(255,255,255,.55)" />
      {albums.map((album) => (
        <div key={album.key} style={{ margin: "0 auto 3.5rem", maxWidth: 960 }}>
          {album.label && (
            <h3 style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", margin: "0 0 1.5rem", borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: "1.25rem" }}>
              {album.label}
            </h3>
          )}
          <ul className="mx-auto grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {album.images.map((src) => {
              const at = frame++;
              return (
                <li key={at}>
                  <button
                    type="button"
                    onClick={() => setOpen(at)}
                    aria-haspopup="dialog"
                    aria-label={`Enlarge ${photos[at].alt}`}
                    className="group block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-[6px]"
                    style={{ padding: 0, border: 0, background: p.charcoal, cursor: "zoom-in", aspectRatio: "4 / 5", outline: "1px solid rgba(255,255,255,.12)", outlineOffset: 4 }}
                  >
                    <span
                      aria-hidden
                      className="block size-full transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      style={{ backgroundImage: cssImage(src), backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(1)" }}
                    />
                  </button>
                  <p aria-hidden style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(255,255,255,.5)", margin: "0.7rem 4px 0" }}>
                    <span>{frameNo(at + 1)}</span>
                    <span>▸</span>
                  </p>
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
        theme={{ backdrop: "rgba(8,8,8,.97)", text: "#fff", accent: "#fff", font: BODY, controlRing: "rgba(255,255,255,.25)" }}
        imageFilter="grayscale(1)"
        windowStyle={{ background: p.charcoal }}
        reserve={{ y: "15rem" }}
        renderFrame={(photo, { photo: current, index: i }) => (
          <>
            {/* One frame pulled from the sheet: a thin white border with the sheet's hairline standing off it. */}
            <div style={{ padding: "clamp(6px, 0.9vw, 10px)", background: "#fff", outline: "1px solid rgba(255,255,255,.22)", outlineOffset: 8, boxShadow: "0 40px 80px -30px rgba(0,0,0,.9)" }}>{photo}</div>
            <figcaption className="mt-6 flex w-full justify-between gap-6" style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>
              <span>{frameNo(i + 1)}</span>
              <span>{current.album || `${config.partner1Name} & ${config.partner2Name}`}</span>
              <span aria-hidden>▸</span>
            </figcaption>
          </>
        )}
      />
    </section>
  );
}
