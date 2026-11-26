"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { screensFor } from "@/lib/templateScreens";
import { formatPrice } from "@/lib/utils";
import type { WeddingTemplate } from "@/types/template";

const ADVANCE_MS = 5500;
/** How long the centred slide shows its intro before its invitation opens. */
const OPEN_AFTER_MS = 1100;

/**
 * Every template, one at a time: the centred slide shows the intro guests meet
 * first, then "opens" to the site behind it; its neighbours wait smaller and
 * softer either side. Advances on its own, pausing on hover, focus, when it's
 * off screen, with its pause button, and never under reduced motion.
 */
export default function TemplateCarousel({ templates }: { templates: WeddingTemplate[] }) {
  const slides = templates.flatMap((t) => {
    const s = screensFor(t.id);
    return s ? [{ t, s }] : [];
  });
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduce, setReduce] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragX = useRef<number | null>(null);

  const go = (next: number) => {
    setOpened(false);
    setIndex(((next % count) + count) % count);
  };

  // Reduced motion: no auto-advance and no opening crossfade (the opened site shows).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Only run while the carousel is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The centred slide opens its invitation a beat after it arrives.
  useEffect(() => {
    if (reduce || !visible) return;
    const t = window.setTimeout(() => setOpened(true), OPEN_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [index, reduce, visible]);

  const running = playing && !hovered && visible && !reduce && count > 1;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(index + 1), ADVANCE_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go is stable in effect; index drives the timer
  }, [running, index]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  };
  const onPointerDown = (e: PointerEvent) => { dragX.current = e.clientX; };
  const onPointerUp = (e: PointerEvent) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  if (count === 0) return null;
  const current = slides[index].t;
  const showOpened = opened || reduce;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Wedding website templates"
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false);
      }}
      onKeyDown={onKey}
    >
      {/* Stage: slides 68% wide on desktop (80% on phones), the active one centred */}
      <div className="overflow-hidden py-4" onPointerDown={onPointerDown} onPointerUp={onPointerUp} style={{ touchAction: "pan-y" }}>
        <div className="tc-track relative">
          {/* Sizes the stage: an invisible copy of one slide's frame. */}
          <div aria-hidden className="invisible mx-auto" style={{ width: "var(--tc-w)" }}>
            <div className="hidden aspect-[1200/700] sm:block" />
            <div className="aspect-[390/700] sm:hidden" />
          </div>
          {slides.map(({ t, s }, i) => {
            const active = i === index;
            // Offset from the centre, wrapped so the loop never runs out of neighbours.
            const half = Math.floor(count / 2);
            const o = ((i - index + count + half) % count) - half;
            const near = Math.abs(o) <= 1;
            return (
              <div
                key={t.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${t.name}`}
                aria-hidden={!active}
                inert={!active}
                className="tc-slide"
                style={{
                  ["--o" as string]: o,
                  ["--s" as string]: active ? 1 : 0.86,
                  opacity: active ? 1 : near ? 0.55 : 0,
                  zIndex: active ? 2 : near ? 1 : 0,
                  cursor: active ? undefined : "pointer",
                }}
                onClick={() => !active && near && go(i)}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ borderRadius: "var(--radius-lg)", boxShadow: active ? "0 30px 60px -28px rgba(47,30,38,0.45)" : "none", background: "var(--color-surface-container)" }}
                >
                  {/* Desktop screens (landscape) */}
                  <div className={`screen-swap relative hidden aspect-[1200/700] sm:block ${active && showOpened ? "is-open" : ""}`}>
                    <Image src={s.intro} alt="" fill loading={near ? "eager" : "lazy"} className="object-cover object-top" sizes="(max-width: 1024px) 70vw, 760px" />
                    <Image src={s.home} alt={`${t.name}: the opened wedding website`} fill loading={near ? "eager" : "lazy"} className="screen-after object-cover object-top" sizes="(max-width: 1024px) 70vw, 760px" />
                  </div>
                  {/* Phone screens (portrait) */}
                  <div className="relative aspect-[390/700] sm:hidden">
                    <Image src={s.phone} alt={`${t.name} on a phone`} fill loading={near ? "eager" : "lazy"} className="object-cover object-top" sizes="80vw" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The centred template's details */}
      <div className="mx-auto mt-6 flex max-w-xl flex-col items-center text-center" aria-live="polite">
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 2.6vw, 2rem)", letterSpacing: "0.04em", color: "var(--color-on-surface)" }}>
          {current.name}
        </p>
        <p className="label-luxury mt-1" style={{ color: "var(--color-primary)" }}>
          {current.tags.join(" · ")} · {formatPrice(current.price)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href={`/preview/${current.id}`}
            className="btn-primary label-luxury inline-flex min-h-[44px] items-center px-6"
            style={{ borderRadius: "var(--radius-full)", color: "#fff", letterSpacing: "0.12em" }}
          >
            Preview {current.name}
          </Link>
          <Link
            href={`/templates/${current.id}`}
            className="btn-outline label-luxury inline-flex min-h-[44px] items-center px-6"
            style={{ borderRadius: "var(--radius-full)", letterSpacing: "0.12em" }}
          >
            Details
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <RoundButton label="Previous template" onClick={() => go(index - 1)}>
          <ChevronLeft size={18} aria-hidden />
        </RoundButton>
        <div className="flex items-center" role="group" aria-label="Choose a template">
          {slides.map(({ t }, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Show ${t.name}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
              className="flex h-11 w-7 items-center justify-center"
            >
              <span
                aria-hidden
                className="block h-1.5 rounded-full transition-[width,background-color] duration-300"
                style={{ width: i === index ? 22 : 7, background: i === index ? "var(--color-primary)" : "var(--color-outline)" }}
              />
            </button>
          ))}
        </div>
        <RoundButton label="Next template" onClick={() => go(index + 1)}>
          <ChevronRight size={18} aria-hidden />
        </RoundButton>
        {!reduce && (
          <RoundButton label={playing ? "Pause the slideshow" : "Play the slideshow"} onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
          </RoundButton>
        )}
      </div>
    </div>
  );
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="btn-outline flex h-11 w-11 items-center justify-center"
      style={{ borderRadius: "var(--radius-full)" }}
    >
      {children}
    </button>
  );
}
