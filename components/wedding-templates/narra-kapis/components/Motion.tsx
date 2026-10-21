"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { DISPLAY, SERIF } from "../theme";
import { Calado } from "./Ornaments";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Section entrance: a soft fade up. */
export function Reveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface WrittenProps {
  children: ReactNode;
  /** Ink colour for the text and the travelling nib. */
  color: string;
  nib: string;
  style?: CSSProperties;
  /** Play when scrolled into view instead of on mount. */
  inView?: boolean;
  /** Gate for on-mount playback (e.g. once the intro has opened). */
  play?: boolean;
  delay?: number;
  duration?: number;
}

/**
 * Handwriting reveal: the script is uncovered left to right like a pen stroke,
 * with a brass nib riding the leading edge and lifting off at the end.
 *
 * One progress value (0–100) drives the clip, the ink and the nib together, so
 * the stroke edge and the nib never drift apart. The ink is fully dark almost
 * immediately — the clip does the revealing — so it reads as writing, not a fade.
 */
export function Written({ children, color, nib, style, inView = false, play = true, delay = 0, duration = 2.2 }: WrittenProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.8 });
  const progress = useMotionValue(0);
  const clipPath = useTransform(progress, (v) => `inset(-50% ${100 - v}% -50% 0)`);
  const inkOpacity = useTransform(progress, [0, 3, 100], [0, 1, 1]);
  const nibLeft = useTransform(progress, (v) => `${v}%`);
  const nibOpacity = useTransform(progress, [0, 2, 94, 100], [0, 1, 1, 0]);
  const start = play && (!inView || seen);

  useEffect(() => {
    if (reduce) {
      progress.set(100);
      return;
    }
    if (!start) return;
    // Slow into the first letter, steady through the word, ease off the last stroke.
    const controls = animate(progress, 100, { duration, delay, ease: [0.4, 0.1, 0.45, 1] });
    return () => controls.stop();
  }, [start, reduce, delay, duration, progress]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block", padding: "0 0.15em" }}>
      <motion.span style={{ display: "inline-block", color, ...style, clipPath, opacity: inkOpacity }}>{children}</motion.span>
      {!reduce && (
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            top: "62%",
            left: nibLeft,
            opacity: nibOpacity,
            width: "0.16em",
            minWidth: 6,
            maxWidth: 11,
            aspectRatio: "1",
            translateX: "-50%",
            borderRadius: "50%",
            background: nib,
            boxShadow: `0 0 0 2px color-mix(in srgb, ${nib} 30%, transparent), 0 0 12px ${nib}`,
          }}
        />
      )}
    </span>
  );
}

interface HeadingProps {
  id: string;
  /** Short Filipino eyebrow, e.g. "Ang Aming Kuwento". */
  eyebrow: string;
  title: string;
  color: string;
  accent: string;
  style?: CSSProperties;
}

/** Calado transom over a Filipino eyebrow and an engraved-caps title. */
export function SectionHeading({ id, eyebrow, title, color, accent, style }: HeadingProps) {
  const reduce = useReducedMotion();
  return (
    <div style={{ marginBottom: "2.75rem", textAlign: "center", ...style }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, scaleX: 0.6 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
      >
        <Calado color={accent} width="min(70%, 15rem)" />
      </motion.div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 20px)", color: accent, margin: "1rem 0 0.35rem" }}>{eyebrow}</p>
      <h2
        id={id}
        style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(30px, 8.6vw, 50px)", letterSpacing: "0.12em", paddingLeft: "0.12em", lineHeight: 1.15, textTransform: "uppercase", color, margin: 0, textWrap: "balance" }}
      >
        {title}
      </h2>
    </div>
  );
}
