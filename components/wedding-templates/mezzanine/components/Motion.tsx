"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import type { Palette } from "../theme";
import { BODY, DISPLAY, ENGRAVED, GUTTER, SANS } from "../theme";

/**
 * Where fixed overlays (the photo lightbox) mount: a node outside the
 * container-query root, whose containment would otherwise scope `position: fixed`.
 */
export const PortalTarget = createContext<HTMLElement | null>(null);

/** True once the lift doors have opened: reveals wait for it, so they play as the guest scrolls. */
export const Arrived = createContext(true);

/** Whether the lobby directory is on the page, so floor buttons can link back to it. */
export const DirectoryShown = createContext(true);

/**
 * A slow 20px rise for content that mounts below the fold. Anything already on
 * screen, printed, or seen under reduced motion is simply shown: the reveal
 * only ever enhances content that is visible by default.
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const arrived = useContext(Arrived);
  const [state, setState] = useState<"static" | "waiting" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!arrived || !el || reduce || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("waiting");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
    );
    io.observe(el);
    const show = () => setState("shown");
    window.addEventListener("beforeprint", show);
    // Never leave a section hidden if the observer is starved (background tab, headless capture).
    const fallback = setTimeout(() => {
      if (document.visibilityState === "hidden") show();
    }, 4000);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
      window.removeEventListener("beforeprint", show);
    };
  }, [reduce, arrived]);

  const style: CSSProperties =
    state === "static"
      ? {}
      : {
          opacity: state === "shown" ? 1 : 0,
          transform: state === "shown" ? "none" : "translateY(20px)",
          transition: `opacity 1.4s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1.4s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        };
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

/** The engraved round floor button: the one label system of the template. */
export function FloorPlate({ n, palette: p, onDark = false, size = 38 }: { n: number; palette: Palette; onDark?: boolean; size?: number }) {
  const ring = onDark ? p.bronzeLight : p.bronzeText;
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1px solid ${ring}`,
        boxShadow: `inset 0 0 0 3px ${onDark ? "transparent" : p.linen}, inset 0 0 0 4px color-mix(in srgb, ${ring} 45%, transparent)`,
        fontFamily: ENGRAVED,
        fontSize: Math.max(12, Math.round(size * (n > 9 ? 0.4 : 0.46))),
        letterSpacing: n > 9 ? "-0.04em" : undefined,
        lineHeight: 1,
        paddingTop: 1,
        color: ring,
      }}
    >
      {n}
    </span>
  );
}

interface HeadingProps {
  id: string;
  floor: number;
  title: string;
  /** Optional line under the title. */
  lede?: string;
  palette: Palette;
  onDark?: boolean;
  style?: CSSProperties;
}

/** A section title with its floor button beside it; the floor number also appears in the directory. */
export function FloorHeading({ id, floor, title, lede, palette: p, onDark = false, style }: HeadingProps) {
  const color = onDark ? p.linenOn : p.ink;
  const hasDirectory = useContext(DirectoryShown);
  return (
    <div style={{ marginBottom: "2rem", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
        {/* The floor button takes the guest back to the lobby directory. */}
        {hasDirectory ? (
        <a href="#mz-directory" aria-label={`Floor ${floor}, back to the directory`} title="Back to the directory" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={{ display: "grid", placeItems: "center", width: 44, height: 44, margin: -3, borderRadius: "50%", outlineColor: onDark ? p.linenOn : p.oxblood }}>
          <FloorPlate n={floor} palette={p} onDark={onDark} />
        </a>
        ) : (
          <FloorPlate n={floor} palette={p} onDark={onDark} />
        )}
        <h2 id={id} style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(2rem, 9.5cqw, 3.2rem)", lineHeight: 1.05, letterSpacing: "-0.01em", color, margin: 0, minWidth: 0, overflowWrap: "anywhere", textWrap: "balance" }}>
          {title}
        </h2>
      </div>
      {lede && (
        <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: onDark ? 1.72 : 1.65, color: onDark ? `color-mix(in srgb, ${p.linenOn} 84%, transparent)` : p.inkSoft, margin: "1rem 0 0", maxWidth: "40ch" }}>
          {lede}
        </p>
      )}
    </div>
  );
}

/** Shared section frame: generous vertical rhythm, a centred measure. */
export function Floor({ id, labelledBy, children, background, color, maxWidth = 600, pad = "3.75rem" }: { id: string; labelledBy: string; children: ReactNode; background: string; color?: string; maxWidth?: number; pad?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} style={{ background, color, padding: `${pad} ${GUTTER}`, scrollMarginTop: 12 }}>
      <div style={{ maxWidth, margin: "0 auto" }}>{children}</div>
    </section>
  );
}
