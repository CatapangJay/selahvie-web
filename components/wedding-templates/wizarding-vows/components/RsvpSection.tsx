"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";
import type { Palette } from "../theme";
import { BOOK, CAPS, QUILL, capsLabel, monogram, parchmentStyle, parseWeddingDate } from "../theme";
import { OwlStamp, Snitch, WaxSeal } from "./Emblems";
import DriedSpray from "./DriedFlowers";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e1f12]";

/**
 * Reply by owl: a letter written in quill on ruled parchment, sealed in wax.
 * Once sent, the thank-you note comes back stamped for owl post.
 */
export default function RsvpSection({ config, palette: p }: Props) {
  const LINE = `color-mix(in srgb, ${p.inkSoft} 55%, transparent)`;
  const { submit, prefillName, maxPlusOnes, matching } = useRsvpSubmit(config);
  const reduce = useReducedMotion();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [meal, setMeal] = useState<string | undefined>();
  const [plusOneName, setPlusOneName] = useState("");
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (attending === null) return;
    const sent = await submit({
      guestName: name,
      email,
      attending,
      mealChoice: meal,
      plusOne: Boolean(plusOneName.trim()),
      plusOneName,
      additionalGuestNames: extraNames,
      message,
    });
    if (sent) setSubmitted(true);
  };

  const label: CSSProperties = { ...capsLabel(p.inkSoft, 11), paddingLeft: 0 };
  const field: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: `1px solid ${LINE}`,
    borderRadius: 0,
    padding: "0.4rem 0",
    fontFamily: BOOK,
    fontSize: "1.2rem",
    color: p.ink,
  };
  const choice = (active: boolean): CSSProperties => ({
    fontFamily: BOOK,
    fontStyle: "italic",
    fontSize: "1.08rem",
    minHeight: 48,
    padding: "0.5rem 1rem",
    borderRadius: 2,
    border: `1px solid ${active ? p.wax : LINE}`,
    background: active ? p.wax : "transparent",
    color: active ? p.parchment : p.ink,
    transition: "background-color .25s, color .25s, border-color .25s",
    cursor: "pointer",
  });

  const deadlineDate = parseWeddingDate(config.rsvpDeadline);
  const deadline = deadlineDate
    ? deadlineDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : config.rsvpDeadline?.trim();
  const letter: CSSProperties = {
    ...parchmentStyle(p),
    position: "relative",
    backgroundColor: `color-mix(in srgb, ${p.parchment} 75%, #FFF9EA)`,
    borderRadius: 3,
    padding: "clamp(2rem, 6vw, 2.75rem) clamp(1.3rem, 5vw, 2.25rem) clamp(2.4rem, 7vw, 3rem)",
    boxShadow: "0 26px 44px -28px rgba(30,18,6,.7)",
  };

  return (
    <section id="rsvp" aria-labelledby="wv-rsvp-title" style={{ ...parchmentStyle(p), position: "relative", padding: "5.5rem 1.25rem", textAlign: "center", overflow: "hidden" }}>
      <DriedSpray tone="dark" style={{ position: "absolute", left: 0, bottom: 0, width: "min(42vw, 16rem)" }} />
      <Snitch gilt={p.gilt} size={52} style={{ position: "absolute", top: "3.4rem", right: "12%" }} />
      <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="wv-rsvp-title" kicker="Kindly reply" title="Reply by Owl" color={p.ink} accent={p.wax} style={{ marginBottom: "1rem" }} />
        {deadline && (
          <p style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", color: p.ink, margin: "0 0 2.5rem" }}>
            Owls will be accepted until <strong style={{ fontStyle: "normal", color: p.wax }}>{deadline}</strong>.
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div key="sent" role="status" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} style={{ position: "relative" }}>
              <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ ...letter, paddingTop: "2.4rem" }}>
                <OwlStamp style={{ position: "absolute", top: -22, right: 18, width: 58, height: "auto", rotate: "6deg" }} />
                <p style={{ fontFamily: QUILL, fontSize: "clamp(40px, 11vw, 54px)", color: p.quill, lineHeight: 1.1, margin: 0 }}>
                  Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}
                </p>
                <p style={{ fontFamily: BOOK, fontSize: "1.2rem", lineHeight: 1.6, color: p.ink, margin: "0.75rem 0 0" }}>
                  {attending ? "Your owl is on its way. We'll save you a seat at the feast." : "Your owl is on its way. We'll miss you, and we're grateful you wrote."}
                </p>
              </motion.div>
            </motion.div>
          ) : !open ? (
            <motion.button
              key="start"
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls={`${uid}-form`}
              exit={{ opacity: 0 }}
              className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                width: "min(100%, 19rem)",
                minHeight: 56,
                borderRadius: 2,
                border: `1px solid ${p.gilt}`,
                background: p.wax,
                color: p.parchment,
                fontFamily: CAPS,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: `inset 0 0 0 3px ${p.wax}, inset 0 0 0 4px color-mix(in srgb, ${p.gilt} 60%, transparent)`,
                outlineColor: p.wax,
              }}
            >
              Write your reply
            </motion.button>
          ) : (
            <motion.form
              id={`${uid}-form`}
              key="form"
              aria-label="RSVP"
              onSubmit={handleSubmit}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -30, scale: 0.92, transition: { duration: 0.5 } }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col text-left"
              style={letter}
            >
              <p aria-hidden style={{ fontFamily: QUILL, fontSize: "clamp(1.7rem, 7vw, 2.1rem)", color: p.quill, margin: "0 0 1.4rem" }}>
                Dear {config.partner1Name} &amp; {config.partner2Name},
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${uid}-name`} style={label}>Your full name</label>
                  <input
                    id={`${uid}-name`}
                    required
                    autoFocus
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={(e) => matching.checkName(e.target.value)}
                    className={FOCUS}
                    style={field}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${uid}-email`} style={label}>Email</label>
                  <input
                    id={`${uid}-email`}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={FOCUS}
                    style={field}
                  />
                </div>
              </div>

              <OpenInviteNotice
                matching={matching}
                labelColor={p.inkSoft}
                textColor={p.ink}
                lineColor={LINE}
                accent={p.wax}
                offset="1.5rem"
                bodyStyle={{ fontFamily: BOOK, fontSize: "1.1rem", lineHeight: 1.55 }}
                labelStyle={label}
                fieldStyle={{ fontFamily: BOOK, fontSize: "1.15rem", padding: "0.4rem 0", width: "10rem" }}
                actionStyle={{ fontFamily: CAPS, fontWeight: 700, fontSize: "0.9rem" }}
              />

              <fieldset style={{ marginTop: "2rem", border: 0, padding: 0 }}>
                <legend style={{ ...label, marginBottom: "0.75rem" }}>Will you attend?</legend>
                <div className="grid grid-cols-2 gap-3">
                  {([[true, "Joyfully accepts"], [false, "Regretfully declines"]] as const).map(([value, text]) => (
                    <button key={text} type="button" aria-pressed={attending === value} onClick={() => setAttending(value)} className={FOCUS} style={choice(attending === value)}>
                      {text}
                    </button>
                  ))}
                </div>
              </fieldset>

              {attending && config.mealOptions?.length > 0 && (
                <fieldset style={{ marginTop: "2rem", border: 0, padding: 0 }}>
                  <legend style={{ ...label, marginBottom: "0.75rem" }}>At the feast I shall have</legend>
                  <div className="flex flex-wrap gap-3">
                    {config.mealOptions.map((opt) => (
                      <button key={opt} type="button" aria-pressed={meal === opt} onClick={() => setMeal(opt)} className={FOCUS} style={choice(meal === opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {attending && maxPlusOnes > 1 && (
                <div style={{ marginTop: "2rem" }}>
                  <AdditionalGuestsField
                    max={maxPlusOnes}
                    names={extraNames}
                    onChange={setExtraNames}
                    labelColor={p.inkSoft}
                    textColor={p.ink}
                    lineColor={LINE}
                    accent={p.wax}
                    labelStyle={{ ...label, marginBottom: "0.25rem" }}
                    fieldStyle={field}
                    actionStyle={{ fontFamily: CAPS, fontWeight: 700, fontSize: "0.9rem" }}
                  />
                </div>
              )}

              {attending && maxPlusOnes === 1 && (
                <div className="flex flex-col gap-1" style={{ marginTop: "2rem" }}>
                  <label htmlFor={`${uid}-plus`} style={label}>Bringing a companion (optional)</label>
                  <input
                    id={`${uid}-plus`}
                    value={plusOneName}
                    onChange={(e) => setPlusOneName(e.target.value)}
                    placeholder="Their full name"
                    className={`${FOCUS} placeholder:text-[#2e1f12]/40`}
                    style={field}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1" style={{ marginTop: "2rem" }}>
                <label htmlFor={`${uid}-msg`} style={label}>A few words for the couple (optional)</label>
                <textarea id={`${uid}-msg`} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${FOCUS} resize-none`} style={field} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "2.5rem" }}>
                <WaxSeal wax={p.wax} initials={monogram(config.partner1Name, config.partner2Name)} size={52} style={{ flexShrink: 0 }} />
                <button
                  type="submit"
                  disabled={attending === null}
                  className="flex-1 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2e1f12] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    minHeight: 54,
                    borderRadius: 2,
                    border: 0,
                    background: p.ink,
                    color: p.parchment,
                    fontFamily: CAPS,
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Send by owl
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
