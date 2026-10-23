"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { BOOK, CAPS, DISPLAY, QUILL, capsLabel, mapsUrl, slateStyle, parchmentStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** Name on the banner that follows the guest's footsteps. */
  guestName?: string;
  /** Travel notes are their own audience section; hide them when it is off. */
  showNotes: boolean;
  /** The first programme time doubles as the arrival time; only when the schedule is visible to this guest. */
  showSchedule: boolean;
}

// Map drawing space; labels are placed over it in percentages of these.
const W = 360;
const H = 480;
const pctX = (x: number) => `${(x / W) * 100}%`;
const pctY = (y: number) => `${(y / H) * 100}%`;

/** Walls, corridors and stairs, in drawing order. */
const WALLS = [
  "M96,46 H264 V140 H200 M160,140 H96 Z",
  "M160,140 V214 M200,140 V214",
  "M22,176 H160 V214 M22,176 V292 H160 V250",
  "M338,176 H200 V214 M338,176 V292 H200 V250",
  "M160,250 V330 H120 M200,250 V330 H240",
  "M120,330 V372 M240,330 V372",
  "M160,372 H40 V452 H320 V372 H200",
];
/** Stair treads and a secret passage, drawn finer. */
const DETAILS = [
  "M28,312 h40 M28,322 h40 M28,332 h40 M28,342 h40 M28,352 h40",
  "M292,312 h40 M292,322 h40 M292,332 h40 M292,342 h40 M292,352 h40",
  "M110,96 a70,30 0 0 1 140,0",
];
const PASSAGE = "M338,232 C352,180 352,96 264,70";

/** The route from the gate to the ceremony door. */
const ROUTE: [number, number][] = [
  [180, 440], [180, 380], [148, 352], [148, 300], [180, 270], [180, 214], [180, 150],
];
const STEP = 15;

interface Footprint {
  x: number;
  y: number;
  angle: number;
}

/** Footprints every STEP units along the route, alternating left and right of it. */
function footprints(route: [number, number][]): Footprint[] {
  const out: Footprint[] = [];
  // Distance into the current segment of the next footprint, carried across corners.
  let next = 0;
  for (let i = 1; i < route.length; i++) {
    const [x0, y0] = route[i - 1];
    const [x1, y1] = route[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const dx = (x1 - x0) / len;
    const dy = (y1 - y0) / len;
    for (; next < len; next += STEP) {
      const side = out.length % 2 ? 1 : -1;
      out.push({ x: x0 + dx * next - dy * 4 * side, y: y0 + dy * next + dx * 4 * side, angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 });
    }
    next -= len;
  }
  return out;
}

const STEPS = footprints(ROUTE);
const STEP_S = 0.28;
/** One walk from the gate to the door, a pause at the door, then the ink fades and it starts again. */
const WALK_S = STEPS.length * STEP_S;
const PERIOD = WALK_S + 2.6;

function Foot({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <ellipse cx={0} cy={1.6} rx={1.9} ry={3.1} />
      <ellipse cx={0} cy={-3.1} rx={1.5} ry={1.3} />
    </g>
  );
}

/**
 * The venue as an enchanted map. Folded, it shows only its title; once the
 * guest solemnly swears, it unfolds, its walls ink themselves in, and a trail
 * of footprints labelled with the guest's name walks from the gate to the
 * ceremony, where the couple's footprints are already waiting.
 */
export default function MapSection({ config, palette: p, date, guestName, showNotes, showSchedule }: Props) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [revealed, setRevealed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  // The swear button disappears with the cover; hand focus to the map so keyboard users stay in place.
  useEffect(() => {
    if (revealed) mapRef.current?.focus({ preventScroll: true });
  }, [revealed]);
  const maps = mapsUrl(config);
  const t = config.travel;
  const notes = showNotes
    ? [t?.directions, t?.accommodations, ...(t?.notes?.split("\n") ?? [])].map((s) => s?.trim()).filter((s): s is string => Boolean(s))
    : [];
  const hasVenue = Boolean(config.venueName || config.venueAddress || config.venueCity);
  if (!hasVenue && notes.length === 0) return null;
  const firstTime = showSchedule ? config.schedule?.find((e) => e.time.trim())?.time : undefined;
  const ink = p.ink;
  const draw = (delay: number, duration = 1.4) =>
    reduce ? {} : { initial: { pathLength: 0, opacity: 0 }, animate: revealed ? { pathLength: 1, opacity: 1 } : undefined, transition: { duration, delay, ease: [0.45, 0, 0.3, 1] as const } };
  const labelIn = (delay: number) => (reduce ? {} : { initial: { opacity: 0 }, animate: revealed ? { opacity: 1 } : undefined, transition: { duration: 0.9, delay } });
  const label: CSSProperties = { position: "absolute", transform: "translate(-50%, -50%)", fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(11px, 3.1cqw, 15px)", lineHeight: 1.15, color: ink, textAlign: "center", whiteSpace: "nowrap" };
  const walker = guestName?.split(" & ")[0] || "You";

  return (
    <section id="map" aria-labelledby="wv-map-title" style={{ ...slateStyle(p), padding: "5.5rem 1.1rem" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <SectionHeading id="wv-map-title" kicker="Where to find us" title="The Wedding Map" subtitle="Tap your wand to the parchment and follow the footsteps." color={p.chalk} accent={p.gilt} />

        {hasVenue && (
          <div style={{ position: "relative", width: "min(100%, 30rem)", margin: "0 auto", containerType: "inline-size" }}>
            <p aria-live="polite" className="sr-only">{revealed ? "The map has unfolded." : ""}</p>
            {!revealed ? (
              <motion.div
                key="cover"
                style={{ ...parchmentStyle(p), position: "relative", aspectRatio: `${W} / ${H}`, padding: "12cqw 9cqw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", borderRadius: 3, boxShadow: "0 30px 50px -24px rgba(0,0,0,.85)" }}
              >
                {/* Fold creases */}
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 33%, rgba(60,40,15,.16) 33.3%, transparent 34%, transparent 66%, rgba(60,40,15,.16) 66.3%, transparent 67%)", pointerEvents: "none" }} />
                <p style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(16px, 4.6cqw, 20px)", lineHeight: 1.5, color: ink, margin: 0 }}>
                  Messrs. {config.partner1Name} &amp; {config.partner2Name}
                  <span style={{ display: "block", fontSize: "0.86em", color: p.inkSoft }}>Purveyors of Aids to Wedding Guests</span>
                  <span style={{ display: "block", marginTop: "0.6em" }}>are proud to present</span>
                </p>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.7rem, 10cqw, 2.8rem)", lineHeight: 1.05, color: ink, margin: "0.9rem 0 0" }}>
                  The Wedding Map
                </p>
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  aria-controls={`${uid}-map`}
                  aria-expanded={revealed}
                  className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{ marginTop: "2.2rem", minHeight: 52, padding: "0.7rem 1.4rem", borderRadius: 2, border: `1px solid ${ink}`, background: "transparent", color: ink, fontFamily: QUILL, fontSize: "clamp(1.25rem, 5.8cqw, 1.6rem)", lineHeight: 1.2, cursor: "pointer", outlineColor: ink }}
                >
                  &ldquo;I solemnly swear that I am up to some good&rdquo;
                </button>
              </motion.div>
            ) : (
              <motion.div
                id={`${uid}-map`}
                ref={mapRef}
                tabIndex={-1}
                role="img"
                aria-label={`Enchanted map: footsteps lead from the gate to ${config.venueName || "the ceremony"}.`}
                className="focus-visible:outline-2 focus-visible:outline-offset-4"
                initial={reduce ? false : { clipPath: "inset(0% 50% 0% 50%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
                style={{ ...parchmentStyle(p), position: "relative", aspectRatio: `${W} / ${H}`, borderRadius: 3, boxShadow: "0 30px 50px -24px rgba(0,0,0,.85)", overflow: "hidden" }}
              >
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 33%, rgba(60,40,15,.14) 33.3%, transparent 34%, transparent 66%, rgba(60,40,15,.14) 66.3%, transparent 67%)", pointerEvents: "none" }} />
                <svg aria-hidden viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
                  {WALLS.map((d, i) => (
                    <motion.path key={d} d={d} strokeWidth={2.2} {...draw(0.9 + i * 0.18)} />
                  ))}
                  {DETAILS.map((d, i) => (
                    <motion.path key={d} d={d} strokeWidth={1} opacity={0.7} {...draw(2 + i * 0.2, 1)} />
                  ))}
                  <motion.path d={PASSAGE} strokeWidth={1.2} strokeDasharray="3 5" {...draw(2.4, 1.6)} />
                  {/* Compass */}
                  <motion.g {...labelIn(2.4)} strokeWidth={1}>
                    <circle cx={318} cy={40} r={16} />
                    <path d="M318,20 L322,40 L318,60 L314,40 Z" fill={ink} />
                    <path d="M298,40 H338" />
                  </motion.g>

                  {/* The couple, waiting at the door */}
                  {[[166, 120, -12], [194, 120, 12]].map(([x, y, a], i) => (
                    <motion.g
                      key={i}
                      animate={reduce || !revealed ? undefined : { rotate: [0, i ? -14 : 14, 0], x: [0, i ? 2 : -2, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                      style={{ originX: 0.5, originY: 0.5 }}
                    >
                      <g transform={`translate(${x - 3} ${y}) rotate(${a})`}><Foot fill={ink} /></g>
                      <g transform={`translate(${x + 3} ${y + 3}) rotate(${a})`}><Foot fill={ink} /></g>
                    </motion.g>
                  ))}

                  {/* The guest's footsteps */}
                  {STEPS.map((s, i) => (
                    <motion.g
                      key={i}
                      initial={{ opacity: reduce ? 0.7 : 0 }}
                      animate={reduce || !revealed ? undefined : { opacity: [0, 0.9, 0.9, 0] }}
                      transition={{ duration: PERIOD, times: [0, 0.02, 0.45, 0.6], repeat: Infinity, delay: 3 + i * STEP_S, ease: "linear" }}
                    >
                      <g transform={`translate(${s.x} ${s.y}) rotate(${s.angle})`}><Foot fill={p.wax} /></g>
                    </motion.g>
                  ))}
                </svg>

                {/* Room names, inked over the drawing */}
                <motion.div {...labelIn(1.6)} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <span style={{ ...label, left: pctX(180), top: pctY(66), fontFamily: CAPS, fontStyle: "normal", fontWeight: 700, fontSize: "clamp(12px, 3.6cqw, 17px)", letterSpacing: "0.08em", whiteSpace: "normal", width: "44%" }}>
                    {config.venueName || "The Ceremony"}
                  </span>
                  <span style={{ ...label, left: pctX(180), top: pctY(98) }}>the vows</span>
                  <span style={{ ...label, left: pctX(91), top: pctY(222) }}>The Feast</span>
                  <span style={{ ...label, left: pctX(269), top: pctY(222) }}>Dance Floor</span>
                  <span style={{ ...label, left: pctX(91), top: pctY(268), fontSize: "clamp(10px, 2.6cqw, 13px)", color: p.inkSoft }}>cake (guarded)</span>
                  <span style={{ ...label, left: pctX(269), top: pctY(268), fontSize: "clamp(10px, 2.6cqw, 13px)", color: p.inkSoft }}>mind the stairs</span>
                  <span style={{ ...label, left: pctX(48), top: pctY(298), fontSize: "clamp(10px, 2.6cqw, 13px)" }}>Owlery</span>
                  <span style={{ ...label, left: pctX(312), top: pctY(298), fontSize: "clamp(10px, 2.6cqw, 13px)" }}>Photo Corner</span>
                  <span style={{ ...label, left: pctX(340), top: pctY(150), transform: "translate(-50%, -50%) rotate(-70deg)", fontSize: "clamp(9px, 2.4cqw, 12px)", color: p.inkSoft }}>secret passage</span>
                  <span style={{ ...label, left: pctX(180), top: pctY(414), fontFamily: CAPS, fontStyle: "normal", fontSize: "clamp(10px, 2.8cqw, 13px)", letterSpacing: "0.16em" }}>THE GATE</span>
                  {config.venueCity && (
                    <span style={{ ...label, left: pctX(180), top: pctY(468), fontSize: "clamp(10px, 2.8cqw, 13px)", color: p.inkSoft }}>{config.venueCity}</span>
                  )}
                </motion.div>

                {/* Name banners: the couple at the door, the guest at the head of the footsteps */}
                <motion.div {...labelIn(2.8)} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <Banner palette={p} style={{ left: pctX(146), top: pctY(150) }}>{config.partner1Name}</Banner>
                  <Banner palette={p} style={{ left: pctX(214), top: pctY(150) }}>{config.partner2Name}</Banner>
                </motion.div>
                {reduce ? (
                  <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                    <Banner palette={p} accent style={{ left: pctX(STEPS[0].x + 26), top: pctY(STEPS[0].y) }}>{walker}</Banner>
                  </div>
                ) : (
                  <motion.div
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      left: STEPS.map((s) => pctX(s.x + 26)).filter((_, i) => i % 4 === 0),
                      top: STEPS.map((s) => pctY(s.y)).filter((_, i) => i % 4 === 0),
                    }}
                    transition={{
                      // Visible for the whole walk and a moment at the door, then gone until the next walk.
                      opacity: { duration: PERIOD, times: [0, 0.03, (WALK_S + 1.4) / PERIOD, (WALK_S + 2) / PERIOD], repeat: Infinity, delay: 3 },
                      left: { duration: WALK_S, repeat: Infinity, repeatDelay: PERIOD - WALK_S, delay: 3, ease: "linear" },
                      top: { duration: WALK_S, repeat: Infinity, repeatDelay: PERIOD - WALK_S, delay: 3, ease: "linear" },
                    }}
                    style={{ position: "absolute", pointerEvents: "none" }}
                  >
                    <Banner palette={p} accent>{walker}</Banner>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {hasVenue && (
          <div style={{ ...parchmentStyle(p), position: "relative", width: "min(100%, 30rem)", margin: "2rem auto 0", padding: "1.8rem 1.5rem 1.6rem", borderRadius: 3, textAlign: "center", boxShadow: "0 24px 40px -26px rgba(0,0,0,.8)" }}>
            <p style={{ ...capsLabel(p.wax, 11), margin: 0 }}>The ceremony</p>
            {config.venueName && <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.5rem, 7vw, 2.1rem)", lineHeight: 1.15, color: ink, margin: "0.5rem 0 0" }}>{config.venueName}</h3>}
            {(config.venueAddress || config.venueCity) && (
              <p style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.45, color: ink, margin: "0.4rem 0 0" }}>
                {[config.venueAddress, config.venueCity].filter(Boolean).join(", ")}
              </p>
            )}
            {(date.long || firstTime) && (
              <p style={{ ...capsLabel(p.inkSoft, 12), lineHeight: 1.8, margin: "1rem 0 0", paddingTop: "0.9rem", borderTop: `1px solid color-mix(in srgb, ${p.inkSoft} 35%, transparent)` }}>
                {date.long}
                {date.long && firstTime && " · "}
                {firstTime && `Arrive by ${firstTime}`}
              </p>
            )}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{ display: "inline-flex", alignItems: "center", minHeight: 50, marginTop: "1.2rem", padding: "0 1.5rem", borderRadius: 2, background: p.wax, color: p.parchment, border: `1px solid ${p.gilt}`, fontFamily: CAPS, fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", outlineColor: p.wax }}
              >
                Open the muggle map →
              </a>
            )}
          </div>
        )}

        {notes.length > 0 && (
          <div style={{ width: "min(100%, 30rem)", margin: "2.6rem auto 0" }}>
            <p style={{ ...capsLabel(p.gilt, 11), margin: "0 0 0.4rem", textAlign: "center" }}>Scrawled in the margins</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notes.map((note, i) => (
                <li key={i} style={{ display: "flex", gap: "0.9rem", fontFamily: BOOK, fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.55, color: p.chalk, padding: "0.95rem 0", borderTop: i ? `1px solid color-mix(in srgb, ${p.chalk} 16%, transparent)` : "none" }}>
                  <span aria-hidden style={{ color: p.gilt, fontFamily: CAPS, paddingTop: 2 }}>✦</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/** A little scroll-ended name label, as the map writes beside each set of footprints. */
function Banner({ palette: p, accent = false, style, children }: { palette: Palette; accent?: boolean; style?: CSSProperties; children: string }) {
  return (
    <span
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        padding: "0.1rem 0.55rem 0.15rem",
        border: `1px solid ${accent ? p.wax : p.ink}`,
        background: `color-mix(in srgb, ${p.parchment} 88%, #FFF8E6)`,
        fontFamily: BOOK,
        fontStyle: "italic",
        fontSize: "clamp(10px, 2.9cqw, 13px)",
        lineHeight: 1.2,
        color: accent ? p.wax : p.ink,
        whiteSpace: "nowrap",
        maxWidth: "34cqw",
        overflow: "hidden",
        textOverflow: "ellipsis",
        clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
