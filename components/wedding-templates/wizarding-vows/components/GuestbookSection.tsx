"use client";

import { useId, type CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useGuestbook } from "@/components/wedding-templates/_shared/useGuestbook";
import type { Palette } from "../theme";
import { BOOK, CAPS, QUILL, capsLabel, parchmentStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e1f12]";

/**
 * Guestbook as a ledger of notes: guests write on ruled parchment, and each
 * well-wish is kept below as a folded note signed in quill.
 */
export default function GuestbookSection({ config, palette: p }: Props) {
  const { entries, name, setName, message, setMessage, sending, error, submit } = useGuestbook(config);
  const uid = useId();
  const LINE = `color-mix(in srgb, ${p.inkSoft} 55%, transparent)`;

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
  const letter: CSSProperties = {
    ...parchmentStyle(p),
    position: "relative",
    backgroundColor: `color-mix(in srgb, ${p.parchment} 75%, #FFF9EA)`,
    borderRadius: 3,
    padding: "clamp(2rem, 6vw, 2.75rem) clamp(1.3rem, 5vw, 2.25rem) clamp(2.4rem, 7vw, 3rem)",
    boxShadow: "0 26px 44px -28px rgba(30,18,6,.7)",
  };

  return (
    <section id="guestbook" aria-labelledby="wv-guestbook-title" style={{ ...parchmentStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="wv-guestbook-title" kicker="Leave a note" title="The Guestbook" subtitle="Well wishes for the happy couple" color={p.ink} accent={p.wax} />

        <form onSubmit={submit} aria-label="Sign the guestbook" style={letter} className="flex flex-col">
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
            className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2e1f12] disabled:cursor-wait disabled:opacity-60"
            style={{
              marginTop: "2.5rem",
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
            {sending ? "Inking…" : "Sign the guestbook"}
          </button>
          {error && (
            <p role="alert" style={{ fontFamily: BOOK, fontSize: "1.05rem", color: p.wax, margin: "1rem 0 0" }}>
              {error}
            </p>
          )}
        </form>

        {entries.length > 0 && (
          <ul style={{ listStyle: "none", margin: "3rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.map((w) => (
              <li
                key={w.id}
                style={{
                  background: `color-mix(in srgb, ${p.parchment} 70%, #FFF9EA)`,
                  borderRadius: 3,
                  padding: "1.2rem 1.3rem",
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.inkSoft} 28%, transparent), 0 10px 18px -14px rgba(30,18,6,.6)`,
                }}
              >
                <p style={{ whiteSpace: "pre-line", fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(16px, 4.4vw, 18px)", lineHeight: 1.6, color: p.ink, margin: 0 }}>{w.message}</p>
                <p style={{ fontFamily: QUILL, fontSize: "clamp(28px, 7vw, 34px)", lineHeight: 1.1, color: p.quill, margin: "0.4rem 0 0" }}>{w.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
