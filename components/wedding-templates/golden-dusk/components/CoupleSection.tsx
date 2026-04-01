"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

interface PortraitCardProps {
  name: string;
  role: string;
  photo: string;
  accent: string;
}

function PortraitCard({ name, role, photo, accent }: PortraitCardProps) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="flex flex-col items-center gap-4"
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-xl"
        style={{ aspectRatio: "3/4", maxWidth: "320px", border: "3px solid #ffffff" }}
      >
        <Image src={photo} alt={name} fill className="object-cover object-top" />
        {/* Bottom gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(44,24,16,0.6) 0%, transparent 50%)" }}
        />
        {/* Name overlay */}
        <div className="absolute bottom-4 inset-x-0 text-center">
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1.3rem",
              color: "#ffffff",
              textShadow: "0 1px 8px rgba(0,0,0,0.4)",
            }}
          >
            {name}
          </p>
          <p
            className="text-xs uppercase tracking-widest mt-0.5"
            style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)" }}
          >
            {role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CoupleSection({ config, accent }: Props) {
  const BG = "#f5f0eb";
  const gallery = config.galleryImageUrls ?? [];

  const bridePhoto  = gallery[3] ?? `https://picsum.photos/seed/gd-bride/600/800`;
  const groomPhoto  = gallery[4] ?? `https://picsum.photos/seed/gd-groom/600/800`;

  return (
    <section id="couple" className="relative py-24 px-6 text-center" style={{ background: BG }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {/* Heading */}
          <motion.p
            variants={rise}
            className="text-xs uppercase tracking-[0.3em] mb-2"
            style={{ color: accent, fontFamily: "var(--font-sans)" }}
          >
            The Happy Couple
          </motion.p>
          <motion.h2
            variants={rise}
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "#2c1810",
              lineHeight: 1.2,
              marginBottom: "0.75rem",
            }}
          >
            Bride &amp; Groom Details
          </motion.h2>
          <motion.div variants={rise} className="flex items-center justify-center gap-2 mb-12">
            <div className="h-0.5 w-8" style={{ background: accent }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: accent }} />
            <div className="h-0.5 w-8" style={{ background: accent }} />
          </motion.div>

          {/* Portraits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
            <PortraitCard
              name={config.partner1Name || "The Groom"}
              role="Groom"
              photo={groomPhoto}
              accent={accent}
            />
            <PortraitCard
              name={config.partner2Name || "The Bride"}
              role="Bride"
              photo={bridePhoto}
              accent={accent}
            />
          </div>

          {/* View All button */}
          <motion.div variants={rise} className="flex justify-center mt-10">
            <button
              className="px-7 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] transition-all hover:opacity-80"
              style={{ background: accent, color: "#ffffff", fontFamily: "var(--font-sans)" }}
            >
              View All
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
