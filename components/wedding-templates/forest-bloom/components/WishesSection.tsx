"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalCorner from "./BotanicalCorner";
import GoldPillButton from "./GoldPillButton";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

interface Wish { name: string; message: string; ts: number }

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
};

export default function WishesSection({ config, gold, accent }: Props) {
  const BG = "#2a3830";
  const [name, setName]       = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wishes, setWishes]   = useState<Wish[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setWishes(prev => [{ name: name.trim(), message: message.trim(), ts: Date.now() }, ...prev]);
    setName("");
    setMessage("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(20,30,22,0.55)",
    border: `1px solid ${gold}25`,
    borderRadius: "0.75rem",
    color: "#ffffff",
    padding: "0.75rem 1rem",
    fontSize: "0.9rem",
    width: "100%",
    fontFamily: "var(--font-sans)",
    outline: "none",
    backdropFilter: "blur(6px)",
  };

  return (
    <section
      className="relative overflow-hidden py-20 px-6"
      style={{ background: BG, borderTop: `1px solid ${gold}15` }}
    >
      {/* Botanical corners */}
      <div className="absolute top-0 left-0 z-0"><BotanicalCorner corner="top-left" scale={0.85} opacity={0.7} /></div>
      <div className="absolute bottom-0 right-0 z-0"><BotanicalCorner corner="bottom-right" scale={0.8} opacity={0.65} /></div>

      <motion.div
        variants={cont}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative max-w-xl mx-auto text-center"
        style={{ zIndex: 1 }}
      >
        <motion.p
          variants={rise}
          className="text-xs uppercase tracking-[0.3em] mb-2"
          style={{ color: `${accent}70`, fontFamily: "var(--font-sans)" }}
        >
          Send Your Blessings
        </motion.p>
        <motion.h2
          variants={rise}
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
          }}
        >
          Wedding Wishes
        </motion.h2>
        <motion.p
          variants={rise}
          className="text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans)", letterSpacing: "0.04em" }}
        >
          Joyous Words at Your Fingertips
        </motion.p>

        {/* Form */}
        <motion.form
          variants={cont}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 mb-8"
        >
          <motion.input
            variants={rise}
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
          <motion.textarea
            variants={rise}
            rows={4}
            placeholder="Write your wishes for the couple..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
          />
          <motion.div variants={rise} className="flex justify-center pt-1">
            {submitted ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: gold, fontSize: "1rem" }}
              >
                Thank you! 🌿
              </motion.p>
            ) : (
              <GoldPillButton gold={gold} type="submit" disabled={!name.trim() || !message.trim()}>
                Send Wishes
              </GoldPillButton>
            )}
          </motion.div>
        </motion.form>

        {/* Submitted wishes list */}
        {wishes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={cont}
            className="flex flex-col gap-4 mt-2 text-left"
          >
            {wishes.map(w => (
              <motion.div
                key={w.ts}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-5 py-4"
                style={{ background: "rgba(20,30,22,0.45)", border: `1px solid ${gold}18` }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: gold, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>{w.name}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans)" }}>{w.message}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
