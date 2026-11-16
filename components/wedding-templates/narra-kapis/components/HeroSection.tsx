"use client";

import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SCRIPT, SERIF, capizStyle, cssImage, woodStyle } from "../theme";
import { Brackets, CapizPanes, Calado } from "./Ornaments";
import { Written } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The window has been opened; the entrance and the handwriting play from here. */
  opened: boolean;
  /** Personal note for the viewing guest: a line under the names on phones, a note tucked in the window on desktop. */
  greeting?: { name: string; message: string } | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Script sizes for the couple's names: one for the centred phone hero (sized on
 * the whole pair, as before) and one for the desktop text column, sized on the
 * longer of the two written lines and capped by viewport height so the
 * countdown stays above the fold.
 */
function nameSizes(partner1: string, partner2: string) {
  const len = Math.max(8, `${partner1} & ${partner2}`.trim().length);
  const line = Math.max(6, partner1.trim().length, partner2.trim().length + 2);
  return {
    "--nk-name-sm": `clamp(3rem, min(17vw, ${(165 / len).toFixed(1)}vw), 7.5rem)`,
    "--nk-name-lg": `clamp(3rem, min(${(88 / line).toFixed(2)}vw, 12.5svh), 6rem)`,
  } as CSSProperties;
}

/**
 * An old photograph in a bahay na bato. Phones see it hung in a narra frame with
 * the names written over the sepia print; wide screens step back into the room:
 * the portrait sits in a capiz window with its shell sashes slid open and the
 * guest's note tucked in the corner, and the words are set on the narra wall beside it.
 */
export default function HeroSection({ config, palette: p, date, opened, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const image = cssImage(config.heroImageUrl);
  const show = opened || Boolean(reduce);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: EASE },
  });
  const sepia = (position: string): CSSProperties => ({
    position: "absolute",
    inset: 0,
    backgroundColor: p.molave,
    backgroundImage: image,
    backgroundSize: "cover",
    backgroundPosition: position,
    filter: "sepia(.45) saturate(.85) contrast(1.02)",
  });

  return (
    <header
      ref={ref}
      aria-labelledby="nk-hero-title"
      style={{ ...woodStyle(p), position: "relative", minHeight: "100svh", padding: "clamp(0.75rem, 3vw, 1.5rem)", display: "flex" }}
    >
      {/* Phones: the framed photograph. Desktop: the wall panel the window is set into. */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 pb-14 pt-20 text-center lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-x-[clamp(3.5rem,6.5vw,7rem)] lg:px-[clamp(3rem,6vw,7.5rem)] lg:pb-16 lg:pt-10 lg:text-left"
        style={{ boxShadow: `inset 0 0 0 2px ${p.brass}, inset 0 0 0 8px ${p.narraDeep}, 0 20px 40px -20px rgba(0,0,0,.8)` }}
      >
        {/* Phone photograph behind the words */}
        <motion.div aria-hidden className="lg:hidden" style={{ position: "absolute", inset: "-6%", y: reduce ? 0 : imageY }}>
          <div style={sepia("center")} />
        </motion.div>
        <div
          aria-hidden
          className="lg:hidden"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, transparent 50%, color-mix(in srgb, ${p.narraDeep} 55%, transparent) 78%, transparent 100%), radial-gradient(110% 75% at 50% 52%, color-mix(in srgb, ${p.narraDeep} 62%, transparent) 0%, color-mix(in srgb, ${p.narraDeep} 30%, transparent) 55%, color-mix(in srgb, ${p.narraDeep} 80%, transparent) 100%)`,
          }}
        />
        <div aria-hidden className="lg:hidden" style={{ position: "absolute", top: "1rem", left: 0, right: 0 }}>
          <Calado color={p.brass} width="min(70%, 20rem)" />
        </div>

        {/* Desktop: the capiz window holding the portrait */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={show ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative hidden aspect-[17/25] h-[min(calc(100svh_-_9.5rem),46rem)] flex-col lg:flex lg:justify-self-end"
        >
          <div aria-hidden style={{ background: p.narraDeep, padding: "0.8rem 1rem 0.4rem", borderRadius: "999px 999px 0 0", boxShadow: `inset 0 0 0 3px ${p.molave}` }}>
            <Calado color={p.brass} width="100%" />
          </div>
          <div
            className="relative flex-1 overflow-hidden"
            style={{ border: `12px solid ${p.narraDeep}`, boxShadow: `inset 0 0 0 2px ${p.molave}, 0 34px 60px -30px rgba(0,0,0,.85)`, background: p.molave }}
          >
            <motion.div style={{ position: "absolute", inset: "-6%", y: reduce ? 0 : imageY }}>
              <div role="img" aria-label={`Portrait of ${config.partner1Name} and ${config.partner2Name}`} style={sepia("center 30%")} />
            </motion.div>
            {/* The two shell sashes, slid back into the frame */}
            {(["left", "right"] as const).map((side) => (
              <motion.div
                key={side}
                aria-hidden
                initial={reduce ? false : { x: "0%" }}
                animate={show ? { x: side === "left" ? "-80%" : "80%" } : undefined}
                transition={{ duration: 1.6, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
                style={{ position: "absolute", top: 0, bottom: 0, width: "50%", [side]: 0, borderInline: `3px solid ${p.narraDeep}`, boxShadow: "0 0 18px rgba(20,10,4,.45)" }}
              >
                <CapizPanes palette={p} cols={3} rows={7} gap={4} style={{ height: "100%" }} />
              </motion.div>
            ))}
          </div>
          {/* Window sill */}
          <div aria-hidden style={{ height: 16, margin: "0 -14px", background: p.narraDeep, boxShadow: `inset 0 2px 0 ${p.molave}, 0 12px 20px -8px rgba(0,0,0,.7)` }} />

          {greeting && (
            <motion.div
              {...rise(1.9)}
              role="note"
              aria-label={`Invitation for ${greeting.name}`}
              style={{
                ...capizStyle(p, 100),
                position: "absolute",
                left: "-13%",
                bottom: "9%",
                width: "min(17rem, 72%)",
                padding: "1.15rem 1.1rem 1rem",
                rotate: -2.5,
                textAlign: "center",
                color: p.ink,
                boxShadow: "0 20px 32px -16px rgba(20,10,4,.75)",
              }}
            >
              <Brackets color={p.brass} inset={6} size={12} />
              <span style={{ display: "block", fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.molave }}>Para kay</span>
              <span style={{ display: "block", fontFamily: SCRIPT, fontSize: "2.1rem", lineHeight: 1.15, color: p.narraDeep, margin: "0.3rem 0 0", overflowWrap: "anywhere" }}>{greeting.name}</span>
              <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.45, margin: "0.35rem 0 0" }}>{greeting.message}</span>
            </motion.div>
          )}
        </motion.div>

        {/* The words: centred over the photo on phones, set on the wall beside the window on desktop */}
        <div className="relative flex w-full max-w-[640px] flex-col items-center lg:max-w-[36rem] lg:items-start" style={{ ...nameSizes(config.partner1Name, config.partner2Name), color: p.capiz }}>
          <motion.p {...rise(0.1)} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.8vw, 21px)", lineHeight: 1.4, color: p.sand, margin: 0 }}>
            Sa biyaya ng Diyos at basbas ng aming mga magulang
          </motion.p>

          <h1
            id="nk-hero-title"
            aria-label={names}
            className="mb-1 mt-5 w-full text-[length:var(--nk-name-sm)] lg:-ml-[0.15em] lg:mb-0 lg:mt-6 lg:text-[length:var(--nk-name-lg)]"
            style={{ fontFamily: SCRIPT, fontWeight: 400, lineHeight: 1.05, textShadow: "0 3px 18px rgba(20,10,4,.55)", overflowWrap: "anywhere" }}
          >
            <Written color={p.capiz} nib={p.brass} play={show} delay={0.9} duration={2}>
              {config.partner1Name}
            </Written>
            <br />
            <span className="lg:pl-[0.9em]">
              <Written color={p.capiz} nib={p.brass} play={show} delay={2.8} duration={2}>
                &amp; {config.partner2Name}
              </Written>
            </span>
          </h1>

          <motion.span {...rise(1.1)} aria-hidden className="mt-6 hidden lg:block" style={{ width: "4.5rem", height: 1, background: p.brass }} />

          {date.long && (
            <motion.p {...rise(1.2)} className="mb-0 mt-5 pl-[0.24em] lg:mt-6 lg:pl-0" style={{ fontFamily: DISPLAY, fontSize: "clamp(13px, 3.8vw, 16px)", letterSpacing: "0.24em", textTransform: "uppercase" }}>
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
            <motion.div {...rise(1.5)} className="mt-8 flex w-full justify-center lg:mt-9 lg:justify-start">
              <Countdown target={date.date} palette={p} />
            </motion.div>
          )}

          {greeting && (
            <motion.p {...rise(1.7)} role="note" aria-label={`Invitation for ${greeting.name}`} className="lg:hidden" style={{ fontFamily: SERIF, fontSize: "clamp(16px, 4.4vw, 18px)", lineHeight: 1.5, color: p.capiz, margin: "1.75rem 0 0", maxWidth: "22rem" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.26em", paddingLeft: "0.26em", textTransform: "uppercase", color: p.latte, display: "block", marginBottom: 2 }}>
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
    <div
      role="timer"
      aria-label={spoken}
      className="w-[min(100%,21rem)] gap-2 lg:w-[24rem] lg:gap-2.5"
      style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", "--nk-num": p.capiz, "--nk-num-lg": p.narraDeep, "--nk-unit": p.sand, "--nk-unit-lg": p.narra } as CSSProperties}
    >
      {units.map((u) => (
        <div
          key={u.label}
          aria-hidden
          className="relative px-[0.2rem] pb-[0.6rem] pt-[0.7rem] text-center lg:pb-3 lg:pt-3.5"
          style={{
            ...woodStyle(p),
            boxShadow: `inset 0 0 0 1px ${p.brass}, inset 0 0 0 4px ${p.narraDeep}, 0 8px 14px -8px rgba(0,0,0,.7)`,
          }}
        >
          {/* On the desktop wall each plaque holds a capiz pane, like a small window light. */}
          <span className="absolute inset-[5px] hidden lg:block" style={{ ...capizStyle(p, 100), boxShadow: `inset 0 0 0 1px ${p.brass}` }} />
          <span className="relative block text-[length:clamp(21px,6vw,26px)] text-[color:var(--nk-num)] lg:text-[30px] lg:text-[color:var(--nk-num-lg)]" style={{ fontFamily: DISPLAY, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
            {u.value === null ? "–" : String(u.value).padStart(2, "0")}
          </span>
          <span className="relative mt-0.5 block text-[color:var(--nk-unit)] lg:text-[color:var(--nk-unit-lg)]" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13 }}>
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
