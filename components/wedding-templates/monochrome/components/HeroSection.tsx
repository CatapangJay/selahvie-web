"use client";

import { useRef, useSyncExternalStore, type CSSProperties } from "react";
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

/**
 * Name sizes that keep the longest name on one line: one for the centred phone
 * stack (~88% of the viewport) and one for the desktop type column (~36vw of
 * usable width), which is also capped by height so the countdown stays above the fold.
 */
function nameSizes(...names: string[]) {
  const longest = Math.max(4, ...names.map((n) => n.trim().length));
  return {
    "--mc-name-sm": `clamp(1.75rem, min(17vw, ${(88 / (longest * 0.62)).toFixed(1)}vw), 6rem)`,
    "--mc-name-lg": `clamp(2rem, min(${(36 / (longest * 0.64)).toFixed(2)}vw, 13svh), 6rem)`,
  } as CSSProperties;
}

/**
 * Black-and-white portrait. Phones stack everything on the centre line over the
 * full-bleed photo: names, a handwritten ampersand, the date in numerals and a
 * ruled countdown. Desktop sets the type flush left on a black column and mounts
 * the photo beside it as a framed print, with the guest's caption card pinned
 * across the print's lower edge.
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
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-[5.5rem] text-center lg:flex-row lg:justify-start lg:p-0 lg:text-left"
      style={{ background: p.ink }}
    >
      {/* Phones: full-bleed photo. Desktop: a print mounted on the black page, right of the type column. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden lg:inset-y-6 lg:left-[44%] lg:right-6">
        <motion.div style={{ position: "absolute", inset: 0, y: reduce ? 0 : imageY, scale: reduce ? 1 : imageScale }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: cssImage(config.heroImageUrl),
              backgroundSize: "cover",
              backgroundPosition: "center 35%",
              filter: "grayscale(1) contrast(1.05)",
            }}
          />
        </motion.div>
      </div>
      {/* Scrim keeps the centred type legible over the photo; desktop type sits on solid black instead. */}
      <div
        aria-hidden
        className="absolute inset-0 lg:hidden"
        style={{
          background: `radial-gradient(120% 70% at 50% 55%, color-mix(in srgb, ${p.ink} 55%, transparent) 0%, color-mix(in srgb, ${p.ink} 30%, transparent) 60%, color-mix(in srgb, ${p.ink} 75%, transparent) 100%)`,
        }}
      />
      {/* Film-edge frame: inset from the photo on phones, inside the print's border on desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[clamp(0.75rem,3vw,1.5rem)] lg:inset-y-[2.5rem] lg:left-[calc(44%_+_1rem)] lg:right-[2.5rem]"
        style={{ border: "1px solid rgba(255,255,255,.25)" }}
      />

      <div className="relative flex w-full max-w-[680px] flex-col items-center lg:w-[44%] lg:max-w-none lg:items-start lg:py-16 lg:pl-[clamp(3rem,6vw,6.5rem)] lg:pr-[clamp(2rem,3.5vw,3.5rem)]">
        <motion.p
          {...fade(0.1)}
          className="pl-[0.34em] lg:pl-0"
          style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, letterSpacing: "0.34em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", margin: 0 }}
        >
          Together with their families
        </motion.p>

        <h1
          id="mc-hero-title"
          className="mt-6 w-full text-[length:var(--mc-name-sm)] lg:mt-7 lg:text-[length:var(--mc-name-lg)]"
          style={{
            ...nameSizes(config.partner1Name, config.partner2Name),
            fontFamily: HEADING,
            fontWeight: 200,
            lineHeight: 1,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#fff",
            overflowWrap: "anywhere",
          }}
        >
          <motion.span {...fade(0.25)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
          <motion.span
            {...fade(0.4)}
            aria-label="and"
            className="lg:pl-[1.1em]"
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
            className="mb-8 mt-7 pl-[0.3em] lg:mb-9 lg:mt-9 lg:pl-0"
            style={{ fontFamily: BODY, fontSize: "clamp(15px, 4.4vw, 19px)", fontWeight: 500, letterSpacing: "0.3em", color: "#fff" }}
          >
            {numeralDate(config.weddingDate)}
          </motion.p>
        ) : (
          config.weddingDate && (
            <motion.p
              {...fade(0.7)}
              className="mb-8 mt-7 lg:mb-9 lg:mt-9"
              style={{ fontFamily: BODY, fontSize: 17, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff" }}
            >
              {config.weddingDate}
            </motion.p>
          )
        )}

        {target && (
          <motion.div {...fade(0.85)} className="flex w-full justify-center lg:justify-start">
            <Countdown target={target} />
          </motion.div>
        )}

        {greeting && (
          <motion.div
            {...fade(1)}
            role="note"
            aria-label={`Invitation for ${greeting.name}`}
            className="relative mt-10 w-[min(100%,22rem)] lg:absolute lg:bottom-16 lg:left-[calc(100%_-_3rem)] lg:mt-0 lg:w-[21rem] lg:text-left"
            style={{ padding: "1.1rem 1.25rem 1.2rem", background: `color-mix(in srgb, ${p.ink} 80%, transparent)`, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18)" }}
          >
            <CornerTicks />
            <p className="pl-[0.3em] lg:pl-0" style={{ fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", margin: 0 }}>
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
      className="w-[min(100%,22rem)] lg:w-[25rem]"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        borderBlock: "1px solid rgba(255,255,255,.35)",
      }}
    >
      {units.map((u, i) => (
        <div key={u.label} aria-hidden style={{ padding: "0.85rem 0.25rem", textAlign: "center", borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.2)" }}>
          <span
            className="text-[length:clamp(22px,6.4vw,28px)] lg:text-[32px]"
            style={{
              position: "relative",
              display: "block",
              overflow: "hidden",
              height: "1.2em",
              fontFamily: HEADING,
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
