"use client";

import { useId, type CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useGuestbook } from "@/components/wedding-templates/_shared/useGuestbook";
import type { Palette } from "../theme";
import { ACCENT, BODY, HEADING } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const LINE = "rgba(255,255,255,.35)";

/** Well-wishes on charcoal: hairline fields, then each note numbered down a ruled column. */
export default function GuestbookSection({ config, palette: p, index }: Props) {
  const { entries, name, setName, message, setMessage, sending, error, submit } = useGuestbook(config);
  const uid = useId();

  const label: CSSProperties = { fontFamily: HEADING, fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" };
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

  return (
    <section id="guestbook" aria-labelledby="mc-guestbook-title" style={{ background: p.charcoal, padding: "6rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="mc-guestbook-title" index={index} eyebrow="Well wishes" title="Guestbook" color="#fff" muted="rgba(255,255,255,.55)" />

        <form onSubmit={submit} aria-label="Sign the guestbook" className="flex flex-col" style={{ textAlign: "left" }}>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-name`} style={label}>Your name</label>
            <input id={`${uid}-name`} required autoComplete="name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={FOCUS} style={field} />
          </div>
          <div className="flex flex-col gap-1" style={{ marginTop: "2rem" }}>
            <label htmlFor={`${uid}-msg`} style={label}>A note for the couple</label>
            <textarea id={`${uid}-msg`} required rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${FOCUS} resize-none`} style={field} />
          </div>
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
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
            {sending ? "Signing…" : "Sign the guestbook"}
          </button>
          {error && (
            <p role="alert" style={{ fontFamily: HEADING, fontSize: "1rem", color: "#fff", marginTop: "1rem" }}>
              {error}
            </p>
          )}
        </form>

        {entries.length > 0 && (
          <ol style={{ listStyle: "none", margin: "3.5rem 0 0", padding: 0, textAlign: "left", borderTop: "1px solid rgba(255,255,255,.4)" }}>
            {entries.map((w, i) => (
              <li key={w.id} style={{ display: "grid", gridTemplateColumns: "2.75rem 1fr", padding: "1.6rem 0.25rem", borderBottom: "1px solid rgba(255,255,255,.18)" }}>
                <span aria-hidden style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: "0.1em", color: "rgba(255,255,255,.5)", paddingTop: "0.3rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p style={{ whiteSpace: "pre-line", fontFamily: HEADING, fontSize: "clamp(15px, 4vw, 17px)", fontWeight: 300, lineHeight: 1.65, color: "rgba(255,255,255,.8)", margin: 0 }}>
                    {w.message}
                  </p>
                  <p style={{ fontFamily: ACCENT, fontSize: "clamp(24px, 6vw, 28px)", lineHeight: 1.2, color: "#fff", margin: "0.5rem 0 0" }}>{w.name}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
