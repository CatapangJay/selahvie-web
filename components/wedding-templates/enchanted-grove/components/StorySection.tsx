"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import Divider from "./Divider";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

const fromLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  show:   { opacity: 1, x: 0, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};
const fromRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  show:   { opacity: 1, x: 0, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};

export default function StorySection({ config, gold, accent }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  /* Parallax: photo drifts up slightly as section scrolls into view */
  const photoY = useTransform(scrollYProgress, [0, 1], ["40px", "-40px"]);
  /* Floating orb moves opposite direction for depth */
  const orbY   = useTransform(scrollYProgress, [0, 1], ["-20px", "60px"]);

  const has1 = !!config.partner1Name;
  const has2 = !!config.partner2Name;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 px-6"
      style={{ background: "#08110e", borderTop: `1px solid ${gold}10` }}
    >
      {/* Floating ambient orb */}
      <motion.div
        aria-hidden
        style={{ y: orbY }}
        className="pointer-events-none absolute top-0 right-0 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(circle, ${accent}15 0%, transparent 65%)` }}
        />
      </motion.div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.26em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Our Story
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#eef5ee" }}>
            {has1 && has2 ? `${config.partner1Name} & ${config.partner2Name}` : "How It Began"}
          </h2>
          <Divider gold={gold} accent={accent} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Text side */}
          <motion.div
            variants={fromLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Large decorative quote */}
            <p
              aria-hidden
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "9rem",
                lineHeight: 0.75,
                color: `${gold}12`,
                marginBottom: "-2.5rem",
                userSelect: "none",
              }}
            >
              "
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                lineHeight: 1.9,
                color: `${accent}85`,
              }}
            >
              {config.coupleStory ||
                "In the heart of a moonlit forest, two paths crossed — and neither could imagine walking back alone. Our journey began with a single moment, a look, a laugh, and a quiet certainty that this was where the story truly started."}
            </p>

            {/* Small leaf divider */}
            <div className="mt-7 flex items-center gap-3">
              <div className="h-px w-8" style={{ background: `${gold}50` }} />
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden>
                <path d="M8 0.5 C4 0.5, 0.5 3, 0.5 5.5 C0.5 8, 4 10.5, 8 10.5 C12 10.5, 15.5 8, 15.5 5.5 C15.5 3, 12 0.5, 8 0.5Z" fill={`${gold}25`} stroke={gold} strokeWidth="0.6"/>
                <line x1="8" y1="0.5" x2="8" y2="10.5" stroke={gold} strokeWidth="0.5" opacity="0.5"/>
              </svg>
              <div className="h-px w-8" style={{ background: `${gold}50` }} />
            </div>
          </motion.div>

          {/* Photo with parallax */}
          <motion.div
            variants={fromRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            style={{ y: photoY }}
            className="relative"
          >
            {config.heroImageUrl ? (
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: "3/4",
                  boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 40px ${accent}12`,
                }}
              >
                <Image src={config.heroImageUrl} alt="Couple" fill className="object-cover" />
                {/* Enchanted overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to bottom, transparent 55%, ${accent}20 100%)` }}
                />
                {/* Corner vine frames */}
                {[
                  "top-3 left-3 border-t-2 border-l-2 rounded-tl-lg",
                  "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-7 h-7 ${cls}`} style={{ borderColor: `${gold}60` }} />
                ))}
              </div>
            ) : (
              <div
                className="w-full rounded-2xl flex items-center justify-center"
                style={{ aspectRatio: "3/4", background: `${accent}08`, border: `1px solid ${accent}18` }}
              >
                <p style={{ color: `${accent}35`, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Photo coming soon</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
