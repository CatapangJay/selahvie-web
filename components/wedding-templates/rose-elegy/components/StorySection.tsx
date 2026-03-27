import Image from "next/image";
import { Heart } from "lucide-react";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

export default function StorySection({ config, accent }: Props) {
  if (!config.coupleStory) return null;

  return (
    <section className="py-24" style={{ background: "var(--color-surface-container-low)" }}>
      <div className="mx-auto max-w-4xl px-6">
        <SectionLabel
          eyebrow="Our Story"
          title={`${config.partner1Name} & ${config.partner2Name}`}
        />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
          {/* Story text */}
          <div>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.85 }}
            >
              {config.coupleStory}
            </p>
          </div>

          {/* First gallery image or decorative fallback */}
          {config.galleryImageUrls?.[0] ? (
            <div
              className="relative overflow-hidden shadow-ambient"
              style={{ borderRadius: "var(--radius-xl)", aspectRatio: "3/4" }}
            >
              <Image
                src={config.galleryImageUrls[0]}
                alt="The couple"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                aspectRatio: "3/4",
                borderRadius: "var(--radius-xl)",
                background: `${accent}20`,
              }}
            >
              <Heart size={64} fill={accent} stroke="none" style={{ color: accent, opacity: 0.4 }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
