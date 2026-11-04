import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { SCRIPT, SECTION_PAD, feltStyle } from "../theme";
import SectionHeading from "./SectionHeading";
import GiltFrame from "./GiltFrame";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const SHAPES = ["rect", "oval", "rect", "arch", "oval", "rect"] as const;

/** Photographs hung like old-master portraits: oval, arched and rectangular gilt frames. */
export default function GallerySection({ config, palette: p }: Props) {
  const images = config.galleryImageUrls?.filter(Boolean) ?? [];
  if (images.length === 0) return null;
  const albums = galleryHasAlbums(config) ? galleryAlbumsOf(config) : [{ key: "all", label: "", urls: images }];

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
              {album.urls.map((url, i) => (
                <Reveal as="li" key={`${url}-${i}`} index={i % 3} className={i % 3 === 1 ? "md:mt-12" : ""}>
                  <div className="group">
                    <GiltFrame palette={p} shape={SHAPES[i % SHAPES.length]} ratio="4 / 5">
                      <Image
                        src={url}
                        alt={`${config.partner1Name} and ${config.partner2Name}${album.label ? `, ${album.label.toLowerCase()}` : ""}, photograph ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 46vw, 340px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </GiltFrame>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
