"use client";

import { useState } from "react";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import GalleryLightbox, { type LightboxPhoto } from "@/components/wedding-templates/_shared/GalleryLightbox";
import type { Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, feltStyle, giltStyle } from "../theme";
import SectionHeading from "./SectionHeading";
import GiltFrame from "./GiltFrame";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const SHAPES = ["rect", "oval", "rect", "arch", "oval", "rect"] as const;

/** Photographs hung like old-master portraits: oval, arched and rectangular gilt frames. Any portrait can be taken down for a closer look. */
export default function GallerySection({ config, palette: p }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const images = config.galleryImageUrls?.filter(Boolean) ?? [];
  if (images.length === 0) return null;
  const albums = galleryHasAlbums(config) ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: images }];
  const altFor = (album: string, i: number) => `${config.partner1Name} and ${config.partner2Name}${album ? `, ${album.toLowerCase()}` : ""}, photograph ${i + 1}`;
  // Every portrait in page order, so the viewer walks the whole gallery.
  const photos: LightboxPhoto[] = albums.flatMap((a) => a.urls.map((src, i) => ({ src, album: a.label, alt: altFor(a.label, i) })));
  let n = 0;

  return (
    <section id="gallery" aria-labelledby="jt-gallery-title" style={{ ...feltStyle(p.teal, p.tealDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "70rem" }}>
        <SectionHeading id="jt-gallery-title" eyebrow="Moments" title="The Gallery" palette={p} tone="dark" />

        {albums.map((album, ai) => (
          <div key={album.key} style={ai > 0 ? { marginTop: "clamp(3rem, 7vw, 5rem)" } : undefined}>
            {album.label && (
              <h3
                className="text-center"
                style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: "clamp(2rem, 5vw, 2.8rem)", lineHeight: 1.15, color: p.goldLight, marginBottom: "clamp(1.5rem, 4vw, 2.5rem)" }}
              >
                {album.label}
              </h3>
            )}
            <ul className="grid grid-cols-2 items-start md:grid-cols-3" style={{ gap: "clamp(1.25rem, 4vw, 3rem)" }}>
              {album.urls.map((url, i) => {
                const at = n++;
                return (
                  <Reveal as="li" key={`${url}-${i}`} index={i % 3} className={i % 3 === 1 ? "md:mt-12" : ""}>
                    <button
                      type="button"
                      onClick={() => setOpen(at)}
                      aria-haspopup="dialog"
                      aria-label={`Enlarge ${altFor(album.label, i)}`}
                      className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4"
                      style={{ padding: 0, border: 0, background: "none", cursor: "zoom-in", outlineColor: p.goldLight }}
                    >
                      <GiltFrame palette={p} shape={SHAPES[i % SHAPES.length]} ratio="4 / 5">
                        <Image
                          src={url}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 46vw, 340px"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      </GiltFrame>
                    </button>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <GalleryLightbox
        photos={photos}
        index={open}
        onIndex={setOpen}
        theme={{ backdrop: { ...feltStyle(p.tealDeep, p.tealDeep), backgroundColor: p.tealDeep }, text: p.cream, accent: p.goldLight, font: SERIF }}
        windowRadius="2px"
        windowStyle={{ background: p.tealDeep, boxShadow: "inset 0 0 18px rgba(0,0,0,.45)" }}
        reserve={{ x: "4.5rem", y: "15rem" }}
        renderFrame={(photo, { photo: current }) => (
          <>
            {/* A gilt frame with a bevelled lip, as on the gallery wall. */}
            <div
              style={{
                ...giltStyle(p),
                padding: "clamp(0.7rem, 1.6vw, 1.1rem)",
                borderRadius: 4,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,.45), inset 0 0 0 5px rgba(90,60,10,.2), 0 40px 80px -30px rgba(0,0,0,.75), 0 6px 14px rgba(0,0,0,.3)",
              }}
            >
              <div style={{ padding: 3, background: p.goldDeep, borderRadius: 2 }}>{photo}</div>
            </div>
            <figcaption className="mt-4 text-center" style={{ fontFamily: SCRIPT, fontSize: "clamp(1.6rem, 4vw, 2rem)", lineHeight: 1.1, color: p.goldLight }}>
              {config.partner1Name} &amp; {config.partner2Name}
              {current.album && <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: "1rem", color: p.cream, marginTop: 4 }}>{current.album}</span>}
            </figcaption>
          </>
        )}
      />
    </section>
  );
}
