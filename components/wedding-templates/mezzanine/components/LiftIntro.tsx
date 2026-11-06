"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, ENGRAVED, SANS } from "../theme";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: DateParts;
  greeting: { name: string; message: string } | null;
  /** CSS url() of the couple's photo, seen through the doors as they part. */
  heroImage?: string;
  /** The guest called the lift: music and the hero entrance may start. */
  onStart: () => void;
  /** The doors are mostly open: the page may scroll and take focus. */
  onArrive: () => void;
  /** The doors are open: remove the overlay. */
  onDone: () => void;
}

/** Choreography, in seconds from the press. */
const T = {
  /** The car travels up from L to M; the call light goes out on arrival. */
  travel: 1.4,
  doors: { delay: 1.7, duration: 3.6 },
  fade: { delay: 4.4, duration: 0.9 },
  /** The page behind becomes scrollable while the doors are still settling. */
  arrive: 3900,
  done: 5600,
};
/** Slow to start, long to settle: heavy doors on a good track. */
const DOOR_EASE = [0.5, 0, 0.1, 1] as const;

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** Brushed grain in plain CSS: fine irregular vertical lines (prime spacings, so no visible repeat). */
const GRAIN = [
  "repeating-linear-gradient(90deg, rgba(255,240,222,.07) 0 1px, rgba(255,240,222,0) 1px 3px)",
  "repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 1px, rgba(0,0,0,0) 1px 7px)",
  "repeating-linear-gradient(90deg, rgba(255,240,222,.05) 0 2px, rgba(255,240,222,0) 2px 13px)",
  "repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 3px, rgba(0,0,0,0) 3px 29px)",
].join(", ");
/** Honed stone: a slow, low-contrast mottle for the lobby wall and floor. */
const STONE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='s' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.008 .014' numOctaves='4' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .45  0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>"
);

const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;

/** Brushed metal in the couple's bronze: a broad soft highlight from the downlight, darker toward the floor. */
function metal(p: Palette, { tone = 0, sheenAt = 50 }: { tone?: number; sheenAt?: number } = {}): CSSProperties {
  const base = mix(p.bronze, 70 - tone, "#140D09");
  const lit = mix(p.bronze, 82 - tone, "#F6E2C6");
  const shade = mix(p.bronze, 40 - tone / 2, "#0B0705");
  return {
    backgroundColor: base,
    backgroundImage: [
      GRAIN,
      "linear-gradient(180deg, rgba(255,236,210,.14) 0%, rgba(255,236,210,.05) 35%, rgba(0,0,0,.06) 65%, rgba(0,0,0,.28) 100%)",
      `linear-gradient(90deg, ${shade} 0%, ${base} ${Math.max(0, sheenAt - 34)}%, ${lit} ${sheenAt}%, ${base} ${Math.min(100, sheenAt + 30)}%, ${shade} 100%)`,
    ].join(", "),
    
  };
}

/** One door leaf, sliding into its pocket in the frame. */
function Leaf({ side, open, reduce, palette: p }: { side: "left" | "right"; open: boolean; reduce: boolean; palette: Palette }) {
  const left = side === "left";
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ x: open && !reduce ? (left ? "-100%" : "100%") : 0 }}
      transition={{ ...T.doors, ease: DOOR_EASE }}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [left ? "left" : "right"]: 0,
        width: "50%",
        ...metal(p, { sheenAt: left ? 66 : 34 }),
        // The meeting edges: a dark seam on the left leaf, a caught highlight on the right.
        boxShadow: left
          ? "inset -1px 0 0 rgba(0,0,0,.75), inset -3px 0 4px -2px rgba(0,0,0,.35)"
          : "inset 1px 0 0 rgba(255,236,214,.18), inset 3px 0 4px -2px rgba(0,0,0,.35)",
        willChange: "transform",
      }}
    />
  );
}

/** The doorway: the couple beyond, the two leaves in front, a recess shadow over both. */
function Doorway({ open, reduce, palette: p, heroImage }: { open: boolean; reduce: boolean; palette: Palette; heroImage?: string }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: p.oxbloodDeep, backgroundImage: heroImage ? `linear-gradient(180deg, rgba(255,214,170,.14), rgba(20,8,6,.22)), ${heroImage}` : undefined, backgroundSize: "cover", backgroundPosition: "center 40%" }} />
      <Leaf side="left" open={open} reduce={reduce} palette={p} />
      <Leaf side="right" open={open} reduce={reduce} palette={p} />
      <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 12px 16px -8px rgba(0,0,0,.65), inset 10px 0 12px -10px rgba(0,0,0,.7), inset -10px 0 12px -10px rgba(0,0,0,.7)" }} />
    </>
  );
}

/**
 * The lift lobby, drawn: a honed-stone wall under a warm downlight, a bronze
 * frame with its header and red floor readout, two brushed-bronze leaves on a
 * grooved sill, a polished floor that reflects them, and the call panel on
 * the wall. The guest's place card hangs above. Pressing the call button
 * lights it, the readout runs up from L to M, the light goes out on arrival,
 * and the doors part slowly onto the couple, the lobby easing a step closer
 * before it gives way to the invitation.
 */
export default function LiftIntro({ palette: p, partner1, partner2, date, greeting, heroImage, onStart, onArrive, onDone }: Props) {
  const reduce = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    button.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const arrive = setTimeout(onArrive, reduce ? 300 : T.arrive);
    const done = setTimeout(onDone, reduce ? 450 : T.done);
    return () => {
      clearTimeout(arrive);
      clearTimeout(done);
    };
  }, [open, reduce, onArrive, onDone]);

  const start = () => {
    if (open) return;
    setOpen(true);
    onStart();
  };

  const led = "#FF4A36";
  const lit = open && !reduce;

  return (
    <motion.div
      role={open ? undefined : "dialog"}
      aria-modal={open ? undefined : true}
      aria-label={open ? undefined : `${partner1} & ${partner2}: wedding invitation`}
      initial={{ opacity: 1 }}
      animate={{ opacity: open ? 0 : 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={reduce ? { duration: 0.45 } : { ...T.fade, ease: "easeOut" }}
      onClick={start}
      style={{
        position: "fixed",
        inset: 0,
        bottom: "var(--preview-chrome-bottom, 0px)",
        zIndex: "var(--z-modal, 80)" as unknown as number,
        overflow: "hidden",
        cursor: open ? "default" : "pointer",
        pointerEvents: open ? "none" : "auto",
        background: "#140F0C",
      }}
    >
      <style>{`
.mz-stage { position: absolute; inset: 0; container-type: size; overflow: hidden;
  /* Frame width follows the narrower of width and height; everything else is measured from it. */
  --fw: min(76cqw, 44cqh, 520px); --fh: calc(var(--fw) * 1.6); --ft: max(19cqh, 9.5rem);
  --jamb: calc(var(--fw) * .075); --head: calc(var(--fh) * .16); --sill: max(9px, calc(var(--fh) * .022)); }
@container (max-height: 500px) { .mz-stage { --ft: 22cqh; --fh: calc(var(--fw) * 1.5); } }
.mz-scene { position: absolute; inset: 0; }
.mz-frame { position: absolute; left: 50%; top: var(--ft); width: var(--fw); height: var(--fh); transform: translateX(-50%); }
.mz-opening { position: absolute; left: var(--jamb); right: var(--jamb); top: var(--head); bottom: 0; overflow: hidden; }
.mz-sill { position: absolute; left: 50%; top: calc(var(--ft) + var(--fh)); width: calc(var(--fw) * 1.04); height: var(--sill); transform: translateX(-50%); }
.mz-floor { position: absolute; left: 0; right: 0; top: calc(var(--ft) + var(--fh) + var(--sill)); bottom: 0; }
.mz-reflect { position: absolute; left: 50%; top: 0; width: calc(var(--fw) - 2 * var(--jamb)); height: calc((var(--fh) - var(--head)) * .55); transform: translateX(-50%) scaleY(-1); transform-origin: 50% 50%; opacity: .22; filter: blur(1.5px);
  -webkit-mask-image: linear-gradient(to top, #000, transparent 75%); mask-image: linear-gradient(to top, #000, transparent 75%); overflow: hidden; }
.mz-reflect > div { position: absolute; left: 0; right: 0; bottom: 0; height: calc((var(--fh) - var(--head))); }
.mz-panel { position: absolute; top: calc(var(--ft) + var(--fh) * .52); left: calc(50% + var(--fw) / 2 + min(calc((100cqw - var(--fw)) / 4), calc(var(--fw) * .1)) - calc(var(--fw) * .04)); width: calc(var(--fw) * .08); min-width: 18px; aspect-ratio: 1 / 2.4; }
.mz-card { position: absolute; top: max(14px, 2.6cqh); left: 50%; transform: translateX(-50%); width: min(84cqw, 21rem); }
@container (max-height: 500px) { .mz-card { transform: translateX(-50%) scale(.72); transform-origin: 50% 0; } }
.mz-call { outline: none; }
.mz-call:focus-visible .mz-plate { box-shadow: 0 0 0 2px ${p.lamp}, 0 0 14px rgba(240,190,116,.45); }
`}</style>

      <div className="mz-stage">
        <motion.div
          className="mz-scene"
          initial={false}
          animate={{ scale: lit ? 1.05 : 1 }}
          transition={{ ...T.doors, ease: DOOR_EASE }}
          style={{ transformOrigin: "50% 58%" }}
        >
          {/* Lobby wall: honed stone in tall slabs, washed by a warm downlight over the lift */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#231B17",
              backgroundImage: [
                "radial-gradient(ellipse 46cqw 34cqh at 50% calc(var(--ft) - 2cqh), rgba(255,214,168,.30), rgba(255,214,168,.08) 55%, rgba(255,214,168,0) 75%)",
                "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) calc(25cqw - 1px), rgba(0,0,0,.35) calc(25cqw - 1px), rgba(255,240,220,.05) 25cqw)",
                STONE,
                "linear-gradient(180deg, #2B221D, #1B1512 70%, #120D0B)",
              ].join(", "),
              backgroundSize: "auto, auto, 600px 600px, auto",
            }}
          />

          {/* Bronze frame: jambs and header, bevelled, standing a little proud of the wall */}
          <div
            aria-hidden
            className="mz-frame"
            style={{
              ...metal(p, { tone: 16, sheenAt: 50 }),
              boxShadow: "0 18px 40px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,236,214,.25), inset 1px 0 0 rgba(255,236,214,.12), inset -1px 0 0 rgba(0,0,0,.5)",
            }}
          >
            {/* Header panel seam and the floor readout behind smoked glass */}
            <span style={{ position: "absolute", left: "var(--jamb)", right: "var(--jamb)", top: "calc(var(--head) - 2px)", height: 2, background: "rgba(0,0,0,.45)", boxShadow: "0 1px 0 rgba(255,236,214,.12)" }} />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "calc(var(--head) * .36)",
                transform: "translateX(-50%)",
                width: "calc(var(--fw) * .26)",
                height: "calc(var(--head) * .34)",
                minHeight: 16,
                background: "linear-gradient(180deg, #170C09, #0E0605)",
                borderRadius: 2,
                boxShadow: `0 0 0 2px ${mix(p.bronze, 55, "#F0D9BC")}, 0 0 0 3px rgba(0,0,0,.45), inset 0 1px 3px rgba(0,0,0,.8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35em",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: "max(10px, calc(var(--fw) * .045))",
                lineHeight: 1,
                color: led,
                textShadow: "0 0 6px rgba(255,74,54,.75), 0 0 1px rgba(255,74,54,.9)",
              }}
            >
              <motion.span initial={false} animate={{ opacity: lit ? [0, 1, 1, 0] : 0 }} transition={{ duration: T.travel, times: [0, 0.1, 0.85, 1] }} style={{ fontSize: "0.8em" }}>
                ▲
              </motion.span>
              <span style={{ position: "relative", display: "inline-block", width: "1ch", textAlign: "center" }}>
                <motion.span initial={false} animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.2, delay: reduce ? 0 : T.travel * 0.55 }} style={{ position: "absolute", inset: 0 }}>
                  L
                </motion.span>
                <motion.span initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: 0.2, delay: reduce ? 0 : T.travel }}>
                  M
                </motion.span>
              </span>
            </div>

            {/* The opening; the leaves slide into the jambs */}
            <div className="mz-opening">
              <Doorway open={open} reduce={reduce} palette={p} heroImage={heroImage} />
            </div>
          </div>

          {/* Grooved bronze sill */}
          <div
            aria-hidden
            className="mz-sill"
            style={{
              background: `repeating-linear-gradient(90deg, rgba(255,236,214,.22) 0 1px, rgba(0,0,0,.35) 1px 3px), linear-gradient(180deg, ${mix(p.bronze, 75, "#F6E2C6")}, ${mix(p.bronze, 55, "#0B0705")})`,
              boxShadow: "0 1px 0 rgba(0,0,0,.6), 0 -1px 0 rgba(0,0,0,.4)",
            }}
          />

          {/* Polished floor, with the doors reflected in it */}
          <div
            aria-hidden
            className="mz-floor"
            style={{ backgroundColor: "#16110E", backgroundImage: `radial-gradient(ellipse 40cqw 14cqh at 50% 0, rgba(255,214,168,.12), rgba(255,214,168,0) 70%), ${STONE}, linear-gradient(180deg, #1E1814, #0D0A08)`, backgroundSize: "auto, 600px 600px, auto" }}
          >
            <div className="mz-reflect">
              <div>
                <Doorway open={open} reduce={reduce} palette={p} heroImage={heroImage} />
              </div>
            </div>
          </div>

          {/* Call panel on the wall: up and down, the up button lights on the press */}
          <div aria-hidden className="mz-panel" style={{ ...metal(p, { tone: 10, sheenAt: 40 }), borderRadius: 3, boxShadow: "0 4px 10px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,236,214,.25), inset 0 -1px 0 rgba(0,0,0,.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18%" }}>
            {[0, 1].map((i) => (
              <span key={i} style={{ position: "relative", width: "58%", aspectRatio: "1", borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${mix(p.bronze, 70, "#F6E2C6")}, ${mix(p.bronze, 50, "#0B0705")})`, boxShadow: "0 0 0 1.5px rgba(0,0,0,.45), inset 0 1px 1px rgba(255,236,214,.3)" }}>
                {i === 0 && (
                  <motion.span
                    initial={false}
                    animate={{ opacity: lit ? [0, 1, 1, 0] : 0 }}
                    transition={{ duration: T.travel + 0.3, times: [0, 0.08, 0.85, 1] }}
                    style={{ position: "absolute", inset: -2, borderRadius: "50%", boxShadow: `0 0 0 1.5px ${p.lamp}, 0 0 10px 2px rgba(240,190,116,.7)` }}
                  />
                )}
              </span>
            ))}
          </div>

          {/* Evening falloff toward the corners */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(6,4,3,.6) 100%)" }} />
        </motion.div>

        {/* Place card, framed on the wall above the lift */}
        <div
          className="mz-card"
          style={{
            padding: "0.95rem 1.1rem 1rem",
            background: p.linen,
            color: p.ink,
            textAlign: "center",
            border: `1px solid ${p.bronze}`,
            outline: `1px solid ${mix(p.bronze, 55, "transparent")}`,
            outlineOffset: 3,
            boxShadow: "0 10px 24px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.4)",
          }}
        >
          {greeting ? (
            <>
              <p style={{ fontFamily: ENGRAVED, fontSize: 14, letterSpacing: "0.12em", color: p.inkSoft, margin: 0 }}>Reserved for</p>
              <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.3rem, 6.6cqw, 1.75rem)", lineHeight: 1.12, color: p.oxblood, margin: "0.25rem 0 0", overflowWrap: "anywhere", textWrap: "balance" }}>{greeting.name}</p>
              {greeting.message && (
                <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.5, color: p.inkSoft, margin: "0.45rem 0 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{greeting.message}</p>
              )}
            </>
          ) : (
            <>
              <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.3rem, 6.6cqw, 1.75rem)", lineHeight: 1.12, color: p.oxblood, margin: 0, overflowWrap: "anywhere", textWrap: "balance" }}>
                {partner1} <span style={{ color: p.bronzeText }}>&amp;</span> {partner2}
              </p>
              {date.numeric && <p style={{ fontFamily: ENGRAVED, fontSize: 14, letterSpacing: "0.14em", color: p.inkSoft, margin: "0.35rem 0 0" }}>{date.numeric}</p>}
            </>
          )}
        </div>
      </div>

      {/* The instruction, on a small engraved plate at the foot of the doors */}
      <motion.div
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: "absolute", left: 0, right: 0, bottom: "max(3.5%, 1rem)", display: "flex", justifyContent: "center", zIndex: 3 }}
      >
        <button
          ref={button}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            start();
          }}
          aria-disabled={open}
          className="mz-call"
          style={{ background: "none", border: 0, padding: 6, cursor: "pointer" }}
        >
          <span
            className="mz-plate"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontFamily: ENGRAVED, fontSize: 15, letterSpacing: "0.12em", color: p.linenOn, background: "rgba(14,9,7,.9)", padding: "0.6rem 1rem 0.55rem", borderRadius: 2, boxShadow: `inset 0 0 0 1px ${mix(p.bronzeLight, 40, "transparent")}, 0 6px 16px rgba(0,0,0,.45)`, transition: "box-shadow .24s ease-out" }}
          >
            <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: p.lamp, boxShadow: `0 0 8px ${p.lamp}` }} />
            Call the lift
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
}
