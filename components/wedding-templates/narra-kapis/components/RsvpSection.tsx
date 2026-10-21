"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";
import type { Palette } from "../theme";
import { DISPLAY, SCRIPT, SERIF, capizStyle, parseWeddingDate, woodStyle } from "../theme";
import { Brackets } from "./Ornaments";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b3e1f]";

/** The reply card: a pearl capiz plaque on narra that unfolds when the guest taps "Sasagot ako". */
export default function RsvpSection({ config, palette: p }: Props) {
  const LINE = `color-mix(in srgb, ${p.molave} 55%, transparent)`;
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
    fontFamily: DISPLAY,
    fontSize: 12,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: p.molave,
  };
  const field: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: `1px solid ${LINE}`,
    borderRadius: 0,
    padding: "0.55rem 0",
    fontFamily: SERIF,
    fontSize: "1.2rem",
    color: p.ink,
  };
  const choice = (active: boolean): CSSProperties => ({
    fontFamily: SERIF,
    fontSize: "1.1rem",
    minHeight: 48,
    padding: "0.5rem 1.25rem",
    border: `1px solid ${active ? p.narra : LINE}`,
    background: active ? p.narra : "transparent",
    color: active ? p.capiz : p.ink,
    transition: "background-color .25s, color .25s, border-color .25s",
    cursor: "pointer",
  });

  const deadlineDate = parseWeddingDate(config.rsvpDeadline);
  const deadline = deadlineDate
    ? deadlineDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : config.rsvpDeadline?.trim();
  const card: CSSProperties = {
    ...capizStyle(p, 98),
    position: "relative",
    color: p.ink,
    padding: "clamp(2rem, 6vw, 2.75rem)",
    boxShadow: `0 0 0 6px ${p.narraDeep}, 0 0 0 7px ${p.brass}, 0 24px 40px -24px rgba(0,0,0,.8)`,
  };

  return (
    <section id="rsvp" aria-labelledby="nk-rsvp-title" style={{ ...woodStyle(p), padding: "6rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="nk-rsvp-title" eyebrow="Inaasahan namin kayo" title="RSVP" color={p.capiz} accent={p.brass} style={{ marginBottom: "1rem" }} />
        {deadline && (
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(17px, 4.6vw, 19px)",
              color: p.sand,
              margin: "0 0 2.5rem",
            }}
          >
            Kindly reply by {deadline}.
          </p>
        )}

        {submitted ? (
          <div role="status" style={card}>
            <Brackets color={p.brass} />
            <p style={{ fontFamily: SCRIPT, fontSize: "clamp(40px, 11vw, 54px)", color: p.narraDeep, lineHeight: 1.2, margin: 0 }}>
              Salamat{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}
            </p>
            <p style={{ fontFamily: SERIF, fontSize: "1.2rem", lineHeight: 1.6, color: p.ink, margin: "0.75rem 0 0" }}>
              {attending ? "Magkita-kita tayo! We can't wait to celebrate with you." : "We'll miss you, and we're grateful you let us know."}
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
                  ...capizStyle(p, 100),
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  width: "min(100%, 19rem)",
                  minHeight: 60,
                  border: `1px solid ${p.brass}`,
                  color: p.narraDeep,
                  cursor: "pointer",
                  outlineColor: p.brass,
                }}
              >
                <span style={{ fontFamily: DISPLAY, fontSize: 15, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase" }}>Sasagot ako</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: p.molave }}>Reply to the invitation</span>
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
                  <Brackets color={p.brass} />
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
                    labelColor={p.molave}
                    textColor={p.ink}
                    lineColor={LINE}
                    accent={p.narra}
                    offset="1.5rem"
                    bodyStyle={{ fontFamily: SERIF, fontSize: "1.1rem", lineHeight: 1.55 }}
                    labelStyle={label}
                    fieldStyle={{ fontFamily: SERIF, fontSize: "1.2rem", padding: "0.55rem 0", width: "10rem" }}
                    actionStyle={{ fontFamily: SERIF, fontWeight: 600, fontSize: "1.1rem" }}
                  />

                  <fieldset style={{ marginTop: "2rem", border: 0, padding: 0 }}>
                    <legend style={{ ...label, marginBottom: "0.75rem" }}>Will you attend?</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {([[true, "Dadalo ako"], [false, "Hindi makakadalo"]] as const).map(([value, text]) => (
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
                        labelColor={p.molave}
                        textColor={p.ink}
                        lineColor={LINE}
                        accent={p.narra}
                        labelStyle={{ ...label, marginBottom: "0.25rem" }}
                        fieldStyle={field}
                        actionStyle={{ fontFamily: SERIF, fontWeight: 600, fontSize: "1.1rem" }}
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
                        className={`${FOCUS} placeholder:text-[#2b190c]/40`}
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
                    className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6b3e1f] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      ...woodStyle(p),
                      marginTop: "2.5rem",
                      minHeight: 54,
                      fontFamily: DISPLAY,
                      fontSize: 14,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      border: `1px solid ${p.brass}`,
                      cursor: "pointer",
                    }}
                  >
                    Ipadala
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
