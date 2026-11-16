"use client";

import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SCRIPT, cssImage, darkroomStyle, paperStyle, stampText, stripFrames } from "../theme";
import { Developing } from "./Motion";
import PhotoStrip from "./PhotoStrip";

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
 * Didone sizes that keep the longer line ("& Partner") on the print. Container
 * units, so they fit the invitation's own width (including the marketplace's
 * phone frame on a desktop screen), not the browser window. The phone size
 * spans the full print; the desktop size fits the words column, a little over
 * two fifths of the screen, with the second line set in by about two letters.
 */
function nameSizes(p1: string, p2: string) {
  const sm = Math.max(5, p1.trim().length, p2.trim().length + 2);
  const lg = Math.max(6, p1.trim().length, p2.trim().length + 4);
  return {
    "--ss-name-sm": `clamp(2.75rem, min(19cqw, ${(158 / sm).toFixed(1)}cqw), 6rem)`,
    "--ss-name-lg": `clamp(2.5rem, min(${(70 / lg).toFixed(2)}cqw, 12svh), 6rem)`,
  } as CSSProperties;
}

/**
 * Height of the first screen's print: the viewport less both film edges (~4.9rem)
 * and the marketplace preview bar. The desktop prints are sized from it too. The 60rem cap
 * keeps tall screens (an iPad Pro in landscape is 1032px) from showing a wide band of paper below.
 */
const STAGE = "max(540px, min(calc(100svh - var(--preview-chrome-bottom, 0px) - 4.9rem), 60rem))";

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

/** A bulldog clip pegging a print to the darkroom's drying line. */
function Clip({ palette: p, style }: { palette: Palette; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: -14,
        width: 16,
        height: 26,
        marginLeft: -8,
        borderRadius: "3px 3px 2px 2px",
        background: `linear-gradient(180deg, #4A4F5C 0%, #23262F 100%)`,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,.12), 0 4px 6px -2px rgba(0,0,0,.6)`,
        zIndex: 2,
        ...style,
      }}
    >
      <span style={{ position: "absolute", left: 3, right: 3, top: 4, height: 2, borderRadius: 1, background: p.paper, opacity: 0.35 }} />
    </span>
  );
}

/** The personal note for the viewing guest: an admission ticket with a tear-off stub. */
function AdmissionStub({ greeting, palette: p }: { greeting: { name: string; message: string }; palette: Palette }) {
  return (
    <div role="note" aria-label={`Invitation for ${greeting.name}`} style={{ display: "flex", textAlign: "left", filter: "drop-shadow(0 10px 14px rgba(10,12,20,.22))" }}>
      <div style={{ flex: 1, minWidth: 0, background: p.print, padding: "1rem 1.1rem", borderRadius: "8px 0 0 8px" }}>
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
    </div>
  );
}

/**
 * Phones get the enlargement: one frame from the roll printed full-bleed between
 * its film edges, the names exposed onto it over an ink fade and coming into
 * focus once the guest leaves the booth. Wide screens step into the darkroom
 * instead: the enlargement and the booth strip hang pegged to a drying line on
 * the left, the guest's admission ticket tucked against the print, while the
 * names, date and frame counter are set beside them in the safelight. The
 * camera's orange imprint stays burned into the photograph's corner either way.
 */
export default function HeroSection({ config, palette: p, date, opened, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const show = opened || Boolean(reduce);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const portrait = cssImage(config.heroImageUrl);
  // The hanging strip shows the other poses; with no gallery it repeats the portrait.
  const gallery = stripFrames({ heroImageUrl: "", galleryImageUrls: config.galleryImageUrls });
  const strip = gallery.some(Boolean) ? gallery : stripFrames(config);

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
  /** A print swinging gently on the line as it is pegged up. */
  const hang = (delay: number, rotate: number) => ({
    initial: reduce ? false : { opacity: 0, y: -24, rotate: rotate * 2.5 },
    animate: show ? { opacity: 1, y: 0, rotate } : undefined,
    transition: { duration: 1.3, delay, ease: EASE },
  });

  return (
    <header ref={ref} aria-labelledby="ss-hero-title" className="text-center" style={{ ...paperStyle(p), containerType: "inline-size", position: "relative", paddingBottom: "3.5rem", overflow: "hidden" }}>
      <div style={{ background: p.inkDeep }}>
        <FilmEdge palette={p} side="top" />

        <div
          className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-x-[clamp(2.5rem,5vw,5rem)] lg:px-[max(3rem,calc((100%_-_80rem)/2))]"
          style={{ "--ss-stage": STAGE, position: "relative", height: "var(--ss-stage)", overflow: "hidden", background: "#2B2620" } as CSSProperties}
        >
          {/* Phone: the enlargement fills the print, with an ink fade deepest where the type sits. */}
          <div className="lg:hidden">
            <motion.div style={{ position: "absolute", inset: "-8% 0", y: reduce ? 0 : imageY }}>
              <Developing image={portrait} label={`${names} portrait`} play={show} delay={0.2} style={{ position: "absolute", inset: 0 }} />
            </motion.div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(110% 55% at 50% 52%, color-mix(in srgb, ${p.inkDeep} 52%, transparent) 0%, transparent 100%), linear-gradient(180deg, color-mix(in srgb, ${p.inkDeep} 55%, transparent) 0%, color-mix(in srgb, ${p.inkDeep} 12%, transparent) 22%, color-mix(in srgb, ${p.inkDeep} 28%, transparent) 50%, color-mix(in srgb, ${p.inkDeep} 78%, transparent) 100%)`,
              }}
            />
          </div>

          {/* Desktop: the darkroom wall under the safelight, with a drying line strung across the prints. */}
          <div aria-hidden className="absolute inset-0 hidden lg:block" style={darkroomStyle(p)} />

          <div className="relative hidden h-full items-start justify-end pt-[2.1rem] lg:flex">
            <span aria-hidden className="absolute" style={{ top: "2.1rem", left: "-50vw", right: "-1.5rem", height: 1, background: `color-mix(in srgb, ${p.paper} 34%, transparent)` }} />
            {/* The enlargement, white-bordered, with the roll's edge print typed on its foot. */}
            <motion.div {...hang(0.15, 1.2)} className="relative" style={{ rotate: 1.2, transformOrigin: "50% 0", marginTop: 4 }}>
              <Clip palette={p} style={{ left: "22%" }} />
              <Clip palette={p} style={{ left: "78%" }} />
              <div style={{ background: p.print, padding: "0.8rem 0.8rem 0", boxShadow: "0 30px 50px -28px rgba(0,0,0,.85), 0 2px 0 rgba(0,0,0,.08)" }}>
                <div style={{ position: "relative", height: "min(calc(var(--ss-stage) - 8.5rem), 36rem)", aspectRatio: "4 / 5" }}>
                  <Developing image={portrait} label={`${names} portrait`} play={show} delay={0.5} style={{ position: "absolute", inset: 0 }} />
                  {date.imprint && (
                    <span aria-hidden style={{ ...stampText(p), position: "absolute", right: "0.85rem", bottom: "0.7rem", fontSize: 15 }}>
                      {date.imprint}
                    </span>
                  )}
                </div>
                <p aria-hidden style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: p.inkSoft, margin: 0, padding: "0.7rem 0.1rem 0.75rem", whiteSpace: "nowrap" }}>
                  <span>▸ 14A</span>
                  <span>SV 400</span>
                </p>
              </div>

              {greeting && (
                <motion.div {...rise(1.6)} className="absolute" style={{ left: "-2.5rem", bottom: "-1.25rem", width: "min(19rem, 88%)", rotate: -3.5 }}>
                  <AdmissionStub greeting={greeting} palette={p} />
                </motion.div>
              )}
            </motion.div>

            {/* The booth strip, pegged alongside and overlapping the print's edge. */}
            <motion.div {...hang(0.45, -2.4)} className="relative z-[1]" style={{ rotate: -2.4, transformOrigin: "50% 0", marginLeft: "-1.5rem", marginTop: "1.1rem" }}>
              <Clip palette={p} style={{ left: "50%" }} />
              <PhotoStrip
                palette={p}
                frames={strip}
                play={show}
                delay={0.9}
                stagger={0.35}
                width="min(11rem, calc((var(--ss-stage) - 7.5rem) / 3.65))"
                labelPrefix="Booth photo"
                caption={date.imprint && <span style={{ ...stampText(p), color: p.film, textShadow: "none", fontSize: 11 }}>{date.imprint}</span>}
              />
            </motion.div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center px-5 pb-[3.25rem] pt-14 lg:relative lg:inset-auto lg:max-w-[34rem] lg:items-start lg:p-0 lg:text-left" style={{ color: p.print }}>
            <motion.p
              {...rise(0.6)}
              className="absolute inset-x-0 top-[1.4rem] lg:static lg:mb-7"
              style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: "0.32em", paddingLeft: "0.32em", textTransform: "uppercase", color: p.print, margin: 0 }}
            >
              <span aria-hidden className="hidden lg:inline" style={{ color: p.stamp }}>▸ Frame 00 · </span>
              Save the date
            </motion.p>

            <h1
              id="ss-hero-title"
              aria-label={names}
              className="w-full text-[length:var(--ss-name-sm)] lg:text-[length:var(--ss-name-lg)]"
              style={{
                ...nameSizes(config.partner1Name, config.partner2Name),
                fontFamily: DISPLAY,
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.015em",
                margin: 0,
                overflowWrap: "anywhere",
                textShadow: "0 2px 24px rgba(5,7,12,.45)",
              }}
            >
              <motion.span {...focusIn(1.0)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
              <motion.span {...focusIn(1.3)} className="lg:pl-[0.9em]" style={{ display: "block", fontStyle: "italic" }}>
                <span aria-hidden style={{ fontFamily: SCRIPT, fontStyle: "normal", fontSize: "0.82em", color: `color-mix(in srgb, ${p.film} 62%, #FFE3D6)`, marginRight: "0.1em", textShadow: "none" }}>&amp;</span>
                {config.partner2Name}
              </motion.span>
            </h1>

            {(date.long || config.venueName || config.venueCity) && (
              <div className="mt-[1.4rem] lg:mt-[clamp(1.25rem,3.5svh,2.25rem)]">
                <motion.div
                  aria-hidden
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={show ? { scaleX: 1 } : undefined}
                  transition={{ duration: 1.1, delay: 1.7, ease: EASE }}
                  className="mx-auto lg:mx-0 lg:origin-left"
                  style={{ height: 1, width: "min(62%, 15rem)", marginBottom: "0.9rem", background: `color-mix(in srgb, ${p.print} 55%, transparent)` }}
                />
                {date.date ? (
                  <motion.p {...rise(1.85)} style={{ margin: 0 }}>
                    <span style={{ display: "block", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.stamp }} className="lg:!pl-0">
                      {date.weekday}
                    </span>
                    <span className="lg:text-[32px]" style={{ display: "block", fontFamily: DISPLAY, fontSize: "clamp(22px, 6.6cqw, 30px)", lineHeight: 1.2, marginTop: 4 }}>
                      {date.monthDayYear}
                    </span>
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
                    className="mx-auto lg:mx-0"
                    style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(16px, 4.6cqw, 19px)", lineHeight: 1.35, color: `color-mix(in srgb, ${p.print} 88%, transparent)`, marginTop: "0.45rem", maxWidth: "22rem", textWrap: "balance" }}
                  >
                    {/* Venue and town as two deliberate lines, so a wrap never strands a separator. */}
                    {config.venueName && <span style={{ display: "block" }}>{config.venueName}</span>}
                    {config.venueCity && <span style={{ display: "block", fontSize: "0.86em" }}>{config.venueCity}</span>}
                  </motion.p>
                )}
              </div>
            )}

            {date.date && (
              <motion.div {...rise(2.2)} className="mt-7 flex justify-center lg:mt-[clamp(1.5rem,4.5svh,2.75rem)] lg:justify-start">
                <Countdown target={date.date} palette={p} />
              </motion.div>
            )}
          </div>

          {date.imprint && (
            <span aria-hidden className="lg:hidden" style={{ ...stampText(p), position: "absolute", right: "1rem", bottom: "0.85rem", fontSize: 15 }}>
              {date.imprint}
            </span>
          )}
        </div>

        <FilmEdge palette={p} side="bottom" />
      </div>

      {/* Phones keep the guest's ticket just under the print; desktop tucks it against the enlargement. */}
      {greeting && (
        <motion.div {...rise(0.45)} className="relative mx-auto mt-10 max-w-[23rem] px-5 lg:hidden" style={{ boxSizing: "content-box" }}>
          <AdmissionStub greeting={greeting} palette={p} />
        </motion.div>
      )}
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
    <div role="timer" aria-label={spoken} className="w-[min(100%,20rem)] lg:w-[23rem]">
      <p aria-hidden style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.28em", paddingLeft: "0.28em", textTransform: "uppercase", color: `color-mix(in srgb, ${p.print} 80%, transparent)`, margin: "0 0 0.6rem" }} className="lg:!pl-0">
        Frames until the big day
      </p>
      <div aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
        {units.map((u) => (
          <div key={u.label} style={{ textAlign: "center", background: `color-mix(in srgb, ${p.inkDeep} 72%, transparent)`, borderRadius: 6, padding: "0.6rem 0.2rem 0.5rem", boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.print} 22%, transparent)` }}>
            <span className="text-[length:clamp(20px,6cqw,26px)] lg:text-[30px]" style={{ ...stampText(p), display: "block", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
              {u.value === null ? "--" : String(u.value).padStart(2, "0")}
            </span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: p.print, marginTop: 3 }}>{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
