"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { BODY, DISPLAY, ENGRAVED, EASE_OUT, GUTTER, SANS, cssImage } from "../theme";

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

/** Name size that keeps the longer name on one line, in the invitation's own container units. */
function nameSize(p1: string, p2: string): string {
  const len = Math.max(5, p1.trim().length, p2.trim().length + 2);
  return `clamp(2.3rem, min(15cqw, ${(142 / len).toFixed(1)}cqw), 5.6rem)`;
}

/**
 * The floor the doors open onto: the couple's photograph full-bleed, settling
 * from a slight lean-in as the doors part, with oxblood rising from the
 * bottom to carry the names, the day and the place.
 */
export default function HeroSection({ config, palette: p, date, started, greeting, showRsvpLink, instant = false }: Props) {
  const reduce = useReducedMotion();
  const show = started || Boolean(reduce);
  const photo = cssImage(config.heroImageUrl);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const place = [config.venueName, config.venueCity].filter(Boolean).join(", ");

  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: instant ? 0.9 : 1.4, delay: (instant ? 0.1 : 3.4) + i * (instant ? 0.08 : 0.18), ease: EASE_OUT },
  });

  return (
    <header aria-labelledby="mz-hero-title" style={{ position: "relative", minHeight: "max(560px, min(100svh, 900px))", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden", background: p.oxblood, color: p.linenOn }}>
      <style>{`.mz-hero-photo { background-position: center 30%; } @container (min-width: 760px) { .mz-hero-photo { background-position: center 58%; } }`}</style>
      <motion.div
        className="mz-hero-photo"
        role={photo ? "img" : undefined}
        aria-label={photo ? `${names}, photographed together` : undefined}
        aria-hidden={photo ? undefined : true}
        initial={reduce ? false : { scale: 1.06 }}
        animate={show ? { scale: 1 } : undefined}
        transition={{ duration: 4.4, delay: 1.5, ease: EASE_OUT }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "74%", transformOrigin: "50% 40%", backgroundColor: p.oxbloodDeep, backgroundImage: photo, backgroundSize: "cover" }}
      />
      {/* The photograph settles into oxblood, so the type below sits on a calm, solid field */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "74.5%", background: `linear-gradient(180deg, color-mix(in srgb, ${p.oxbloodDeep} 30%, transparent) 0%, transparent 18%, transparent 42%, color-mix(in srgb, ${p.oxblood} 58%, transparent) 64%, color-mix(in srgb, ${p.oxblood} 88%, transparent) 84%, ${p.oxblood} 100%)` }} />

      {/* The text block carries its own oxblood ground, so the names never sit on bare photo, whatever the height. */}
      <div style={{ position: "relative", width: "100%", paddingTop: "5rem", background: `linear-gradient(180deg, transparent 0, color-mix(in srgb, ${p.oxblood} 62%, transparent) 4.5rem, color-mix(in srgb, ${p.oxblood} 86%, transparent) 9rem, ${p.oxblood} 13rem)` }}>
      <div style={{ position: "relative", padding: `0 ${GUTTER} clamp(2.25rem, 8cqw, 3.5rem)`, maxWidth: 680, width: "100%", margin: "0 auto" }}>
        <h1 id="mz-hero-title" tabIndex={-1} aria-label={names} style={{ outline: "none", textShadow: "0 1px 18px rgba(18,4,6,.5), 0 0 2px rgba(18,4,6,.35)", fontFamily: DISPLAY, fontWeight: 400, fontSize: nameSize(config.partner1Name, config.partner2Name), lineHeight: 0.95, letterSpacing: "-0.01em", margin: 0, overflowWrap: "anywhere" }}>
          <motion.span {...rise(1)} style={{ display: "block" }}>
            {config.partner1Name}
          </motion.span>
          <motion.span {...rise(2)} style={{ display: "block" }}>
            <span aria-hidden style={{ color: p.bronzeLight, marginRight: "0.18em" }}>&amp;</span>
            {config.partner2Name}
          </motion.span>
        </h1>

        {greeting ? (
          <motion.div {...rise(3)} role="note" aria-label={`Invitation for ${greeting.name}`} style={{ margin: "1.3rem 0 0", maxWidth: "34ch" }}>
            <p style={{ fontFamily: ENGRAVED, fontSize: 15, letterSpacing: "0.12em", color: p.lamp, margin: 0, overflowWrap: "anywhere" }}>For {greeting.name}</p>
            <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.6, color: `color-mix(in srgb, ${p.linenOn} 90%, transparent)`, margin: "0.35rem 0 0" }}>
              {greeting.message || "We would love you to come up and celebrate with us."}
            </p>
          </motion.div>
        ) : (
          <motion.p {...rise(3)} style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.6, color: `color-mix(in srgb, ${p.linenOn} 90%, transparent)`, margin: "1.3rem 0 0", maxWidth: "30ch" }}>
            are getting married, and would love you to come up and celebrate with them.
          </motion.p>
        )}

        {(date.long || place) && (
          <motion.p {...rise(4)} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontFamily: ENGRAVED, fontSize: 16, letterSpacing: "0.1em", color: p.linenOn, margin: "1.6rem 0 0", paddingTop: "1rem", borderTop: `1px solid color-mix(in srgb, ${p.bronzeLight} 45%, transparent)` }}>
            {date.long && <span>{date.long}</span>}
            {place && <span>{place}</span>}
          </motion.p>
        )}

        {showRsvpLink && (
          <motion.div {...rise(5)} style={{ marginTop: "1.6rem" }}>
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
    </header>
  );
}
