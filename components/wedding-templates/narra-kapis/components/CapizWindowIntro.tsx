"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SCRIPT, SERIF, capizStyle, woodStyle } from "../theme";
import { Brackets, CapizPanes, Calado } from "./Ornaments";
import { Written } from "./Motion";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: DateParts;
  /** Personal note for the viewing guest; open invitations get the couple's names instead. */
  greeting: { name: string; message: string } | null;
  onOpen: () => void;
}

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * A closed capiz window in a narra wall, with a note tucked into the sash and
 * written out to the guest. Opening slides both shell panels into the frame,
 * the way the old sliding windows of a bahay na bato open.
 */
export default function CapizWindowIntro({ palette: p, partner1, partner2, date, greeting, onOpen }: Props) {
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!opening) return;
    const id = setTimeout(onOpen, reduce ? 0 : 1500);
    return () => clearTimeout(id);
  }, [opening, onOpen, reduce]);

  const slide = { duration: reduce ? 0 : 1.3, ease: EASE };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${partner1} & ${partner2} invitation`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      style={{
        ...woodStyle(p),
        position: "fixed",
        inset: 0,
        // The marketplace preview bar sits at the bottom; stop above it so the open button stays tappable.
        bottom: "var(--preview-chrome-bottom, 0px)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "1.25rem",
        overflowY: "auto",
      }}
    >
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(18px, 5vw, 22px)", color: p.sand, margin: 0 }}>Tuloy po kayo</p>

      {/* The window: calado transom over a framed pair of sliding capiz sashes */}
      <div style={{ width: "min(88vw, 23rem)" }}>
        <div style={{ background: p.narraDeep, padding: "0.6rem 0.75rem 0.35rem", borderRadius: "999px 999px 0 0", boxShadow: `inset 0 0 0 3px ${p.molave}` }}>
          <Calado color={p.brass} width="100%" />
        </div>
        <div
          style={{
            position: "relative",
            height: "min(54svh, 30rem)",
            overflow: "hidden",
            border: `10px solid ${p.narraDeep}`,
            boxShadow: `inset 0 0 0 2px ${p.molave}, 0 30px 60px -30px rgba(0,0,0,.8)`,
            background: `radial-gradient(80% 60% at 50% 40%, #FFE6B8 0%, ${p.latte} 70%, ${p.molave} 100%)`,
          }}
        >
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              initial={false}
              animate={{ x: opening ? (side === "left" ? "-96%" : "96%") : "0%" }}
              transition={slide}
              style={{ position: "absolute", top: 0, bottom: 0, width: "50%", [side]: 0, borderInline: `3px solid ${p.narraDeep}` }}
            >
              <CapizPanes palette={p} cols={3} rows={6} gap={4} style={{ height: "100%" }} />
            </motion.div>
          ))}

          {/* Note tucked into the sash */}
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: "1rem" }}>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14, rotate: -2 }}
            animate={opening ? { opacity: 0, y: -40, rotate: -6 } : { opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: opening ? 0.6 : 0.9, delay: opening ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              ...capizStyle(p, 100),
              position: "relative",
              width: "min(100%, 16.5rem)",
              padding: "1.6rem 1.1rem 1.4rem",
              textAlign: "center",
              color: p.ink,
              boxShadow: "0 18px 30px -16px rgba(43,25,12,.6)",
            }}
          >
            <Brackets color={p.brass} inset={6} size={12} />
            {greeting ? (
              <>
                <p style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.molave, margin: 0 }}>Para kay</p>
                <p style={{ fontSize: "clamp(2.2rem, 10vw, 2.8rem)", lineHeight: 1.1, margin: "0.4rem 0 0", overflowWrap: "anywhere" }}>
                  <Written color={p.narraDeep} nib={p.brass} delay={0.9} duration={1.8} style={{ fontFamily: SCRIPT }}>
                    {greeting.name}
                  </Written>
                </p>
                <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.45, color: p.ink, margin: "0.6rem 0 0" }}>{greeting.message}</p>
              </>
            ) : (
              <>
                <p style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.molave, margin: 0 }}>Ang kasal nina</p>
                <p style={{ fontSize: "clamp(2rem, 9vw, 2.5rem)", lineHeight: 1.15, margin: "0.4rem 0 0", overflowWrap: "anywhere" }}>
                  <Written color={p.narraDeep} nib={p.brass} delay={0.9} duration={2} style={{ fontFamily: SCRIPT }}>
                    {partner1} &amp; {partner2}
                  </Written>
                </p>
              </>
            )}
            {date.dayMonthYear && (
              <p style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.22em", paddingLeft: "0.22em", textTransform: "uppercase", color: p.molave, margin: "0.9rem 0 0" }}>{date.dayMonthYear}</p>
            )}
          </motion.div>
          </div>
        </div>
        {/* Window sill */}
        <div aria-hidden style={{ height: 14, margin: "0 -10px", background: p.narraDeep, boxShadow: `inset 0 2px 0 ${p.molave}, 0 10px 18px -8px rgba(0,0,0,.7)` }} />
      </div>

      <motion.button
        type="button"
        autoFocus
        disabled={opening}
        onClick={() => setOpening(true)}
        animate={{ opacity: opening ? 0 : 1 }}
        className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          minHeight: 54,
          padding: "0.55rem 2rem",
          border: `1px solid ${p.brass}`,
          background: `color-mix(in srgb, ${p.narraDeep} 70%, transparent)`,
          color: p.capiz,
          cursor: "pointer",
          outlineColor: p.brass,
        }}
      >
        <span style={{ fontFamily: DISPLAY, fontSize: 14, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase" }}>Buksan ang bintana</span>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: p.sand }}>Open the window</span>
      </motion.button>
    </motion.div>
  );
}
