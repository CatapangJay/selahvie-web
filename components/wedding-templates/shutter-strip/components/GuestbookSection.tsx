"use client";

import { useId, type CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useGuestbook } from "@/components/wedding-templates/_shared/useGuestbook";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SCRIPT, paperStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e2b45]";

/**
 * The booth's guestbook: guests type a caption on a print card, and each note
 * is kept below like a print pinned to the wall, signed by hand.
 */
export default function GuestbookSection({ config, palette: p }: Props) {
  const { entries, name, setName, message, setMessage, sending, error, submit } = useGuestbook(config);
  const uid = useId();
  const LINE = `color-mix(in srgb, ${p.inkSoft} 60%, transparent)`;

  const label: CSSProperties = { fontFamily: MONO, fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: p.inkSoft };
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
    <section id="guestbook" aria-labelledby="ss-guestbook-title" style={{ ...paperStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ss-guestbook-title" caption="Leave a note" title="The |Guestbook" color={p.ink} accent={p.film} />

        <form onSubmit={submit} aria-label="Sign the guestbook" style={card} className="flex flex-col">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-name`} style={label}>Your name</label>
            <input id={`${uid}-name`} required autoComplete="name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={FOCUS} style={field} />
          </div>
          <div className="flex flex-col gap-1" style={{ marginTop: "2rem" }}>
            <label htmlFor={`${uid}-msg`} style={label}>Your caption for the couple</label>
            <textarea id={`${uid}-msg`} required rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${FOCUS} resize-none`} style={field} />
          </div>
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e2b45] disabled:cursor-wait disabled:opacity-60"
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
            {sending ? "Developing…" : "Sign the guestbook"}
          </button>
          {error && (
            <p role="alert" style={{ fontFamily: MONO, fontSize: "1rem", color: p.film, margin: "1rem 0 0" }}>
              {error}
            </p>
          )}
        </form>

        {entries.length > 0 && (
          <ul style={{ listStyle: "none", margin: "3rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {entries.map((w, i) => (
              <li
                key={w.id}
                style={{ background: p.print, borderRadius: 6, padding: "1.2rem 1.3rem", boxShadow: "0 8px 16px -12px rgba(10,12,20,.45)", rotate: i % 2 ? "0.6deg" : "-0.6deg" }}
              >
                <p style={{ whiteSpace: "pre-line", fontFamily: MONO, fontSize: "clamp(15px, 4.2vw, 17px)", lineHeight: 1.6, color: p.text, margin: 0 }}>{w.message}</p>
                <p style={{ fontFamily: SCRIPT, fontSize: "1.6rem", lineHeight: 1.2, color: p.ink, margin: "0.5rem 0 0" }}>
                  <span aria-hidden style={{ fontFamily: DISPLAY, color: p.film }}>— </span>
                  <span>{w.name}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
