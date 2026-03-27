import Image from "next/image";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
}

export default function GallerySection({ config, primary }: Props) {
  const images = config.galleryImageUrls?.filter(Boolean) ?? [];
  if (images.length === 0) return null;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel eyebrow="Our Album" title="Gallery" />

        {/* Asymmetric masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative overflow-hidden group shadow-ambient"
              style={{
                aspectRatio: i % 5 === 0 ? "3/4" : i % 3 === 0 ? "4/3" : "1/1",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <Image
                src={url}
                alt={`Gallery ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Colour-tinted hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `${primary}20` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
