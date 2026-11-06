"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { useRsvpSubmit } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import AdditionalGuestsField from "@/components/wedding-templates/_shared/AdditionalGuestsField";
import OpenInviteNotice from "@/components/wedding-templates/_shared/OpenInviteNotice";
import type { Palette } from "../theme";
import { BODY, DISPLAY, EASE_OUT, SANS, parseWeddingDate } from "../theme";
import { Floor, FloorHeading } from "./Motion";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2";

/** The reply, on oxblood: underlined linen fields, two large answer buttons, and a filled linen button to send. */
export default function RsvpSection({ config, floor, palette: p }: { config: WeddingConfig; floor: number; palette: Palette }) {
  const { submit, prefillName, maxPlusOnes, matching } = useRsvpSubmit(config);
  const reduce = useReducedMotion();
  const uid = useId();
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [meal, setMeal] = useState<string | undefined>();
  const [dietary, setDietary] = useState("");
  const [plusOneName, setPlusOneName] = useState("");
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (attending === null || sending) return;
    setSending(true);
    const sent = await submit({
      guestName: name,
      email,
      phone: phone.trim() || undefined,
      attending,
      mealChoice: attending ? meal : undefined,
      dietaryRestrictions: attending ? dietary.trim() || undefined : undefined,
      plusOne: attending && Boolean(plusOneName.trim()),
      plusOneName: attending ? plusOneName : "",
      additionalGuestNames: attending ? extraNames : [],
      message,
    });
    setSending(false);
    if (sent) setSubmitted(true);
  };

  const on = p.linenOn;
  const soft = `color-mix(in srgb, ${on} 80%, transparent)`;
  const LINE = `color-mix(in srgb, ${on} 50%, transparent)`;
  const label: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: 15, color: soft };
  const field: CSSProperties = { width: "100%", background: "transparent", border: 0, borderBottom: `1px solid ${LINE}`, borderRadius: 0, padding: "0.6rem 0", fontFamily: SANS, fontSize: "1.0625rem", color: on, outlineColor: on };
  const choice = (active: boolean): CSSProperties => ({
    minHeight: 56,
    padding: "0.6rem 1rem",
    borderRadius: 999,
    border: `1px solid ${active ? on : LINE}`,
    background: active ? on : "transparent",
    color: active ? p.oxblood : on,
    fontFamily: SANS,
    fontWeight: 500,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color .3s, color .3s, border-color .3s",
    outlineColor: on,
  });
  const gap = { marginTop: "1.7rem" };

  const deadlineDate = parseWeddingDate(config.rsvpDeadline);
  const deadline = deadlineDate ? deadlineDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : config.rsvpDeadline?.trim();

  return (
    <Floor id="rsvp" labelledBy="mz-rsvp-title" background={p.oxblood} color={on} maxWidth={560}>
      <FloorHeading id="mz-rsvp-title" floor={floor} title="Your reply" lede={deadline ? `Please reply by ${deadline}.` : "Please let us know either way."} palette={p} onDark />

      {submitted ? (
        <motion.div ref={(el) => el?.focus({ preventScroll: true })} tabIndex={-1} role="status" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE_OUT }} style={{ outline: "none", borderTop: `1px solid ${LINE}`, paddingTop: "1.6rem" }}>
          <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 8cqw, 2.4rem)", lineHeight: 1.12, margin: 0 }}>
            {attending ? "We'll see you upstairs" : "You'll be missed"}
            {name.trim() ? `, ${name.trim().split(" ")[0]}.` : "."}
          </p>
          <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.7, color: soft, margin: "0.8rem 0 0" }}>
            {attending ? "Your reply is in. We can't wait to celebrate with you." : "Thank you for telling us. We'll be thinking of you on the night."}
          </p>
        </motion.div>
      ) : (
        <form aria-label="RSVP" onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-name`} style={label}>Full name</label>
            <input id={`${uid}-name`} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={(e) => matching.checkName(e.target.value)} className={FOCUS} style={field} />
          </div>

          <OpenInviteNotice
            matching={matching}
            labelColor={soft}
            textColor={on}
            lineColor={LINE}
            accent={on}
            errorColor={p.lamp}
            offset="1.25rem"
            bodyStyle={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.6 }}
            labelStyle={label}
            fieldStyle={{ fontFamily: SANS, fontSize: "1.0625rem", padding: "0.6rem 0", width: "10rem" }}
            actionStyle={{ fontFamily: SANS, fontWeight: 600, fontSize: 15 }}
          />

          <div className="flex flex-col gap-1" style={gap}>
            <label htmlFor={`${uid}-email`} style={label}>Email</label>
            <input id={`${uid}-email`} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FOCUS} style={field} />
          </div>

          <div className="flex flex-col gap-1" style={gap}>
            <label htmlFor={`${uid}-phone`} style={label}>Mobile number (optional)</label>
            <input id={`${uid}-phone`} type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={FOCUS} style={field} />
          </div>

          <fieldset style={{ ...gap, border: 0, padding: 0 }}>
            <legend style={{ ...label, marginBottom: "0.8rem" }}>Will you be there?</legend>
            <div className="grid grid-cols-2 gap-3">
              {([[true, "Yes, I'll be there"], [false, "Sorry, I can't"]] as const).map(([value, text]) => (
                <button key={text} type="button" aria-pressed={attending === value} onClick={() => setAttending(value)} className={FOCUS} style={choice(attending === value)}>
                  {text}
                </button>
              ))}
            </div>
          </fieldset>

          {attending && config.mealOptions?.length > 0 && (
            <fieldset style={{ ...gap, border: 0, padding: 0 }}>
              <legend style={{ ...label, marginBottom: "0.8rem" }}>Your dinner</legend>
              <div className="flex flex-col gap-2">
                {config.mealOptions.map((opt) => (
                  <button key={opt} type="button" aria-pressed={meal === opt} onClick={() => setMeal(opt)} className={FOCUS} style={{ ...choice(meal === opt), minHeight: 50, textAlign: "left", borderRadius: 2 }}>
                    {opt}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {attending && (
            <div className="flex flex-col gap-1" style={gap}>
              <label htmlFor={`${uid}-diet`} style={label}>Allergies or dietary needs (optional)</label>
              <input id={`${uid}-diet`} value={dietary} onChange={(e) => setDietary(e.target.value)} className={FOCUS} style={field} />
            </div>
          )}

          {attending && maxPlusOnes > 1 && (
            <div style={gap}>
              <AdditionalGuestsField
                max={maxPlusOnes}
                names={extraNames}
                onChange={setExtraNames}
                labelColor={soft}
                textColor={on}
                lineColor={LINE}
                accent={on}
                labelStyle={{ ...label, marginBottom: "0.25rem" }}
                fieldStyle={field}
                actionStyle={{ fontFamily: SANS, fontWeight: 600, fontSize: 15 }}
              />
            </div>
          )}

          {attending && maxPlusOnes === 1 && (
            <div className="flex flex-col gap-1" style={gap}>
              <label htmlFor={`${uid}-plus`} style={label}>Bringing a guest? Their name (optional)</label>
              <input id={`${uid}-plus`} value={plusOneName} onChange={(e) => setPlusOneName(e.target.value)} className={FOCUS} style={field} />
            </div>
          )}

          <div className="flex flex-col gap-1" style={gap}>
            <label htmlFor={`${uid}-msg`} style={label}>A note for us (optional)</label>
            <textarea id={`${uid}-msg`} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${FOCUS} resize-none`} style={field} />
          </div>

          {matching.sendError && (
            // The notice under the name field announces the error; this copy keeps it in view beside the button.
            <p aria-hidden style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: p.lamp, margin: "2rem 0 -1rem" }}>
              {matching.sendError}
            </p>
          )}
          <button
            type="submit"
            disabled={attending === null || sending}
            className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ marginTop: "2.4rem", minHeight: 54, borderRadius: 999, border: 0, background: on, color: p.oxblood, fontFamily: SANS, fontWeight: 600, fontSize: 16, cursor: "pointer", outlineColor: on }}
          >
            {sending ? "Sending…" : "Send my reply"}
          </button>
          {attending === null && <p style={{ fontFamily: SANS, fontSize: 14, color: soft, margin: "0.8rem 0 0", textAlign: "center" }}>Choose yes or no above to send.</p>}
        </form>
      )}
    </Floor>
  );
}
