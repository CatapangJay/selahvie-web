"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig, RSVPEntry } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
}

export default function RsvpSection({ config, primary, accent }: Props) {
  const [rsvp, setRsvp] = useState<Partial<RSVPEntry>>({ attending: true });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="rsvp"
      className="py-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${primary}0a 0%, ${accent}18 50%, ${primary}0a 100%)`,
      }}
    >
      {/* Decorative background circles */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}18, transparent 70%)` }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}18, transparent 70%)` }}
      />

      <div className="mx-auto max-w-2xl px-6 relative z-10">
        <SectionLabel eyebrow="Join Us" title="RSVP" />

        {config.rsvpDeadline && (
          <p
            className="text-center -mt-4 mb-10 text-sm"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Kindly respond by{" "}
            <span style={{ color: primary }}>
              {new Date(config.rsvpDeadline).toLocaleDateString("en-US", { dateStyle: "long" })}
            </span>
          </p>
        )}

        {submitted ? (
          /* ── Confirmation card ── */
          <div
            className="rounded-3xl p-12 text-center shadow-ambient"
            style={{
              background: "var(--color-surface-container-lowest)",
              border: `1px solid ${accent}30`,
            }}
          >
            <Heart size={48} fill={accent} stroke="none" className="mx-auto mb-6" style={{ color: accent }} />
            <h3 className="headline-sm mb-3">Thank you, {rsvp.guestName}!</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              {rsvp.attending
                ? "We're so excited to celebrate with you. More details will follow soon!"
                : "We'll miss you, but thank you for letting us know. Sending you all our love!"}
            </p>
          </div>
        ) : (
          /* ── RSVP form ── */
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl p-8 md:p-10 shadow-ambient space-y-7"
            style={{
              background: "var(--color-surface-container-lowest)",
              border: `1px solid ${accent}25`,
            }}
          >
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Your Full Name"
                id="guestName"
                required
                placeholder="e.g. Sarah Johnson"
                value={rsvp.guestName ?? ""}
                onChange={(e) => setRsvp({ ...rsvp, guestName: e.target.value })}
              />
              <InputField
                label="Email Address"
                id="guestEmail"
                type="email"
                required
                placeholder="sarah@example.com"
                value={rsvp.email ?? ""}
                onChange={(e) => setRsvp({ ...rsvp, email: e.target.value })}
              />
            </div>

            {/* Attending toggle */}
            <div>
              <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-variant)" }}>
                Will you attend?
              </p>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setRsvp({ ...rsvp, attending: val })}
                    className="flex-1 rounded-full py-3 label-luxury text-xs transition-all hover:scale-[1.02]"
                    style={{
                      background: rsvp.attending === val
                        ? `linear-gradient(135deg, ${primary}, ${accent})`
                        : "var(--color-surface-container)",
                      color: rsvp.attending === val ? "#fff" : "var(--color-on-surface-variant)",
                      boxShadow: rsvp.attending === val ? `0 4px 20px ${primary}30` : "none",
                      border: `1px solid ${rsvp.attending === val ? "transparent" : `${accent}30`}`,
                    }}
                  >
                    {val ? "Joyfully Accepts" : "Regretfully Declines"}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal preference */}
            {rsvp.attending && config.mealOptions?.length > 0 && (
              <div>
                <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-variant)" }}>
                  Meal Preference
                </p>
                <div className="flex flex-wrap gap-2">
                  {config.mealOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRsvp({ ...rsvp, mealChoice: opt })}
                      className="rounded-full px-5 py-2 text-sm transition-all hover:scale-[1.02]"
                      style={{
                        background: rsvp.mealChoice === opt ? `${accent}40` : "var(--color-surface-container)",
                        color: rsvp.mealChoice === opt ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                        border: `1px solid ${rsvp.mealChoice === opt ? accent : `${accent}20`}`,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Plus one */}
            {rsvp.attending && config.allowPlusOne && (
              <InputField
                label="Plus One Name (optional)"
                id="plusOne"
                placeholder="Guest's full name"
                value={rsvp.plusOneName ?? ""}
                onChange={(e) => setRsvp({ ...rsvp, plusOneName: e.target.value })}
              />
            )}

            {/* Message / wishes */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="wish"
                className="label-luxury"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Send Wishes (optional)
              </label>
              <textarea
                id="wish"
                rows={3}
                placeholder="Share your love and well wishes for the couple…"
                value={rsvp.message ?? ""}
                onChange={(e) => setRsvp({ ...rsvp, message: e.target.value })}
                className="w-full resize-none rounded-sm border-0 border-b-2 px-0 py-2 outline-none transition-colors"
                style={{
                  background: "transparent",
                  borderBottomColor: "var(--color-outline-variant)",
                  color: "var(--color-on-surface)",
                }}
              />
            </div>

            <ButtonPrimary type="submit" size="lg" fullWidth>
              Send RSVP
            </ButtonPrimary>
          </form>
        )}
      </div>
    </section>
  );
}
