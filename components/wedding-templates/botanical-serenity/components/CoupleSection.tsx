"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  bg: string;
  textDeep: string;
}

/** Perpetually floating leaf SVG particle */
function FloatingLeaf({
  style,
  green,
  delay,
}: {
  style: React.CSSProperties;
  green: string;
  delay: number;
}) {
  return (
    <motion.svg
      width="18"
      height="28"
      viewBox="0 0 18 28"
      fill="none"
      style={{ position: "absolute", ...style }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.55, 0.55, 0],
        y: [0, -14, -22, -30],
        rotate: [0, 8, -4, 6],
      }}
      transition={{
        duration: 5.5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      <path
        d="M9 26 C9 18 2 12 2 6 C2 1 9 0 9 0 C9 0 16 1 16 6 C16 12 9 18 9 26Z"
        fill={`${green}35`}
        stroke={green}
        strokeWidth="0.6"
      />
    </motion.svg>
  );
}

const LEAVES = [
  { style: { left: "10%", bottom: "8%" }, delay: 0 },
  { style: { left: "22%", bottom: "4%" }, delay: 1.2 },
  { style: { left: "42%", bottom: "12%" }, delay: 2.1 },
  { style: { right: "18%", bottom: "6%" }, delay: 0.7 },
  { style: { right: "8%", bottom: "14%" }, delay: 1.8 },
  { style: { left: "68%", bottom: "3%" }, delay: 2.9 },
];

export default function CoupleSection({ config, green, floral, bg, textDeep }: Props) {
  const portrait1 = config.galleryImageUrls?.[2] || "/placeholder-portrait.jpg";
  const portrait2 = config.galleryImageUrls?.[3] || "/placeholder-portrait.jpg";

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: `${green}0a` }}>
      {/* Floating leaf particles */}
      {LEAVES.map((l, i) => (
        <FloatingLeaf key={i} style={l.style as React.CSSProperties} green={green} delay={l.delay} />
      ))}

      <div className="max-w-[1400px] mx-auto px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="mb-20 text-center"
        >
          <p className="text-xs tracking-[0.22em] uppercase mb-4" style={{ color: floral }}>
            The couple
          </p>
          <h2
            className="text-3xl lg:text-5xl font-light"
            style={{ color: textDeep, letterSpacing: "-0.02em" }}
          >
            {config.partner1Name} &amp; {config.partner2Name}
          </h2>
        </motion.div>

        {/* Portrait grid — full bleed, zero gap to feel cinematic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {[
            { name: config.partner1Name, src: portrait1, delay: 0 },
            { name: config.partner2Name, src: portrait2, delay: 0.15 },
          ].map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80, damping: 18, delay: person.delay }}
              className="relative overflow-hidden aspect-[3/4] group"
            >
              <Image
                src={person.src}
                alt={person.name ?? ""}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${textDeep}cc 0%, transparent 48%)`,
                }}
              />

              {/* Name tag */}
              <div className="absolute bottom-8 left-8 right-8">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 80, damping: 18, delay: person.delay + 0.25 }}
                  className="text-2xl font-light text-white"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {person.name}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
