"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Check } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import Divider from "./Divider";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";

interface Props {
  config: WeddingConfig;
  accent: string;
  gold: string;
}

interface RsvpState {
  name: string;
  attending: "yes" | "no" | null;
  mealChoice: string;
  plusOne: boolean;
  wishes: string;
  phone: string;
  dietary: string;
}

const MEALS = ["Chicken", "Fish", "Vegetarian"];

const formVar: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.5, ease: "easeOut" as const } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.35, ease: "easeIn" as const } },
};

const confirmVar: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  exit:   { opacity: 0, scale: 0.88, transition: { duration: 0.3 } },
};

const inputStyle = (accent: string): React.CSSProperties => ({
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${accent}30`,
  color: "#f0ecf8",
  padding: "0.5rem 0",
  width: "100%",
  outline: "none",
  fontFamily: "var(--font-sans)",
  fontSize: "0.9rem",
  transition: "border-color 0.2s",
});

export default function RsvpSection({ config, accent, gold }: Props) {
  const { submit, prefillName, maxPlusOnes, matching } = useRsvpSubmit(config);
  const [rsvp, setRsvp]       = useState<RsvpState>({ name: prefillName, attending: null, mealChoice: "", plusOne: false, wishes: "", phone: "", dietary: "" });
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [submitted, setSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvp.name || !rsvp.attending) return;
    const sent = await submit({
      guestName: rsvp.name,
      phone: rsvp.phone.trim() || undefined,
      dietaryRestrictions: rsvp.attending === "yes" ? rsvp.dietary.trim() || undefined : undefined,
      attending: rsvp.attending === "yes",
      mealChoice: rsvp.mealChoice || undefined,
      plusOne: Boolean(maxPlusOnes === 1 && rsvp.plusOne),
      additionalGuestNames: extraNames,
      message: rsvp.wishes || undefined,
    });
    if (sent) setSubmit(true);
  };

  return (
    <section
      id="rsvp"
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: "#0c0d1a", borderTop: `1px solid ${accent}10` }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 65% 55% at 50% 100%, ${accent}07, transparent 65%)` }}
        aria-hidden
      />

      <div className="relative max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="text-center mb-12"
        >
          <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}b0`, fontFamily: "var(--font-sans)" }}>
            Kindly Reply By {config.rsvpDeadline || "the date indicated"}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              color: "#f0ecf8",
            }}
          >
            RSVP
          </h2>
          <Divider accent={accent} gold={gold} />
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
              style={{ background: `${accent}05`, border: `1px solid ${accent}15` }}
            >
              {/* Corner ornaments */}
              {[
                "top-3 left-3 border-t border-l",
                "top-3 right-3 border-t border-r",
                "bottom-3 left-3 border-b border-l",
                "bottom-3 right-3 border-b border-r",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 ${cls}`} style={{ borderColor: `${gold}40` }} />
              ))}

              {/* Name */}
              <div className="mb-7">
                <label htmlFor="guestName" className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: `${accent}b0` }}>
                  Your Name
                </label>
                <input
                  id="guestName"
                  type="text"
                  value={rsvp.name}
                  onChange={(e) => setRsvp((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Full name"
                  style={inputStyle(accent)}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = gold)}
                  onBlur={(e)  => {
                    e.currentTarget.style.borderBottomColor = `${accent}30`;
                    matching.checkName(e.currentTarget.value);
                  }}
                />
                <OpenInviteNotice
                  matching={matching}
                  labelColor={`${accent}b0`}
                  textColor="#f0ecf8"
                  lineColor={`${accent}30`}
                  accent={gold}
                  errorColor="#f2b8b5"
                />
              </div>

              {/* Attending */}
              <div className="mb-7">
                <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: `${accent}b0` }}>
                  Will you attend?
                </p>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRsvp((p) => ({ ...p, attending: val }))}
                      className="flex-1 py-2 rounded-lg text-sm transition-all duration-200 capitalize"
                      style={{
                        background: rsvp.attending === val
                          ? `linear-gradient(135deg, ${accent}50, ${gold}50)`
                          : "transparent",
                        border: `1px solid ${rsvp.attending === val ? gold : `${accent}25`}`,
                        color: rsvp.attending === val ? "#f0ecf8" : `${accent}b0`,
                        boxShadow: rsvp.attending === val ? `0 0 20px ${gold}20` : "none",
                      }}
                    >
                      {val === "yes" ? "Joyfully Accepts" : "Regretfully Declines"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="mb-7">
                <label htmlFor="guestPhone" className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: `${accent}b0` }}>
                  Phone Number (optional)
                </label>
                <input
                  id="guestPhone"
                  type="tel"
                  autoComplete="tel"
                  value={rsvp.phone}
                  onChange={(e) => setRsvp((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 555 123 4567"
                  style={inputStyle(accent)}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = gold)}
                  onBlur={(e)  => (e.currentTarget.style.borderBottomColor = `${accent}30`)}
                />
              </div>

              {/* Meal + Plus one */}
              {rsvp.attending === "yes" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-7">
                    <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: `${accent}b0` }}>
                      Meal Preference
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MEALS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setRsvp((p) => ({ ...p, mealChoice: opt }))}
                          className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
                          style={{
                            background: rsvp.mealChoice === opt ? `${gold}20` : "transparent",
                            border: `1px solid ${rsvp.mealChoice === opt ? `${gold}60` : `${accent}20`}`,
                            color: rsvp.mealChoice === opt ? gold : `${accent}b0`,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {maxPlusOnes > 1 && (
                    <div className="mb-7">
                      <AdditionalGuestsField
                        max={maxPlusOnes}
                        names={extraNames}
                        onChange={setExtraNames}
                        labelColor={`${accent}b0`}
                        textColor="#f0ecf8"
                        lineColor={`${accent}30`}
                        accent={gold}
                      />
                    </div>
                  )}
                  {maxPlusOnes === 1 && (
                  <div className="mb-7 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRsvp((p) => ({ ...p, plusOne: !p.plusOne }))}
                      className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
                      style={{
                        background: rsvp.plusOne ? `${gold}30` : "transparent",
                        border: `1px solid ${rsvp.plusOne ? gold : `${accent}30`}`,
                      }}
                    >
                      {rsvp.plusOne && <Check size={11} style={{ color: gold }} />}
                    </button>
                    <span className="text-sm" style={{ color: `${accent}cc` }}>
                      I&apos;ll be bringing a guest (+1)
                    </span>
                  </div>
                  )}

                  <div className="mb-7">
                    <label htmlFor="dietaryRestrictions" className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: `${accent}b0` }}>
                      Dietary Restrictions (optional)
                    </label>
                    <input
                      id="dietaryRestrictions"
                      type="text"
                      value={rsvp.dietary}
                      onChange={(e) => setRsvp((p) => ({ ...p, dietary: e.target.value }))}
                      placeholder="Allergies or foods you avoid"
                      style={inputStyle(accent)}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = gold)}
                      onBlur={(e)  => (e.currentTarget.style.borderBottomColor = `${accent}30`)}
                    />
                  </div>
                </motion.div>
              )}

              {/* Wishes */}
              <div className="mb-8">
                <label htmlFor="wishes" className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: `${accent}b0` }}>
                  Wishes for the Couple
                </label>
                <textarea
                  id="wishes"
                  rows={3}
                  value={rsvp.wishes}
                  onChange={(e) => setRsvp((p) => ({ ...p, wishes: e.target.value }))}
                  placeholder="Share a message with the couple…"
                  style={{
                    ...inputStyle(accent),
                    resize: "none",
                    lineHeight: 1.7,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = gold)}
                  onBlur={(e)  => (e.currentTarget.style.borderBottomColor = `${accent}30`)}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl tracking-[0.15em] uppercase text-sm transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${accent}60, ${gold}70)`,
                  color: "#0c0d1a",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  boxShadow: `0 4px 24px ${gold}30`,
                }}
              >
                Send RSVP
              </button>
            </motion.form>

          ) : (

            <motion.div
              key="confirm"
              variants={confirmVar}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative rounded-2xl p-12 text-center"
              style={{ background: `${accent}06`, border: `1px solid ${accent}20` }}
            >
              {/* Animated star */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill={gold} aria-hidden>
                  <path d="M20 0 L23 15 L40 20 L23 25 L20 40 L17 25 L0 20 L17 15 Z" />
                </svg>
              </motion.div>

              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "#f0ecf8", marginBottom: "0.5rem" }}>
                Wonderstruck!
              </h3>
              <p style={{ color: `${accent}cc`, fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
                {rsvp.attending === "yes"
                  ? `We can't wait to celebrate with you, ${rsvp.name}.`
                  : `Thank you for your kind reply, ${rsvp.name}. You'll be missed.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
