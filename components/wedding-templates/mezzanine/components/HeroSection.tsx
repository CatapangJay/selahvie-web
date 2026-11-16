"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { BODY, DISPLAY, ENGRAVED, EASE_OUT, GUTTER, SANS, cssImage } from "../theme";
import CountdownStrip from "./CountdownStrip";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The lift was called: play the entrance. */
  started: boolean;
  greeting: { name: string; message: string } | null;
  showRsvpLink: boolean;
  /** The doors were skipped (return visit or deep link): rise at once. */
  instant?: boolean;
}

/**
 * Name sizes that keep the longer name on one line, in the invitation's own
 * container units: one for the stacked phone hero (also capped by the screen
 * height, so the countdown stays in the first view) and one for the desktop
 * directory column, a little under half the width.
 */
function nameSizes(p1: string, p2: string): CSSProperties {
  const len = Math.max(5, p1.trim().length, p2.trim().length + 2);
  return {
    ["--mz-name" as string]: `clamp(2.1rem, min(15cqw, ${(142 / len).toFixed(1)}cqw, 8.4svh), 5.6rem)`,
    ["--mz-name-lg" as string]: `clamp(2.4rem, min(${(80 / len).toFixed(2)}cqw, 10svh), 6rem)`,
  };
}

/*
 * Phones: the photograph full-bleed, settling into oxblood that carries the
 * names, the day, the place and the floor indicator.
 * Wide invitations (container ≥ 1024px): the photograph hangs as a tall
 * bronze-framed panel beside a lobby-directory column, names over dotted-leader
 * rows and the indicator panel, all inside one screen.
 */
const CSS = `
.mz-hero { --mz-count-num: clamp(1.75rem, min(8.6cqw, 4.6svh), 2.4rem); --mz-count-pad: min(0.75rem, 1.4svh); position: relative; min-height: max(560px, min(100svh, 900px)); display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }
.mz-hero-inner { display: contents; }
.mz-hero-frame { position: relative; flex: 1 1 auto; min-height: 9rem; overflow: hidden; }
.mz-hero-photo { position: absolute; inset: 0; background-size: cover; background-position: 56% 62%; transform-origin: 50% 40%; }
.mz-hero-ground { position: relative; width: 100%; margin-top: -4.5rem; padding-top: 3.5rem; }
.mz-hero-copy { position: relative; padding: 0 ${GUTTER} clamp(1.75rem, min(8cqw, 4.5svh), 3.5rem); max-width: 680px; width: 100%; margin: 0 auto; }
.mz-hero-title { font-size: var(--mz-name); }
.mz-hero-floor, .mz-hero-trim, .mz-hero-dl dt, .mz-hero-leader { display: none; }
.mz-hero-dl { display: flex; flex-direction: column; gap: 0.3rem; }
.mz-hero-dl > div { display: block; }
.mz-hero-gap { margin-top: min(1.4rem, 2.6svh); }
@container (min-width: 760px) { .mz-hero-photo { background-position: center 58%; } }
@container (min-width: 1024px) {
  .mz-hero { --mz-count-num: clamp(2.1rem, 5.4svh, 3rem); --mz-count-pad: min(0.95rem, 1.8svh); min-height: max(600px, 100svh); justify-content: center; padding: clamp(1.75rem, 5.5svh, 3.5rem) clamp(2.5rem, 5cqw, 5rem); }
  .mz-hero-inner { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr); align-items: center; column-gap: clamp(3rem, 6cqw, 6.5rem); width: 100%; max-width: 1320px; margin: 0 auto; }
  .mz-hero-frame { flex: none; outline: 1px solid var(--mz-trim); outline-offset: 7px; height: min(calc(max(600px, 100svh) - 2 * clamp(1.75rem, 5.5svh, 3.5rem)), 880px); }
  .mz-hero-photo { background-position: 58% 45%; }
  .mz-hero-fade { display: none; }
  .mz-hero-ground { background: none !important; margin-top: 0; padding-top: 0; }
  .mz-hero-copy { padding: 0; max-width: 34rem; margin: 0; }
  .mz-hero-title { font-size: var(--mz-name-lg); }
  .mz-hero-floor { display: flex; }
  .mz-hero-dl { gap: 0; }
  .mz-hero-dl > div { display: flex; align-items: baseline; gap: 0.75rem; padding: min(0.7rem, 1.3svh) 0; border-bottom: 1px solid var(--mz-row-rule); }
  .mz-hero-trim, .mz-hero-dl dt, .mz-hero-leader { display: block; }
  .mz-hero-dl dd { text-align: right; min-width: 0; }
  .mz-hero-gap { margin-top: min(1.9rem, 3.4svh); }
}
`;

/**
 * The floor the doors open onto: the couple's photograph, settling from a
 * slight lean-in as the doors part, with the names, the greeting, the day,
 * the place and the floor indicator counting down to it.
 */
export default function HeroSection({ config, palette: p, date, started, greeting, showRsvpLink, instant = false }: Props) {
  const reduce = useReducedMotion();
  const show = started || Boolean(reduce);
  const photo = cssImage(config.heroImageUrl);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const place = [config.venueName, config.venueCity].filter(Boolean).join(", ");
  const soft = `color-mix(in srgb, ${p.linenOn} 90%, transparent)`;
  const rowRule = `color-mix(in srgb, ${p.bronzeLight} 30%, transparent)`;

  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: instant ? 0.9 : 1.4, delay: (instant ? 0.1 : 3.4) + i * (instant ? 0.08 : 0.18), ease: EASE_OUT },
  });

  const rows = [
    date.long && { label: "The day", value: date.long },
    place && { label: "The place", value: place },
  ].filter((r): r is { label: string; value: string } => Boolean(r));

  return (
    <header className="mz-hero" aria-labelledby="mz-hero-title" style={{ background: p.oxblood, color: p.linenOn, ...nameSizes(config.partner1Name, config.partner2Name) }}>
      <style>{CSS}</style>
      <div className="mz-hero-inner">
        <div className="mz-hero-frame" style={{ backgroundColor: p.oxbloodDeep, ["--mz-trim" as string]: `color-mix(in srgb, ${p.bronzeLight} 45%, transparent)` }}>
          <motion.div
            className="mz-hero-photo"
            role={photo ? "img" : undefined}
            aria-label={photo ? `${names}, photographed together` : undefined}
            aria-hidden={photo ? undefined : true}
            initial={reduce ? false : { scale: 1.06 }}
            animate={show ? { scale: 1 } : undefined}
            transition={{ duration: 4.4, delay: 1.5, ease: EASE_OUT }}
            style={{ backgroundImage: photo }}
          />
          {/* Phones: the photograph settles into oxblood, so the type below sits on a calm, solid field */}
          <div className="mz-hero-fade" aria-hidden style={{ position: "absolute", inset: "0 0 -1px", background: `linear-gradient(180deg, color-mix(in srgb, ${p.oxbloodDeep} 30%, transparent) 0%, transparent 18%, transparent 42%, color-mix(in srgb, ${p.oxblood} 58%, transparent) 64%, color-mix(in srgb, ${p.oxblood} 88%, transparent) 84%, ${p.oxblood} 100%)` }} />
          {/* Wide screens: a bronze frame, hung like a portrait in the lobby */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: `inset 0 0 0 1px ${p.bronzeLight}` }} className="mz-hero-trim" />
        </div>

        {/* On phones the text block carries its own oxblood ground, so the names never sit on bare photo. */}
        <div className="mz-hero-ground" style={{ background: `linear-gradient(180deg, transparent 0, color-mix(in srgb, ${p.oxblood} 62%, transparent) 4.5rem, color-mix(in srgb, ${p.oxblood} 86%, transparent) 9rem, ${p.oxblood} 13rem)` }}>
          <div className="mz-hero-copy" style={{ ["--mz-row-rule" as string]: rowRule }}>
            <motion.p {...rise(0)} className="mz-hero-floor" style={{ alignItems: "center", gap: "0.75rem", margin: "0 0 min(1.6rem, 3svh)", fontFamily: ENGRAVED, fontSize: 14, letterSpacing: "0.14em", color: p.lamp }}>
              <span aria-hidden style={{ display: "inline-grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", border: `1px solid ${p.lamp}`, boxShadow: `inset 0 0 0 4px ${p.oxblood}, inset 0 0 0 5px color-mix(in srgb, ${p.lamp} 45%, transparent)`, fontSize: 15, letterSpacing: 0, paddingTop: 1 }}>
                M
              </span>
              The mezzanine floor
            </motion.p>

            <h1 id="mz-hero-title" className="mz-hero-title" tabIndex={-1} aria-label={names} style={{ outline: "none", textShadow: "0 1px 18px rgba(18,4,6,.5), 0 0 2px rgba(18,4,6,.35)", fontFamily: DISPLAY, fontWeight: 400, lineHeight: 0.95, letterSpacing: "-0.01em", margin: 0, overflowWrap: "anywhere" }}>
              <motion.span {...rise(1)} style={{ display: "block" }}>
                {config.partner1Name}
              </motion.span>
              <motion.span {...rise(2)} style={{ display: "block" }}>
                <span aria-hidden style={{ color: p.bronzeLight, marginRight: "0.18em" }}>&amp;</span>
                {config.partner2Name}
              </motion.span>
            </h1>

            {greeting ? (
              <motion.div {...rise(3)} role="note" aria-label={`Invitation for ${greeting.name}`} className="mz-hero-gap" style={{ maxWidth: "34ch" }}>
                <p style={{ fontFamily: ENGRAVED, fontSize: 15, letterSpacing: "0.12em", color: p.lamp, margin: 0, overflowWrap: "anywhere" }}>For {greeting.name}</p>
                <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.55, color: soft, margin: "0.3rem 0 0" }}>
                  {greeting.message || "We would love you to come up and celebrate with us."}
                </p>
              </motion.div>
            ) : (
              <motion.p {...rise(3)} className="mz-hero-gap" style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.55, color: soft, marginBottom: 0, maxWidth: "30ch" }}>
                are getting married, and would love you to come up and celebrate with them.
              </motion.p>
            )}

            {rows.length > 0 && (
              <motion.dl {...rise(4)} className="mz-hero-dl mz-hero-gap" style={{ fontFamily: ENGRAVED, fontSize: 16, letterSpacing: "0.1em", color: p.linenOn, marginBottom: 0, paddingTop: "min(0.9rem, 1.6svh)", borderTop: `1px solid color-mix(in srgb, ${p.bronzeLight} 45%, transparent)` }}>
                {rows.map((r) => (
                  <div key={r.label}>
                    <dt style={{ flexShrink: 0, fontSize: 13, letterSpacing: "0.14em", color: p.bronzeLight }}>{r.label}</dt>
                    <span aria-hidden className="mz-hero-leader" style={{ flex: 1, minWidth: "1.5rem", borderBottom: `1px dotted color-mix(in srgb, ${p.bronzeLight} 50%, transparent)`, transform: "translateY(-4px)" }} />
                    <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{r.value}</dd>
                  </div>
                ))}
              </motion.dl>
            )}

            {date.date && (
              <motion.div {...rise(5)} className="mz-hero-gap">
                <CountdownStrip date={date} palette={p} />
              </motion.div>
            )}

            {showRsvpLink && (
              <motion.div {...rise(6)} className="mz-hero-gap">
                <a
                  href="#rsvp"
                  className="inline-flex items-center justify-center transition-colors hover:bg-[color:var(--mz-hover)] focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{ ["--mz-hover" as string]: "#FFFFFF", minHeight: 50, padding: "0 1.6rem", borderRadius: 999, background: p.linenOn, color: p.oxblood, fontFamily: SANS, fontWeight: 600, fontSize: 15, letterSpacing: "0.02em", textDecoration: "none", outlineColor: p.linenOn }}
                >
                  Reply to the invitation
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
