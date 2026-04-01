"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalCorner from "./BotanicalCorner";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
};

interface ProfileCardProps {
  label: string;
  name: string;
  photo?: string;
  gold: string;
  accent: string;
  delay: number;
}

function ProfileCard({ label, name, photo, gold, accent, delay }: ProfileCardProps) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="flex flex-col items-center gap-4 p-8 rounded-3xl text-center"
      style={{
        background: "rgba(20,30,22,0.55)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${gold}20`,
        flex: "1 1 200px",
        maxWidth: "280px",
      }}
    >
      {/* Circular photo / initial placeholder */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 130,
          height: 130,
          border: `2px solid ${gold}50`,
          boxShadow: `0 0 24px ${gold}25`,
        }}
      >
        {photo ? (
          <Image src={photo} alt={name} fill style={{ objectFit: "cover" }} />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "rgba(58,92,67,0.6)", fontSize: "2.4rem", color: "#fff", fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            {name.charAt(0)}
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-xs uppercase tracking-[0.25em]" style={{ color: `${accent}80`, fontFamily: "var(--font-sans)" }}>{label}</p>

      {/* Name */}
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.3rem", color: "#ffffff", lineHeight: 1.2 }}>
        {name || "—"}
      </p>

      {/* Gold ornament line */}
      <div className="flex items-center gap-2 w-full justify-center">
        <div className="h-px flex-1" style={{ background: `${gold}30` }} />
        <div className="w-1 h-1 rounded-full" style={{ background: `${gold}60` }} />
        <div className="h-px flex-1" style={{ background: `${gold}30` }} />
      </div>
    </motion.div>
  );
}

export default function CoupleSection({ config, gold, accent }: Props) {
  const BG = "#2a3830";

  return (
    <section
      className="relative overflow-hidden py-20 px-6 text-center"
      style={{ background: BG, borderTop: `1px solid ${gold}15` }}
    >
      {/* Botanical corners */}
      <div className="absolute top-0 left-0 z-0"><BotanicalCorner corner="top-left" scale={0.8} opacity={0.75} /></div>
      <div className="absolute top-0 right-0 z-0"><BotanicalCorner corner="top-right" scale={0.8} opacity={0.75} /></div>

      <motion.div
        variants={cont}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative max-w-4xl mx-auto flex flex-col items-center"
        style={{ zIndex: 1 }}
      >
        {/* Eyebrow */}
        <motion.p
          variants={rise}
          className="text-xs uppercase tracking-[0.28em] mb-1"
          style={{ color: `${accent}70`, fontFamily: "var(--font-sans)" }}
        >
          About Us
        </motion.p>

        {/* Section heading */}
        <motion.h2
          variants={rise}
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(2rem, 7vw, 3.2rem)",
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "0.75rem",
          }}
        >
          The Happy Couple
        </motion.h2>

        {/* Gold separator */}
        <motion.div variants={rise} className="flex items-center gap-2 mb-8" style={{ width: "180px" }}>
          <div className="h-px flex-1" style={{ background: `${gold}55` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: gold }} />
          <div className="h-px flex-1" style={{ background: `${gold}55` }} />
        </motion.div>

        {/* Couple story quote */}
        {config.coupleStory && (
          <motion.p
            variants={rise}
          className="text-sm mb-10 leading-relaxed max-w-2xl"
            style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic", fontFamily: "var(--font-serif)" }}
          >
            "{config.coupleStory}"
          </motion.p>
        )}

        {/* Profile cards */}
        <motion.div variants={cont} className="flex gap-6 justify-center flex-wrap">
          <ProfileCard
            label="The Bridegroom"
            name={config.partner1Name || "Partner 1"}
            photo={undefined}
            gold={gold}
            accent={accent}
            delay={0}
          />

          {/* Ampersand separator */}
          <motion.div
            variants={rise}
            className="flex items-center justify-center"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "3rem", color: gold, lineHeight: 1, minWidth: "40px" }}
          >
            &
          </motion.div>

          <ProfileCard
            label="The Bride"
            name={config.partner2Name || "Partner 2"}
            photo={undefined}
            gold={gold}
            accent={accent}
            delay={2}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
