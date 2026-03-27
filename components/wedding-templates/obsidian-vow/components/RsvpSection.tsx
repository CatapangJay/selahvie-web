"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig, RSVPEntry } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

export default function RsvpSection({ config, accent }: Props) {
  const [rsvp, setRsvp] = useState<Partial<RSVPEntry>>({ attending: true });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="rsvp"
      className="py-28 relative overflow-hidden"
      style={{ background: "#0d0b09" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center bottom, ${accent}07 0%, transparent 65%)`,
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-2xl px-6 relative z-10">
        <SectionLabel eyebrow="Join Us" title="RSVP" />

        {config.rsvpDeadline && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center -mt-4 mb-10 text-sm"
            style={{ color: "rgba(245,240,232,0.4)" }}
          >
            Kindly respond by{" "}
            <span style={{ color: accent }}>
              {new Date(config.rsvpDeadline).toLocaleDateString("en-US", { dateStyle: "long" })}
            </span>
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Confirmation ── */
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="p-12 text-center relative"
              style={{ border: `1px solid ${accent}30`, background: "rgba(255,255,255,0.02)" }}
            >
              {/* Corner accents */}
              {["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r","bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 ${cls}`} style={{ borderColor: `${accent}70` }} />
              ))}

              <svg width="40" height="40" viewBox="0 0 20 20" fill={accent} className="mx-auto mb-6" style={{ opacity: 0.8 }}>
                <polygon points="10,0 20,10 10,20 0,10" />
              </svg>
              <h3
                className="headline-sm mb-3"
                style={{ fontFamily: "var(--font-serif)", color: "#f5f0e8" }}
              >
                Thank you, {rsvp.guestName}
              </h3>
              <p className="text-sm font-light" style={{ color: "rgba(245,240,232,0.45)" }}>
                {rsvp.attending
                  ? "We look forward to celebrating this extraordinary evening with you."
                  : "We'll miss you, but thank you for letting us know. We send our warmest regards."}
              </p>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="relative p-8 md:p-10 space-y-7"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${accent}18`,
              }}
            >
              {/* Corner accents */}
              {["top-0 left-0 border-t border-l","top-0 right-0 border-t border-r","bottom-0 left-0 border-b border-l","bottom-0 right-0 border-b border-r"].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 ${cls}`} style={{ borderColor: `${accent}40` }} />
              ))}

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <RSVPInputOverride label="Your Full Name" id="guestName" required
                  placeholder="e.g. Sarah Johnson" accent={accent}
                  value={rsvp.guestName ?? ""}
                  onChange={(v) => setRsvp({ ...rsvp, guestName: v })}
                />
                <RSVPInputOverride label="Email Address" id="guestEmail" type="email" required
                  placeholder="sarah@example.com" accent={accent}
                  value={rsvp.email ?? ""}
                  onChange={(v) => setRsvp({ ...rsvp, email: v })}
                />
              </div>

              {/* Attending toggle */}
              <div>
                <p className="label-luxury mb-3" style={{ color: `${accent}70`, letterSpacing: "0.15em" }}>
                  Will you attend?
                </p>
                <div className="flex gap-3">
                  {[true, false].map((val) => (
                    <motion.button
                      key={String(val)}
                      type="button"
                      onClick={() => setRsvp({ ...rsvp, attending: val })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{   scale: 0.98 }}
                      className="flex-1 py-3 label-luxury text-xs tracking-widest transition-colors"
                      style={{
                        background: rsvp.attending === val ? accent : "transparent",
                        color: rsvp.attending === val ? "#0a0908" : "rgba(245,240,232,0.45)",
                        border: `1px solid ${rsvp.attending === val ? accent : `${accent}25`}`,
                        letterSpacing: "0.15em",
                      }}
                    >
                      {val ? "Joyfully Accepts" : "Regretfully Declines"}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Meal preference */}
              {rsvp.attending && config.mealOptions?.length > 0 && (
                <div>
                  <p className="label-luxury mb-3" style={{ color: `${accent}70`, letterSpacing: "0.15em" }}>
                    Meal Preference
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.mealOptions.map((opt) => (
                      <motion.button
                        key={opt}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{   scale: 0.97 }}
                        onClick={() => setRsvp({ ...rsvp, mealChoice: opt })}
                        className="px-5 py-2 text-sm font-light transition-colors"
                        style={{
                          background: rsvp.mealChoice === opt ? `${accent}20` : "transparent",
                          color: rsvp.mealChoice === opt ? accent : "rgba(245,240,232,0.45)",
                          border: `1px solid ${rsvp.mealChoice === opt ? `${accent}60` : `${accent}20`}`,
                        }}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Plus one */}
              {rsvp.attending && config.allowPlusOne && (
                <RSVPInputOverride
                  label="Plus One Name (optional)" id="plusOne"
                  placeholder="Guest's full name" accent={accent}
                  value={rsvp.plusOneName ?? ""}
                  onChange={(v) => setRsvp({ ...rsvp, plusOneName: v })}
                />
              )}

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="wish"
                  className="label-luxury"
                  style={{ color: `${accent}70`, letterSpacing: "0.15em" }}
                >
                  Send Wishes (optional)
                </label>
                <textarea
                  id="wish"
                  rows={3}
                  placeholder="Share your warmest wishes for the couple…"
                  value={rsvp.message ?? ""}
                  onChange={(e) => setRsvp({ ...rsvp, message: e.target.value })}
                  className="w-full resize-none border-0 border-b px-0 py-2 outline-none bg-transparent text-sm font-light transition-colors"
                  style={{
                    borderBottomColor: `${accent}25`,
                    color: "rgba(245,240,232,0.75)",
                  }}
                />
              </div>

              {/* Submit — styled differently for dark theme */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{   scale: 0.98 }}
                className="w-full py-4 label-luxury tracking-[0.2em] transition-all"
                style={{
                  background: accent,
                  color: "#0a0908",
                  border: "none",
                  letterSpacing: "0.2em",
                }}
              >
                SEND RSVP
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* Dark-themed input override (avoids importing the light InputField directly) */
function RSVPInputOverride({
  label, id, placeholder, accent, value, onChange, type = "text", required = false,
}: {
  label: string; id: string; placeholder: string; accent: string;
  value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="label-luxury" style={{ color: `${accent}70`, letterSpacing: "0.15em" }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 border-b px-0 py-2 outline-none bg-transparent text-sm font-light transition-colors"
        style={{
          borderBottomColor: `${accent}25`,
          color: "rgba(245,240,232,0.85)",
        }}
      />
    </div>
  );
}
