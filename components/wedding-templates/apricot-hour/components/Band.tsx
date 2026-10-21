"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { Sprig } from "./Ornaments";

/** One stripe of the page-long sunset: its sky colour and whether text sits light on it. */
export interface Band {
  bg: string;
  dark: boolean;
}

/** Sky from late morning to night. Sections take evenly spaced stops, so the page always ends at dusk. */
export function sunsetRamp(p: Palette, count: number): Band[] {
  const stops: Band[] = [
    { bg: p.butter, dark: false },
    { bg: p.golden, dark: false },
    { bg: p.apricotSoft, dark: false },
    { bg: p.apricot, dark: true },
    { bg: p.sunset, dark: true },
    { bg: p.dusk, dark: true },
    { bg: p.duskDeep, dark: true },
  ];
  if (count <= 0) return [];
  if (count === 1) return [stops[0]];
  return Array.from({ length: count }, (_, i) => stops[Math.round((i / (count - 1)) * (stops.length - 1))]);
}

/** Text colours for a band. */
export function tones(band: Band, p: Palette) {
  return band.dark
    ? { text: p.morning, soft: "rgba(255,246,236,.78)", accent: p.butter, rule: "rgba(255,246,236,.28)", card: "rgba(255,246,236,.08)" }
    : { text: p.ink, soft: `color-mix(in srgb, ${p.ink} 78%, transparent)`, accent: p.apricotDeep, rule: `color-mix(in srgb, ${p.ink} 18%, transparent)`, card: p.morning };
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface TitleProps {
  id: string;
  eyebrow: string;
  title: string;
  band: Band;
  palette: Palette;
  style?: CSSProperties;
}

/** Sprig, small-caps eyebrow, then a soft serif title with an italic final word. */
export function SectionTitle({ id, eyebrow, title, band, palette: p, style }: TitleProps) {
  const t = tones(band, p);
  const words = title.split(" ");
  const last = words.pop();
  return (
    <div style={{ textAlign: "center", marginBottom: "2.5rem", ...style }}>
      <Sprig color={band.dark ? p.butter : p.dusk} bloom={band.dark ? p.golden : p.apricot} style={{ width: "2.75rem", margin: "0 auto 0.75rem", display: "block" }} />
      <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: t.accent, margin: 0 }}>{eyebrow}</p>
      <h2 id={id} style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(2.3rem, 9vw, 3.6rem)", lineHeight: 1.08, color: t.text, margin: "0.6rem 0 0", textWrap: "balance" }}>
        {words.join(" ")} {last && <em style={{ fontStyle: "italic", fontWeight: 400 }}>{last}</em>}
      </h2>
    </div>
  );
}

export const SECTION_PAD = "clamp(4rem, 12vw, 6.5rem) clamp(1.25rem, 5vw, 2.5rem)";
