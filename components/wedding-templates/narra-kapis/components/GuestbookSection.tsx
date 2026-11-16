"use client";

import { useId, type CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useGuestbook } from "@/components/wedding-templates/_shared/useGuestbook";
import type { Palette } from "../theme";
import { DISPLAY, SCRIPT, SERIF, capizStyle, woodStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b3e1f]";

/**
 * Pagbati (well-wishes) on narra wood: a brass-framed capiz pane to write on,
 * and each note kept below as a smaller pane, signed in script.
 */
export default function GuestbookSection({ config, palette: p }: Props) {
  const { entries, name, setName, message, setMessage, sending, error, submit } = useGuestbook(config);
  const uid = useId();
  const LINE = `color-mix(in srgb, ${p.molave} 55%, transparent)`;

  const label: CSSProperties = { fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: p.molave };
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
  const card: CSSProperties = {
    ...capizStyle(p, 98),
    position: "relative",
    color: p.ink,
    padding: "clamp(2rem, 6vw, 2.75rem)",
    boxShadow: `0 0 0 6px ${p.narraDeep}, 0 0 0 7px ${p.brass}, 0 24px 40px -24px rgba(0,0,0,.8)`,
  };

  return (
    <section id="guestbook" aria-labelledby="nk-guestbook-title" style={{ ...woodStyle(p), padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="nk-guestbook-title" eyebrow="Mga pagbati" title="Guestbook" color={p.capiz} accent={p.brass} />

        <form onSubmit={submit} aria-label="Sign the guestbook" style={card} className="flex flex-col">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-name`} style={label}>Pangalan · Your name</label>
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
            className="transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6b3e1f] disabled:cursor-wait disabled:opacity-60"
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
            {sending ? "Ipinapadala…" : "Sign the guestbook"}
          </button>
          {error && (
            <p role="alert" style={{ fontFamily: SERIF, fontSize: "1.05rem", color: p.narraDeep, margin: "1rem 0 0" }}>
              {error}
            </p>
          )}
        </form>

        {entries.length > 0 && (
          <ul style={{ listStyle: "none", margin: "3rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {entries.map((w) => (
              <li key={w.id} style={{ ...capizStyle(p, 94), borderLeft: `6px solid ${p.narra}`, boxShadow: `0 0 0 1px ${p.brass}`, padding: "1.2rem 1.3rem" }}>
                <p style={{ whiteSpace: "pre-line", fontFamily: SERIF, fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.6, color: p.ink, margin: 0 }}>{w.message}</p>
                <p style={{ fontFamily: SCRIPT, fontSize: "1.7rem", lineHeight: 1.2, color: p.narraDeep, margin: "0.4rem 0 0" }}>{w.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
