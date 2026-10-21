"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SCRIPT, SERIF, cssImage, woodStyle } from "../theme";
import { Calado } from "./Ornaments";
import { Written } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The window has been opened; the entrance and the handwriting play from here. */
  opened: boolean;
  /** Personal note for the viewing guest, set as a line under the names. */
  greeting?: { name: string; message: string } | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Script size that keeps the couple's names inside a phone's width. */
function nameSize(text: string): string {
  const len = Math.max(8, text.trim().length);
  return `clamp(3rem, min(17vw, ${(165 / len).toFixed(1)}vw), 7.5rem)`;
}

/**
 * An old photograph hung in a narra frame: sepia-warmed portrait, a calado
 * transom across the top, and the couple's names written on in brown ink.
 */
export default function HeroSection({ config, palette: p, date, opened, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const show = opened || Boolean(reduce);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <header
      ref={ref}
      aria-labelledby="nk-hero-title"
      style={{ ...woodStyle(p), position: "relative", minHeight: "100svh", padding: "clamp(0.75rem, 3vw, 1.5rem)", display: "flex" }}
    >
      {/* The framed photograph */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "5rem 1.25rem 3.5rem",
          textAlign: "center",
          boxShadow: `inset 0 0 0 2px ${p.brass}, inset 0 0 0 8px ${p.narraDeep}, 0 20px 40px -20px rgba(0,0,0,.8)`,
        }}
      >
        <motion.div aria-hidden style={{ position: "absolute", inset: "-6%", y: reduce ? 0 : imageY }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: p.molave,
              backgroundImage: cssImage(config.heroImageUrl),
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "sepia(.45) saturate(.85) contrast(1.02)",
            }}
          />
        </motion.div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(110% 75% at 50% 52%, color-mix(in srgb, ${p.narraDeep} 62%, transparent) 0%, color-mix(in srgb, ${p.narraDeep} 30%, transparent) 55%, color-mix(in srgb, ${p.narraDeep} 80%, transparent) 100%)`,
          }}
        />
        <div aria-hidden style={{ position: "absolute", top: "1rem", left: 0, right: 0 }}>
          <Calado color={p.brass} width="min(70%, 20rem)" />
        </div>

        <div style={{ position: "relative", width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", alignItems: "center", color: p.capiz }}>
          <motion.p {...rise(0.1)} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.8vw, 21px)", color: p.sand, margin: 0 }}>
            Sa biyaya ng Diyos at basbas ng aming mga magulang
          </motion.p>

          <h1 id="nk-hero-title" aria-label={names} style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: nameSize(names), lineHeight: 1.05, margin: "1.25rem 0 0.25rem", textShadow: "0 3px 18px rgba(20,10,4,.55)" }}>
            <Written color={p.capiz} nib={p.brass} play={show} delay={0.9} duration={2}>
              {config.partner1Name}
            </Written>
            <br />
            <Written color={p.capiz} nib={p.brass} play={show} delay={2.8} duration={2}>
              &amp; {config.partner2Name}
            </Written>
          </h1>

          {date.long && (
            <motion.p {...rise(1.2)} style={{ fontFamily: DISPLAY, fontSize: "clamp(13px, 3.8vw, 16px)", letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", margin: "1.25rem 0 0" }}>
              {date.long}
            </motion.p>
          )}
          {config.venueName && (
            <motion.p {...rise(1.35)} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 20px)", color: p.sand, margin: "0.4rem 0 0" }}>
              {config.venueName}
              {config.venueCity && `, ${config.venueCity}`}
            </motion.p>
          )}

          {date.date && (
            <motion.div {...rise(1.5)} style={{ marginTop: "2rem", width: "100%", display: "flex", justifyContent: "center" }}>
              <Countdown target={date.date} palette={p} />
            </motion.div>
          )}

          {greeting && (
            <motion.p {...rise(1.7)} role="note" aria-label={`Invitation for ${greeting.name}`} style={{ fontFamily: SERIF, fontSize: "clamp(16px, 4.4vw, 18px)", lineHeight: 1.5, color: p.capiz, margin: "1.75rem 0 0", maxWidth: "22rem" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.26em", paddingLeft: "0.26em", textTransform: "uppercase", color: p.brass, display: "block", marginBottom: 2 }}>
                Para kay {greeting.name}
              </span>
              <em>{greeting.message}</em>
            </motion.p>
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

/** Four small narra plaques with brass keylines, labelled in Filipino. */
function Countdown({ target, palette: p }: { target: Date; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;

  if (left !== null && left <= 0) {
    return (
      <p style={{ fontFamily: SCRIPT, fontSize: "clamp(2.4rem, 10vw, 3.2rem)", color: p.capiz, margin: 0 }}>
        {left <= -DAY ? "Mag-asawa na kami" : "Ngayon na ang araw"}
      </p>
    );
  }

  const units = [
    { label: "Araw", value: left === null ? null : Math.floor(left / DAY) },
    { label: "Oras", value: left === null ? null : Math.floor((left % DAY) / 3600) },
    { label: "Minuto", value: left === null ? null : Math.floor((left % 3600) / 60) },
    { label: "Segundo", value: left === null ? null : left % 60 },
  ];
  const spoken = left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes to go`;

  return (
    <div role="timer" aria-label={spoken} style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, width: "min(100%, 21rem)" }}>
      {units.map((u) => (
        <div
          key={u.label}
          aria-hidden
          style={{
            ...woodStyle(p),
            padding: "0.7rem 0.2rem 0.6rem",
            boxShadow: `inset 0 0 0 1px ${p.brass}, inset 0 0 0 4px ${p.narraDeep}, 0 8px 14px -8px rgba(0,0,0,.7)`,
          }}
        >
          <span style={{ display: "block", fontFamily: DISPLAY, fontSize: "clamp(21px, 6vw, 26px)", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", color: p.capiz }}>
            {u.value === null ? "–" : String(u.value).padStart(2, "0")}
          </span>
          <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: p.sand, marginTop: 2 }}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
