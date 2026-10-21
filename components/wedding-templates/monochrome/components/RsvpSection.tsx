"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";
import type { Palette } from "../theme";
import { ACCENT, BODY, HEADING, shortDate } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const LINE = "rgba(255,255,255,.35)";

/** A solid white "Reply" bar; the reply card unfolds beneath it. */
export default function RsvpSection({ config, palette: p, index }: Props) {
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

  const label: CSSProperties = {
    fontFamily: HEADING,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,.7)",
  };
  const field: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: `1px solid ${LINE}`,
    borderRadius: 0,
    padding: "0.6rem 0",
    fontFamily: HEADING,
    fontWeight: 300,
    fontSize: "1.1rem",
    color: "#fff",
  };
  const choice = (active: boolean): CSSProperties => ({
    fontFamily: HEADING,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    minHeight: 48,
    padding: "0.5rem 1.25rem",
    border: `1px solid ${active ? "#fff" : LINE}`,
    background: active ? "#fff" : "transparent",
    color: active ? p.ink : "#fff",
    transition: "background-color .25s, color .25s, border-color .25s",
    cursor: "pointer",
  });

  const deadline = shortDate(config.rsvpDeadline);

  return (
    <section id="rsvp" aria-labelledby="mc-rsvp-title" style={{ background: p.charcoal, padding: "6rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="mc-rsvp-title" index={index} eyebrow="RSVP" title="Kindly Reply" color="#fff" muted="rgba(255,255,255,.55)" style={{ marginBottom: "1rem" }} />
        {deadline && (
          <p
            style={{
              fontFamily: HEADING,
              fontSize: "clamp(15px, 4vw, 17px)",
              fontWeight: 300,
              color: "rgba(255,255,255,.72)",
              margin: "0 0 2.5rem",
            }}
          >
            We&apos;d love to hear from you by {deadline}.
          </p>
        )}

        {submitted ? (
          <div role="status" style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", padding: "2.5rem 2rem" }}>
            <p style={{ fontFamily: ACCENT, fontSize: "clamp(34px, 9vw, 46px)", color: "#fff", lineHeight: 1.2, margin: 0 }}>
              Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}
            </p>
            <p style={{ fontFamily: HEADING, fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(255,255,255,.8)", margin: "1rem 0 0" }}>
              {attending ? "We can't wait to celebrate with you." : "We'll miss you, and we're grateful you let us know."}
            </p>
          </div>
        ) : (
          <>
            {!open && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-controls={`${uid}-form`}
                className={`group transition-[letter-spacing] duration-500 hover:tracking-[0.4em] ${FOCUS}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  width: "min(100%, 20rem)",
                  minHeight: 54,
                  border: "1px solid #fff",
                  background: "#fff",
                  color: p.ink,
                  fontFamily: BODY,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Reply
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            )}

            <AnimatePresence initial={false}>
              {open && (
                <motion.form
                  id={`${uid}-form`}
                  key="form"
                  aria-label="RSVP"
                  onSubmit={handleSubmit}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col text-left"
                  style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", padding: "clamp(1.75rem, 6vw, 2.5rem)" }}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${uid}-name`} style={label}>Full name</label>
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
                    labelColor="rgba(255,255,255,.7)"
                    textColor="#fff"
                    lineColor={LINE}
                    accent="#fff"
                    offset="1.5rem"
                    bodyStyle={{ fontFamily: HEADING, fontWeight: 300, fontSize: "1rem", lineHeight: 1.6 }}
                    labelStyle={label}
                    fieldStyle={{ fontFamily: HEADING, fontSize: "1.1rem", padding: "0.6rem 0", width: "10rem" }}
                    actionStyle={{ fontFamily: BODY, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.04em" }}
                  />

                  <fieldset style={{ marginTop: "2rem", border: 0, padding: 0 }}>
                    <legend style={{ ...label, marginBottom: "0.75rem" }}>Will you attend?</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {([[true, "Attending"], [false, "Decline"]] as const).map(([value, text]) => (
                        <button
                          key={text}
                          type="button"
                          aria-pressed={attending === value}
                          onClick={() => setAttending(value)}
                          className={FOCUS}
                          style={choice(attending === value)}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {attending && config.mealOptions?.length > 0 && (
                    <fieldset style={{ marginTop: "2rem", border: 0, padding: 0 }}>
                      <legend style={{ ...label, marginBottom: "0.75rem" }}>Meal preference</legend>
                      <div className="flex flex-wrap gap-3">
                        {config.mealOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            aria-pressed={meal === opt}
                            onClick={() => setMeal(opt)}
                            className={FOCUS}
                            style={choice(meal === opt)}
                          >
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
                        labelColor="rgba(255,255,255,.7)"
                        textColor="#fff"
                        lineColor={LINE}
                        accent="#fff"
                        labelStyle={{ ...label, marginBottom: "0.25rem" }}
                        fieldStyle={field}
                        actionStyle={{ fontFamily: BODY, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.04em" }}
                      />
                    </div>
                  )}

                  {attending && maxPlusOnes === 1 && (
                    <div className="flex flex-col gap-1" style={{ marginTop: "2rem" }}>
                      <label htmlFor={`${uid}-plus`} style={label}>Plus one (optional)</label>
                      <input
                        id={`${uid}-plus`}
                        value={plusOneName}
                        onChange={(e) => setPlusOneName(e.target.value)}
                        placeholder="Their full name"
                        className={`${FOCUS} placeholder:text-white/40`}
                        style={field}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1" style={{ marginTop: "2rem" }}>
                    <label htmlFor={`${uid}-msg`} style={label}>A note for the couple (optional)</label>
                    <textarea
                      id={`${uid}-msg`}
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${FOCUS} resize-none`}
                      style={field}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={attending === null}
                    className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      marginTop: "2.5rem",
                      minHeight: 52,
                      fontFamily: HEADING,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: p.ink,
                      background: "#fff",
                      border: "1px solid #fff",
                      cursor: "pointer",
                    }}
                  >
                    Send reply
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
