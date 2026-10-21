import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { cssImage } from "../theme";
import { SECTION_PAD, SectionTitle, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

// Alternate arch, round and soft-square windows so the grid reads like a row of garden doors.
const SHAPES = ["999px 999px 1rem 1rem", "1.25rem", "999px", "1rem 1rem 999px 999px"];

export default function GallerySection({ config, palette: p, band }: Props) {
  const images = config.galleryImageUrls.map(cssImage).filter((u): u is string => Boolean(u));
  if (images.length === 0) return null;

  return (
    <section aria-labelledby="ah-gallery-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <SectionTitle id="ah-gallery-title" eyebrow="A few favourites" title="Through the window" band={band} palette={p} />
      <ul className="mx-auto grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" style={{ maxWidth: 900, listStyle: "none", padding: 0, margin: "0 auto" }}>
        {images.map((image, i) => (
          <li key={i} style={{ marginTop: i % 2 === 1 ? "1.5rem" : 0 }}>
            <div
              role="img"
              aria-label={`Photo ${i + 1} of ${config.partner1Name} and ${config.partner2Name}`}
              style={{
                aspectRatio: SHAPES[i % SHAPES.length] === "999px" ? "1" : "3 / 4",
                borderRadius: SHAPES[i % SHAPES.length],
                backgroundImage: image,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: p.apricotSoft,
                boxShadow: `0 0 0 4px color-mix(in srgb, ${p.morning} ${band.dark ? 22 : 100}%, transparent)`,
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
