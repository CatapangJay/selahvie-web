"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SANS, cssImage, labelText, paperStyle, sheetStyle, tapeStyle } from "../theme";
import { Sprig } from "./Specimens";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The folio has begun to unfold: play the entrance. */
  started: boolean;
  greeting: { name: string; message: string } | null;
  /** Show the "leave a note" link (guestbook visible to this guest). */
  showGuestbookLink: boolean;
  showRsvpLink: boolean;
}

/** Name size that keeps the longer line inside the sheet, in the invitation's own container units. */
function nameSize(p1: string, p2: string): string {
  const len = Math.max(5, p1.trim().length, p2.trim().length + 2);
  return `clamp(2.6rem, min(17cqw, ${(150 / len).toFixed(1)}cqw), 5.6rem)`;
}

/**
 * The first sheet of the folio: a photograph tipped in with linen tape, a
 * pressed sprig laid across its corner, the names set large in a light serif,
 * and a typed label for the date and place in the lower right, the way a
 * collector labels a specimen. Blocks rise in turn, 220ms apart, once the
 * folds begin to open.
 */
export default function HeroSection({ config, palette: p, date, started, greeting, showGuestbookLink, showRsvpLink }: Props) {
  const reduce = useReducedMotion();
  const show = started || Boolean(reduce);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const photo = cssImage(config.heroImageUrl);

  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 2, delay: 0.35 + i * 0.22, ease: [0.16, 1, 0.3, 1] as const },
  });

  const link = (filled: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 1.35rem",
    borderRadius: 2,
    border: `1px solid ${p.ink}`,
    background: filled ? p.ink : "transparent",
    color: filled ? p.sheet : p.ink,
    fontFamily: MONO,
    fontSize: 12,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    textDecoration: "none",
    outlineColor: p.ink,
  });

  return (
    <header aria-labelledby="ef-hero-title" style={{ ...paperStyle(p), position: "relative", overflow: "hidden", padding: "2.25rem clamp(1.25rem, 6cqw, 2rem) 2rem" }}>
      <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
      <motion.p {...rise(0)} style={{ ...labelText(p, 11), display: "flex", justifyContent: "space-between", margin: 0, paddingBottom: "0.7rem", borderBottom: `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)` }}>
        <span>Herbarium of a marriage</span>
        <span aria-hidden>Sheet 01</span>
      </motion.p>

      {/* Tipped-in photograph */}
      <motion.div {...rise(1)} style={{ position: "relative", margin: "2.4rem auto 0", width: "min(100%, 30rem)" }}>
        <div style={{ ...sheetStyle(p), padding: "0.7rem 0.7rem 2.1rem", transform: "rotate(-1.2deg)" }}>
          <div
            role={photo ? "img" : undefined}
            aria-label={photo ? `${names}` : undefined}
            aria-hidden={photo ? undefined : true}
            style={{ aspectRatio: "4 / 5", backgroundColor: "#C9C6B4", backgroundImage: photo, backgroundSize: "cover", backgroundPosition: "center 30%" }}
          />
          <p aria-hidden style={{ ...labelText(p, 10), margin: "0.65rem 0 0", textAlign: "right" }}>fig. 1 — the two of us</p>
        </div>
        <span aria-hidden style={{ ...tapeStyle(p, -38), top: 6, left: -18 }} />
        <span aria-hidden style={{ ...tapeStyle(p, 34), top: 4, right: -20 }} />
        <Sprig which={0} width="38cqw" rotate={28} style={{ left: "-11%", bottom: "-9%", zIndex: 1, maxWidth: 220 }} />
      </motion.div>

      <div style={{ position: "relative", zIndex: 2, marginTop: "2.4rem", textAlign: "left" }}>
        {greeting && (
          <motion.div {...rise(2)} role="note" aria-label={`Invitation for ${greeting.name}`} style={{ marginBottom: "1.4rem", paddingLeft: "0.9rem", borderLeft: `2px solid ${p.rust}` }}>
            <p style={{ ...labelText(p, 10), color: p.rust, margin: 0 }}>Prepared for</p>
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.3rem, 6cqw, 1.6rem)", lineHeight: 1.25, color: p.ink, margin: "0.15rem 0 0", overflowWrap: "anywhere" }}>{greeting.name}</p>
            {greeting.message && <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: p.text, margin: "0.3rem 0 0" }}>{greeting.message}</p>}
          </motion.div>
        )}

        <h1 id="ef-hero-title" aria-label={names} style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: nameSize(config.partner1Name, config.partner2Name), lineHeight: 0.98, letterSpacing: "-0.02em", color: p.ink, margin: 0, overflowWrap: "anywhere" }}>
          <motion.span {...rise(3)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
          <motion.span {...rise(4)} style={{ display: "block", paddingLeft: "12cqw" }}>
            <em aria-hidden style={{ color: p.rust, fontWeight: 300, marginRight: "0.12em" }}>&amp;</em>
            {config.partner2Name}
          </motion.span>
        </h1>

        <motion.p {...rise(5)} style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.2cqw, 17px)", lineHeight: 1.65, color: p.text, margin: "1.4rem 0 0", maxWidth: "32ch" }}>
          Together with our families, we would be glad to have you beside us as we marry.
        </motion.p>

        {(date.long || config.venueName || config.venueCity) && (
          <motion.dl {...rise(6)} style={{ margin: "1.8rem 0 0 auto", width: "min(100%, 20rem)", border: `1px solid color-mix(in srgb, ${p.ink} 45%, transparent)`, padding: "0.35rem 0.9rem", background: `color-mix(in srgb, ${p.sheet} 70%, transparent)` }}>
            {[
              date.long ? ["Date", date.long] : null,
              config.venueName || config.venueCity ? ["Locality", [config.venueName, config.venueCity].filter(Boolean).join(", ")] : null,
            ]
              .filter((r): r is string[] => Boolean(r))
              .map(([k, v], i) => (
                <div key={k} style={{ display: "flex", gap: "0.8rem", padding: "0.55rem 0", borderTop: i ? `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)` : "none" }}>
                  <dt style={{ ...labelText(p, 10), flex: "0 0 4.6rem", paddingTop: 3 }}>{k}</dt>
                  <dd style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.45, color: p.text, margin: 0 }}>{v}</dd>
                </div>
              ))}
          </motion.dl>
        )}

        {(showRsvpLink || showGuestbookLink) && (
          <motion.div {...rise(7)} className="flex flex-wrap gap-3" style={{ marginTop: "1.8rem" }}>
            {showRsvpLink && (
              <a href="#rsvp" className="transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4" style={link(true)}>
                Reply
              </a>
            )}
            {showGuestbookLink && (
              <a href="#guestbook" className="transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4" style={link(false)}>
                Leave a note
              </a>
            )}
          </motion.div>
        )}
      </div>

      </div>
      <Sprig which={1} width="34cqw" rotate={-142} style={{ right: "-11%", top: "56%", maxWidth: 200, opacity: 0.85 }} />
    </header>
  );
}
