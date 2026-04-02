"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  bg: string;
  textDeep: string;
}

export default function OurStorySection({ config, green, floral, bg, textDeep }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  // Scroll parallax on the photo column
  const { scrollYProgress } = useScroll({
    target: photoRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const storyText = config.coupleStory;
  const paragraphs = storyText && storyText.trim()
    ? storyText.split(/\n+/).filter(Boolean)
    : [
        `It began with a glance across a sun-dappled garden —`,
        `two paths quietly converging toward the same horizon.`,
      ];

  const storyImage =
    config.galleryImageUrls?.[1] || "/placeholder-story.jpg";

  return (
    <section ref={sectionRef} className="py-32" style={{ background: bg }}>
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-20 lg:gap-28 items-center">

          {/* ── Text column ── */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xs tracking-[0.22em] uppercase mb-6"
              style={{ color: floral }}
            >
              Our Story
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
              className="text-3xl lg:text-5xl font-light mb-12 leading-[1.15]"
              style={{ color: textDeep, letterSpacing: "-0.02em" }}
            >
              How it all began
            </motion.h2>

            <div className="space-y-6 max-w-xl">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.25 + i * 0.12 }}
                  className="text-base leading-[1.85]"
                  style={{ color: `${textDeep}cc` }}
                >
                  {p}
                </motion.p>
              ))}
            </div>

            {/* Decorative divider rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0, background: `${green}35`, height: "1px", maxWidth: "120px", marginTop: "48px" }}
            />
          </div>

          {/* ── Photo column with parallax ── */}
          <div ref={photoRef} className="relative overflow-hidden aspect-[4/5]">
            <motion.div
              style={{ y: photoY }}
              className="absolute inset-[-8%] w-full h-[116%]"
            >
              <Image
                src={storyImage}
                alt="Our story"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </motion.div>

            {/* Botanical-tinted corner overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
              style={{
                background: `linear-gradient(to top, ${bg}90 0%, transparent 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
