"use client";

import { useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { ACCENT, BODY, HEADING, cssImage, longDate, numeralDate, parseWeddingDate } from "../theme";
import { CornerTicks } from "./Preloader";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** The title card has been dismissed; the entrance plays from here. */
  opened: boolean;
  /** Personal note for the viewing guest, captioned under the countdown. */
  greeting?: { name: string; message: string } | null;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** Name size that keeps the longest name on one line within ~88% of the viewport. */
function nameSize(...names: string[]): string {
  const longest = Math.max(4, ...names.map((n) => n.trim().length));
  const fit = (88 / (longest * 0.56)).toFixed(1);
  return `clamp(2.6rem, min(17vw, ${fit}vw), 7.5rem)`;
}

/**
 * Black-and-white portrait with everything stacked on the centre line: names,
 * a handwritten ampersand, the date in numerals and a ruled countdown.
 */
export default function HeroSection({ config, palette: p, opened, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const target = parseWeddingDate(config.weddingDate);
  const show = opened || Boolean(reduce);
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, delay, ease: EASE },
  });

  return (
    <header
      ref={ref}
      aria-labelledby="mc-hero-title"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "5.5rem 1.25rem 4rem",
        textAlign: "center",
        background: p.ink,
      }}
    >
      <motion.div aria-hidden style={{ position: "absolute", inset: 0, y: reduce ? 0 : imageY, scale: reduce ? 1 : imageScale }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: cssImage(config.heroImageUrl),
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(1) contrast(1.05)",
          }}
        />
      </motion.div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 70% at 50% 55%, color-mix(in srgb, ${p.ink} 55%, transparent) 0%, color-mix(in srgb, ${p.ink} 30%, transparent) 60%, color-mix(in srgb, ${p.ink} 75%, transparent) 100%)`,
        }}
      />
      {/* Film-edge frame inset from the photo */}
      <div aria-hidden style={{ position: "absolute", inset: "clamp(0.75rem, 3vw, 1.5rem)", border: "1px solid rgba(255,255,255,.25)", pointerEvents: "none" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.p
          {...fade(0.1)}
          style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, letterSpacing: "0.34em", paddingLeft: "0.34em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", margin: 0 }}
        >
          Together with their families
        </motion.p>

        <h1
          id="mc-hero-title"
          style={{
            width: "100%",
            fontFamily: HEADING,
            fontSize: nameSize(config.partner1Name, config.partner2Name),
            fontWeight: 200,
            lineHeight: 1,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#fff",
            margin: "1.5rem 0 0",
          }}
        >
          <motion.span {...fade(0.25)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
          <motion.span
            {...fade(0.4)}
            aria-label="and"
            style={{ display: "block", fontFamily: ACCENT, textTransform: "none", letterSpacing: 0, fontSize: "0.7em", lineHeight: 0.9, color: "rgba(255,255,255,.8)", margin: "0.05em 0" }}
          >
            &amp;
          </motion.span>
          <motion.span {...fade(0.55)} style={{ display: "block" }}>{config.partner2Name}</motion.span>
        </h1>

        {target ? (
          <motion.p
            {...fade(0.7)}
            aria-label={longDate(config.weddingDate)}
            style={{ fontFamily: BODY, fontSize: "clamp(15px, 4.4vw, 19px)", fontWeight: 500, letterSpacing: "0.3em", paddingLeft: "0.3em", color: "#fff", margin: "1.75rem 0 2rem" }}
          >
            {numeralDate(config.weddingDate)}
          </motion.p>
        ) : (
          config.weddingDate && (
            <motion.p {...fade(0.7)} style={{ fontFamily: BODY, fontSize: 17, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", margin: "1.75rem 0 2rem" }}>
              {config.weddingDate}
            </motion.p>
          )
        )}

        {target && (
          <motion.div {...fade(0.85)} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Countdown target={target} />
          </motion.div>
        )}

        {greeting && (
          <motion.div
            {...fade(1)}
            role="note"
            aria-label={`Invitation for ${greeting.name}`}
            style={{ position: "relative", width: "min(100%, 22rem)", marginTop: "2.5rem", padding: "1.1rem 1.25rem 1.2rem", background: "rgba(10,10,10,.35)", backdropFilter: "blur(4px)" }}
          >
            <CornerTicks />
            <p style={{ fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,.65)", margin: 0 }}>
              Dear
            </p>
            <p style={{ fontFamily: ACCENT, fontSize: "clamp(2rem, 9vw, 2.6rem)", lineHeight: 1.05, color: "#fff", margin: "0.2rem 0 0.35rem", overflowWrap: "anywhere" }}>
              {greeting.name}
            </p>
            <p style={{ fontFamily: HEADING, fontSize: 15, fontWeight: 300, lineHeight: 1.5, color: "rgba(255,255,255,.85)", margin: 0 }}>{greeting.message}</p>
          </motion.div>
        )}
      </div>
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

/** One ruled strip of four readings, split by hairlines; each number rolls as it changes. */
function Countdown({ target }: { target: Date }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const reduce = useReducedMotion();
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;

  if (left !== null && left <= 0) {
    return (
      <p style={{ fontFamily: ACCENT, fontSize: "clamp(2.2rem, 9vw, 3rem)", color: "#fff", margin: 0 }}>
        {left <= -DAY ? "Happily married" : "Today is the day"}
      </p>
    );
  }

  const units = [
    { label: "Days", value: left === null ? null : Math.floor(left / DAY) },
    { label: "Hrs", value: left === null ? null : Math.floor((left % DAY) / 3600) },
    { label: "Min", value: left === null ? null : Math.floor((left % 3600) / 60) },
    { label: "Sec", value: left === null ? null : left % 60 },
  ];
  const spoken = left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes to go`;

  return (
    <div
      role="timer"
      aria-label={spoken}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        width: "min(100%, 22rem)",
        borderBlock: "1px solid rgba(255,255,255,.35)",
      }}
    >
      {units.map((u, i) => (
        <div key={u.label} aria-hidden style={{ padding: "0.85rem 0.25rem", borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.2)" }}>
          <span
            style={{
              position: "relative",
              display: "block",
              overflow: "hidden",
              height: "1.2em",
              fontFamily: HEADING,
              fontSize: "clamp(22px, 6.4vw, 28px)",
              fontWeight: 200,
              lineHeight: 1.2,
              fontVariantNumeric: "tabular-nums",
              color: "#fff",
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={u.value ?? "–"}
                initial={reduce ? false : { y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                style={{ display: "inline-block" }}
              >
                {u.value === null ? "–" : String(u.value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </span>
          <span style={{ display: "block", fontFamily: BODY, fontSize: 11, fontWeight: 500, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,.65)", marginTop: 4 }}>
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
