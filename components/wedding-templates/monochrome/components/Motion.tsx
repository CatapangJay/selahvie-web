"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BODY, HEADING } from "../theme";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Section entrance: a soft fade up. */
export function Reveal({ children, id }: { children: ReactNode; id?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      id={id}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 1, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface HeadingProps {
  id: string;
  /** Contact-sheet frame number, e.g. "01". */
  index: string;
  eyebrow: string;
  title: string;
  color: string;
  /** Rule and eyebrow colour. */
  muted: string;
  size?: string;
  style?: CSSProperties;
}

/**
 * Frame number and small-caps label between hairlines, then a thin display
 * title whose letters open up from tight to airy tracking as it scrolls in.
 */
export function SectionHeading({ id, index, eyebrow, title, color, muted, size = "clamp(34px, 9vw, 56px)", style }: HeadingProps) {
  const reduce = useReducedMotion();
  return (
    <div style={{ marginBottom: "2.75rem", ...style }}>
      <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginBottom: "1.1rem" }}>
        <motion.span
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE }}
          style={{ height: 1, width: 36, background: muted, transformOrigin: "right" }}
        />
        <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, letterSpacing: "0.32em", paddingLeft: "0.32em", textTransform: "uppercase", color: muted }}>
          {index} &nbsp;/&nbsp; {eyebrow}
        </span>
        <motion.span
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE }}
          style={{ height: 1, width: 36, background: muted, transformOrigin: "left" }}
        />
      </div>
      <motion.h2
        id={id}
        initial={reduce ? false : { opacity: 0, letterSpacing: "-0.04em" }}
        whileInView={{ opacity: 1, letterSpacing: "0.04em" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.2, ease: EASE }}
        style={{ fontFamily: HEADING, fontSize: size, fontWeight: 200, lineHeight: 1.1, textTransform: "uppercase", color, margin: 0, textWrap: "balance" }}
      >
        {title}
      </motion.h2>
    </div>
  );
}
