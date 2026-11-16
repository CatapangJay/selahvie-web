"use client";

import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SANS, couplePhotos, cssImage } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The gift tag has been opened; the entrance plays from here. */
  opened: boolean;
  /** Personal note for the viewing guest, hung under the date as a small tag. */
  greeting?: { name: string; message: string } | null;
  /** Anchor to the RSVP section, when it is shown; becomes the desktop call to reply. */
  rsvpHref?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Name sizes that keep the longest name on one line: one for the stacked phone
 * hero (also capped by viewport height so the countdown stays above the fold)
 * and one for the desktop text column, which is a little under half the screen.
 */
function nameSizes(...names: string[]) {
  const longest = Math.max(4, ...names.map((n) => n.trim().length));
  return {
    "--ah-name-sm": `clamp(2.4rem, min(15vw, ${(86 / (longest * 0.5)).toFixed(1)}vw, 8.5svh), 5.5rem)`,
    "--ah-name-lg": `clamp(3rem, min(${(38 / (longest * 0.52)).toFixed(2)}vw, 13svh), 6rem)`,
  } as CSSProperties;
}

/**
 * Morning sky: the couple framed in an arched window with the sun turning slowly
 * behind it. Phones stack portrait, names, date and countdown so all of it lands
 * in the first screen; wider screens set the portrait beside the words.
 */
export default function HeroSection({ config, palette: p, date, opened, greeting, rsvpHref }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const image = cssImage(config.heroImageUrl);
  const keepsake = couplePhotos(config)[0];
  const show = opened || Boolean(reduce);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, delay, ease: EASE },
  });
  const couple = `${config.partner1Name} and ${config.partner2Name}`;

  return (
    <header
      ref={ref}
      aria-labelledby="ah-hero-title"
      className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 pb-8 pt-10 lg:px-12 lg:py-24"
      style={{ background: `linear-gradient(180deg, ${p.morning} 0%, ${p.butter} 100%)`, color: p.ink }}
    >
      {/* A low sun glow pooled on the far side, so wide screens read as one sky rather than an empty margin. */}
      <span
        aria-hidden
        className="pointer-events-none absolute hidden lg:block"
        style={{ right: "-12vw", bottom: "-28vw", width: "58vw", aspectRatio: "1", borderRadius: "50%", background: `radial-gradient(circle, color-mix(in srgb, ${p.golden} 80%, transparent) 0%, transparent 68%)` }}
      />

      <div className="relative grid w-full max-w-[76rem] items-center justify-items-center gap-y-0 text-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-[clamp(3rem,6vw,6rem)] lg:text-left">
        {/* Arched window with the sun behind its crown */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1.3, ease: EASE }}
          className="relative order-2 mt-[clamp(1.75rem,4.5svh,2.5rem)] aspect-[3/4] h-[clamp(10.5rem,calc(100svh_-_31.5rem),24rem)] lg:order-1 lg:mt-0 lg:h-[min(calc(100svh_-_13rem),42rem)] lg:justify-self-end"
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
            aria-label={`Portrait of ${couple}`}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "999px 999px 0 0",
              backgroundColor: p.apricotSoft,
              backgroundImage: image,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              boxShadow: `0 0 0 6px ${p.morning}, 0 0 0 7px ${p.apricot}, 0 32px 60px -28px ${p.dusk}`,
            }}
          />
          {/* A second, smaller keepsake frame leaning on the arch: desktop only, where there's room for it. */}
          {keepsake && (
            <motion.div
              {...rise(1.05)}
              role="img"
              aria-label={`${couple} together`}
              className="absolute hidden lg:block"
              style={{
                left: "-18%",
                bottom: "-6%",
                width: "42%",
                aspectRatio: "1",
                borderRadius: "50%",
                backgroundColor: p.apricotSoft,
                backgroundImage: keepsake,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: `0 0 0 5px ${p.morning}, 0 0 0 6px ${p.apricot}, 0 22px 40px -22px ${p.dusk}`,
              }}
            />
          )}
          {/* On wide screens the guest's tag hangs off the frame's right edge, keeping the words column calm. */}
          {greeting && (
            <motion.div {...rise(1.15)} className="absolute hidden lg:block" style={{ right: "-8%", bottom: "16%" }}>
              <GreetingTag greeting={greeting} palette={p} tilt />
            </motion.div>
          )}
        </motion.div>

        <div className="contents lg:order-2 lg:flex lg:flex-col lg:items-start">
          <motion.p
            {...rise(0.1)}
            className="order-1"
            style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.32em", paddingLeft: "0.32em", textTransform: "uppercase", color: p.apricotDeep, margin: 0 }}
          >
            Please join us at golden hour
          </motion.p>

          <h1
            id="ah-hero-title"
            className="order-3 mt-6 w-full text-[length:var(--ah-name-sm)] lg:mt-6 lg:text-[length:var(--ah-name-lg)]"
            style={{ ...nameSizes(config.partner1Name, config.partner2Name), fontFamily: DISPLAY, fontWeight: 300, lineHeight: 1, color: p.ink, overflowWrap: "anywhere" }}
          >
            <motion.span {...rise(0.35)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
            <motion.span {...rise(0.5)} className="lg:pl-[0.6em]" style={{ display: "block", fontStyle: "italic", fontSize: "0.55em", color: p.apricotDeep, margin: "0.12em 0" }}>
              and
            </motion.span>
            <motion.span {...rise(0.65)} className="lg:pl-[0.5em]" style={{ display: "block" }}>{config.partner2Name}</motion.span>
          </h1>

          {date.long && (
            <motion.p {...rise(0.8)} className="order-4 mt-5 lg:mt-9" style={{ fontFamily: SANS, fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: p.ink }}>
              {date.long}
              {config.venueCity && (
                <span style={{ display: "block", marginTop: 8, letterSpacing: "0.02em", textTransform: "none", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.15em", color: p.apricotDeep }}>
                  {[config.venueName, config.venueCity].filter(Boolean).join(", ")}
                </span>
              )}
            </motion.p>
          )}

          {date.date && (
            <motion.div {...rise(0.95)} className="order-5 mt-6 lg:mt-9">
              <Countdown target={date.date} palette={p} />
            </motion.div>
          )}

          {rsvpHref && (
            <motion.a
              {...rise(1.05)}
              href={rsvpHref}
              className="order-6 mt-9 hidden min-h-[52px] items-center gap-3 rounded-full px-7 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 lg:inline-flex"
              style={{ background: p.dusk, color: p.morning, fontFamily: SANS, fontSize: 15, fontWeight: 500, letterSpacing: "0.1em", textDecoration: "none", outlineColor: p.dusk }}
            >
              Reply to our invitation <span aria-hidden>→</span>
            </motion.a>
          )}

          {greeting && (
            <motion.div {...rise(1.1)} className="order-7 mt-8 lg:hidden">
              <GreetingTag greeting={greeting} palette={p} />
            </motion.div>
          )}
        </div>
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

/** The personal note for the viewing guest, cut like a florist's gift tag and hung on a short string. */
function GreetingTag({ greeting, palette: p, tilt = false }: { greeting: { name: string; message: string }; palette: Palette; tilt?: boolean }) {
  return (
    <div
      role="note"
      aria-label={`Invitation for ${greeting.name}`}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: tilt ? "rotate(4deg)" : undefined, transformOrigin: "top center" }}
    >
      {/* When it hangs on the frame, a small brass pin holds the string. */}
      {tilt && <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: p.apricotDeep, boxShadow: `0 0 0 2px ${p.morning}` }} />}
      <span aria-hidden style={{ width: 2, height: 22, background: p.apricot, borderRadius: 2 }} />
      <div
        style={{
          position: "relative",
          width: tilt ? "15rem" : "min(80vw, 18rem)",
          padding: "1.75rem 1.5rem 1.25rem",
          textAlign: "center",
          background: p.morning,
          clipPath: "polygon(12% 0, 88% 0, 100% 18%, 100% 100%, 0 100%, 0 18%)",
          filter: "drop-shadow(0 10px 18px rgba(91,44,58,.18))",
        }}
      >
        <span aria-hidden style={{ position: "absolute", top: 9, left: "50%", width: 10, height: 10, marginLeft: -5, borderRadius: "50%", boxShadow: `inset 0 0 0 2px ${p.apricot}` }} />
        <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: tilt ? "1.4rem" : "clamp(1.3rem, 5.6vw, 1.55rem)", lineHeight: 1.2, color: p.ink, margin: 0, overflowWrap: "anywhere", textWrap: "balance" }}>
          For {greeting.name}
        </p>
        <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 300, lineHeight: 1.5, color: p.ink, opacity: 0.85, margin: "0.5rem 0 0" }}>{greeting.message}</p>
      </div>
    </div>
  );
}

/**
 * Days, hours and minutes in one soft pill split by hairlines: three equal,
 * centred cells so the figures never shift as the clock ticks. Seconds stay out
 * of the way of the calm.
 */
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
    { label: "Days", value: left === null ? null : Math.floor(left / DAY), pad: false },
    { label: "Hours", value: left === null ? null : Math.floor((left % DAY) / 3600), pad: true },
    { label: "Minutes", value: left === null ? null : Math.floor((left % 3600) / 60), pad: true },
  ];
  const spoken = left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes to go`;
  const rule = `color-mix(in srgb, ${p.apricot} 35%, transparent)`;

  return (
    <div
      role="timer"
      aria-label={spoken}
      className="inline-flex items-stretch"
      style={{
        borderRadius: 999,
        padding: "0 0.75rem",
        background: `color-mix(in srgb, ${p.morning} 82%, transparent)`,
        boxShadow: `inset 0 0 0 1px ${rule}, 0 14px 30px -22px ${p.dusk}`,
      }}
    >
      {units.map((u, i) => (
        <div key={u.label} aria-hidden className="flex items-stretch">
          {i > 0 && <span style={{ width: 1, margin: "0.9rem 0", background: rule }} />}
          <div className="flex w-[4.75rem] flex-col items-center justify-center text-center sm:w-[5.5rem]" style={{ padding: "0.85rem 0 0.8rem" }}>
            <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.65rem, 7vw, 2.1rem)", lineHeight: 1, fontVariantNumeric: "lining-nums tabular-nums", color: p.ink }}>
              {u.value === null ? "–" : u.pad ? String(u.value).padStart(2, "0") : u.value}
            </span>
            <span style={{ display: "block", fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.16em", paddingLeft: "0.16em", textTransform: "uppercase", color: p.apricotDeep, marginTop: 7 }}>
              {u.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
