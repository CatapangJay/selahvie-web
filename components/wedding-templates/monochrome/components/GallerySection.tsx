import type { WeddingConfig } from "@/types/wedding";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
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
  // The full-bleed break takes the first photo, so it's dropped from whichever album holds it.
  const breakUrl = skip ? config.galleryImageUrls[0] : undefined;
  const sources = galleryHasAlbums(config)
    ? galleryAlbumsOf(config)
    : [{ key: "all", label: "", urls: config.galleryImageUrls }];
  const breakAlbum = breakUrl ? sources.findIndex((a) => a.urls.includes(breakUrl)) : -1;
  const albums = sources
    .map((a, ai) => ({
      ...a,
      images: a.urls
        .filter((u, ui) => !(ai === breakAlbum && ui === a.urls.indexOf(u) && u === breakUrl))
        .map(cssImage)
        .filter((u): u is string => Boolean(u)),
    }))
    .filter((a) => a.images.length > 0);
  if (albums.length === 0) return null;
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
            {album.images.map((image) => {
              const n = ++frame;
              return (
                <li key={n}>
                  <div
                    role="img"
                    aria-label={`${album.label ? `${album.label}, ` : ""}gallery photo ${n}`}
                    style={{ aspectRatio: "4 / 5", backgroundImage: image, backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(1)", outline: "1px solid rgba(255,255,255,.12)", outlineOffset: 4 }}
                  />
                  <p aria-hidden style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(255,255,255,.5)", margin: "0.7rem 4px 0" }}>
                    <span>{String(n).padStart(2, "0")}A</span>
                    <span>▸</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
