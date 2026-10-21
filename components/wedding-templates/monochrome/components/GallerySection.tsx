import type { WeddingConfig } from "@/types/wedding";
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

/** A contact sheet: black-and-white frames on the ink, each numbered like a negative strip. */
export default function GallerySection({ config, palette: p, index, skip }: Props) {
  const images = config.galleryImageUrls.slice(skip).map(cssImage).filter((u): u is string => Boolean(u));
  if (images.length === 0) return null;

  return (
    <section aria-labelledby="mc-gallery-title" style={{ background: p.ink, padding: "6rem 1rem", textAlign: "center" }}>
      <SectionHeading id="mc-gallery-title" index={index} eyebrow="Contact sheet" title="Frames" color="#fff" muted="rgba(255,255,255,.55)" />
      <ul className="mx-auto grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3" style={{ maxWidth: 960, listStyle: "none", padding: 0, margin: "0 auto" }}>
        {images.map((image, i) => (
          <li key={i}>
            <div
              role="img"
              aria-label={`Gallery photo ${i + 1}`}
              style={{ aspectRatio: "4 / 5", backgroundImage: image, backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(1)", outline: "1px solid rgba(255,255,255,.12)", outlineOffset: 4 }}
            />
            <p aria-hidden style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(255,255,255,.5)", margin: "0.7rem 4px 0" }}>
              <span>{String(i + 1).padStart(2, "0")}A</span>
              <span>▸</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
