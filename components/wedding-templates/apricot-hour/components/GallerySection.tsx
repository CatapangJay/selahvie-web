import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { DISPLAY, cssImage } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

// Alternate arch, round and soft-square windows so the grid reads like a row of garden doors.
const SHAPES = ["999px 999px 1rem 1rem", "1.25rem", "999px", "1rem 1rem 999px 999px"];

export default function GallerySection({ config, palette: p, band }: Props) {
  const t = tones(band, p);
  const sources = galleryHasAlbums(config) ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: config.galleryImageUrls }];
  const albums = sources
    .map((a) => ({ ...a, images: a.urls.map(cssImage).filter((u): u is string => Boolean(u)) }))
    .filter((a) => a.images.length > 0);
  if (albums.length === 0) return null;
  let frame = 0;

  return (
    <section id="gallery" aria-labelledby="ah-gallery-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <SectionTitle id="ah-gallery-title" eyebrow="A few favourites" title="Through the window" band={band} palette={p} />
      {albums.map((album) => (
        <div key={album.key} style={{ maxWidth: 900, margin: "0 auto 3rem" }}>
          {album.label && (
            <h3 style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: "1.7rem", textAlign: "center", color: t.text, margin: "0 0 1.5rem" }}>{album.label}</h3>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {album.images.map((image, i) => {
              const n = ++frame;
              return (
                <li key={n} style={{ marginTop: i % 2 === 1 ? "1.5rem" : 0 }}>
                  <div
                    role="img"
                    aria-label={`${album.label ? `${album.label}, photo` : "Photo"} ${i + 1} of ${config.partner1Name} and ${config.partner2Name}`}
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
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
