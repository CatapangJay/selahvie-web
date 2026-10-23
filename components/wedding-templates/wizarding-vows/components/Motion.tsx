"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BOOK, DISPLAY, capsLabel } from "../theme";
import { Hallows } from "./Emblems";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Section entrance: rises out of the dark like ink coming up on the page. */
export function Reveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface HeadingProps {
  id: string;
  /** Engraved line above the title. */
  kicker: string;
  title: string;
  /** A line of old-book italic under the title. */
  subtitle?: string;
  color: string;
  accent: string;
  style?: CSSProperties;
}

/** The Hallows mark draws itself, then an engraved kicker and the decorative title. */
export function SectionHeading({ id, kicker, title, subtitle, color, accent, style }: HeadingProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: "2.75rem", ...style }}>
      <Hallows color={accent} size={34} strokeWidth={3.5} draw style={{ margin: "0 auto 1rem", display: "block" }} />
      <p style={{ ...capsLabel(accent, 12), margin: "0 0 0.7rem" }}>{kicker}</p>
      <h2 id={id} style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(34px, 9.5vw, 56px)", lineHeight: 1.08, color, margin: 0, textWrap: "balance" }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.5, color, opacity: 0.82, margin: "0.8rem auto 0", maxWidth: "28rem", textWrap: "balance" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

