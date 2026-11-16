"use client";

import { useId, type CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useGuestbook } from "@/components/wedding-templates/_shared/useGuestbook";
import type { Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, feltStyle, paperStyle } from "../theme";
import SectionHeading from "./SectionHeading";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b1018]";

/**
 * Well-wishes on teal felt: a gilt-edged cream card to write on, and each note
 * kept below as its own small card, signed in script.
 */
export default function GuestbookSection({ config, palette: p }: Props) {
  const { entries, name, setName, message, setMessage, sending, error, submit } = useGuestbook(config);
  const uid = useId();

  const label: CSSProperties = { fontFamily: SERIF, fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.28em", textTransform: "uppercase", color: p.goldInk };
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
  const card: CSSProperties = {
    ...paperStyle(p.cream, p.creamDeep),
    color: p.ink,
    boxShadow: `inset 0 0 0 7px ${p.cream}, inset 0 0 0 8px ${p.gold}, 0 30px 60px -24px rgba(0,0,0,.65)`,
    padding: "clamp(2.25rem, 6vw, 3.5rem) clamp(1.5rem, 5vw, 3.25rem)",
  };

  return (
    <section id="guestbook" aria-labelledby="jt-guestbook-title" style={{ ...feltStyle(p.teal, p.tealDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "40rem" }}>
        <SectionHeading id="jt-guestbook-title" eyebrow="Well Wishes" title="Guestbook" palette={p} tone="dark" />

        <form onSubmit={submit} aria-label="Sign the guestbook" style={card} className="flex flex-col">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-name`} style={label}>Your name</label>
            <input id={`${uid}-name`} required autoComplete="name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={FOCUS} style={field} />
          </div>
          <div className="flex flex-col gap-1" style={{ marginTop: "2rem" }}>
            <label htmlFor={`${uid}-msg`} style={label}>Your wishes for the couple</label>
            <textarea id={`${uid}-msg`} required rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${FOCUS} resize-none`} style={field} />
          </div>
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b1018] disabled:cursor-wait disabled:opacity-60"
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
            {sending ? "Signing…" : "Sign the guestbook"}
          </button>
          {error && (
            <p role="alert" style={{ fontFamily: SERIF, fontSize: "1.05rem", color: p.raspberryDeep, marginTop: "1rem" }}>
              {error}
            </p>
          )}
        </form>

        {entries.length > 0 && (
          <ul className="flex flex-col" style={{ gap: "1rem", marginTop: "2.5rem" }}>
            {entries.map((w) => (
              <li key={w.id} style={{ ...paperStyle(p.cream, p.creamDeep), boxShadow: `inset 0 0 0 1px ${p.gold}90`, padding: "1.4rem 1.6rem" }}>
                <p className="whitespace-pre-line" style={{ fontFamily: SERIF, fontSize: "1.15rem", lineHeight: 1.6, color: p.ink, margin: 0 }}>
                  {w.message}
                </p>
                <p style={{ fontFamily: SCRIPT, fontSize: "1.6rem", lineHeight: 1.2, color: p.raspberryDeep, margin: "0.5rem 0 0" }}>{w.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
