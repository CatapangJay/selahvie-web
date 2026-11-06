"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SANS, labelText, paperStyle, sheetStyle, tapeStyle } from "../theme";
import { Sprig } from "./Specimens";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: DateParts;
  greeting: { name: string; message: string } | null;
  /** The guest pressed the button: the hero may start its entrance. */
  onStart: () => void;
  /** The folds are out of the way: remove the overlay. */
  onDone: () => void;
}

/** Folding curve and timing: each panel swings 96° over 1.4s; the label lifts first. */
const FOLD = { duration: 1.4, ease: [0.4, 0, 0.2, 1] as const, times: [0, 0.8, 1] };
const DELAYS = { top: 0, bottom: 0.5, sides: 1.05 };
const TOTAL_MS = (DELAYS.sides + FOLD.duration) * 1000 + 60;

/** Bands of the folded sheet: top and bottom flaps, two doors across the middle. */
const TOP_H = 31;
const BOTTOM_H = 31;

interface PanelProps {
  palette: Palette;
  open: boolean;
  reduce: boolean;
  axis: "rotateX" | "rotateY";
  to: number;
  delay: number;
  origin: string;
  style: CSSProperties;
  children?: ReactNode;
}

/** One folded panel. It swings only once opened; under reduced motion the whole sheet fades instead. */
function Panel({ palette: p, open, reduce, axis, to, delay, origin, style, children }: PanelProps) {
  const motionProps =
    open && !reduce
      ? { animate: { [axis]: [0, to, to], opacity: [1, 1, 0] }, transition: { ...FOLD, delay } }
      : { animate: { [axis]: 0, opacity: 1 } };
  return (
    <motion.div
      aria-hidden
      initial={false}
      {...motionProps}
      style={{ ...paperStyle(p), position: "absolute", backfaceVisibility: "hidden", overflow: "hidden", transformOrigin: origin, ...style }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The folio: a sheet of rag paper folded in four around the invitation, a
 * typed specimen label laid across the middle and the doors held by a strip
 * of linen tape. Unfolding lifts the label away, swings the top flap back,
 * then the bottom, then parts the doors, splitting the tape.
 */
export default function FoldIntro({ palette: p, partner1, partner2, date, greeting, onStart, onDone }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    button.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onDone, reduce ? 450 : TOTAL_MS);
    return () => clearTimeout(id);
  }, [open, reduce, onDone]);

  const start = () => {
    if (open) return;
    setOpen(true);
    onStart();
  };

  const crease = (side: "top" | "bottom" | "left" | "right") =>
    `linear-gradient(to ${side}, rgba(60,56,40,.16), rgba(60,56,40,0) 14%), linear-gradient(to ${side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left"}, rgba(255,255,255,.5), rgba(255,255,255,0) 3%)`;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${partner1} & ${partner2} invitation`}
      initial={{ opacity: 1 }}
      animate={{ opacity: open && reduce ? 0 : 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed",
        inset: 0,
        bottom: "var(--preview-chrome-bottom, 0px)",
        zIndex: 60,
        perspective: 1500,
        pointerEvents: open ? "none" : "auto",
        overflow: "hidden",
      }}
    >
      {/* Top flap: hinged on its top edge, swings back into the screen. */}
      <Panel palette={p} open={open} reduce={Boolean(reduce)} axis="rotateX" to={-96} delay={DELAYS.top} origin="50% 0%" style={{ top: 0, left: 0, right: 0, height: `${TOP_H}%`, zIndex: 3, backgroundImage: `${crease("top")}, ${paperStyle(p).backgroundImage}`, boxShadow: "0 6px 14px -8px rgba(40,36,24,.35)" }}>
        <Sprig which={0} width="min(62vw, 300px)" rotate={-18} style={{ left: "-6%", top: "-18%" }} />
        <Sprig which={1} width="min(44vw, 220px)" rotate={154} style={{ right: "-8%", top: "-10%" }} />
      </Panel>

      {/* Bottom flap: hinged on its bottom edge. */}
      <Panel palette={p} open={open} reduce={Boolean(reduce)} axis="rotateX" to={96} delay={DELAYS.bottom} origin="50% 100%" style={{ bottom: 0, left: 0, right: 0, height: `${BOTTOM_H}%`, zIndex: 3, backgroundImage: `${crease("bottom")}, ${paperStyle(p).backgroundImage}`, boxShadow: "0 -6px 14px -8px rgba(40,36,24,.35)" }}>
        <Sprig which={2} width="min(58vw, 290px)" rotate={12} style={{ right: "-4%", bottom: "-16%" }} />
        <p style={{ ...labelText(p, 10), position: "absolute", left: 0, right: 0, bottom: "1.4rem", textAlign: "center", margin: 0 }}>Folio · Myrtaceae · Eucalyptus</p>
      </Panel>

      {/* Middle doors, hinged on the outer edges; each carries half of the tape seal. */}
      <Panel palette={p} open={open} reduce={Boolean(reduce)} axis="rotateY" to={96} delay={DELAYS.sides} origin="0% 50%" style={{ top: `${TOP_H}%`, bottom: `${BOTTOM_H}%`, left: 0, width: "50%", zIndex: 2, backgroundImage: `${crease("right")}, ${paperStyle(p).backgroundImage}` }}>
        <span style={{ ...tapeStyle(p), right: -1, top: "50%", marginTop: -11, width: 44, clipPath: "polygon(0 4%, 100% 0, 100% 100%, 0 96%)" }} />
      </Panel>
      <Panel palette={p} open={open} reduce={Boolean(reduce)} axis="rotateY" to={-96} delay={DELAYS.sides} origin="100% 50%" style={{ top: `${TOP_H}%`, bottom: `${BOTTOM_H}%`, right: 0, width: "50%", zIndex: 2, backgroundImage: `${crease("left")}, ${paperStyle(p).backgroundImage}` }}>
        <span style={{ ...tapeStyle(p), left: -1, top: "50%", marginTop: -11, width: 44, clipPath: "polygon(0 0, 100% 6%, 96% 40%, 100% 100%, 0 100%)" }} />
      </Panel>

      {/* The label card: lifts away before the folds move. */}
      <motion.div
        initial={false}
        animate={{ opacity: open ? 0 : 1, y: open && !reduce ? -6 : 0 }}
        transition={{ duration: 0.24, ease: "linear" }}
        style={{ position: "absolute", inset: 0, zIndex: 5, display: "grid", placeItems: "center", padding: "1.25rem", pointerEvents: open ? "none" : "auto" }}
      >
        <div style={{ ...sheetStyle(p), position: "relative", width: "min(86vw, 22rem)", padding: "1.6rem 1.4rem 1.4rem", border: `1px solid color-mix(in srgb, ${p.ink} 40%, transparent)`, outline: `1px solid color-mix(in srgb, ${p.ink} 18%, transparent)`, outlineOffset: -6, textAlign: "left" }}>
          <span aria-hidden style={{ ...tapeStyle(p, -4), top: -11, left: "50%", marginLeft: -36, width: 72 }} />
          <p style={{ ...labelText(p, 10), margin: 0, display: "flex", justifyContent: "space-between" }}>
            <span>Herbarium of</span>
            <span aria-hidden>No. 01</span>
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(2rem, 10vw, 2.6rem)", lineHeight: 1.04, color: p.ink, margin: "0.7rem 0 0", overflowWrap: "anywhere" }}>
            {partner1} <em style={{ color: p.rust, fontWeight: 300 }}>&amp;</em> {partner2}
          </h1>
          <dl style={{ margin: "1.1rem 0 0", borderTop: `1px solid color-mix(in srgb, ${p.ink} 25%, transparent)` }}>
            {[
              greeting ? ["Prepared for", greeting.name] : null,
              date.dayMonthYear ? ["Collected", date.dayMonthYear] : null,
            ]
              .filter((r): r is string[] => Boolean(r))
              .map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", padding: "0.5rem 0", borderBottom: `1px solid color-mix(in srgb, ${p.ink} 25%, transparent)` }}>
                  <dt style={{ ...labelText(p, 10), flex: "0 0 6.6rem" }}>{k}</dt>
                  <dd style={{ fontFamily: MONO, fontSize: 14, color: p.text, margin: 0, overflowWrap: "anywhere" }}>{v}</dd>
                </div>
              ))}
          </dl>
          <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: p.text, margin: "0.9rem 0 0" }}>
            {greeting?.message || "Folded with care, and sent with our love. Open it to find the day we hope you'll share with us."}
          </p>
          <button
            ref={button}
            type="button"
            onClick={start}
            className="transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ marginTop: "1.25rem", width: "100%", minHeight: 50, border: 0, borderRadius: 2, background: p.ink, color: p.sheet, fontFamily: MONO, fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", outlineColor: p.ink }}
          >
            Unfold the invitation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
