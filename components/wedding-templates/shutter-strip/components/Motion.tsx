"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DISPLAY, MONO } from "../theme";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Reset this on the element wrapping the sections. */
export const FRAME_COUNTER = "ss-frame";

/** Section entrance: a soft fade up. */
export function Reveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Filter a print goes through in the tray: dark, warm and soft, then clear. */
const UNDEVELOPED = "sepia(1) brightness(.22) contrast(.8) blur(2px)";
const DEVELOPED = "sepia(0) brightness(1) contrast(1) blur(0px)";

interface DevelopingProps {
  image?: string;
  label: string;
  style?: CSSProperties;
  /** Develop when scrolled into view instead of when `play` turns on. */
  inView?: boolean;
  play?: boolean;
  delay?: number;
  /** Extra filter kept after developing (e.g. a black-and-white print). */
  tone?: string;
}

/**
 * A photograph coming up in the developer: it starts as a dark, warm smudge
 * and clears to the finished print.
 */
export function Developing({ image, label, style, inView = false, play = true, delay = 0, tone = "" }: DevelopingProps) {
  const reduce = useReducedMotion();
  const done = `${DEVELOPED} ${tone}`.trim();
  const transition = { duration: 2.4, delay, ease: [0.3, 0, 0.2, 1] as const };
  const motionProps = reduce
    ? { initial: false as const, animate: { filter: done } }
    : inView
      ? { initial: { filter: `${UNDEVELOPED} ${tone}`.trim() }, whileInView: { filter: done }, viewport: { once: true, amount: 0.5 }, transition }
      : { initial: { filter: `${UNDEVELOPED} ${tone}`.trim() }, animate: play ? { filter: done } : undefined, transition };

  return (
    <motion.div
      // An empty placeholder frame is decoration, not a photo.
      {...(image ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...motionProps}
      style={{ backgroundColor: "#5A4B3E", backgroundImage: image, backgroundSize: "cover", backgroundPosition: "center", ...style }}
    />
  );
}

interface HeadingProps {
  id: string;
  /** Short typewriter caption after the frame number. */
  caption: string;
  /** Title; the part after "|" is set in italic. */
  title: string;
  color: string;
  accent: string;
  style?: CSSProperties;
}

/**
 * Typewriter frame counter over a didone title with an italic second half.
 * Frames are numbered by a CSS counter reset on the page, so hidden sections never leave a gap.
 */
export function SectionHeading({ id, caption, title, color, accent, style }: HeadingProps) {
  const reduce = useReducedMotion();
  const [upright, italic] = title.split("|");
  return (
    <div style={{ marginBottom: "2.5rem", textAlign: "center", ...style }}>
      <motion.p
        initial={reduce ? false : { opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
        style={{ counterIncrement: FRAME_COUNTER, fontFamily: MONO, fontSize: 13, letterSpacing: "0.22em", paddingLeft: "0.22em", textTransform: "uppercase", color: accent, margin: "0 0 0.75rem" }}
      >
        <span aria-hidden>▸ </span>Frame <span className="before:content-[counter(ss-frame,decimal-leading-zero)]" /> — {caption}
      </motion.p>
      <h2 id={id} style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(36px, 10vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.01em", color, margin: 0, textWrap: "balance" }}>
        {upright}
        {italic && <em style={{ fontStyle: "italic" }}>{italic}</em>}
      </h2>
    </div>
  );
}
