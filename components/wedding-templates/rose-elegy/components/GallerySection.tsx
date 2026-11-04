import Image from "next/image";
import SectionLabel from "./SectionLabel";
import { galleryAlbumsOf, galleryHasAlbums } from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
}

export default function GallerySection({ config, primary }: Props) {
  const albums = galleryAlbumsOf(config);
  if (albums.length === 0) return null;
  const grouped = galleryHasAlbums(config);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel eyebrow="Our Album" title="Gallery" />

        <div className="space-y-16">
          {albums.map((album) => (
            <div key={album.key}>
              {grouped && (
                <h3 className="headline-sm mb-6 text-center" style={{ color: "var(--color-on-surface)" }}>
                  {album.label}
                </h3>
              )}
              {/* Asymmetric masonry-style grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {album.urls.filter(Boolean).map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="relative overflow-hidden group shadow-ambient"
                    style={{
                      aspectRatio: i % 5 === 0 ? "3/4" : i % 3 === 0 ? "4/3" : "1/1",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <Image
                      src={url}
                      alt={grouped ? `${album.label} photo ${i + 1}` : `Gallery ${i + 1}`}
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
          ))}
        </div>
      </div>
    </section>
  );
}
