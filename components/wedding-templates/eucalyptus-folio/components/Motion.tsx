"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { DISPLAY, MONO, SANS } from "../theme";

/** Reset this on the element wrapping the sections. */
export const SHEET_COUNTER = "ef-sheet";

/**
 * Section entrance: a slow rise from 24px. Content is only held back when it
 * starts below the fold on a client that can observe it, so a missed
 * observer, a print or a reduced-motion guest always sees everything.
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [state, setState] = useState<"static" | "waiting" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    // Hold back only content that is still off-screen when the page mounts.
    setState("waiting");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(el);
    const show = () => setState("shown");
    window.addEventListener("beforeprint", show);
    return () => {
      io.disconnect();
      window.removeEventListener("beforeprint", show);
    };
  }, [reduce]);

  const style: CSSProperties =
    state === "static"
      ? {}
      : {
          opacity: state === "shown" ? 1 : 0,
          transform: state === "shown" ? "none" : "translateY(24px)",
          transition: `opacity 1.6s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1.6s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        };
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

interface HeadingProps {
  id: string;
  /** Typed caption after the sheet number, e.g. "Order of the day". */
  caption: string;
  title: string;
  /** Optional line under the title. */
  lede?: string;
  ink: string;
  soft: string;
  rust: string;
  align?: "left" | "center";
  style?: CSSProperties;
}

/**
 * A specimen-label heading: "Sheet 04 — Order of the day" typed above a light
 * serif title, closed by a short hairline. Sheets are numbered by a CSS
 * counter, so a hidden section never leaves a gap.
 */
export function SectionHeading({ id, caption, title, lede, ink, soft, rust, align = "left", style }: HeadingProps) {
  return (
    <div style={{ textAlign: align, marginBottom: "1.6rem", ...style }}>
      <p style={{ counterIncrement: SHEET_COUNTER, fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: soft, margin: 0 }}>
        Sheet <span style={{ color: rust }} className="before:content-[counter(ef-sheet,decimal-leading-zero)]" /> <span aria-hidden>—</span> {caption}
      </p>
      <h2 id={id} style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(2.1rem, 10.5cqw, 3.4rem)", lineHeight: 1.04, letterSpacing: "-0.015em", color: ink, margin: "0.65rem 0 0", textWrap: "balance" }}>
        {title}
      </h2>
      <div aria-hidden style={{ width: 44, height: 1, background: rust, margin: align === "center" ? "1.1rem auto 0" : "1.1rem 0 0" }} />
      {lede && (
        <p style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.1cqw, 17px)", lineHeight: 1.65, color: soft, margin: "1rem 0 0", maxWidth: "34ch", marginInline: align === "center" ? "auto" : undefined }}>
          {lede}
        </p>
      )}
    </div>
  );
}

/** Shared padding for a sheet (section). */
export const SHEET_PAD = "2.75rem clamp(1.25rem, 6cqw, 2rem)";
