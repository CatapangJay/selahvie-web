"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, type Band } from "./Band";
import { Sprig } from "./Ornaments";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
  rsvpDeadline: DateParts;
}

/** A cream reply card on the evening sky, with a ribbon tab tucked over its top edge. */
export default function RsvpSection({ config, palette: p, band, rsvpDeadline }: Props) {
  const { submit, prefillName, maxPlusOnes, matching } = useRsvpSubmit(config);
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
      mealChoice: meal,
      plusOne: Boolean(plusOneName.trim()),
      plusOneName,
      additionalGuestNames: extraNames,
      message,
    });
    if (sent) setSubmitted(true);
  };

  const line = `color-mix(in srgb, ${p.ink} 30%, transparent)`;
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2";
  const label: CSSProperties = { fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: p.apricotDeep };
  const field: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: `1.5px solid ${line}`,
    borderRadius: 0,
    padding: "0.6rem 0",
    fontFamily: DISPLAY,
    fontSize: "1.15rem",
    color: p.ink,
    outlineColor: p.dusk,
  };
  const choice = (active: boolean): CSSProperties => ({
    minHeight: 48,
    padding: "0.5rem 1.2rem",
    borderRadius: 999,
    border: `1.5px solid ${active ? p.apricot : line}`,
    background: active ? p.apricot : "transparent",
    color: active ? "#fff" : p.ink,
    fontFamily: SANS,
    fontSize: 15,
    fontWeight: 500,
    transition: "background-color .25s, color .25s, border-color .25s",
    cursor: "pointer",
    outlineColor: p.dusk,
  });
  const deadline = rsvpDeadline.date ? `${rsvpDeadline.monthDay}, ${rsvpDeadline.year}` : rsvpDeadline.long;
  const card: CSSProperties = {
    position: "relative",
    background: p.morning,
    color: p.ink,
    borderRadius: "1.75rem",
    padding: "clamp(2.5rem, 8vw, 3rem) clamp(1.25rem, 6vw, 2.5rem) clamp(1.75rem, 6vw, 2.5rem)",
    boxShadow: `0 30px 60px -30px rgba(0,0,0,.5)`,
  };
  const ribbon = (
    <span aria-hidden style={{ position: "absolute", top: -14, left: "50%", width: 64, height: 28, marginLeft: -32, borderRadius: "0 0 10px 10px", background: p.apricot, boxShadow: `inset 0 -3px 0 ${p.apricotDeep}` }} />
  );

  return (
    <section id="rsvp" aria-labelledby="ah-rsvp-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionTitle id="ah-rsvp-title" eyebrow="Kindly let us know" title="Will you come?" band={band} palette={p} style={{ marginBottom: "1rem" }} />
        {deadline && (
          <p style={{ textAlign: "center", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.15rem", color: band.dark ? p.butter : p.apricotDeep, margin: "0 0 2.5rem" }}>
            Replies by {deadline}, please
          </p>
        )}

        {submitted ? (
          <div role="status" style={{ ...card, textAlign: "center" }}>
            {ribbon}
            <Sprig color={p.dusk} bloom={p.apricot} style={{ width: "3.5rem", margin: "0 auto 0.75rem", display: "block" }} />
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.8rem, 7vw, 2.3rem)", lineHeight: 1.15, margin: 0 }}>
              Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}
            </p>
            <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.65, margin: "0.75rem 0 0" }}>
              {attending ? "We'll save you a spot in the golden light." : "We'll miss you, and we're grateful you told us."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} aria-label="RSVP" style={card} className="flex flex-col">
            {ribbon}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-name`} style={label}>Your name</label>
                <input
                  id={`${uid}-name`}
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={(e) => matching.checkName(e.target.value)}
                  className={focus}
                  style={field}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-email`} style={label}>Email</label>
                <input id={`${uid}-email`} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={focus} style={field} />
              </div>
            </div>

            <OpenInviteNotice
              matching={matching}
              labelColor={p.apricotDeep}
              textColor={p.ink}
              lineColor={line}
              accent={p.apricotDeep}
              offset="1.5rem"
              bodyStyle={{ fontFamily: SANS, fontWeight: 300, fontSize: "1rem", lineHeight: 1.6 }}
              labelStyle={label}
              fieldStyle={{ fontFamily: DISPLAY, fontSize: "1.15rem", padding: "0.6rem 0", width: "10rem" }}
              actionStyle={{ fontFamily: SANS, fontWeight: 500, fontSize: "1rem" }}
            />

            <fieldset style={{ marginTop: "1.75rem", border: 0, padding: 0 }}>
              <legend style={{ ...label, marginBottom: "0.75rem" }}>Will you be there?</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([[true, "Yes, with joy"], [false, "Sadly, I can't"]] as const).map(([value, text]) => (
                  <button key={text} type="button" aria-pressed={attending === value} onClick={() => setAttending(value)} className={focus} style={choice(attending === value)}>
                    {text}
                  </button>
                ))}
              </div>
            </fieldset>

            {attending && config.mealOptions?.length > 0 && (
              <fieldset style={{ marginTop: "1.75rem", border: 0, padding: 0 }}>
                <legend style={{ ...label, marginBottom: "0.75rem" }}>Dinner choice</legend>
                <div className="flex flex-wrap gap-2.5">
                  {config.mealOptions.map((opt) => (
                    <button key={opt} type="button" aria-pressed={meal === opt} onClick={() => setMeal(opt)} className={focus} style={choice(meal === opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {attending && maxPlusOnes > 1 && (
              <div style={{ marginTop: "1.75rem" }}>
                <AdditionalGuestsField
                  max={maxPlusOnes}
                  names={extraNames}
                  onChange={setExtraNames}
                  labelColor={p.apricotDeep}
                  textColor={p.ink}
                  lineColor={line}
                  accent={p.apricotDeep}
                  labelStyle={{ ...label, marginBottom: "0.25rem" }}
                  fieldStyle={field}
                  actionStyle={{ fontFamily: SANS, fontWeight: 500, fontSize: "1rem" }}
                />
              </div>
            )}

            {attending && maxPlusOnes === 1 && (
              <div className="flex flex-col gap-1" style={{ marginTop: "1.75rem" }}>
                <label htmlFor={`${uid}-plus`} style={label}>Bringing someone? (optional)</label>
                <input id={`${uid}-plus`} value={plusOneName} onChange={(e) => setPlusOneName(e.target.value)} placeholder="Their full name" className={focus} style={field} />
              </div>
            )}

            <div className="flex flex-col gap-1" style={{ marginTop: "1.75rem" }}>
              <label htmlFor={`${uid}-msg`} style={label}>A note for us (optional)</label>
              <textarea id={`${uid}-msg`} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${focus} resize-none`} style={field} />
            </div>

            <button
              type="submit"
              disabled={attending === null}
              className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              style={{
                marginTop: "2.25rem",
                minHeight: 54,
                borderRadius: 999,
                border: 0,
                background: p.dusk,
                color: p.morning,
                fontFamily: SANS,
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.1em",
                cursor: "pointer",
                outlineColor: p.dusk,
              }}
            >
              Send our reply
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
