"use client";

import GalleryLightbox, { type LightboxPhoto } from "@/components/wedding-templates/_shared/GalleryLightbox";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";

export type { LightboxPhoto };

interface Props {
  photos: LightboxPhoto[];
  index: number | null;
  onIndex: (index: number | null) => void;
  palette: Palette;
  couple: string;
}

/** An arch over the photo's own proportions: a true semicircle on portraits, flatter on wide shots. */
const archRadius = (ratio: number) => {
  const arch = (Math.min(ratio / 2, 0.42) * 100).toFixed(1);
  return `50% 50% 0.75rem 0.75rem / ${arch}% ${arch}% 0.75rem 0.75rem`;
};

/** The photo enlarged in a cream, arch-topped mat with a small sun rising behind its crown, on the night sky. */
export default function Lightbox({ photos, index, onIndex, palette: p, couple }: Props) {
  return (
    <GalleryLightbox
      photos={photos}
      index={index}
      onIndex={onIndex}
      theme={{ backdrop: `color-mix(in srgb, ${p.duskDeep} 97%, transparent)`, text: p.morning, accent: p.butter, font: SANS }}
      windowRadius={archRadius}
      windowStyle={{ background: p.apricotSoft, boxShadow: `0 0 0 1px color-mix(in srgb, ${p.apricot} 40%, transparent)` }}
      renderFrame={(photo, { photo: current, ratio }) => (
        <>
          <svg aria-hidden viewBox="0 0 200 200" className="absolute left-1/2 -translate-x-1/2" style={{ top: "-2.9rem", width: "7.5rem" }}>
            {Array.from({ length: 16 }, (_, i) => (
              <line key={i} x1="100" y1="8" x2="100" y2="34" stroke={p.apricot} strokeWidth="5" strokeLinecap="round" opacity=".75" transform={`rotate(${i * 22.5} 100 100)`} />
            ))}
            <circle cx="100" cy="100" r="54" fill={p.golden} />
          </svg>
          <div
            className="relative"
            style={{
              padding: "clamp(8px, 1.4vw, 16px)",
              background: p.morning,
              borderRadius: archRadius(ratio),
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.apricot} 55%, transparent), 0 40px 80px -30px rgba(0,0,0,.7)`,
            }}
          >
            {photo}
          </div>
          <figcaption className="mt-4 text-center" style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.15rem", color: p.morning }}>
            {couple}
            {current.album && <span style={{ color: p.butter }}> · {current.album}</span>}
          </figcaption>
        </>
      )}
    />
  );
}
