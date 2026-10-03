import Image from "next/image";
import { templates } from "@/data/templates";
import TemplateGrid from "@/components/templates/TemplateGrid";
import FloralSprig from "@/components/ui/FloralSprig";
import { weddingImages } from "@/lib/weddingImages";


export const metadata = {
  title: "Wedding website templates — Selah Vie",
  description: "Browse our curated collection of beautiful, customizable wedding website templates.",
};

export default function TemplatesPage() {
  return (
    <div>
      {/* Header band — wedding image + bordeaux wash, curved bottom sweep */}
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden text-center"
        style={{
          minHeight: "clamp(340px, 46vw, 520px)",
          // Extra bottom padding so the arced sweep doesn't visually pull the
          // centered content low — content stays optically centered in the band.
          paddingTop: "clamp(6rem, 12vw, 9rem)",
          paddingBottom: "clamp(6rem, 12vw, 9rem)",
        }}
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0" aria-hidden>
          <Image
            src={weddingImages.ceremony}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Bordeaux wash for contrast + brand tone */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(61,18,28,0.82) 0%, rgba(61,18,28,0.74) 55%, rgba(61,18,28,0.9) 100%)" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <FloralSprig size={40} color="var(--gold)" className="mx-auto" />
          <h1
            className="mt-6"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              fontWeight: 400,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#FDF8F7",
            }}
          >
            The Collection
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed sm:text-base" style={{ color: "rgba(253,248,247,0.85)" }}>
            Every design is a carefully curated starting point — each one yours to personalize
            completely. Find the one that feels like you.
          </p>
        </div>

        {/* Curved cream sweep into the body */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10" style={{ height: "clamp(40px, 6vw, 80px)" }} aria-hidden>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-full w-full" style={{ display: "block" }}>
            <path d="M0,100 L0,55 C360,-6 1080,-6 1440,55 L1440,100 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </div>

      {/* Grid / alternating rows */}
      <div
        className="mx-auto max-w-6xl px-6"
        style={{ paddingTop: "clamp(2rem, 5vw, 4rem)", paddingBottom: "var(--spacing-section-xl)" }}
      >
        <TemplateGrid templates={templates} />
      </div>
    </div>
  );
}
