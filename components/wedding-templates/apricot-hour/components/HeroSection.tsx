"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SANS, cssImage } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The gift tag has been opened; the entrance plays from here. */
  opened: boolean;
  /** Personal note for the viewing guest, hung under the date as a small tag. */
  greeting?: { name: string; message: string } | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Name size that keeps the longest name on one line on a phone. */
function nameSize(...names: string[]): string {
  const longest = Math.max(4, ...names.map((n) => n.trim().length));
  return `clamp(2.6rem, min(15vw, ${(86 / (longest * 0.5)).toFixed(1)}vw), 6.5rem)`;
}

/** Morning sky: an arched window onto the couple with the sun turning slowly behind it. */
export default function HeroSection({ config, palette: p, date, opened, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const image = cssImage(config.heroImageUrl);
  const show = opened || Boolean(reduce);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, delay, ease: EASE },
  });

  return (
    <header
      ref={ref}
      aria-labelledby="ah-hero-title"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4.5rem 1.25rem 3.5rem",
        textAlign: "center",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${p.morning} 0%, ${p.butter} 100%)`,
        color: p.ink,
      }}
    >
      <motion.p
        {...rise(0.1)}
        style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.32em", paddingLeft: "0.32em", textTransform: "uppercase", color: p.apricotDeep, margin: "0 0 1.75rem" }}
      >
        Please join us at golden hour
      </motion.p>

      {/* Arched window with the sun behind its crown */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={show ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.3, ease: EASE }}
        style={{ position: "relative", width: "min(68vw, 19rem)", aspectRatio: "3 / 4" }}
      >
        <motion.div aria-hidden style={{ position: "absolute", left: "50%", top: "-14%", width: "130%", aspectRatio: "1", x: "-50%", y: reduce ? 0 : sunY }}>
          <motion.svg
            viewBox="0 0 200 200"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            style={{ width: "100%", height: "100%" }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <line key={i} x1="100" y1="10" x2="100" y2="34" stroke={p.apricot} strokeWidth="2.4" strokeLinecap="round" opacity=".55" transform={`rotate(${i * 15} 100 100)`} />
            ))}
            <circle cx="100" cy="100" r="58" fill={p.golden} />
          </motion.svg>
        </motion.div>
        <div
          role="img"
          aria-label={`${config.partner1Name} and ${config.partner2Name}`}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "999px 999px 0 0",
            backgroundColor: p.apricotSoft,
            backgroundImage: image,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: `0 0 0 6px ${p.morning}, 0 0 0 7px ${p.apricot}, 0 24px 48px -24px ${p.dusk}`,
          }}
        />
      </motion.div>

      <h1
        id="ah-hero-title"
        style={{ width: "100%", fontFamily: DISPLAY, fontWeight: 300, fontSize: nameSize(config.partner1Name, config.partner2Name), lineHeight: 1, color: p.ink, margin: "2.25rem 0 0" }}
      >
        <motion.span {...rise(0.35)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
        <motion.span {...rise(0.5)} style={{ display: "block", fontStyle: "italic", fontSize: "0.55em", color: p.apricotDeep, margin: "0.15em 0" }}>
          and
        </motion.span>
        <motion.span {...rise(0.65)} style={{ display: "block" }}>{config.partner2Name}</motion.span>
      </h1>

      {date.long && (
        <motion.p {...rise(0.8)} style={{ fontFamily: SANS, fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: p.ink, margin: "1.5rem 0 0" }}>
          {date.long}
          {config.venueCity && <span style={{ display: "block", marginTop: 6, letterSpacing: "0.1em", textTransform: "none", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.1em", color: p.apricotDeep }}>{config.venueCity}</span>}
        </motion.p>
      )}

      {date.date && (
        <motion.div {...rise(0.95)} style={{ marginTop: "1.75rem" }}>
          <Countdown target={date.date} palette={p} />
        </motion.div>
      )}

      {greeting && (
        <motion.div {...rise(1.1)} role="note" aria-label={`Invitation for ${greeting.name}`} style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span aria-hidden style={{ width: 2, height: 22, background: p.apricot, borderRadius: 2 }} />
          <div
            style={{
              position: "relative",
              width: "min(80vw, 18rem)",
              padding: "1.6rem 1.25rem 1.1rem",
              background: p.morning,
              clipPath: "polygon(12% 0, 88% 0, 100% 18%, 100% 100%, 0 100%, 0 18%)",
              filter: `drop-shadow(0 8px 14px rgba(91,44,58,.14))`,
            }}
          >
            <span aria-hidden style={{ position: "absolute", top: 8, left: "50%", width: 10, height: 10, marginLeft: -5, borderRadius: "50%", boxShadow: `inset 0 0 0 2px ${p.apricot}` }} />
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.3rem, 5.6vw, 1.55rem)", lineHeight: 1.15, color: p.ink, margin: 0, overflowWrap: "anywhere" }}>
              For {greeting.name}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 300, lineHeight: 1.5, color: p.ink, opacity: 0.85, margin: "0.4rem 0 0" }}>{greeting.message}</p>
          </div>
        </motion.div>
      )}
    </header>
  );
}

const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
// Server render shows dashes, so hydration never disagrees with the clock.
const serverSeconds = () => null;

const DAY = 86_400;

/** Days, hours and minutes as soft pebbles; seconds stay out of the way of the calm. */
function Countdown({ target, palette: p }: { target: Date; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;

  if (left !== null && left <= 0) {
    return (
      <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.6rem, 6vw, 2rem)", color: p.apricotDeep, margin: 0 }}>
        {left <= -DAY ? "Happily married" : "Today is the day"}
      </p>
    );
  }

  const units = [
    { label: "days", value: left === null ? null : Math.floor(left / DAY) },
    { label: "hours", value: left === null ? null : Math.floor((left % DAY) / 3600) },
    { label: "minutes", value: left === null ? null : Math.floor((left % 3600) / 60) },
  ];
  const spoken = left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes to go`;

  return (
    <div role="timer" aria-label={spoken} style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {units.map((u) => (
        <div
          key={u.label}
          aria-hidden
          style={{
            minWidth: "4.75rem",
            padding: "0.7rem 0.5rem 0.6rem",
            borderRadius: "1.5rem 1.5rem 1rem 1rem",
            background: p.morning,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.apricot} 40%, transparent)`,
          }}
        >
          <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.5rem, 6.5vw, 1.9rem)", lineHeight: 1, fontVariantNumeric: "lining-nums tabular-nums", color: p.ink }}>
            {u.value ?? "–"}
          </span>
          <span style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: p.apricotDeep, marginTop: 4 }}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
