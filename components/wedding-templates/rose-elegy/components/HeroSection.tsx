import Image from "next/image";
import { Heart, MapPin, Sparkles } from "lucide-react";
import Countdown from "./Countdown";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  weddingDateFormatted: string;
}

export default function HeroSection({ config, primary, accent, weddingDateFormatted }: Props) {
  const hasImage = !!config.heroImageUrl;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      {/* ── Background ── */}
      {hasImage ? (
        <div className="absolute inset-0">
          <Image
            src={config.heroImageUrl}
            alt="Wedding hero"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(28,20,20,0.1) 0%, rgba(28,20,20,0.5) 60%, rgba(28,20,20,0.75) 100%)",
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${primary}18 0%, ${accent}30 50%, ${primary}18 100%)`,
          }}
        />
      )}

      {/* ── Decorative corner glows ── */}
      <div
        className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
        style={{ background: `radial-gradient(circle at top left, ${accent}20, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
        style={{ background: `radial-gradient(circle at bottom right, ${accent}20, transparent 70%)` }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 px-6 py-24 max-w-3xl">
        <p
          className="label-luxury mb-8 tracking-[0.25em]"
          style={{ color: hasImage ? "rgba(255,255,255,0.75)" : "var(--color-on-surface-variant)" }}
        >
          Together with their families
        </p>

        {/* Partner 1 */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3rem, 8vw, 6.5rem)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: hasImage ? "#fff" : "var(--color-on-surface)",
          }}
        >
          {config.partner1Name || "Partner One"}
        </h1>

        {/* Heart divider */}
        <div className="my-4 flex items-center justify-center gap-4">
          <div
            className="h-px flex-1 max-w-[6rem]"
            style={{ background: hasImage ? "rgba(255,255,255,0.3)" : `${accent}60` }}
          />
          <Heart
            size={28}
            fill={accent}
            stroke="none"
            style={{ color: accent, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))" }}
          />
          <div
            className="h-px flex-1 max-w-[6rem]"
            style={{ background: hasImage ? "rgba(255,255,255,0.3)" : `${accent}60` }}
          />
        </div>

        {/* Partner 2 */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3rem, 8vw, 6.5rem)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: hasImage ? "#fff" : "var(--color-on-surface)",
          }}
        >
          {config.partner2Name || "Partner Two"}
        </h1>

        {weddingDateFormatted && (
          <p
            className="mt-8 text-lg font-light"
            style={{ color: hasImage ? "rgba(255,255,255,0.9)" : "var(--color-on-surface-variant)" }}
          >
            {weddingDateFormatted}
          </p>
        )}

        {(config.venueName || config.venueCity) && (
          <p
            className="mt-2 flex items-center justify-center gap-1.5 text-sm"
            style={{ color: hasImage ? "rgba(255,255,255,0.65)" : "var(--color-on-surface-variant)" }}
          >
            <MapPin size={13} />
            {[config.venueName, config.venueCity].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Countdown */}
        {config.weddingDate && (
          <div className="mt-12">
            <p
              className="label-luxury mb-5"
              style={{ color: hasImage ? "rgba(255,255,255,0.5)" : "var(--color-on-surface-variant)" }}
            >
              Counting Down
            </p>
            <Countdown targetDate={config.weddingDate} />
          </div>
        )}

        {/* RSVP scroll CTA */}
        <a
          href="#rsvp"
          className="mt-14 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-all hover:scale-105"
          style={{
            background: hasImage ? "rgba(255,255,255,0.15)" : `${primary}18`,
            color: hasImage ? "#fff" : primary,
            border: `1px solid ${hasImage ? "rgba(255,255,255,0.25)" : `${primary}30`}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <Sparkles size={14} />
          RSVP Now
        </a>
      </div>

      {/* Scroll hint arrow */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ color: hasImage ? "rgba(255,255,255,0.4)" : "var(--color-outline)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 8l8 8 8-8" />
        </svg>
      </div>
    </section>
  );
}
