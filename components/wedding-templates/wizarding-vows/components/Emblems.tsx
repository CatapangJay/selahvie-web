"use client";

import { useId, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CAPS, HOUSES } from "../theme";

/** Points of a star-shaped ring (a lion's mane, a wax seal's rim) around the origin. */
function ring(spikes: number, outer: number, inner: number, cx = 0, cy = 0): string {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

const MANE = ring(14, 27, 19);
const SHIELD = "M24,40 H176 V128 C176,182 140,216 100,236 C60,216 24,182 24,128 Z";

function Lion({ field, charge }: { field: string; charge: string }) {
  return (
    <g>
      <polygon points={MANE} fill={charge} />
      <circle r={14.5} fill={field} />
      <circle cx={-10} cy={-12} r={4.5} fill={charge} />
      <circle cx={10} cy={-12} r={4.5} fill={charge} />
      <circle cx={-5} cy={-3} r={2} fill={charge} />
      <circle cx={5} cy={-3} r={2} fill={charge} />
      <path d="M-4,3 L4,3 L0,8 Z" fill={charge} />
      <path d="M0,8 C-2,12 -6,12 -8,10 M0,8 C2,12 6,12 8,10" fill="none" stroke={charge} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

function Serpent({ field, charge }: { field: string; charge: string }) {
  return (
    <g>
      <path d="M-20,24 C-34,8 -2,6 -7,-5 C-11,-15 4,-22 15,-16" fill="none" stroke={charge} strokeWidth={7.5} strokeLinecap="round" />
      <path d="M-20,24 C-34,8 -2,6 -7,-5 C-11,-15 4,-22 15,-16" fill="none" stroke={field} strokeWidth={1.2} strokeDasharray="2 4" strokeLinecap="round" />
      <ellipse cx={18} cy={-16} rx={8} ry={5.5} transform="rotate(-18 18 -16)" fill={charge} />
      <circle cx={20} cy={-18} r={1.4} fill={field} />
      <path d="M25,-18 L31,-21 M25,-18 L31,-15" stroke="#B3261E" strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );
}

function Badger({ charge }: { charge: string }) {
  const pale = "#F4ECDA";
  return (
    <g>
      <circle cx={-14} cy={-15} r={5.5} fill={charge} />
      <circle cx={14} cy={-15} r={5.5} fill={charge} />
      <path d="M0,-22 C15,-22 22,-6 18,8 C14,20 6,25 0,25 C-6,25 -14,20 -18,8 C-22,-6 -15,-22 0,-22 Z" fill={pale} />
      <path d="M-6,-21 C-14,-16 -16,0 -10,14 C-8,18 -5,18 -4,12 C-3,0 -3,-14 -6,-21 Z" fill={charge} />
      <path d="M6,-21 C14,-16 16,0 10,14 C8,18 5,18 4,12 C3,0 3,-14 6,-21 Z" fill={charge} />
      <circle cx={-8} cy={-2} r={1.8} fill={pale} />
      <circle cx={8} cy={-2} r={1.8} fill={pale} />
      <ellipse cx={0} cy={20} rx={4.5} ry={3} fill={charge} />
    </g>
  );
}

function Eagle({ field, charge }: { field: string; charge: string }) {
  return (
    <g>
      <path
        d="M0,-8 C-8,-15 -20,-21 -31,-17 C-25,-12 -27,-8 -31,-4 C-23,-4 -21,0 -25,4 C-17,4 -11,6 -7,10 L-6,17 L0,24 L6,17 L7,10 C11,6 17,4 25,4 C21,0 23,-4 31,-4 C27,-8 25,-12 31,-17 C20,-21 8,-15 0,-8 Z"
        fill={charge}
      />
      <circle cy={-13} r={6.5} fill={charge} />
      <path d="M2,-13 L9,-11 L3,-9 Z" fill={field} />
      <circle cx={1} cy={-15} r={1.2} fill={field} />
      <path d="M-22,-10 L-12,-6 M-22,-2 L-12,0 M22,-10 L12,-6 M22,-2 L12,0" stroke={field} strokeWidth={1} opacity={0.6} />
    </g>
  );
}

interface CrestProps {
  /** Arched over the shield, e.g. the couple's names. */
  label?: string;
  /** On the ribbon under the shield. */
  motto?: string;
  /** In the medallion where the bands cross. */
  initials: string;
  gilt: string;
  wax: string;
  style?: CSSProperties;
  title?: string;
}

/**
 * The four-house crest: a shield quartered in muted oxblood, forest, ochre and slate
 * with a lion, serpent, badger and eagle, gilt bands crossing at a medallion
 * that carries the couple's initials, a name arched above and a motto ribbon.
 */
export function Crest({ label, motto = "Amor Omnia Vincit", initials, gilt, wax, style, title }: CrestProps) {
  const id = useId().replace(/:/g, "");
  const [lion, serpent, badger, eagle] = HOUSES;
  return (
    <svg viewBox="0 -22 200 284" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <defs>
        <clipPath id={`${id}-shield`}>
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id={`${id}-gilt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={gilt} stopOpacity={0.75} />
          <stop offset=".5" stopColor={gilt} />
          <stop offset="1" stopColor="#5A3A0E" stopOpacity={0.9} />
        </linearGradient>
        <path id={`${id}-arc`} d="M24,34 A86,86 0 0 1 176,34" />
      </defs>

      {label && (
        <text fill={gilt} style={{ fontFamily: CAPS, fontWeight: 700, fontSize: 15, letterSpacing: "0.18em" }}>
          <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
      )}

      <g clipPath={`url(#${id}-shield)`}>
        <rect x={0} y={0} width={100} height={124} fill={lion.field} />
        <rect x={100} y={0} width={100} height={124} fill={serpent.field} />
        <rect x={0} y={124} width={100} height={140} fill={badger.field} />
        <rect x={100} y={124} width={100} height={140} fill={eagle.field} />
        <rect x={0} y={113} width={200} height={22} fill={`url(#${id}-gilt)`} />
        <rect x={89} y={0} width={22} height={262} fill={`url(#${id}-gilt)`} />
      </g>
      <path d={SHIELD} fill="none" stroke={`url(#${id}-gilt)`} strokeWidth={5} />
      <path d={SHIELD} fill="none" stroke="#2A1A06" strokeWidth={0.8} opacity={0.6} />

      <g transform="translate(58 78)"><Lion {...lion} /></g>
      <g transform="translate(140 80)"><Serpent {...serpent} /></g>
      <g transform="translate(60 172)"><Badger charge={badger.charge} /></g>
      <g transform="translate(138 170)"><Eagle {...eagle} /></g>

      <circle cx={100} cy={124} r={23} fill={`url(#${id}-gilt)`} />
      <circle cx={100} cy={124} r={18.5} fill={wax} stroke="#2A1A06" strokeWidth={0.6} />
      <text x={100} y={130} textAnchor="middle" fill={gilt} style={{ fontFamily: CAPS, fontWeight: 700, fontSize: initials.length > 2 ? 14 : 18 }}>
        {initials}
      </text>

      {/* Motto ribbon with folded tails */}
      <path d="M14,232 L34,226 L30,242 L36,256 L14,250 L20,241 Z" fill={wax} />
      <path d="M186,232 L166,226 L170,242 L164,256 L186,250 L180,241 Z" fill={wax} />
      <path d="M30,222 Q100,240 170,222 L170,246 Q100,264 30,246 Z" fill={wax} stroke={gilt} strokeWidth={1.2} />
      <path id={`${id}-ribbon`} d="M32,237 Q100,255 168,237" fill="none" />
      <text fill={gilt} style={{ fontFamily: CAPS, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.06em" }}>
        <textPath href={`#${id}-ribbon`} startOffset="50%" textAnchor="middle">
          {motto.toUpperCase()}
        </textPath>
      </text>
    </svg>
  );
}

// Equilateral triangle with its inscribed circle and the line from apex to base.
const HALLOWS_TRI = "M50,4 L96,84 L4,84 Z";
const HALLOWS_R = 26.6;
const HALLOWS_CY = 84 - HALLOWS_R;

interface HallowsProps {
  color: string;
  size?: number;
  /** Draw the strokes in when scrolled into view. */
  draw?: boolean;
  strokeWidth?: number;
  style?: CSSProperties;
}

/** The triangle, circle and line, drawn as one continuous ink stroke when it scrolls into view. */
export function Hallows({ color, size = 40, draw = false, strokeWidth = 3, style }: HallowsProps) {
  const reduce = useReducedMotion();
  const animate = draw && !reduce;
  const stroke = (delay: number) =>
    animate
      ? { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true, amount: 0.8 }, transition: { duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] as const } }
      : {};
  return (
    <svg aria-hidden viewBox="0 0 100 90" width={size} height={size * 0.9} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" style={{ overflow: "visible", ...style }}>
      <motion.path d={HALLOWS_TRI} {...stroke(0)} />
      <motion.circle cx={50} cy={HALLOWS_CY} r={HALLOWS_R} {...stroke(0.5)} />
      <motion.path d="M50,4 L50,84" {...stroke(0.9)} />
    </svg>
  );
}

/** The golden ball drawn in fine gold line with outstretched wings, drifting very slightly. */
export function Snitch({ gilt, size = 56, style }: { gilt: string; size?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  const wing = "C-18,-15 -32,-13 -37,-7 C-30,-7 -22,-3 -7,2";
  return (
    <motion.svg
      aria-hidden
      viewBox="-40 -18 80 36"
      width={size}
      height={size * 0.45}
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{ overflow: "visible", ...style }}
      fill="none"
      stroke={gilt}
      strokeWidth={0.9}
      strokeLinecap="round"
    >
      <path d={`M-7,-3 ${wing} M-9,-5 C-20,-10 -28,-9 -31,-6`} />
      <path d={`M-7,-3 ${wing} M-9,-5 C-20,-10 -28,-9 -31,-6`} transform="scale(-1 1)" />
      <circle r={7.5} />
      <path d="M-7.5,0 Q0,-4.5 7.5,0 M0,-7.5 Q-3.6,0 0,7.5" opacity={0.7} />
    </motion.svg>
  );
}

// Drips of wax squeezed out around the stamp: [angle in degrees, radius].
const DRIPS: [number, number][] = [[32, 13], [150, 11], [262, 12]];

/**
 * A pressed wax seal in relief: an irregular, domed puddle of wax lit from the
 * upper left, a sunken impression where the stamp went in, and the couple's
 * initials and shield standing proud inside it, with a glossy highlight.
 */
export function WaxSeal({ wax, initials, size, style }: { wax: string; initials: string; size?: number; style?: CSSProperties }) {
  const id = useId().replace(/:/g, "");
  const light = `color-mix(in srgb, ${wax} 72%, #E8705E)`;
  const body = `color-mix(in srgb, ${wax} 85%, #B3262A)`;
  const deep = `color-mix(in srgb, ${wax} 58%, #160303)`;
  const fontSize = initials.length > 2 ? 12.5 : 15;
  return (
    <svg aria-hidden viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`${id}-wax`} cx=".36" cy=".3" r=".8">
          <stop offset="0" style={{ stopColor: light }} />
          <stop offset=".5" style={{ stopColor: body }} />
          <stop offset="1" style={{ stopColor: deep }} />
        </radialGradient>
        <radialGradient id={`${id}-pool`} cx=".6" cy=".62" r=".7">
          <stop offset="0" style={{ stopColor: body }} />
          <stop offset="1" style={{ stopColor: deep }} />
        </radialGradient>
        {/* Wobbles the outline so the wax looks poured, not cut */}
        <filter id={`${id}-pour`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves={2} seed={11} />
          <feDisplacementMap in="SourceGraphic" scale={11} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Broad dome: the blurred outline becomes a height map lit from the upper left */}
        <filter id={`${id}-dome`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={6.5} result="h" />
          <feDiffuseLighting in="h" surfaceScale={7} diffuseConstant={1.2} lightingColor="#fff" result="d">
            <feDistantLight azimuth={225} elevation={48} />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1} result="shaded" />
          <feSpecularLighting in="h" surfaceScale={7} specularConstant={0.55} specularExponent={34} lightingColor="#FFE9E2" result="s">
            <fePointLight x={22} y={14} z={70} />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sIn" />
          <feComposite in="shaded" in2="sIn" operator="arithmetic" k2={1} k3={0.75} result="lit" />
          <feDropShadow dx={1.5} dy={3} stdDeviation={2.2} floodColor="#1A0606" floodOpacity={0.55} />
        </filter>
        {/* The stamp's impression: shadow under the upper-left lip, a catch of light on the lower right */}
        <filter id={`${id}-sunk`} x="-10%" y="-10%" width="120%" height="120%">
          <feComponentTransfer in="SourceAlpha" result="inv">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feGaussianBlur in="inv" stdDeviation={2.4} result="invB" />
          <feOffset in="invB" dx={2.2} dy={2.6} result="sh" />
          <feFlood floodColor="#120202" floodOpacity={0.85} result="shC" />
          <feComposite in="shC" in2="sh" operator="in" result="sh2" />
          <feComposite in="sh2" in2="SourceAlpha" operator="in" result="shadow" />
          <feOffset in="invB" dx={-1.6} dy={-1.8} result="hl" />
          <feFlood floodColor="#FFB8A8" floodOpacity={0.35} result="hlC" />
          <feComposite in="hlC" in2="hl" operator="in" result="hl2" />
          <feComposite in="hl2" in2="SourceAlpha" operator="in" result="glint" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shadow" />
            <feMergeNode in="glint" />
          </feMerge>
        </filter>
        {/* Fine relief for the raised initials and shield */}
        <filter id={`${id}-relief`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={0.9} result="h" />
          <feDiffuseLighting in="h" surfaceScale={2.6} diffuseConstant={1.2} lightingColor="#fff" result="d">
            <feDistantLight azimuth={225} elevation={42} />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1} result="shaded" />
          <feSpecularLighting in="h" surfaceScale={2.6} specularConstant={0.8} specularExponent={18} lightingColor="#FFE0D6" result="s">
            <feDistantLight azimuth={225} elevation={42} />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sIn" />
          <feComposite in="shaded" in2="sIn" operator="arithmetic" k2={1} k3={0.7} result="lit" />
          <feDropShadow dx={0.8} dy={1.1} stdDeviation={0.6} floodColor="#140303" floodOpacity={0.7} />
        </filter>
      </defs>

      <g filter={`url(#${id}-dome)`}>
        <g filter={`url(#${id}-pour)`} fill={`url(#${id}-wax)`}>
          <circle cx={50} cy={50} r={39} />
          {DRIPS.map(([deg, r]) => {
            const a = (deg * Math.PI) / 180;
            return <circle key={deg} cx={50 + 33 * Math.cos(a)} cy={50 + 33 * Math.sin(a)} r={r} />;
          })}
        </g>
      </g>
      <circle cx={50} cy={50} r={27.5} fill={`url(#${id}-pool)`} filter={`url(#${id}-sunk)`} />
      <g filter={`url(#${id}-relief)`}>
        <circle cx={50} cy={50} r={23.5} fill="none" style={{ stroke: body }} strokeWidth={1.4} strokeDasharray="0.1 3.1" strokeLinecap="round" />
        <path d="M38,33 H62 V47 C62,57 56,63 50,66.5 C44,63 38,57 38,47 Z" fill="none" style={{ stroke: body }} strokeWidth={2} strokeLinejoin="round" />
        <text x={50} y={53.5} textAnchor="middle" style={{ fontFamily: CAPS, fontWeight: 700, fontSize, fill: body }}>
          {initials}
        </text>
      </g>
    </svg>
  );
}

const PERFORATIONS = [
  ...Array.from({ length: 12 }, (_, i) => [3 + i * 5.27, 0]),
  ...Array.from({ length: 12 }, (_, i) => [3 + i * 5.27, 78]),
  ...Array.from({ length: 15 }, (_, i) => [0, 3 + i * 5.14]),
  ...Array.from({ length: 15 }, (_, i) => [64, 3 + i * 5.14]),
];

/** Audubon's Snowy Owl (Havell after Audubon, 1831; National Gallery of Art, CC0), cropped to the face. */
export const STAMP_OWL_SRC = "/templates/wizarding-vows/stamp-owl.jpg";

/**
 * A postage stamp printed with a snowy owl from an old natural-history plate,
 * toned a little warm, inside a perforated border with "Owl Post" and its
 * value along the foot.
 */
export function OwlStamp({ style }: { style?: CSSProperties }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden viewBox="0 0 64 78" style={{ overflow: "visible", filter: "drop-shadow(0 1px 1.5px rgba(40,22,8,.45))", ...style }}>
      <defs>
        <mask id={`${id}-perf`}>
          <rect width={64} height={78} fill="#fff" />
          {PERFORATIONS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.9} fill="#000" />)}
        </mask>
        <clipPath id={`${id}-pic`}>
          <rect x={6} y={6} width={52} height={60} />
        </clipPath>
        <filter id={`${id}-print`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves={1} seed={4} />
          <feColorMatrix values="0 0 0 0 .22 0 0 0 0 .14 0 0 0 0 .06 0 0 0 .28 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g mask={`url(#${id}-perf)`}>
        <rect width={64} height={78} fill="#EFE6D2" />
        <rect x={4.5} y={4.5} width={55} height={69} fill="none" stroke="#5A3E22" strokeWidth={0.6} />
      </g>
      <g clipPath={`url(#${id}-pic)`}>
        <image href={STAMP_OWL_SRC} x={6} y={6} width={52} height={60} preserveAspectRatio="xMidYMid slice" style={{ filter: "sepia(.35) saturate(.85) contrast(1.05)" }} />
        {/* Faint printing grain over the picture */}
        <rect x={6} y={6} width={52} height={60} fill="#fff" filter={`url(#${id}-print)`} />
        <rect x={6} y={58} width={52} height={8} fill="rgba(36,24,12,.82)" />
      </g>
      <rect x={6} y={6} width={52} height={60} fill="none" stroke="#3A2614" strokeWidth={0.8} />
      <text x={32} y={63.6} textAnchor="middle" fill="#EFE6D2" style={{ fontFamily: CAPS, fontWeight: 700, fontSize: 5, letterSpacing: "0.12em" }}>
        OWL POST
      </text>
      <text x={32} y={72} textAnchor="middle" fill="#5A3E22" style={{ fontFamily: CAPS, fontWeight: 700, fontSize: 4.4, letterSpacing: "0.1em" }}>
        ONE KNUT
      </text>
    </svg>
  );
}

