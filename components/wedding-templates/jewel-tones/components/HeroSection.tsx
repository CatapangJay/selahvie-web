"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SERIF, feltStyle, initialOf, paperStyle } from "../theme";
import GiltFrame from "./GiltFrame";
import CalaLily from "./CalaLily";
import Countdown from "./Countdown";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The envelope has been opened; hero entrance plays from here. */
  opened: boolean;
  showRsvp: boolean;
  /** Personal note for the viewing guest, set as a place card in the hero. */
  greeting?: { name: string; message: string } | null;
}

/**
 * Script name sizes that keep the longest name on one line: one for the stacked
 * phone hero, one for the desktop words column (a little under half the screen,
 * and the second name is indented). Both are capped by viewport height so the
 * countdown stays in the first screen.
 */
function nameSizes(...names: string[]) {
  const longest = Math.max(5, ...names.map((n) => n.trim().length));
  return {
    "--jt-name-sm": `clamp(2rem, min(${(86 / (longest * 0.42)).toFixed(1)}vw, 7.4svh), 4.25rem)`,
    "--jt-name-lg": `clamp(2.75rem, min(${(38 / (longest * 0.42 + 0.8)).toFixed(2)}vw, 11svh), 6rem)`,
  } as CSSProperties;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Raspberry felt with a gilt-framed portrait. Phones stack the portrait, names,
 * date and countdown so all of it lands in the first screen, with the guest's
 * place card just below. Wide screens set the words beside a tall arched frame,
 * the place card tucked into its corner, all inside a double gilt rule.
 */
export default function HeroSection({ config, palette: p, date, opened, showRsvp, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const venueLine = [config.venueName, config.venueCity].filter(Boolean).join(" · ");
  const show = opened || Boolean(reduce);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: EASE },
  });
  const lily = (side: "left" | "right", delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 30 },
    animate: show
      ? { opacity: 1, y: 0, rotate: reduce ? (side === "left" ? -8 : 8) : side === "left" ? [-10, -6, -10] : [10, 6, 10] }
      : undefined,
    transition: {
      opacity: { duration: 1, delay },
      y: { type: "spring" as const, stiffness: 50, damping: 16, delay },
      rotate: { duration: 8, ease: "easeInOut" as const, repeat: Infinity },
    },
  });

  return (
    <section
      ref={ref}
      aria-labelledby="jt-hero-title"
      className="relative flex min-h-svh items-center overflow-hidden px-5 pb-10 pt-[clamp(1.25rem,3svh,2rem)] lg:px-[clamp(4rem,7vw,7rem)] lg:py-16"
      style={feltStyle(p.raspberry, p.raspberryDeep)}
    >
      {/* Warm light behind the portrait: centred over it on phones, pooled on the frame's side on desktop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{ background: `radial-gradient(26rem 22rem at 50% 28%, ${p.gold}33, transparent 70%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: `radial-gradient(44rem 36rem at 70% 50%, ${p.gold}33, transparent 70%)` }}
      />

      {/* Desktop: the felt is bordered like the card stock it echoes, a double gilt rule with diamond corners. */}
      <div
        aria-hidden
        className="pointer-events-none absolute hidden lg:block"
        style={{ inset: "1.5rem", border: `1px solid ${p.gold}aa`, boxShadow: `inset 0 0 0 6px transparent, inset 0 0 0 7px ${p.gold}55` }}
      >
        {(["0 auto auto 0", "0 0 auto auto", "auto 0 0 auto", "auto auto 0 0"] as const).map((inset) => (
          <span
            key={inset}
            className="absolute"
            style={{ inset, width: 9, height: 9, margin: -5, transform: "rotate(45deg)", background: p.gold }}
          />
        ))}
      </div>

      {/* Desktop: calla lilies swaying up from the lower corners */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          aria-hidden
          {...lily(side, 0.6)}
          className="pointer-events-none absolute hidden lg:block"
          style={{
            bottom: "-1.5rem",
            left: side === "left" ? "clamp(1rem, 3vw, 3.5rem)" : undefined,
            right: side === "right" ? "clamp(1rem, 3vw, 3.5rem)" : undefined,
            width: "clamp(4.5rem, 6.5vw, 6.5rem)",
            transformOrigin: "50% 100%",
            scaleX: side === "right" ? -1 : 1,
          }}
        >
          <CalaLily />
        </motion.div>
      ))}

      <div className="relative mx-auto grid w-full max-w-[72rem] justify-items-center text-center lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:justify-items-start lg:gap-x-[clamp(3.5rem,7vw,7rem)] lg:text-left">
        {/* The gilt arch: led by the portrait on phones, the right-hand anchor on desktop. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative order-2 mt-[clamp(0.75rem,2svh,1.25rem)] w-[clamp(7.5rem,min(calc((100svh_-_28rem)*0.74),66vw),19rem)] lg:order-2 lg:col-start-2 lg:row-span-full lg:mt-0 lg:w-[clamp(18rem,calc((100svh_-_10rem)*0.72),30rem)]"
        >
          <GiltFrame palette={p} shape="arch" ratio="4 / 5.2">
            {config.heroImageUrl ? (
              <motion.div style={{ position: "absolute", inset: 0, y: reduce ? 0 : imageY, scale: 1.18 }}>
                <Image
                  src={config.heroImageUrl}
                  alt={`${config.partner1Name} and ${config.partner2Name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 480px, 72vw"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ position: "absolute", inset: 0, fontFamily: SCRIPT, fontSize: "5rem", color: p.raspberryDeep }}
              >
                {initialOf(config.partner1Name)}&amp;{initialOf(config.partner2Name)}
              </div>
            )}
          </GiltFrame>

          {/* Phones: a lily standing either side of the frame instead of in the corners. */}
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              aria-hidden
              {...lily(side, 0.5)}
              className="pointer-events-none absolute lg:hidden"
              style={{
                bottom: "-0.75rem",
                left: side === "left" ? "-2.4rem" : undefined,
                right: side === "right" ? "-2.4rem" : undefined,
                width: "2.9rem",
                transformOrigin: "50% 100%",
                scaleX: side === "right" ? -1 : 1,
              }}
            >
              <CalaLily />
            </motion.div>
          ))}

          {/* Desktop: the guest's place card tucked into the frame's lower corner. */}
          {greeting && (
            <motion.div {...rise(1.1)} className="absolute hidden w-[16.5rem] lg:block" style={{ left: "-30%", bottom: "-5%" }}>
              <PlaceCard greeting={greeting} palette={p} />
            </motion.div>
          )}
        </motion.div>

        {/* Words: grid items in their own order on phones, one left-set column on desktop. */}
        <div className="contents lg:order-1 lg:col-start-1 lg:row-start-1 lg:flex lg:w-full lg:flex-col lg:items-start">
          <motion.p
            {...rise(0.15)}
            className="order-1 text-[1.05rem] lg:text-[1.35rem]"
            style={{ fontFamily: SERIF, fontStyle: "italic", color: p.goldLight }}
          >
            Together with their families
          </motion.p>

          <h1
            id="jt-hero-title"
            className="order-3 mt-[clamp(0.6rem,1.8svh,1rem)] w-full text-[length:var(--jt-name-sm)] lg:mt-[clamp(0.5rem,2svh,1.25rem)] lg:text-[length:var(--jt-name-lg)]"
            style={{
              ...nameSizes(config.partner1Name, config.partner2Name),
              fontFamily: SCRIPT,
              fontWeight: 400,
              lineHeight: 1.02,
              color: p.cream,
              textShadow: "0 3px 24px rgba(0,0,0,.35)",
              overflowWrap: "anywhere",
            }}
          >
            <motion.span {...rise(0.3)} className="block">
              {config.partner1Name}
            </motion.span>
            <motion.span
              {...rise(0.42)}
              aria-hidden
              className="block lg:pl-[2.6em]"
              style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "0.34em", lineHeight: 1.3, color: p.goldLight }}
            >
              &amp;
            </motion.span>
            <span className="sr-only"> and </span>
            <motion.span {...rise(0.54)} className="block lg:pl-[0.8em]">
              {config.partner2Name}
            </motion.span>
          </h1>

          <motion.div
            {...rise(0.66)}
            aria-hidden
            className="order-4 my-[clamp(0.6rem,1.8svh,1rem)] flex items-center justify-center gap-3 lg:my-[clamp(0.9rem,3svh,1.6rem)]"
          >
            <span className="lg:hidden" style={{ height: 1, width: "3rem", background: `linear-gradient(90deg, transparent, ${p.gold})` }} />
            <span style={{ width: 7, height: 7, transform: "rotate(45deg)", background: p.gold }} />
            <span className="w-12 lg:w-40" style={{ height: 1, background: `linear-gradient(270deg, transparent, ${p.gold})` }} />
          </motion.div>

          <motion.div {...rise(0.76)} className="order-5">
            <p
              className="text-[0.95rem] lg:text-[1.2rem]"
              style={{ fontFamily: SERIF, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: p.cream }}
            >
              {date.long}
            </p>
            {venueLine && (
              <p className="mt-1 text-[1.05rem] lg:mt-2 lg:text-[1.25rem]" style={{ fontFamily: SERIF, fontStyle: "italic", color: p.goldLight }}>
                {venueLine}
              </p>
            )}
          </motion.div>

          {date.date && (
            <motion.div
              {...rise(0.9)}
              className="order-6 mt-[clamp(0.9rem,2.4svh,1.5rem)] w-full max-w-[22rem] lg:mt-[clamp(1.25rem,3.5svh,2.25rem)] lg:max-w-[27rem]"
            >
              <Countdown target={date.date} palette={p} />
            </motion.div>
          )}

          {greeting && (
            <motion.div {...rise(1)} className="order-7 mt-9 w-full lg:hidden">
              <PlaceCard greeting={greeting} palette={p} />
            </motion.div>
          )}

          {showRsvp && (
            <motion.div {...rise(1.05)} className="order-8 mt-8 lg:mt-[clamp(1.5rem,4svh,2.5rem)]">
              <a
                href="#rsvp"
                className="inline-flex min-h-12 items-center justify-center px-8 transition-colors hover:bg-[rgba(243,220,154,.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3dc9a]"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: p.goldLight,
                  border: `1px solid ${p.gold}`,
                  borderRadius: 2,
                }}
              >
                Kindly Reply
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Escort-card greeting: cream stock, gilt inner rule, the guest's name in script. */
function PlaceCard({ greeting, palette: p }: { greeting: { name: string; message: string }; palette: Palette }) {
  return (
    <div
      role="note"
      aria-label={`Invitation for ${greeting.name}`}
      className="relative mx-auto text-center"
      style={{
        ...paperStyle(p.cream, p.creamDeep),
        maxWidth: "min(100%, 23rem)",
        padding: "0.45rem",
        transform: "rotate(-2deg)",
        boxShadow: "0 18px 32px -14px rgba(0,0,0,.55), 0 3px 8px rgba(0,0,0,.2)",
        color: p.ink,
      }}
    >
      <div style={{ border: `1px solid ${p.gold}`, padding: "0.9rem clamp(1rem, 4vw, 1.5rem) 1rem" }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.2, color: p.goldInk }}>Dear</p>
        <p
          style={{
            fontFamily: SCRIPT,
            fontSize: "clamp(1.6rem, 4.6vw, 1.9rem)",
            lineHeight: 1.15,
            color: p.raspberryDeep,
            overflowWrap: "anywhere",
            textWrap: "balance",
          }}
        >
          {greeting.name},
        </p>
        <div aria-hidden className="mx-auto my-2 flex items-center justify-center gap-2">
          <span style={{ height: 1, width: "2rem", background: `linear-gradient(90deg, transparent, ${p.gold})` }} />
          <span style={{ width: 5, height: 5, transform: "rotate(45deg)", background: p.gold }} />
          <span style={{ height: 1, width: "2rem", background: `linear-gradient(270deg, transparent, ${p.gold})` }} />
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.45, textWrap: "pretty" }}>{greeting.message}</p>
      </div>
    </div>
  );
}
