"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Check } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import Divider from "./Divider";
import FloatingParticles from "./FloatingParticles";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

interface RsvpState {
  name: string;
  attending: "yes" | "no" | null;
  mealChoice: string;
  plusOne: boolean;
  wishes: string;
}

const MEALS = ["Chicken", "Fish", "Vegetarian"];

const formVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: "easeOut" as const } },
  exit:   { opacity: 0, y: -20, transition: { duration: 0.35 } },
};

const confirmVar: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
  exit:   { opacity: 0, scale: 0.92, transition: { duration: 0.3 } },
};

const inputBase = (accent: string): React.CSSProperties => ({
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${accent}28`,
  color: "#eef5ee",
  padding: "0.5rem 0",
  width: "100%",
  outline: "none",
  fontFamily: "var(--font-sans)",
  fontSize: "0.9rem",
  transition: "border-color 0.2s",
});

export default function RsvpSection({ config, gold, accent }: Props) {
  const [rsvp, setRsvp]       = useState<RsvpState>({ name: "", attending: null, mealChoice: "", plusOne: false, wishes: "" });
  const [submitted, setSubmit] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvp.name || !rsvp.attending) return;
    setSubmit(true);
  };

  return (
    <section
      className="relative overflow-hidden py-28 px-6"
      style={{ background: "#08110e", borderTop: `1px solid ${gold}10` }}
    >
      {/* Ambient magical particles (low opacity) */}
      <FloatingParticles opacity={0.35} />

      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 75% 60% at 50% 100%, ${accent}08, transparent 65%)` }}
      />

      <div className="relative max-w-lg mx-auto" style={{ zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-center mb-12"
        >
          <p className="uppercase tracking-[0.26em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Kindly Reply By {config.rsvpDeadline || "The Date Indicated"}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#eef5ee" }}>
            RSVP
          </h2>
          <Divider gold={gold} accent={accent} />
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              variants={formVar}
              initial="hidden"
              animate="show"
              exit="exit"
              onSubmit={handleSubmit}
              className="relative rounded-2xl p-8"
              style={{
                background: `linear-gradient(145deg, ${accent}08, ${gold}05)`,
                border: `1px solid ${gold}18`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 30px ${accent}06`,
              }}
            >
              {/* Corner vine brackets */}
              {["top-3 left-3 border-t border-l","top-3 right-3 border-t border-r",
                "bottom-3 left-3 border-b border-l","bottom-3 right-3 border-b border-r"].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 ${cls}`} style={{ borderColor: `${gold}35` }} />
              ))}

              {/* Name */}
              <div className="mb-7">
                <label className="block text-xs uppercase tracking-[0.2em] mb-2" style={{ color: `${accent}55` }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={rsvp.name}
                  onChange={(e) => setRsvp((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Full name"
                  style={inputBase(accent)}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = gold)}
                  onBlur={(e)  => (e.currentTarget.style.borderBottomColor = `${accent}28`)}
                />
              </div>

              {/* Attending */}
              <div className="mb-7">
                <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: `${accent}55` }}>
                  Will You Attend?
                </p>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((val) => (
                    <motion.button
                      key={val}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setRsvp((p) => ({ ...p, attending: val }))}
                      className="flex-1 py-2.5 rounded-xl text-sm capitalize"
                      style={{
                        background: rsvp.attending === val
                          ? `linear-gradient(135deg, ${accent}50, ${gold}45)`
                          : "transparent",
                        border: `1px solid ${rsvp.attending === val ? gold : `${accent}22`}`,
                        color: rsvp.attending === val ? "#eef5ee" : `${accent}55`,
                        boxShadow: rsvp.attending === val ? `0 0 20px ${gold}20` : "none",
                        transition: "all 0.25s",
                      }}
                    >
                      {val === "yes" ? "Joyfully Accepts" : "Regretfully Declines"}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Meal & Plus-one (only if attending) */}
              <AnimatePresence>
                {rsvp.attending === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="mb-7">
                      <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: `${accent}55` }}>
                        Meal Preference
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {MEALS.map((opt) => (
                          <motion.button
                            key={opt}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setRsvp((p) => ({ ...p, mealChoice: opt }))}
                            className="px-4 py-1.5 rounded-full text-sm"
                            style={{
                              background: rsvp.mealChoice === opt ? `${gold}18` : "transparent",
                              border: `1px solid ${rsvp.mealChoice === opt ? `${gold}55` : `${accent}20`}`,
                              color: rsvp.mealChoice === opt ? gold : `${accent}55`,
                              transition: "all 0.2s",
                            }}
                          >
                            {opt}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-7 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRsvp((p) => ({ ...p, plusOne: !p.plusOne }))}
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{
                          background: rsvp.plusOne ? `${gold}25` : "transparent",
                          border: `1px solid ${rsvp.plusOne ? gold : `${accent}28`}`,
                          transition: "all 0.2s",
                        }}
                      >
                        {rsvp.plusOne && <Check size={11} style={{ color: gold }} />}
                      </button>
                      <span className="text-sm" style={{ color: `${accent}60` }}>
                        I'll be bringing a guest (+1)
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wishes */}
              <div className="mb-8">
                <label className="block text-xs uppercase tracking-[0.2em] mb-2" style={{ color: `${accent}55` }}>
                  Wishes for the Couple
                </label>
                <textarea
                  rows={3}
                  value={rsvp.wishes}
                  onChange={(e) => setRsvp((p) => ({ ...p, wishes: e.target.value }))}
                  placeholder="Leave a heartfelt note…"
                  style={{ ...inputBase(accent), resize: "none", lineHeight: 1.7 }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = gold)}
                  onBlur={(e)  => (e.currentTarget.style.borderBottomColor = `${accent}28`)}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl tracking-[0.15em] uppercase text-sm font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${accent}60, ${gold}65)`,
                  color: "#060e12",
                  fontFamily: "var(--font-sans)",
                  boxShadow: `0 4px 28px ${gold}25`,
                }}
              >
                Send RSVP
              </motion.button>
            </motion.form>

          ) : (
            <motion.div
              key="confirm"
              variants={confirmVar}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative rounded-2xl p-14 text-center"
              style={{ background: `${accent}07`, border: `1px solid ${gold}20` }}
            >
              {/* Spinning leaf */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <svg width="44" height="30" viewBox="0 0 30 20" fill="none" aria-hidden>
                  <path d="M15 1 C7 1, 1 6, 1 10 C1 14, 7 19, 15 19 C23 19, 29 14, 29 10 C29 6, 23 1, 15 1Z" fill={`${gold}30`} stroke={gold} strokeWidth="0.8"/>
                  <line x1="15" y1="1" x2="15" y2="19" stroke={gold} strokeWidth="0.7" opacity="0.6"/>
                </svg>
              </motion.div>

              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "#eef5ee", marginBottom: "0.5rem" }}>
                Enchanted!
              </h3>
              <p style={{ color: `${accent}70`, fontStyle: "italic", fontFamily: "var(--font-serif)", lineHeight: 1.7 }}>
                {rsvp.attending === "yes"
                  ? `The grove is delighted to see you, ${rsvp.name}. We can't wait.`
                  : `Your kind reply has been received, ${rsvp.name}. You will be missed.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
