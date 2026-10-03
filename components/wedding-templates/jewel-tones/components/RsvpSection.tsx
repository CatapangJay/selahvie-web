"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, feltStyle, initialOf, paperStyle } from "../theme";
import SectionHeading from "./SectionHeading";
import WaxSeal from "./WaxSeal";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  rsvpDeadline: DateParts;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b1018]";

export default function RsvpSection({ config, palette: p, rsvpDeadline }: Props) {
  const { submit, prefillName, maxPlusOnes } = useRsvpSubmit(config);
  const uid = useId();
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState(true);
  const [meal, setMeal] = useState<string | undefined>();
  const [plusOneName, setPlusOneName] = useState("");
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit({
      guestName: name,
      email,
      attending,
      mealChoice: meal,
      plusOne: Boolean(plusOneName.trim()),
      plusOneName,
      additionalGuestNames: extraNames,
      message,
    });
    setSubmitted(true);
  };

  const label: CSSProperties = {
    fontFamily: SERIF,
    fontWeight: 600,
    fontSize: "0.8rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: p.goldInk,
  };
  const field: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: 0,
    borderBottom: `1px solid ${p.goldDeep}`,
    borderRadius: 0,
    padding: "0.55rem 0",
    fontFamily: SERIF,
    fontSize: "1.25rem",
    color: p.ink,
  };
  const choice = (active: boolean): CSSProperties => ({
    fontFamily: SERIF,
    fontWeight: 600,
    fontSize: "1.05rem",
    minHeight: "3rem",
    padding: "0.5rem 1.25rem",
    borderRadius: 2,
    border: `1px solid ${active ? p.raspberryDeep : p.goldDeep}`,
    background: active ? p.raspberry : "transparent",
    color: active ? p.cream : p.ink,
    transition: "background-color .25s, color .25s, border-color .25s",
    cursor: "pointer",
  });

  const deadline = rsvpDeadline.date ? `${rsvpDeadline.monthDay}, ${rsvpDeadline.year}` : rsvpDeadline.long;
  const cardStyle: CSSProperties = {
    ...paperStyle(p.cream, p.creamDeep),
    color: p.ink,
    boxShadow: `inset 0 0 0 7px ${p.cream}, inset 0 0 0 8px ${p.gold}, 0 30px 60px -24px rgba(0,0,0,.65)`,
    padding: "clamp(2.25rem, 6vw, 3.5rem) clamp(1.5rem, 5vw, 3.25rem)",
  };

  return (
    <section id="rsvp" aria-labelledby="jt-rsvp-title" style={{ ...feltStyle(p.raspberry, p.raspberryDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "40rem" }}>
        <SectionHeading id="jt-rsvp-title" eyebrow="Kindly Reply" title="RSVP" palette={p} tone="dark" />
        {deadline && (
          <p
            className="text-center"
            style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.2rem", color: p.goldLight, marginTop: "-2rem", marginBottom: "2.5rem" }}
          >
            Please respond by {deadline}
          </p>
        )}

        {submitted ? (
          <div role="status" className="text-center" style={cardStyle}>
            <div className="mx-auto" style={{ width: "5rem", height: "5rem" }}>
              <WaxSeal palette={p} initials={[initialOf(config.partner1Name), initialOf(config.partner2Name)]} />
            </div>
            <p style={{ fontFamily: SCRIPT, fontSize: "clamp(2.2rem, 6vw, 3rem)", color: p.raspberryDeep, marginTop: "1rem", lineHeight: 1.15 }}>
              Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}
            </p>
            <p style={{ fontFamily: SERIF, fontSize: "1.25rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
              {attending
                ? "We are overjoyed that you will celebrate with us. More details will follow soon."
                : "We will miss you dearly, and are grateful you let us know. Sending you all our love."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={cardStyle} className="flex flex-col" aria-label="RSVP">
            <div className="grid gap-7 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-name`} style={label}>Your full name</label>
                <input
                  id={`${uid}-name`}
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={FOCUS}
                  style={field}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-email`} style={label}>Email address</label>
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

            <fieldset style={{ marginTop: "2rem", border: 0, padding: 0 }}>
              <legend style={{ ...label, marginBottom: "0.75rem" }}>Will you attend?</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([[true, "Joyfully accepts"], [false, "Regretfully declines"]] as const).map(([value, text]) => (
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
                  labelColor={p.goldInk}
                  textColor={p.ink}
                  lineColor={p.goldDeep}
                  accent={p.raspberryDeep}
                  labelStyle={{ ...label, marginBottom: "0.25rem" }}
                  fieldStyle={field}
                  actionStyle={{ fontFamily: SERIF, fontWeight: 600, fontSize: "1.05rem" }}
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
                  className={FOCUS}
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
              className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b1018]"
              style={{
                marginTop: "2.5rem",
                minHeight: "3.5rem",
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: p.cream,
                background: `linear-gradient(135deg, ${p.raspberry}, ${p.raspberryDeep})`,
                border: `1px solid ${p.goldDeep}`,
                borderRadius: 2,
                boxShadow: `0 10px 24px -10px ${p.raspberryDeep}`,
                cursor: "pointer",
              }}
            >
              Send RSVP
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
