"use client";

import { useId, type CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { useGuestbook } from "@/components/wedding-templates/_shared/useGuestbook";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

/** Well-wishes written on a ribbon-tied card, then each note kept below as a soft rounded tag. */
export default function GuestbookSection({ config, palette: p, band }: Props) {
  const { entries, name, setName, message, setMessage, sending, error, submit } = useGuestbook(config);
  const uid = useId();
  const t = tones(band, p);

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
  const card: CSSProperties = {
    position: "relative",
    background: p.morning,
    color: p.ink,
    borderRadius: "1.75rem",
    padding: "clamp(2.5rem, 8vw, 3rem) clamp(1.25rem, 6vw, 2.5rem) clamp(1.75rem, 6vw, 2.5rem)",
    boxShadow: "0 30px 60px -30px rgba(0,0,0,.5)",
  };

  return (
    <section id="guestbook" aria-labelledby="ah-guestbook-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      {/* Wide screens: the invitation to write and the wishes so far on the left, the card on the right. */}
      <div className="mx-auto grid max-w-[560px] items-start lg:max-w-[66rem] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-x-20">
        <div className="lg:col-start-1 lg:row-start-1">
          <SectionTitle id="ah-guestbook-title" eyebrow="Leave a wish" title="Our guestbook" band={band} palette={p} align="start" style={{ marginBottom: "1rem" }} />
          <p className="mx-auto text-center lg:ml-0 lg:text-left" style={{ maxWidth: "34ch", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.15rem", lineHeight: 1.5, color: band.dark ? p.butter : p.apricotDeep, margin: "0 0 2.5rem" }}>
            {entries.length > 0 ? "A few words from the people we love." : "Be the first to leave us a few words for the years ahead."}
          </p>
        </div>

        <form onSubmit={submit} aria-label="Sign the guestbook" style={card} className="flex flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-6">
          <span aria-hidden style={{ position: "absolute", top: -14, left: "50%", width: 64, height: 28, marginLeft: -32, borderRadius: "0 0 10px 10px", background: p.apricot, boxShadow: `inset 0 -3px 0 ${p.apricotDeep}` }} />
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-name`} style={label}>Your name</label>
            <input id={`${uid}-name`} required autoComplete="name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={focus} style={field} />
          </div>
          <div className="flex flex-col gap-1" style={{ marginTop: "1.75rem" }}>
            <label htmlFor={`${uid}-msg`} style={label}>Your wishes for us</label>
            <textarea id={`${uid}-msg`} required rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${focus} resize-none`} style={field} />
          </div>
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
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
            {sending ? "Signing…" : "Sign the guestbook"}
          </button>
          {error && (
            <p role="alert" style={{ fontFamily: SANS, fontSize: "1rem", color: p.apricotDeep, margin: "1rem 0 0" }}>
              {error}
            </p>
          )}
        </form>

        {entries.length > 0 && (
          <ul className="mt-10 grid gap-3 lg:col-start-1 lg:row-start-2 lg:mt-0" style={{ listStyle: "none", padding: 0 }}>
            {entries.map((w) => (
              <li key={w.id} style={{ background: t.card, borderRadius: "1.25rem", padding: "1.2rem 1.4rem", boxShadow: band.dark ? `inset 0 0 0 1px ${t.rule}` : undefined }}>
                <p style={{ whiteSpace: "pre-line", fontFamily: SANS, fontWeight: 300, fontSize: "1rem", lineHeight: 1.65, color: t.soft, margin: 0 }}>{w.message}</p>
                <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.2rem", color: band.dark ? p.morning : p.ink, margin: "0.4rem 0 0" }}>{w.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
