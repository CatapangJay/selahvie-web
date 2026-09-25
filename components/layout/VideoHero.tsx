"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useHydrated } from "@/lib/useHydrated";

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
// Background hero clip. Using a known-stable CC0 sample so the mechanism is
// verifiable end-to-end; swap this for your own hosted wedding footage
// (mp4 / h.264, muted, ~10–20s loop). The poster below renders regardless.
const HERO_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
const HERO_POSTER = "https://picsum.photos/seed/selahvie-hero-cinematic/1920/1080";

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
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pb-40 pt-32 text-center">
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

      {/* Content (z-10) */}
      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="animate-fade-rise max-w-5xl font-normal"
          style={{
            fontFamily: "'Instrument Serif', 'Fraunces', serif",
            fontSize: "clamp(2.75rem, 8vw, 6rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            color: "#FDF8F7",
            textWrap: "balance",
          }}
        >
          Your wedding website,{" "}
          <em className="not-italic" style={{ color: "var(--gold)" }}>
            beautifully made simple.
          </em>
        </h1>

        <p
          className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: "rgba(253,248,247,0.82)", fontWeight: 300 }}
        >
          A wedding website you&apos;ll be proud to share — invitations, your love story, and
          RSVPs, gathered in one calm, beautiful place. Personalize it in minutes.
        </p>

        <div className="animate-fade-rise-delay-2 mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/templates"
            className="liquid-glass inline-flex min-h-[56px] items-center rounded-full px-12 py-4 text-base"
            style={{ color: "#FDF8F7" }}
          >
            Find your template
          </Link>
          <Link
            href="/wedding/demo"
            className="inline-flex min-h-[56px] items-center rounded-full px-8 py-4 text-base transition-colors"
            style={{ color: "rgba(253,248,247,0.85)" }}
          >
            View a live demo →
          </Link>
        </div>
      </div>
    </section>
  );
}
