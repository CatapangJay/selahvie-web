"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SERIF, feltStyle, paperStyle } from "../theme";
import { initialOf } from "../theme";
import WaxSeal from "./WaxSeal";

type Phase = "closed" | "opening" | "rising" | "reveal";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: DateParts;
  /** "Reserved for" / "Kindly reserved for" etc. */
  guestLabel: string;
  /** The viewing guest, printed on the envelope. */
  guestName: string;
  onOpen: () => void;
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SETTLE = { type: "spring", stiffness: 90, damping: 18 } as const;

// Envelope geometry (percentages of the envelope box)
const FLAP_H = 52;
const FLAP_CLIP = "polygon(0 0, 100% 0, 100% 6%, 50% 100%, 0 6%)";
const LEFT_CLIP = "polygon(0 0, 54% 50%, 0 100%)";
const RIGHT_CLIP = "polygon(100% 0, 46% 50%, 100% 100%)";
const BOTTOM_CLIP = "polygon(0 100%, 50% 40%, 100% 100%)";

const fallTransition = {
  y: { type: "spring", stiffness: 42, damping: 18 },
  opacity: { duration: 0.8, delay: 0.1, ease: EASE_OUT },
} as const;

const rootV: Variants = {
  hidden: { opacity: 0 },
  closed: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
  opening: { opacity: 1 },
  rising: { opacity: 1 },
  reveal: { opacity: 1 },
};

const enterV: Variants = {
  hidden: { y: 90, opacity: 0, rotate: -2 },
  closed: { y: 0, opacity: 1, rotate: 0, transition: { ...SETTLE, opacity: { duration: 0.7, ease: EASE_OUT } } },
  opening: { y: 0, opacity: 1, rotate: 0 },
  rising: { y: 0, opacity: 1, rotate: 0 },
  reveal: { y: 0, opacity: 1, rotate: 0 },
};

const floatV: Variants = {
  closed: { y: [0, -8, 0], transition: { y: { duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: 1.2 } } },
  opening: { y: 0, transition: { type: "spring", stiffness: 80, damping: 16 } },
  rising: { y: 0 },
  reveal: { y: "36%", transition: { type: "spring", stiffness: 55, damping: 17 } },
};

const flapV: Variants = {
  closed: { rotateX: 0, y: 0, opacity: 1 },
  opening: { rotateX: 180, y: 0, opacity: 1, transition: { rotateX: { type: "spring", stiffness: 55, damping: 15, mass: 1.1 } } },
  rising: { rotateX: 180, y: 0, opacity: 1 },
  reveal: { rotateX: 180, y: "70vh", opacity: 0, transition: fallTransition },
};

const fallV: Variants = {
  closed: { y: 0, opacity: 1 },
  opening: { y: 0, opacity: 1 },
  rising: { y: 0, opacity: 1 },
  reveal: { y: "70vh", opacity: 0, transition: fallTransition },
};

const cardV: Variants = {
  closed: { y: 0, scale: 1 },
  opening: { y: 0, scale: 1 },
  rising: { y: "-40%", scale: 1, transition: { type: "spring", stiffness: 60, damping: 16 } },
  reveal: { y: "-40%", scale: 1.14, transition: { type: "spring", stiffness: 70, damping: 18 } },
};

const sealHalf = (dir: 1 | -1): Variants => ({
  closed: { x: 0, y: 0, rotate: 0, opacity: 1 },
  opening: {
    x: `${dir * 70}%`,
    y: "140%",
    rotate: dir * 26,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 50, damping: 12 },
      y: { type: "spring", stiffness: 50, damping: 12 },
      rotate: { type: "spring", stiffness: 50, damping: 12 },
      opacity: { duration: 0.7, delay: 0.2, ease: EASE_OUT },
    },
  },
  rising: { opacity: 0 },
  reveal: { opacity: 0 },
});

const pulseV: Variants = {
  closed: { scale: [1, 1.7], opacity: [0.55, 0], transition: { duration: 2.4, ease: "easeOut", repeat: Infinity } },
  opening: { scale: 2.4, opacity: 0, transition: { duration: 0.8, ease: EASE_OUT } },
  rising: { opacity: 0 },
  reveal: { opacity: 0 },
};

const burstV: Variants = {
  closed: { scale: 0.4, opacity: 0 },
  opening: { scale: [0.4, 2.8], opacity: [0.9, 0], transition: { duration: 0.9, ease: EASE_OUT } },
  rising: { opacity: 0 },
  reveal: { opacity: 0 },
};

const fadeOutV: Variants = {
  hidden: { opacity: 0, y: 12 },
  closed: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.7, ease: EASE_OUT } },
  opening: { opacity: 0, y: -6, transition: { duration: 0.4, ease: EASE_OUT } },
  rising: { opacity: 0 },
  reveal: { opacity: 0 },
};

export default function EnvelopeIntro({ palette: p, partner1, partner2, date, guestLabel, guestName, onOpen }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [flapBehind, setFlapBehind] = useState(false);
  const sealRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    sealRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const k = reduce ? 0.3 : 1;
    const next: Partial<Record<Phase, [Phase | "done", number]>> = {
      opening: ["rising", 1050],
      rising: ["reveal", 1700],
      reveal: ["done", 1800],
    };
    const step = next[phase];
    if (!step) return;
    const t = setTimeout(() => (step[0] === "done" ? onOpen() : setPhase(step[0])), step[1] * k);
    return () => clearTimeout(t);
  }, [phase, reduce, onOpen]);

  useEffect(() => {
    if (phase !== "opening") return;
    const t = setTimeout(() => setFlapBehind(true), reduce ? 0 : 400);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  const open = () => {
    if (phase === "closed") setPhase("opening");
  };

  const nameSize = guestName.length > 22 ? "6.2cqw" : guestName.length > 14 ? "7.6cqw" : "9.2cqw";
  const initials: [string, string] = [initialOf(partner1), initialOf(partner2)];
  const paperKraft = paperStyle(p.kraft, p.kraftDeep);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Wedding invitation for ${guestName}`}
      variants={rootV}
      initial="hidden"
      animate={phase}
      exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.9, ease: EASE_OUT } }}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ ...feltStyle(p.raspberry, p.raspberryDeep), zIndex: "var(--z-toast)" }}
    >
      <motion.p
        variants={fadeOutV}
        className="text-center"
        style={{
          fontFamily: SCRIPT,
          fontSize: "clamp(1.9rem, 6vw, 2.9rem)",
          lineHeight: 1.1,
          color: p.goldLight,
          marginBottom: "clamp(1.25rem, 5dvh, 3rem)",
          textShadow: "0 2px 12px rgba(0,0,0,.35)",
        }}
      >
        You are invited
      </motion.p>

      <motion.div variants={enterV}>
        <motion.div variants={floatV}>
          <div
            style={{
              position: "relative",
              width: "min(90vw, 36rem, 76dvh)",
              aspectRatio: "3 / 2",
              containerType: "inline-size",
              perspective: "1400px",
            }}
          >
            {/* Envelope interior */}
            <motion.div
              variants={fallV}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                ...paperStyle(p.kraftDeep, p.kraftDeep),
                boxShadow: "0 40px 70px -25px rgba(0,0,0,.6), 0 10px 24px rgba(0,0,0,.35)",
              }}
            />

            {/* Save-the-date card */}
            <motion.div
              variants={cardV}
              style={{
                position: "absolute",
                left: "5%",
                top: "6%",
                width: "90%",
                height: "84%",
                zIndex: 3,
                ...paperStyle(p.cream, p.creamDeep),
                boxShadow: "0 2px 12px rgba(0,0,0,.28)",
                color: p.ink,
                textAlign: "center",
              }}
            >
              <div
                aria-hidden
                style={{ position: "absolute", inset: "2.4cqw", border: `1px solid ${p.gold}`, pointerEvents: "none" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.2cqw",
                  padding: "5cqw",
                }}
              >
                <span
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: "max(0.6rem, 2.1cqw)",
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    color: p.goldInk,
                  }}
                >
                  Save the Date
                </span>
                <span style={{ fontFamily: SCRIPT, fontSize: "9.6cqw", lineHeight: 1, color: p.raspberryDeep }}>{partner1}</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "max(0.8rem, 3.4cqw)", color: p.goldInk, lineHeight: 1 }}>
                  &amp;
                </span>
                <span style={{ fontFamily: SCRIPT, fontSize: "9.6cqw", lineHeight: 1, color: p.raspberryDeep }}>{partner2}</span>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: "max(0.8rem, 3.6cqw)",
                    letterSpacing: "0.3em",
                    marginTop: "1cqw",
                    color: p.ink,
                  }}
                >
                  {date.dotted}
                </span>
              </div>
            </motion.div>

            {/* Envelope front: three kraft panels */}
            <motion.div
              variants={fallV}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                filter: "drop-shadow(0 -1px 2px rgba(60,35,0,.4))",
              }}
            >
              <div style={{ position: "absolute", inset: 0, clipPath: LEFT_CLIP, ...paperKraft, filter: "brightness(.88)" }} />
              <div style={{ position: "absolute", inset: 0, clipPath: RIGHT_CLIP, ...paperKraft, filter: "brightness(.8)" }} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: BOTTOM_CLIP,
                  ...paperStyle(`color-mix(in srgb, ${p.kraft} 86%, #fff)`, p.kraft),
                }}
              />
            </motion.div>

            {/* The guest's name on the envelope pocket */}
            <motion.div
              variants={fallV}
              style={{
                position: "absolute",
                left: "10%",
                width: "80%",
                top: "67%",
                zIndex: 5,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "max(0.6rem, 2cqw)",
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                  color: p.goldInk,
                }}
              >
                {guestLabel}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: "0.8cqw",
                  fontFamily: SCRIPT,
                  fontSize: nameSize,
                  lineHeight: 1.15,
                  color: p.ink,
                  overflowWrap: "anywhere",
                }}
              >
                {guestName}
              </span>
            </motion.div>

            {/* Flap: kraft outside, teal liner inside */}
            <motion.div
              variants={flapV}
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: `${FLAP_H}%`,
                transformOrigin: "50% 0%",
                transformStyle: "preserve-3d",
                zIndex: flapBehind ? 1 : 6,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: FLAP_CLIP,
                  backfaceVisibility: "hidden",
                  filter: "brightness(1.04)",
                  ...paperKraft,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: FLAP_CLIP,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  backgroundColor: p.teal,
                  backgroundImage: `radial-gradient(circle, rgba(243,220,154,.4) 1px, transparent 1.7px), linear-gradient(180deg, ${p.tealDeep}, ${p.teal})`,
                  backgroundSize: "11px 11px, auto",
                }}
              />
            </motion.div>

            {/* Wax seal: the thing to click */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: `${FLAP_H}%`,
                width: "max(4rem, 15cqw)",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                zIndex: 8,
              }}
            >
              <motion.span
                aria-hidden
                variants={pulseV}
                style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${p.goldLight}`, pointerEvents: "none" }}
              />
              <motion.span
                aria-hidden
                variants={burstV}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${p.goldLight} 0%, transparent 68%)`,
                  pointerEvents: "none",
                }}
              />
              <motion.button
                ref={sealRef}
                type="button"
                onClick={open}
                disabled={phase !== "closed"}
                aria-label={`Break the seal to open the invitation for ${guestName}`}
                whileHover={phase === "closed" ? { scale: 1.07 } : undefined}
                whileTap={phase === "closed" ? { scale: 0.93 } : undefined}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3dc9a]"
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 0,
                  border: "none",
                  background: "none",
                  cursor: phase === "closed" ? "pointer" : "default",
                }}
              >
                <motion.span variants={sealHalf(-1)} style={{ position: "absolute", inset: 0 }}>
                  <WaxSeal palette={p} initials={initials} half="left" />
                </motion.span>
                <motion.span variants={sealHalf(1)} style={{ position: "absolute", inset: 0 }}>
                  <WaxSeal palette={p} initials={initials} half="right" />
                </motion.span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.p
        variants={fadeOutV}
        className="text-center"
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "clamp(1rem, 2.6vw, 1.2rem)",
          color: p.goldLight,
          marginTop: "clamp(1.5rem, 5dvh, 3rem)",
        }}
      >
        Touch the seal to open
      </motion.p>

      <motion.button
        type="button"
        onClick={onOpen}
        variants={fadeOutV}
        className="absolute bottom-5 rounded-sm px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3dc9a]"
        style={{
          fontFamily: SERIF,
          fontSize: "0.8rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(251,246,236,.88)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        Skip
      </motion.button>
    </motion.div>
  );
}
