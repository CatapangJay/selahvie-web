"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SCRIPT, paperStyle, parseWeddingDate } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e2b45]";

/** The reply as a photo-lab order envelope: typed fields on ruled lines, a red "send to print" button. */
export default function RsvpSection({ config, palette: p }: Props) {
  const LINE = `color-mix(in srgb, ${p.inkSoft} 60%, transparent)`;
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
    fontFamily: MONO,
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: p.inkSoft,
  };
  const field: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: `1px solid ${LINE}`,
    borderRadius: 0,
    padding: "0.55rem 0",
    fontFamily: MONO,
    fontSize: "1.1rem",
    color: p.text,
  };
  const choice = (active: boolean): CSSProperties => ({
    fontFamily: MONO,
    fontSize: "1rem",
    minHeight: 48,
    padding: "0.5rem 1rem",
    borderRadius: 999,
    border: `1px solid ${active ? p.ink : LINE}`,
    background: active ? p.ink : "transparent",
    color: active ? p.print : p.text,
    transition: "background-color .25s, color .25s, border-color .25s",
    cursor: "pointer",
  });

  const deadlineDate = parseWeddingDate(config.rsvpDeadline);
  const deadline = deadlineDate
    ? deadlineDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : config.rsvpDeadline?.trim();
  const card: CSSProperties = {
    position: "relative",
    background: p.print,
    color: p.text,
    borderRadius: 6,
    padding: "clamp(2rem, 6vw, 2.75rem) clamp(1.4rem, 5vw, 2.25rem)",
    borderTop: `10px solid ${p.film}`,
    boxShadow: "0 24px 40px -26px rgba(10,12,20,.6)",
  };

  return (
    <section id="rsvp" aria-labelledby="ss-rsvp-title" style={{ ...paperStyle(p), padding: "5.5rem 1.25rem", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ss-rsvp-title" caption="Kindly reply" title="Be in the |Picture" color={p.ink} accent={p.film} style={{ marginBottom: "1rem" }} />
        {deadline && (
          <p style={{ fontFamily: MONO, fontSize: "clamp(15px, 4.2vw, 17px)", color: p.text, margin: "0 0 2.5rem" }}>
            Please reply by <strong style={{ color: p.film }}>{deadline}</strong>.
          </p>
        )}

        {submitted ? (
          <div role="status" style={card}>
            <p style={{ fontFamily: SCRIPT, fontSize: "clamp(44px, 12vw, 58px)", color: p.film, lineHeight: 1.1, margin: 0 }}>
              Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}
            </p>
            <p style={{ fontFamily: DISPLAY, fontSize: "1.2rem", lineHeight: 1.6, color: p.text, margin: "0.75rem 0 0" }}>
              {attending ? "You're in the picture. We can't wait to celebrate with you." : "We'll miss you in the frame, and we're grateful you let us know."}
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
                className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "min(100%, 19rem)",
                  minHeight: 56,
                  borderRadius: 999,
                  border: 0,
                  background: p.film,
                  color: p.print,
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  outlineColor: p.film,
                }}
              >
                <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: p.print }} />
                Fill in your reply
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
                  style={card}
                >
                  <p aria-hidden style={{ ...label, color: p.film, margin: "0 0 1.75rem" }}>Order form · No. 001</p>
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
                    labelColor={p.inkSoft}
                    textColor={p.text}
                    lineColor={LINE}
                    accent={p.ink}
                    offset="1.5rem"
                    bodyStyle={{ fontFamily: DISPLAY, fontSize: "1.1rem", lineHeight: 1.55 }}
                    labelStyle={label}
                    fieldStyle={{ fontFamily: MONO, fontSize: "1.1rem", padding: "0.55rem 0", width: "10rem" }}
                    actionStyle={{ fontFamily: MONO, fontWeight: 700, fontSize: "1rem" }}
                  />

                  <fieldset style={{ marginTop: "2rem", border: 0, padding: 0 }}>
                    <legend style={{ ...label, marginBottom: "0.75rem" }}>Will you attend?</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {([[true, "Count me in"], [false, "Can't make it"]] as const).map(([value, text]) => (
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
                        labelColor={p.inkSoft}
                        textColor={p.text}
                        lineColor={LINE}
                        accent={p.ink}
                        labelStyle={{ ...label, marginBottom: "0.25rem" }}
                        fieldStyle={field}
                        actionStyle={{ fontFamily: MONO, fontWeight: 700, fontSize: "1rem" }}
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
                        className={`${FOCUS} placeholder:text-[#1c1e26]/40`}
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
                    className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e2b45] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      marginTop: "2.5rem",
                      minHeight: 54,
                      borderRadius: 999,
                      border: 0,
                      background: p.ink,
                      color: p.print,
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Send my reply
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
