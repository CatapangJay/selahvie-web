"use client";

import { useState } from "react";
import type { WeddingConfig } from "@/types/wedding";
import GalleryLightbox, { type LightboxPhoto } from "@/components/wedding-templates/_shared/GalleryLightbox";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { MONO, cssImage, darkroomStyle, stampText } from "../theme";
import { SectionHeading } from "./Motion";
import PhotoStrip from "./PhotoStrip";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  imprint: string;
}

const PER_STRIP = 3;
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5];

/** Balance the strips so the last one is never a lone frame (4 photos → 2 + 2, 7 → 3 + 2 + 2). */
function cutStrips(images: string[]): string[][] {
  const strips: string[][] = [];
  const stripCount = Math.ceil(images.length / PER_STRIP);
  const base = Math.floor(images.length / stripCount);
  const extra = images.length % stripCount;
  for (let s = 0, i = 0; s < stripCount; s++) {
    const size = base + (s < extra ? 1 : 0);
    strips.push(images.slice(i, i + size));
    i += size;
  }
  return strips;
}

/**
 * Prints hung on the darkroom line: the gallery is cut into booth strips of
 * three, clipped to a string, and each frame develops as it scrolls into view.
 * Sorted albums each get their own line, labelled like a lab tag.
 */
export default function GallerySection({ config, palette: p, imprint }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const hasAlbums = galleryHasAlbums(config);
  const groups = (hasAlbums ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls ?? [] }])
    .map((g) => ({ ...g, strips: cutStrips(g.urls.filter((u) => Boolean(cssImage(u)))) }))
    .filter((g) => g.strips[0]?.length);
  if (groups.length === 0) return null;
  // Every print in page order, strip by strip, so the viewer walks the whole line.
  const photos: LightboxPhoto[] = groups.flatMap((g) =>
    g.strips.flatMap((frames, si) => frames.map((src, fi) => ({ src, album: g.label, alt: `${g.label ? `${g.label}, ` : ""}gallery strip ${si + 1}, photo ${fi + 1} of ${config.partner1Name} and ${config.partner2Name}` }))),
  );
  // Where each strip's first print sits in that list.
  const starts = groups.map((g, gi) => {
    const before = groups.slice(0, gi).reduce((sum, prev) => sum + prev.strips.flat().length, 0);
    return g.strips.map((_, si) => before + g.strips.slice(0, si).flat().length);
  });

  return (
    <section aria-labelledby="ss-gallery-title" style={{ ...darkroomStyle(p), padding: "5.5rem 1rem 6rem" }}>
      <SectionHeading id="ss-gallery-title" caption="Fresh from the tray" title="Contact |Prints" color={p.print} accent={p.stamp} />
      {groups.map((group, gi) => (
        <div key={group.key} style={{ maxWidth: 900, margin: "0 auto" }}>
          {group.label && (
            <h3 style={{ ...stampText(p), textShadow: "none", fontSize: 14, letterSpacing: "0.26em", textTransform: "uppercase", textAlign: "center", margin: "2.5rem 0 0" }}>
              Roll · {group.label}
            </h3>
          )}
          <ul aria-label={group.label || "Gallery"} style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2.75rem clamp(1rem, 5vw, 2.5rem)", listStyle: "none", padding: "1.5rem 0 0", margin: "0 auto" }}>
            {group.strips.map((frames, si) => {
              const first = starts[gi][si];
              return (
              <li key={si} style={{ position: "relative", paddingTop: 18 }}>
                {/* Drying-line clip */}
                <span aria-hidden style={{ position: "absolute", top: 0, left: "50%", width: 16, height: 26, marginLeft: -8, borderRadius: 3, background: "#C9A27C", boxShadow: "inset 0 -3px 0 rgba(0,0,0,.25)", zIndex: 1 }} />
                <PhotoStrip
                  palette={p}
                  frames={frames.map(cssImage)}
                  onFrame={(fi) => setOpen(first + fi)}
                  inView
                  stagger={0.25}
                  width="clamp(130px, 38vw, 200px)"
                  labelPrefix={`${group.label ? `${group.label}, ` : ""}Gallery strip ${si + 1}, photo`}
                  style={{ transform: `rotate(${TILTS[si % TILTS.length]}deg)` }}
                  caption={
                    <span style={{ ...stampText(p), color: p.film, textShadow: "none", fontSize: 11 }}>
                      {imprint || <span style={{ fontFamily: MONO }}>No. {String(si + 1).padStart(2, "0")}</span>}
                    </span>
                  }
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
        theme={{ backdrop: { ...darkroomStyle(p), backgroundColor: p.inkDeep }, text: p.print, accent: p.stamp, font: MONO }}
        windowStyle={{ background: "#5A4B3E" }}
        reserve={{ y: "17rem" }}
        renderFrame={(photo, { index: i, count }) => (
          // One print cut from the strip: bright white border, a deeper foot with the typed imprint.
          <div style={{ background: p.print, padding: "clamp(10px, 1.6vw, 16px) clamp(10px, 1.6vw, 16px) 0", boxShadow: "0 1px 0 rgba(0,0,0,.05), 0 40px 70px -30px rgba(0,0,0,.85)", transform: "rotate(-0.8deg)" }}>
            {photo}
            <figcaption className="flex items-center justify-between gap-4" style={{ minHeight: "3.2rem", padding: "0.6rem 0.2rem" }}>
              <span style={{ ...stampText(p), textShadow: "none", fontSize: 12, color: p.film }}>{imprint || `${config.partner1Name} & ${config.partner2Name}`}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: p.film }}>
                No. {String(i + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
              </span>
            </figcaption>
          </div>
        )}
      />
    </section>
  );
}
