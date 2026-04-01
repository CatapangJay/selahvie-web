"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16,1,0.3,1] as [number,number,number,number] } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15, delayChildren: 0.4 } },
};

function useCountdown(target: string) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const calc = () => setDiff(Math.max(0, new Date(target).getTime() - Date.now()));
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  const total = Math.floor(diff / 1000);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600) % 24;
  const d = Math.floor(total / 86400);
  return { d, h, m, s, elapsed: diff === 0 };
}

interface BoxProps { value: number; label: string; accent: string }
function CountBox({ value, label, accent }: BoxProps) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[64px]">
      <motion.div
        key={value}
        initial={{ scale: 1.12, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl flex items-center justify-center"
        style={{
          width: 64, height: 64,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(6px)",
          fontSize: "1.7rem",
          fontWeight: 600,
          color: "#ffffff",
          fontFamily: "var(--font-serif)",
        }}
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans)" }}>{label}</span>
    </div>
  );
}

export default function HeroSection({ config, accent }: Props) {
  const { d, h, m, elapsed } = useCountdown(config.weddingDate || "2027-01-01");

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-center px-6 py-24">
      {/* Background photo */}
      {config.heroImageUrl ? (
        <Image
          src={config.heroImageUrl}
          alt="Hero"
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2c1810 0%, #6b3820 100%)" }} />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.75) 100%)" }} />

      {/* Content */}
      <motion.div
        variants={cont}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-6 max-w-2xl w-full"
      >
        {/* Couple names */}
        <motion.p
          variants={rise}
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}
        >
          The wedding of
        </motion.p>

        <motion.h1
          variants={rise}
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(2.4rem, 7vw, 5rem)",
            color: "#ffffff",
            lineHeight: 1.1,
            textShadow: "0 2px 30px rgba(0,0,0,0.4)",
          }}
        >
          {config.partner1Name || "Bride"} &amp; {config.partner2Name || "Groom"}
        </motion.h1>

        {/* Decorative line */}
        <motion.div variants={rise} className="flex items-center gap-3 w-full max-w-xs">
          <div className="h-px flex-1" style={{ background: `${accent}80` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: accent }} />
          <div className="h-px flex-1" style={{ background: `${accent}80` }} />
        </motion.div>

        {/* Countdown heading */}
        <motion.h2
          variants={rise}
          className="uppercase tracking-[0.4em] text-sm"
          style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-sans)" }}
        >
          {elapsed ? "We Are Married!" : "The Count Down"}
        </motion.h2>

        {/* Countdown boxes */}
        {!elapsed && (
          <motion.div variants={rise} className="flex items-start gap-4 justify-center flex-wrap">
            <CountBox value={d} label="Days"  accent={accent} />
            <CountBox value={h} label="Hours" accent={accent} />
            <CountBox value={m} label="Mins"  accent={accent} />
          </motion.div>
        )}

        {/* Wedding date */}
        {config.weddingDate && (
          <motion.p
            variants={rise}
            className="text-sm tracking-widest"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-sans)" }}
          >
            {new Date(config.weddingDate).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </motion.p>
        )}

        {/* CTA */}
        <motion.div variants={rise}>
          <button
            onClick={() => document.querySelector("#story")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-3 rounded-full text-sm uppercase tracking-[0.15em] transition-all duration-200 hover:opacity-85 active:scale-95"
            style={{
              background: accent,
              color: "#ffffff",
              fontFamily: "var(--font-sans)",
              boxShadow: `0 4px 20px ${accent}50`,
            }}
          >
            Wishing Them
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1">
          <div className="w-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
        </div>
      </motion.div>
    </section>
  );
}
