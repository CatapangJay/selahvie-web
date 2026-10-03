import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import type { Palette } from "../theme";
import { SECTION_PAD, feltStyle } from "../theme";
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

  return (
    <section id="gallery" aria-labelledby="jt-gallery-title" style={{ ...feltStyle(p.teal, p.tealDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "70rem" }}>
        <SectionHeading id="jt-gallery-title" eyebrow="Moments" title="The Gallery" palette={p} tone="dark" />

        <ul className="grid grid-cols-2 items-start md:grid-cols-3" style={{ gap: "clamp(1.25rem, 4vw, 3rem)" }}>
          {images.map((url, i) => (
            <Reveal as="li" key={`${url}-${i}`} index={i % 3} className={i % 3 === 1 ? "md:mt-12" : ""}>
              <div className="group">
                <GiltFrame palette={p} shape={SHAPES[i % SHAPES.length]} ratio="4 / 5">
                  <Image
                    src={url}
                    alt={`${config.partner1Name} and ${config.partner2Name}, photograph ${i + 1}`}
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
    </section>
  );
}
