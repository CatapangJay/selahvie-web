"use client";

import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SCRIPT, cssImage, paperStyle, stampText } from "../theme";
import { Developing } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The booth has been left; the entrance plays from here. */
  opened: boolean;
  /** Personal note for the viewing guest, printed on an admission stub. */
  greeting?: { name: string; message: string } | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Didone size that keeps the longer line ("& Partner") inside the print.
 * Container units, so it fits the invitation's own width — including the
 * marketplace's phone frame on a desktop screen — not the browser window.
 */
function nameSize(p1: string, p2: string): string {
  const len = Math.max(5, p1.trim().length, p2.trim().length + 2);
  return `clamp(2.75rem, min(19cqw, ${(158 / len).toFixed(1)}cqw), 6rem)`;
}

/** Edge print between the sprocket holes, like the frame numbers on a real negative. */
const EDGE_MARKS = Array.from({ length: 6 }, (_, i) => `▸ ${14 + i}   ▸ ${14 + i}A   SV 400`).join("   ");

/** One rebate of the negative: a row of sprocket holes with the edge print beside it. */
function FilmEdge({ palette: p, side }: { palette: Palette; side: "top" | "bottom" }) {
  const holes: CSSProperties = {
    height: 9,
    backgroundImage: `linear-gradient(90deg, transparent 0 7px, ${p.paper} 7px 19px, transparent 19px 26px)`,
    backgroundSize: "26px 100%",
    borderRadius: 2,
  };
  const marks: CSSProperties = {
    fontFamily: MONO,
    fontWeight: 700,
    fontSize: 10,
    lineHeight: 1,
    letterSpacing: "0.12em",
    whiteSpace: "pre",
    overflow: "hidden",
    color: `color-mix(in srgb, ${p.stamp} 80%, transparent)`,
    paddingInline: 12,
  };
  return (
    <div aria-hidden style={{ background: p.inkDeep, padding: "7px 0", display: "flex", flexDirection: side === "top" ? "column" : "column-reverse", gap: 6 }}>
      <div style={holes} />
      <div style={marks}>{EDGE_MARKS}</div>
    </div>
  );
}

/**
 * The enlargement: one frame from the roll printed full-bleed between its film
 * edges. The names are exposed onto the lower third of the photograph over an
 * ink fade, coming into focus once the guest leaves the booth; the date sits
 * under a hairline that draws across, and the camera's orange imprint stays
 * burned into the corner.
 */
export default function HeroSection({ config, palette: p, date, opened, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const show = opened || Boolean(reduce);
  const names = `${config.partner1Name} & ${config.partner2Name}`;

  /** Lens pulling focus: soft and slightly low, then sharp. */
  const focusIn = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18, filter: "blur(10px)" },
    animate: show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1.2, delay, ease: EASE },
  });
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <header ref={ref} aria-labelledby="ss-hero-title" style={{ ...paperStyle(p), containerType: "inline-size", position: "relative", paddingBottom: "3.5rem", textAlign: "center", overflow: "hidden" }}>
      <div style={{ background: p.inkDeep }}>
        <FilmEdge palette={p} side="top" />

        {/* The print fills the first screen: the viewport less both film edges (~4.9rem) and the marketplace preview bar. */}
        <div style={{ position: "relative", height: "min(calc(100svh - var(--preview-chrome-bottom, 0px) - 4.9rem), 54rem)", minHeight: 540, overflow: "hidden", background: "#2B2620" }}>
          <motion.div style={{ position: "absolute", inset: "-8% 0", y: reduce ? 0 : imageY }}>
            <Developing image={cssImage(config.heroImageUrl)} label={`${names} portrait`} play={show} delay={0.2} style={{ position: "absolute", inset: 0 }} />
          </motion.div>
          {/* Ink fade: a veil at the top for the kicker, deepest through the middle where the type sits. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(110% 55% at 50% 52%, color-mix(in srgb, ${p.inkDeep} 52%, transparent) 0%, transparent 100%), linear-gradient(180deg, color-mix(in srgb, ${p.inkDeep} 55%, transparent) 0%, color-mix(in srgb, ${p.inkDeep} 12%, transparent) 22%, color-mix(in srgb, ${p.inkDeep} 28%, transparent) 50%, color-mix(in srgb, ${p.inkDeep} 78%, transparent) 100%)`,
            }}
          />

          <motion.p
            {...rise(0.6)}
            style={{ position: "absolute", top: "1.4rem", left: 0, right: 0, fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: "0.32em", paddingLeft: "0.32em", textTransform: "uppercase", color: p.print, margin: 0 }}
          >
            Save the date
          </motion.p>

          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "3.5rem 1.25rem 3.25rem", color: p.print }}>
            <h1
              id="ss-hero-title"
              aria-label={names}
              style={{
                fontFamily: DISPLAY,
                fontWeight: 400,
                fontSize: nameSize(config.partner1Name, config.partner2Name),
                lineHeight: 0.92,
                letterSpacing: "-0.015em",
                margin: 0,
                overflowWrap: "anywhere",
                textShadow: "0 2px 24px rgba(5,7,12,.45)",
              }}
            >
              <motion.span {...focusIn(1.0)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
              <motion.span {...focusIn(1.3)} style={{ display: "block", fontStyle: "italic" }}>
                <span aria-hidden style={{ fontFamily: SCRIPT, fontStyle: "normal", fontSize: "0.82em", color: `color-mix(in srgb, ${p.film} 62%, #FFE3D6)`, marginRight: "0.1em", textShadow: "none" }}>&amp;</span>
                {config.partner2Name}
              </motion.span>
            </h1>

            {(date.long || config.venueName || config.venueCity) && (
              <div style={{ marginTop: "1.4rem" }}>
                <motion.div
                  aria-hidden
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={show ? { scaleX: 1 } : undefined}
                  transition={{ duration: 1.1, delay: 1.7, ease: EASE }}
                  style={{ height: 1, width: "min(62%, 15rem)", margin: "0 auto 0.9rem", background: `color-mix(in srgb, ${p.print} 55%, transparent)` }}
                />
                {date.date ? (
                  <motion.p {...rise(1.85)} style={{ margin: 0 }}>
                    <span style={{ display: "block", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.stamp }}>{date.weekday}</span>
                    <span style={{ display: "block", fontFamily: DISPLAY, fontSize: "clamp(22px, 6.6cqw, 30px)", lineHeight: 1.2, marginTop: 4 }}>{date.monthDayYear}</span>
                  </motion.p>
                ) : (
                  date.long && (
                    <motion.p {...rise(1.85)} style={{ fontFamily: DISPLAY, fontSize: "clamp(22px, 6.6cqw, 30px)", margin: 0 }}>
                      {date.long}
                    </motion.p>
                  )
                )}
                {(config.venueName || config.venueCity) && (
                  <motion.p
                    {...rise(2)}
                    style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(16px, 4.6cqw, 19px)", lineHeight: 1.35, color: `color-mix(in srgb, ${p.print} 88%, transparent)`, margin: "0.45rem auto 0", maxWidth: "22rem", textWrap: "balance" }}
                  >
                    {/* Venue and town as two deliberate lines, so a wrap never strands a separator. */}
                    {config.venueName && <span style={{ display: "block" }}>{config.venueName}</span>}
                    {config.venueCity && <span style={{ display: "block", fontSize: "0.86em" }}>{config.venueCity}</span>}
                  </motion.p>
                )}
              </div>
            )}

            {date.date && (
              <motion.div {...rise(2.2)} style={{ marginTop: "1.75rem", display: "flex", justifyContent: "center" }}>
                <Countdown target={date.date} palette={p} />
              </motion.div>
            )}
          </div>

          {date.imprint && (
            <span aria-hidden style={{ ...stampText(p), position: "absolute", right: "1rem", bottom: "0.85rem", fontSize: 15 }}>
              {date.imprint}
            </span>
          )}
        </div>

        <FilmEdge palette={p} side="bottom" />
      </div>

      <div style={{ position: "relative", padding: "0 1.25rem", maxWidth: 640, margin: "0 auto" }}>

        {greeting && (
          <motion.div
            {...rise(0.45)}
            role="note"
            aria-label={`Invitation for ${greeting.name}`}
            style={{ display: "flex", margin: "2.5rem auto 0", maxWidth: "23rem", textAlign: "left", filter: "drop-shadow(0 10px 14px rgba(10,12,20,.18))" }}
          >
            <div style={{ flex: 1, background: p.print, padding: "1rem 1.1rem", borderRadius: "8px 0 0 8px" }}>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: p.film, margin: 0 }}>Admit · reserved for</p>
              <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 22, lineHeight: 1.2, color: p.ink, margin: "0.2rem 0 0", overflowWrap: "anywhere" }}>{greeting.name}</p>
              <p style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.5, color: p.text, margin: "0.35rem 0 0" }}>{greeting.message}</p>
            </div>
            {/* Tear-off stub */}
            <div
              aria-hidden
              style={{
                width: 54,
                background: p.film,
                borderRadius: "0 8px 8px 0",
                borderLeft: `2px dashed ${p.print}`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <span style={{ writingMode: "vertical-rl", fontFamily: MONO, fontWeight: 700, fontSize: 12, letterSpacing: "0.3em", color: p.print }}>No. 001</span>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}

const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
// Server render shows dashes, so hydration never disagrees with the clock.
const serverSeconds = () => null;

const DAY = 86_400;

/** A camera's frame counter set on the print: four smoked-ink windows with typewriter labels. */
function Countdown({ target, palette: p }: { target: Date; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;

  if (left !== null && left <= 0) {
    return (
      <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(2rem, 9cqw, 2.8rem)", color: p.print, margin: 0 }}>
        {left <= -DAY ? "Just married" : "Today's the day"}
      </p>
    );
  }

  const units = [
    { label: "Days", value: left === null ? null : Math.floor(left / DAY) },
    { label: "Hrs", value: left === null ? null : Math.floor((left % DAY) / 3600) },
    { label: "Min", value: left === null ? null : Math.floor((left % 3600) / 60) },
    { label: "Sec", value: left === null ? null : left % 60 },
  ];
  const spoken = left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes to go`;

  return (
    <div role="timer" aria-label={spoken} style={{ width: "min(100%, 20rem)" }}>
      <p aria-hidden style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.28em", paddingLeft: "0.28em", textTransform: "uppercase", color: `color-mix(in srgb, ${p.print} 80%, transparent)`, margin: "0 0 0.6rem" }}>
        Frames until the big day
      </p>
      <div aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
        {units.map((u) => (
          <div key={u.label} style={{ background: `color-mix(in srgb, ${p.inkDeep} 72%, transparent)`, borderRadius: 6, padding: "0.6rem 0.2rem 0.5rem", boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.print} 22%, transparent)` }}>
            <span style={{ ...stampText(p), display: "block", fontSize: "clamp(20px, 6cqw, 26px)", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
              {u.value === null ? "--" : String(u.value).padStart(2, "0")}
            </span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: p.print, marginTop: 3 }}>{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
