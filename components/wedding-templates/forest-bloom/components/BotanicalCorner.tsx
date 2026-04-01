"use client";

/**
 * Botanical leaf/flower cluster decorations.
 * Designed to match the dark-green botanical invite aesthetic shown in the design reference.
 * Each "position" renders a unique cluster oriented for that corner.
 */

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center";

interface Props {
  corner: Corner;
  /** 0–1  scale factor */
  scale?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* ── Shared leaf/flower path data ───────────────────────────────────────── */
// Green shades used in the reference design
const G1 = "#3a5c43";   // deep green
const G2 = "#4e7a57";   // mid green
const G3 = "#6a9e74";   // light green
const G4 = "#2d4a35";   // darkest green
const WH = "#f0f5ee";   // off-white blossom

/* Top-left cluster — large leaves sweep from left/top, flowers at tip */
function TopLeft() {
  return (
    <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Large background leaf sweeping right */}
      <path d="M -10 60 Q 60 -20 160 40 Q 90 80 -10 60Z" fill={G4} opacity="0.9"/>
      <path d="M -10 60 Q 80 10 160 40" stroke={G3} strokeWidth="0.8" fill="none" opacity="0.5"/>

      {/* Big central leaf */}
      <path d="M 0 120 Q 80 0 180 30 Q 100 90 0 120Z" fill={G2} opacity="0.95"/>
      <path d="M 0 120 Q 90 30 180 30" stroke={G3} strokeWidth="0.7" fill="none" opacity="0.6"/>
      {/* Veins */}
      <path d="M 30 100 Q 80 55 155 38" stroke={G3} strokeWidth="0.5" fill="none" opacity="0.4"/>
      <path d="M 55 80 Q 100 55 155 38" stroke={G3} strokeWidth="0.4" fill="none" opacity="0.3"/>

      {/* Medium leaf leaning down-right */}
      <path d="M -5 180 Q 50 80 130 100 Q 70 150 -5 180Z" fill={G1} opacity="0.9"/>
      <path d="M -5 180 Q 55 95 130 100" stroke={G3} strokeWidth="0.6" fill="none" opacity="0.45"/>

      {/* Small narrow leaf upper-right */}
      <path d="M 80 -10 Q 140 20 120 90 Q 80 50 80 -10Z" fill={G2} opacity="0.85"/>
      <path d="M 80 -10 Q 140 30 120 90" stroke={G3} strokeWidth="0.5" fill="none" opacity="0.4"/>

      {/* Thin sprig top-center */}
      <path d="M 120 -10 Q 160 30 140 80 Q 120 50 120 -10Z" fill={G3} opacity="0.7"/>

      {/* Baby's breath / small white flowers */}
      <circle cx="155" cy="38"  r="4"   fill={WH} opacity="0.95"/>
      <circle cx="148" cy="30"  r="2.5" fill={WH} opacity="0.85"/>
      <circle cx="162" cy="44"  r="3"   fill={WH} opacity="0.9"/>
      <circle cx="170" cy="33"  r="2"   fill={WH} opacity="0.7"/>
      <circle cx="140" cy="42"  r="2"   fill={WH} opacity="0.8"/>

      {/* 5-petal blossom */}
      <g transform="translate(155, 25) rotate(15)">
        <path d="M0,-5 Q3,-3 3,0 Q3,3 0,5 Q-3,3 -3,0 Q-3,-3 0,-5Z" fill={WH} opacity="0.9"/>
        <path d="M-5,0 Q-3,-3 0,-3 Q3,-3 5,0 Q3,3 0,3 Q-3,3 -5,0Z" fill={WH} opacity="0.9"/>
        <circle cx="0" cy="0" r="1.5" fill="#f5d87a"/>
      </g>

      {/* Tiny bud dots scattered */}
      <circle cx="100" cy="15"  r="1.5" fill={WH} opacity="0.6"/>
      <circle cx="115" cy="10"  r="1"   fill={WH} opacity="0.5"/>
      <circle cx="130" cy="20"  r="1.5" fill={WH} opacity="0.6"/>

      {/* Stem lines */}
      <path d="M 90 160 Q 120 100 155 38"  stroke={G2} strokeWidth="0.7" fill="none" opacity="0.4" strokeDasharray="2,3"/>
      <path d="M 10 100 Q 60  50  155 38"   stroke={G2} strokeWidth="0.5" fill="none" opacity="0.3"/>
    </svg>
  );
}

/* Top-right cluster — mirror of top-left, flowers lean left */
function TopRight() {
  return (
    <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
      <path d="M -10 60 Q 60 -20 160 40 Q 90 80 -10 60Z" fill={G4} opacity="0.9"/>
      <path d="M -10 60 Q 80 10 160 40" stroke={G3} strokeWidth="0.8" fill="none" opacity="0.5"/>
      <path d="M 0 120 Q 80 0 180 30 Q 100 90 0 120Z" fill={G2} opacity="0.95"/>
      <path d="M 0 120 Q 90 30 180 30" stroke={G3} strokeWidth="0.7" fill="none" opacity="0.6"/>
      <path d="M 30 100 Q 80 55 155 38" stroke={G3} strokeWidth="0.5" fill="none" opacity="0.4"/>
      <path d="M -5 180 Q 50 80 130 100 Q 70 150 -5 180Z" fill={G1} opacity="0.9"/>
      <path d="M 80 -10 Q 140 20 120 90 Q 80 50 80 -10Z" fill={G2} opacity="0.85"/>
      <path d="M 120 -10 Q 160 30 140 80 Q 120 50 120 -10Z" fill={G3} opacity="0.7"/>
      <circle cx="155" cy="38"  r="4"   fill={WH} opacity="0.95"/>
      <circle cx="148" cy="30"  r="2.5" fill={WH} opacity="0.85"/>
      <circle cx="162" cy="44"  r="3"   fill={WH} opacity="0.9"/>
      <circle cx="170" cy="33"  r="2"   fill={WH} opacity="0.7"/>
      <circle cx="140" cy="42"  r="2"   fill={WH} opacity="0.8"/>
      <g transform="translate(155, 25) rotate(15)">
        <path d="M0,-5 Q3,-3 3,0 Q3,3 0,5 Q-3,3 -3,0 Q-3,-3 0,-5Z" fill={WH} opacity="0.9"/>
        <path d="M-5,0 Q-3,-3 0,-3 Q3,-3 5,0 Q3,3 0,3 Q-3,3 -5,0Z" fill={WH} opacity="0.9"/>
        <circle cx="0" cy="0" r="1.5" fill="#f5d87a"/>
      </g>
      <circle cx="100" cy="15" r="1.5" fill={WH} opacity="0.6"/>
      <circle cx="115" cy="10" r="1"   fill={WH} opacity="0.5"/>
      <circle cx="130" cy="20" r="1.5" fill={WH} opacity="0.6"/>
    </svg>
  );
}

/* Bottom-left cluster — leaves sweep upward from lower-left */
function BottomLeft() {
  return (
    <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleY(-1)" }}>
      <path d="M -10 60 Q 60 -20 160 40 Q 90 80 -10 60Z" fill={G4} opacity="0.9"/>
      <path d="M 0 120 Q 80 0 180 30 Q 100 90 0 120Z" fill={G2} opacity="0.95"/>
      <path d="M -5 180 Q 50 80 130 100 Q 70 150 -5 180Z" fill={G1} opacity="0.9"/>
      <path d="M 80 -10 Q 140 20 120 90 Q 80 50 80 -10Z" fill={G2} opacity="0.8"/>
      <path d="M 120 -10 Q 160 30 140 80 Q 120 50 120 -10Z" fill={G3} opacity="0.65"/>
      <circle cx="155" cy="38" r="4"   fill={WH} opacity="0.95"/>
      <circle cx="148" cy="30" r="2.5" fill={WH} opacity="0.85"/>
      <circle cx="162" cy="44" r="3"   fill={WH} opacity="0.9"/>
      <g transform="translate(145, 52)">
        <circle cx="0"  cy="0"  r="2.5" fill={WH} opacity="0.8"/>
        <circle cx="8"  cy="-4" r="2"   fill={WH} opacity="0.7"/>
        <circle cx="-5" cy="6"  r="2"   fill={WH} opacity="0.7"/>
      </g>
    </svg>
  );
}

/* Bottom-right cluster */
function BottomRight() {
  return (
    <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scale(-1, -1)" }}>
      <path d="M -10 60 Q 60 -20 160 40 Q 90 80 -10 60Z" fill={G4} opacity="0.9"/>
      <path d="M 0 120 Q 80 0 180 30 Q 100 90 0 120Z" fill={G2} opacity="0.95"/>
      <path d="M -5 180 Q 50 80 130 100 Q 70 150 -5 180Z" fill={G1} opacity="0.9"/>
      <path d="M 80 -10 Q 140 20 120 90 Q 80 50 80 -10Z" fill={G2} opacity="0.8"/>
      <path d="M 120 -10 Q 160 30 140 80 Q 120 50 120 -10Z" fill={G3} opacity="0.65"/>
      <circle cx="155" cy="38" r="4"   fill={WH} opacity="0.95"/>
      <circle cx="148" cy="30" r="2.5" fill={WH} opacity="0.85"/>
      <circle cx="162" cy="44" r="3"   fill={WH} opacity="0.9"/>
      <circle cx="170" cy="33" r="2"   fill={WH} opacity="0.7"/>
    </svg>
  );
}

/* Top-center  — wider, shallower cluster that spans the width */
function TopCenter() {
  return (
    <svg width="520" height="180" viewBox="0 0 520 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left wing */}
      <path d="M 0 100 Q 80 20 200 60 Q 110 100 0 100Z"  fill={G4} opacity="0.85"/>
      <path d="M 20 140 Q 100 40 210 70 Q 120 120 20 140Z" fill={G2} opacity="0.9"/>
      <path d="M 70 -10 Q 160 30 150 100 Q 100 60 70 -10Z" fill={G1} opacity="0.8"/>
      {/* Right wing (mirrored) */}
      <path d="M 520 100 Q 440 20 320 60 Q 410 100 520 100Z"  fill={G4} opacity="0.85"/>
      <path d="M 500 140 Q 420 40 310 70 Q 400 120 500 140Z" fill={G2} opacity="0.9"/>
      <path d="M 450 -10 Q 360 30 370 100 Q 420 60 450 -10Z" fill={G1} opacity="0.8"/>
      {/* Center top flowers */}
      <circle cx="200" cy="60" r="4"   fill={WH} opacity="0.95"/>
      <circle cx="193" cy="52" r="2.5" fill={WH} opacity="0.85"/>
      <circle cx="210" cy="55" r="3"   fill={WH} opacity="0.9"/>
      <circle cx="320" cy="60" r="4"   fill={WH} opacity="0.95"/>
      <circle cx="313" cy="52" r="2.5" fill={WH} opacity="0.85"/>
      <circle cx="327" cy="55" r="3"   fill={WH} opacity="0.9"/>
      <circle cx="260" cy="30" r="3"   fill={WH} opacity="0.8"/>
      <circle cx="252" cy="24" r="2"   fill={WH} opacity="0.7"/>
      <circle cx="268" cy="24" r="2"   fill={WH} opacity="0.7"/>
      <g transform="translate(260, 15) rotate(0)">
        <path d="M0,-5 Q3,-3 3,0 Q3,3 0,5 Q-3,3 -3,0 Q-3,-3 0,-5Z" fill={WH} opacity="0.9"/>
        <path d="M-5,0 Q-3,-3 0,-3 Q3,-3 5,0 Q3,3 0,3 Q-3,3 -5,0Z" fill={WH} opacity="0.9"/>
        <circle cx="0" cy="0" r="2" fill="#f5d87a"/>
      </g>
    </svg>
  );
}

export default function BotanicalCorner({ corner, scale = 1, opacity = 1, className = "", style = {} }: Props) {
  const Cluster = {
    "top-left":     TopLeft,
    "top-right":    TopRight,
    "bottom-left":  BottomLeft,
    "bottom-right": BottomRight,
    "top-center":   TopCenter,
  }[corner];

  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      style={{ display: "inline-block", transform: `scale(${scale})`, opacity, ...style }}
    >
      <Cluster />
    </div>
  );
}
