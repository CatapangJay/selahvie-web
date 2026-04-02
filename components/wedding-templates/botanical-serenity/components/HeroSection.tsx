"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalOrnament from "./BotanicalOrnament";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  bg: string;
  textDeep: string;
}

/** Staggered word-by-word reveal */
function WordReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.3 + i * 0.1 }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function HeroSection({ config, green, floral, bg, textDeep }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  // Parallax: image drifts upward as user scrolls
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  // Magnetic CTA — values live outside render cycle
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-30, 30], [5, -5]);
  const rotY = useTransform(mx, [-30, 30], [-5, 5]);
  const tx = useTransform(mx, [-80, 80], [-6, 6]);
  const ty = useTransform(my, [-40, 40], [-4, 4]);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  const coupleName = `${config.partner1Name} & ${config.partner2Name}`;
  const heroPhoto =
    config.heroImageUrl || config.galleryImageUrls?.[0] || "/placeholder-hero.jpg";

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[55%_45%] overflow-hidden"
      style={{ background: bg }}
    >
      {/* ── Left panel ── */}
      <div className="relative z-10 flex flex-col justify-center pl-[8vw] pr-8 py-24 lg:py-0">
        {/* Botanical ornament — top-left flourish */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 -ml-3"
        >
          <BotanicalOrnament green={green} floral={floral} width={90} height={160} animationDelay={0.4} />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xs tracking-[0.22em] uppercase mb-5"
          style={{ color: floral }}
        >
          You are invited to celebrate
        </motion.p>

        {/* Main heading — word-stagger */}
        <h1
          className="text-[clamp(2.8rem,6.5vw,5.8rem)] leading-[1.05] font-light mb-8"
          style={{ color: textDeep, letterSpacing: "-0.02em" }}
        >
          <WordReveal text={coupleName} />
        </h1>

        {/* Date + venue sub-line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 1.0 }}
          className="text-sm tracking-widest uppercase mb-14"
          style={{ color: `${textDeep}90` }}
        >
          {config.weddingDate}
          {config.venueName && (
            <>
              <span className="mx-3" style={{ color: `${green}60` }}>
                &mdash;
              </span>
              {config.venueName}
            </>
          )}
        </motion.div>

        {/* Magnetic CTA */}
        <div style={{ perspective: "600px", display: "inline-block" }}>
          <motion.a
            href="#ceremony"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX: rotX,
              rotateY: rotY,
              x: tx,
              y: ty,
              color: bg,
              background: green,
              borderColor: green,
              borderRadius: "2px",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="inline-block px-9 py-4 text-sm tracking-[0.15em] uppercase border cursor-pointer select-none"
          >
            Explore Our Day
          </motion.a>
        </div>

        {/* Subtle horizontal rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: 0, background: `${green}30`, height: "1px", width: "160px", marginTop: "56px" }}
        />
      </div>

      {/* ── Right panel — full-height photo with parallax ── */}
      <div className="relative overflow-hidden min-h-[55vw] lg:min-h-0">
        <motion.div
          style={{ y: photoY }}
          className="absolute inset-[-8%] w-full h-[116%]"
        >
          <Image
            src={heroPhoto}
            alt={`${config.partner1Name} and ${config.partner2Name}`}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </motion.div>

        {/* Botanical ornament layered over photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="absolute bottom-10 right-8 pointer-events-none"
        >
          <BotanicalOrnament
            green="#ffffff"
            floral="#ffffff"
            width={60}
            height={110}
            animationDelay={2.0}
          />
        </motion.div>
      </div>
    </section>
  );
}
