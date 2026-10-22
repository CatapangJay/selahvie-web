"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SCRIPT, paperStyle, stampText } from "../theme";
import PhotoStrip from "./PhotoStrip";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: DateParts;
  frames: (string | undefined)[];
  /** Personal note for the viewing guest; open invitations get the couple's names instead. */
  greeting: { name: string; message: string } | null;
  onOpen: () => void;
}

type Phase = "idle" | "shooting" | "printing";

const EASE = [0.65, 0, 0.35, 1] as const;
const BULBS = 9;
const POSES = 4;
/**
 * Printed strip width: as large as the space under the print slot allows. Four
 * square frames plus the caption need about 3.65× the width in height, and 11rem
 * covers the slot and the button (cqh already excludes the overlay padding). cq
 * units resolve against the overlay (a size container), so this also holds
 * inside the preview's phone frame.
 */
const STRIP_WIDTH = "min(64cqw, 18rem, calc((100cqh - 11rem) / 3.65))";

/**
 * A marquee photo booth with its curtain drawn and a "reserved" card pinned to
 * it. Striking a pose pulls the curtain back for a 3-2-1 countdown and four
 * flashes; then the curtain falls and the strip feeds out of the print slot,
 * each frame developing in turn.
 */
export default function BoothIntro({ palette: p, partner1, partner2, date, frames, greeting, onOpen }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (phase !== "shooting") return;
    const steps: [number, () => void][] = [
      [0, () => setCurtainOpen(true)],
      [900, () => setCount(3)],
      [1500, () => setCount(2)],
      [2100, () => setCount(1)],
      ...Array.from({ length: POSES }, (_, i): [number, () => void] => [2700 + i * 600, () => { setCount(null); setFlash(i + 1); }]),
      [2700 + POSES * 600, () => setCurtainOpen(false)],
      [3300 + POSES * 600, () => setPhase("printing")],
    ];
    const ids = steps.map(([ms, fn]) => setTimeout(fn, ms));
    return () => ids.forEach(clearTimeout);
  }, [phase]);

  const printing = phase === "printing";
  const status =
    count !== null ? `${count}…` : flash > 0 && phase === "shooting" ? `Pose ${flash} of ${POSES}` : printing ? "Your strip is printing" : "";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${partner1} & ${partner2} invitation`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
      style={{
        ...paperStyle(p),
        position: "fixed",
        inset: 0,
        // The marketplace preview bar sits at the bottom; stop above it so the button stays tappable.
        bottom: "var(--preview-chrome-bottom, 0px)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(1rem, 5svh, 2.75rem) 1.25rem 1.5rem",
        overflowY: "auto",
        containerType: "size",
      }}
    >
      <p aria-live="polite" className="sr-only">{status}</p>

      <div style={{ width: "min(80cqw, 19rem)", flexShrink: 0 }}>
        {/* Marquee and window fold up into the print slot once the photos are taken, leaving the screen to the strip. */}
        <motion.div
          initial={false}
          animate={{ height: printing ? 0 : "auto", opacity: printing ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
          style={{ overflow: "hidden" }}
        >
          {/* Marquee with chasing bulbs */}
          <div style={{ background: p.inkDeep, borderRadius: "14px 14px 0 0", padding: "0.7rem 0.9rem 0.6rem", textAlign: "center", boxShadow: `inset 0 0 0 2px ${p.ink}` }}>
            <div aria-hidden style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
              {Array.from({ length: BULBS }, (_, i) => (
                <motion.span
                  key={i}
                  animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.35, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD58A", boxShadow: "0 0 8px #FFB347" }}
                />
              ))}
            </div>
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(26px, 8vw, 34px)", lineHeight: 1, color: p.print, margin: 0 }}>Photos</p>
            <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "#FFD58A", margin: "0.35rem 0 0" }}>
              {POSES} poses · 1 strip
            </p>
          </div>

          {/* Booth window: curtain over a dark interior with the camera */}
          <div
            style={{
              position: "relative",
              height: "min(34svh, 18rem)",
              overflow: "hidden",
              background: `radial-gradient(70% 55% at 50% 30%, #2A2F3E 0%, ${p.inkDeep} 75%)`,
              border: `8px solid ${p.ink}`,
              borderTop: 0,
            }}
          >
            {/* Lens */}
            <div aria-hidden style={{ position: "absolute", top: "14%", left: "50%", width: 44, height: 44, marginLeft: -22, borderRadius: "50%", background: "radial-gradient(circle at 38% 35%, #6C7896 0 8%, #10131C 30% 62%, #3A4052 64% 70%, #151821 72%)" }} />
            {count !== null && (
              // Keyed so each digit mounts fresh and punches in; the previous one simply leaves.
              <motion.p
                key={count}
                aria-hidden
                initial={{ opacity: 0, scale: 1.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: "clamp(80px, 26vw, 120px)", color: p.print, margin: 0 }}
              >
                {count}
              </motion.p>
            )}
            {flash > 0 && phase === "shooting" && (
              <p aria-hidden style={{ ...stampText(p), position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", fontSize: 13, margin: 0 }}>
                {flash} / {POSES}
              </p>
            )}

            {(["left", "right"] as const).map((side) => (
              <motion.div
                key={side}
                aria-hidden
                initial={false}
                animate={{ x: curtainOpen ? (side === "left" ? "-88%" : "88%") : "0%" }}
                transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: "51%",
                  [side]: 0,
                  backgroundColor: p.film,
                  backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,.24) 0 3px, rgba(255,255,255,.07) 7px 11px, rgba(0,0,0,.18) 15px 18px)`,
                  boxShadow: side === "left" ? "inset -8px 0 14px -6px rgba(0,0,0,.55)" : "inset 8px 0 14px -6px rgba(0,0,0,.55)",
                }}
              />
            ))}
            {/* Curtain rod */}
            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, background: `linear-gradient(${p.print}, #C9C1B4)` }} />

            {/* Reserved card pinned to the curtain */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -12, rotate: -4 }}
              animate={curtainOpen || printing ? { opacity: 0, y: 30, rotate: 6 } : { opacity: 1, y: 0, rotate: -2.5 }}
              transition={{ duration: 0.6, delay: curtainOpen || printing ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                top: "18%",
                left: "50%",
                width: "min(84%, 15rem)",
                marginLeft: "calc(min(84%, 15rem) / -2)",
                background: p.print,
                padding: "1.1rem 0.9rem 1rem",
                textAlign: "center",
                color: p.text,
                boxShadow: "0 14px 22px -12px rgba(0,0,0,.7)",
              }}
            >
              <span aria-hidden style={{ position: "absolute", top: -5, left: "50%", width: 10, height: 10, marginLeft: -5, borderRadius: "50%", background: p.ink }} />
              {greeting ? (
                <>
                  <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.28em", paddingLeft: "0.28em", textTransform: "uppercase", color: p.film, margin: 0 }}>Reserved for</p>
                  <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.5rem, 7vw, 1.9rem)", lineHeight: 1.1, color: p.ink, margin: "0.3rem 0 0", overflowWrap: "anywhere" }}>{greeting.name}</p>
                  <p style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.45, color: p.text, margin: "0.5rem 0 0" }}>{greeting.message}</p>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.28em", paddingLeft: "0.28em", textTransform: "uppercase", color: p.film, margin: 0 }}>Now showing</p>
                  <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.4rem, 6.6vw, 1.8rem)", lineHeight: 1.15, color: p.ink, margin: "0.3rem 0 0", overflowWrap: "anywhere" }}>
                    {partner1} <span style={{ fontFamily: SCRIPT, fontStyle: "normal", color: p.film }}>&amp;</span> {partner2}
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Print slot */}
        <div style={{ background: p.ink, borderRadius: printing ? 10 : "0 0 10px 10px", transition: "border-radius .8s", padding: "0.55rem 0 0.7rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <span aria-hidden style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.35em", paddingLeft: "0.35em", color: "#C9C1B4" }}>PRINTS</span>
          <span aria-hidden style={{ width: `calc(${STRIP_WIDTH} + 0.75rem)`, maxWidth: "100%", height: 6, borderRadius: 3, background: "#05070C", boxShadow: "inset 0 2px 3px rgba(0,0,0,.9)" }} />
        </div>
      </div>

      {/* The strip feeds down out of the slot: the wrapper grows and the strip stays anchored to its foot. */}
      <motion.div
        initial={false}
        animate={{ height: printing ? "auto" : 0 }}
        transition={{ duration: reduce ? 0 : 2.4, delay: reduce ? 0 : 0.7, ease: [0.45, 0, 0.55, 1] }}
        style={{ overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", marginTop: -6, flexShrink: 0 }}
      >
        <PhotoStrip
          palette={p}
          frames={frames}
          play={printing}
          delay={reduce ? 0 : 2.3}
          width={STRIP_WIDTH}
          labelPrefix="Booth photo"
          caption={
            <span>
              <span style={{ display: "block", fontFamily: DISPLAY, fontStyle: "italic", fontSize: 15, lineHeight: 1.2, color: p.ink }}>
                {partner1} &amp; {partner2}
              </span>
              {date.imprint && <span style={{ ...stampText(p), display: "block", fontSize: 12, marginTop: 3 }}>{date.imprint}</span>}
            </span>
          }
        />
      </motion.div>

      <motion.button
        type="button"
        autoFocus
        // aria-disabled rather than disabled: a disabled button drops keyboard focus to the page behind the dialog.
        aria-disabled={phase === "shooting"}
        // Reduced motion skips the photo session and goes straight to the finished strip.
        onClick={() => {
          if (phase === "shooting") return;
          if (printing) onOpen();
          else setPhase(reduce ? "printing" : "shooting");
        }}
        animate={{ opacity: phase === "shooting" ? 0 : 1 }}
        className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{
          marginTop: "1.5rem",
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          minHeight: 52,
          padding: "0 1.9rem",
          borderRadius: 999,
          border: 0,
          background: printing ? p.ink : p.film,
          color: p.print,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: "pointer",
          outlineColor: p.ink,
        }}
      >
        <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: printing ? p.stamp : p.print }} />
        {printing ? "Step inside" : "Strike a pose"}
      </motion.button>

      {/* Camera flash */}
      <AnimatePresence>
        {flash > 0 && phase === "shooting" && !reduce && (
          <motion.div
            key={flash}
            aria-hidden
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ position: "fixed", inset: 0, background: "#FFFFFF", pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
