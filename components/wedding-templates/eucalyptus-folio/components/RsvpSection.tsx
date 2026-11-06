"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SANS, paperStyle, parseWeddingDate, sheetStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2";

/** The reply as an accession slip: typed labels over ruled lines, two choice tabs, and a filled ink button. */
export default function RsvpSection({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const LINE = `color-mix(in srgb, ${p.ink} 35%, transparent)`;
  const { submit, prefillName, maxPlusOnes, matching } = useRsvpSubmit(config);
  const reduce = useReducedMotion();
  const uid = useId();
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
      mealChoice: attending ? meal : undefined,
      plusOne: attending && Boolean(plusOneName.trim()),
      plusOneName: attending ? plusOneName : "",
      additionalGuestNames: attending ? extraNames : [],
      message,
    });
    if (sent) setSubmitted(true);
  };

  const label: CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: p.inkSoft };
  const field: CSSProperties = { width: "100%", background: "transparent", border: 0, borderBottom: `1px solid ${LINE}`, borderRadius: 0, padding: "0.55rem 0", fontFamily: SANS, fontSize: "1.05rem", color: p.text, outlineColor: p.ink };
  const choice = (active: boolean): CSSProperties => ({
    minHeight: 48,
    padding: "0.5rem 0.9rem",
    borderRadius: 2,
    border: `1px solid ${active ? p.ink : LINE}`,
    background: active ? p.ink : "transparent",
    color: active ? p.sheet : p.text,
    fontFamily: SANS,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color .3s, color .3s, border-color .3s",
    outlineColor: p.ink,
  });

  const deadlineDate = parseWeddingDate(config.rsvpDeadline);
  const deadline = deadlineDate ? deadlineDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : config.rsvpDeadline?.trim();
  const card: CSSProperties = { ...sheetStyle(p), padding: "1.6rem clamp(1.1rem, 5cqw, 1.8rem) 1.8rem", border: `1px solid color-mix(in srgb, ${p.ink} 30%, transparent)`, textAlign: "left" };

  return (
    <section id="rsvp" aria-labelledby="ef-rsvp-title" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading
          id="ef-rsvp-title"
          caption="Reply"
          title="Will you be there?"
          lede={deadline ? `We'd be grateful for your reply by ${deadline}.` : "We'd be grateful for your reply."}
          ink={p.ink}
          soft={p.inkSoft}
          rust={p.rust}
        />

        {submitted ? (
          <motion.div role="status" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} style={card}>
            <p style={{ ...label, color: p.rust, margin: 0 }}>Received with thanks</p>
            <p style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(1.7rem, 7.5cqw, 2.2rem)", lineHeight: 1.15, color: p.ink, margin: "0.5rem 0 0" }}>
              {attending ? "We'll save you a seat" : "You'll be missed"}
              {name.trim() ? `, ${name.trim().split(" ")[0]}.` : "."}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: p.text, margin: "0.6rem 0 0" }}>
              {attending ? "Your reply is in. We can't wait to celebrate with you." : "Thank you for letting us know. We'll be thinking of you on the day."}
            </p>
          </motion.div>
        ) : (
          <form aria-label="RSVP" onSubmit={handleSubmit} className="flex flex-col" style={card}>
            <p aria-hidden style={{ ...label, display: "flex", justifyContent: "space-between", margin: "0 0 1.3rem", paddingBottom: "0.6rem", borderBottom: `1px solid ${LINE}` }}>
              <span>Accession slip</span>
              <span style={{ color: p.rust }}>Guest reply</span>
            </p>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${uid}-name`} style={label}>Full name</label>
              <input id={`${uid}-name`} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={(e) => matching.checkName(e.target.value)} className={FOCUS} style={field} />
            </div>

            <OpenInviteNotice
              matching={matching}
              labelColor={p.inkSoft}
              textColor={p.text}
              lineColor={LINE}
              accent={p.ink}
              offset="1.25rem"
              bodyStyle={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.6 }}
              labelStyle={label}
              fieldStyle={{ fontFamily: SANS, fontSize: "1.05rem", padding: "0.55rem 0", width: "10rem" }}
              actionStyle={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.08em" }}
            />

            <div className="flex flex-col gap-1" style={{ marginTop: "1.4rem" }}>
              <label htmlFor={`${uid}-email`} style={label}>Email</label>
              <input id={`${uid}-email`} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FOCUS} style={field} />
            </div>

            <fieldset style={{ marginTop: "1.8rem", border: 0, padding: 0 }}>
              <legend style={{ ...label, marginBottom: "0.7rem" }}>Will you attend?</legend>
              <div className="grid grid-cols-2 gap-3">
                {([[true, "Gladly, yes"], [false, "Sadly, no"]] as const).map(([value, text]) => (
                  <button key={text} type="button" aria-pressed={attending === value} onClick={() => setAttending(value)} className={FOCUS} style={choice(attending === value)}>
                    {text}
                  </button>
                ))}
              </div>
            </fieldset>

            {attending && config.mealOptions?.length > 0 && (
              <fieldset style={{ marginTop: "1.8rem", border: 0, padding: 0 }}>
                <legend style={{ ...label, marginBottom: "0.7rem" }}>Choice of meal</legend>
                <div className="flex flex-wrap gap-2">
                  {config.mealOptions.map((opt) => (
                    <button key={opt} type="button" aria-pressed={meal === opt} onClick={() => setMeal(opt)} className={FOCUS} style={choice(meal === opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {attending && maxPlusOnes > 1 && (
              <div style={{ marginTop: "1.8rem" }}>
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
                  actionStyle={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.08em" }}
                />
              </div>
            )}

            {attending && maxPlusOnes === 1 && (
              <div className="flex flex-col gap-1" style={{ marginTop: "1.8rem" }}>
                <label htmlFor={`${uid}-plus`} style={label}>Bringing a guest? (optional)</label>
                <input id={`${uid}-plus`} value={plusOneName} onChange={(e) => setPlusOneName(e.target.value)} placeholder="Their full name" className={`${FOCUS} placeholder:opacity-50`} style={field} />
              </div>
            )}

            <div className="flex flex-col gap-1" style={{ marginTop: "1.8rem" }}>
              <label htmlFor={`${uid}-msg`} style={label}>A line for us (optional)</label>
              <textarea id={`${uid}-msg`} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${FOCUS} resize-none`} style={field} />
            </div>

            <button
              type="submit"
              disabled={attending === null}
              className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-45"
              style={{ marginTop: "2.2rem", minHeight: 52, borderRadius: 2, border: 0, background: p.ink, color: p.sheet, fontFamily: MONO, fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", outlineColor: p.ink }}
            >
              Send our reply
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
