"use client";

import { motion } from "framer-motion";
import type { Palette } from "../theme";
import { ACCENT, BODY, HEADING } from "../theme";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: string;
  /** Guest the invitation is addressed to; open invitations show a general line instead. */
  guestName?: string | null;
  onOpen: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const smallCaps = {
  fontFamily: BODY,
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: "0.34em",
  paddingLeft: "0.34em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.6)",
} as const;

/**
 * A mounted print: a hairline frame with corner ticks holding the couple's
 * names, and below it, written in by hand, who the invitation is reserved for.
 */
export default function Preloader({ palette: p, partner1, partner2, date, guestName, onOpen }: Props) {
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${partner1} & ${partner2} invitation`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: EASE } }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "grid",
        placeItems: "center",
        background: p.ink,
        padding: "1.25rem",
        textAlign: "center",
        overflowY: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{
          position: "relative",
          width: "min(100%, 26rem)",
          padding: "clamp(2.5rem, 9vw, 3.5rem) clamp(1.25rem, 6vw, 2.5rem)",
          border: "1px solid rgba(255,255,255,.22)",
        }}
      >
        <CornerTicks />

        <motion.p {...rise(0.2)} style={smallCaps}>The wedding of</motion.p>
        <motion.p
          {...rise(0.35)}
          style={{
            fontFamily: HEADING,
            fontSize: "clamp(1.9rem, 8vw, 2.6rem)",
            fontWeight: 200,
            letterSpacing: "0.08em",
            lineHeight: 1.15,
            textTransform: "uppercase",
            color: "#fff",
            margin: "1rem 0 0",
            overflowWrap: "anywhere",
          }}
        >
          {partner1}
          <span style={{ display: "block", fontFamily: ACCENT, textTransform: "none", letterSpacing: 0, fontSize: "1.4em", lineHeight: 0.9, color: "rgba(255,255,255,.75)" }}>
            and
          </span>
          {partner2}
        </motion.p>
        {date && (
          <motion.p {...rise(0.5)} style={{ ...smallCaps, color: "rgba(255,255,255,.75)", marginTop: "1.25rem" }}>
            {date}
          </motion.p>
        )}

        <motion.div {...rise(0.65)} style={{ margin: "2rem auto 0", maxWidth: "20rem" }}>
          <div aria-hidden style={{ height: 1, background: "rgba(255,255,255,.18)" }} />
          <p style={{ ...smallCaps, fontSize: 12, marginTop: "1.1rem" }}>{guestName ? "Reserved for" : "You are invited"}</p>
          {guestName && (
            <p style={{ fontFamily: ACCENT, fontSize: "clamp(2.4rem, 11vw, 3.1rem)", lineHeight: 1.05, color: "#fff", margin: "0.35rem 0 0", overflowWrap: "anywhere" }}>
              {guestName}
            </p>
          )}
        </motion.div>

        <motion.button
          {...rise(0.8)}
          type="button"
          autoFocus
          onClick={onOpen}
          className="group transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginTop: "2rem",
            minHeight: 48,
            padding: "0 1.75rem",
            fontFamily: BODY,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#fff",
            background: "transparent",
            border: "1px solid rgba(255,255,255,.8)",
            cursor: "pointer",
          }}
        >
          Open
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/** Registration marks at each corner of the frame. */
export function CornerTicks({ color = "rgba(255,255,255,.7)" }: { color?: string }) {
  const tick = { position: "absolute", width: 14, height: 14, borderColor: color, borderStyle: "solid", borderWidth: 0 } as const;
  return (
    <>
      <span aria-hidden style={{ ...tick, top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 }} />
      <span aria-hidden style={{ ...tick, top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 }} />
      <span aria-hidden style={{ ...tick, bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 }} />
      <span aria-hidden style={{ ...tick, bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 }} />
    </>
  );
}
