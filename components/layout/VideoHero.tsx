"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useHydrated } from "@/lib/useHydrated";
import { weddingImages } from "@/lib/weddingImages";

/**
 * Cinematic fullscreen hero: looping muted background video over a poster
 * image, glass CTA, and a fade-rise entrance — adapted to Selah Vie's
 * soft-romantic wedding brand.
 *
 * Robustness by design:
 * - The poster image ALWAYS renders and carries the hero; the video fades in
 *   only once it can actually play (`canplay`), so a failed/blocked/slow video
 *   never leaves a blank hero.
 * - Reduced-motion users never see the video autoplay — the still poster is the
 *   whole experience for them.
 * - A scrim over the media keeps the light headline ≥ contrast (DESIGN.md AA).
 *
 * Swap HERO_VIDEO_SRC for your own hosted wedding footage (mp4/h264, muted).
 */
// The hero is a still wedding photo (matching the reference). To use motion,
// drop a hosted wedding clip (mp4 / h.264, muted, ~10–20s loop) into
// HERO_VIDEO_SRC — the poster renders regardless, and the video fades in when
// ready. Left empty by default so we show a real wedding image, not stock video.
const HERO_VIDEO_SRC = "";
const HERO_POSTER = weddingImages.heroCouple;

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const hydrated = useHydrated();
  // The <video> is only rendered after mount so the server and first client
  // render match (neither has it) — no hydration mismatch. Then we also honor
  // the OS reduced-motion setting, checked at mount (client-only).
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const allowVideo = hydrated && !prefersReduced;

  // Nudge playback once the video is mounted; readiness flips via the
  // onCanPlay/onLoadedData props (which never miss the event).
  useEffect(() => {
    if (!allowVideo) return;
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
    // If the video is already buffered by the time we mount, reflect it now.
    if (el.readyState >= 3) setVideoReady(true);
  }, [allowVideo]);

  return (
    <section className="relative flex min-h-[94svh] flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-28 text-center">
      {/* Media layer (z-0): poster always; video fades in when playable */}
      <div className="absolute inset-0 z-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_POSTER}
          alt=""
          className="h-full w-full object-cover"
          style={{
            transform: videoReady ? "scale(1)" : "scale(1.05)",
            transition: "transform 8s ease-out",
          }}
        />
        {HERO_VIDEO_SRC && allowVideo && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
            style={{ opacity: videoReady ? 1 : 0 }}
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        )}
        {/* Scrim: bordeaux-tinted, top-lighter → bottom-darker for text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(47,20,30,0.45) 0%, rgba(47,20,30,0.35) 45%, rgba(61,18,28,0.78) 100%)",
          }}
        />
      </div>

      {/* Content (z-10) — vertically centered between the fixed nav and the bottom curve */}
      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="animate-fade-rise max-w-4xl"
          style={{
            fontFamily: "'Instrument Serif', 'Fraunces', serif",
            fontSize: "clamp(2.25rem, 6.5vw, 5rem)",
            fontWeight: 400,
            lineHeight: 1.04,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#FDF8F7",
            textWrap: "balance",
            textShadow: "0 2px 24px rgba(47,20,30,0.4)",
          }}
        >
          Your wedding invitation,
          <br />
          beautifully online
        </h1>

        <p
          className="animate-fade-rise-delay mt-6 max-w-xl text-sm leading-relaxed sm:text-base"
          style={{ color: "rgba(253,248,247,0.85)", fontWeight: 300 }}
        >
          Customizable wedding website templates with RSVPs built in — personalized in minutes.
        </p>

        <div className="animate-fade-rise-delay-2 mt-9">
          <Link
            href="/templates"
            className="inline-flex min-h-[52px] items-center rounded-full px-11 text-sm transition-all hover:scale-[1.03]"
            style={{
              background: "#FDF8F7",
              color: "var(--bordeaux)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 500,
              boxShadow: "0 8px 30px rgba(47,20,30,0.28)",
            }}
          >
            Get started
          </Link>
        </div>
      </div>

      {/* Curved transition into the cream body below — cream domes UP into the
          photo at the center (inverted arc, matching the reference). */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{ height: "clamp(56px, 8vw, 120px)" }}
        aria-hidden
      >
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-full w-full" style={{ display: "block" }}>
          <path d="M0,120 L0,70 C360,4 1080,4 1440,70 L1440,120 Z" fill="var(--color-surface)" />
        </svg>
      </div>
    </section>
  );
}
