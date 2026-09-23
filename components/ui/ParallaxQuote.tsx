"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";

/**
 * Full-bleed editorial quote with a scroll-linked parallax background: the image
 * translates slower than the page as the section scrolls through the viewport.
 * Reduced-motion users get a static background (no scroll-linked transform).
 * The image is over-sized (top/bottom bleed) so the parallax shift never exposes
 * an edge.
 */
export default function ParallaxQuote() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Image drifts from -12% to +12% across the section's scroll span.
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      className="overflow-hidden"
      style={{ position: "relative", minHeight: "clamp(380px, 56vw, 660px)" }}
    >
      {/* Parallax media layer — taller than the section to allow drift */}
      <motion.div
        className="absolute inset-x-0"
        style={{
          top: "-12%",
          height: "124%",
          y: reduce ? 0 : y,
          willChange: "transform",
        }}
        aria-hidden
      >
        <Image
          src="https://picsum.photos/seed/selahvie-ceremony/1920/1200"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Scrim for text contrast */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(47,20,30,0.38) 0%, rgba(61,18,28,0.74) 100%)" }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[inherit] max-w-3xl flex-col items-center justify-center gap-8 px-6 py-28 text-center">
        <Reveal>
          <p
            className="font-serif"
            style={{
              fontFamily: "'Instrument Serif', 'Fraunces', serif",
              fontSize: "clamp(1.9rem, 4.5vw, 3.5rem)",
              fontStyle: "italic",
              color: "#FDF8F7",
              lineHeight: 1.25,
              textWrap: "balance",
            }}
          >
            Every love story deserves a page as beautiful as the day itself.
          </p>
        </Reveal>
        <Reveal index={1}>
          <Link
            href="/templates"
            className="liquid-glass inline-flex min-h-[52px] items-center rounded-full px-10 py-3.5 text-base"
            style={{ color: "#FDF8F7" }}
          >
            Begin your story
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
