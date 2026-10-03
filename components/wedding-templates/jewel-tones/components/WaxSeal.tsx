"use client";

import { useId, type CSSProperties } from "react";
import type { Palette } from "../theme";
import { SERIF } from "../theme";

interface Props {
  palette: Palette;
  /** Two initials stamped into the wax, e.g. ["S", "N"]. */
  initials: [string, string];
  /** Clip to a jagged half so two instances can crack apart. */
  half?: "left" | "right";
  className?: string;
  style?: CSSProperties;
}

const LEFT_HALF = "polygon(0 0, 52% 0, 46% 22%, 56% 40%, 47% 60%, 55% 80%, 50% 100%, 0 100%)";
const RIGHT_HALF = "polygon(52% 0, 100% 0, 100% 100%, 50% 100%, 55% 80%, 47% 60%, 56% 40%, 46% 22%)";

/** Embossed gold wax seal, drawn in SVG so it scales crisply and takes the monogram. */
export default function WaxSeal({ palette, initials, half, className, style }: Props) {
  const uid = useId().replace(/:/g, "");
  const body = `${uid}-body`;
  const disc = `${uid}-disc`;
  const clip = half === "left" ? LEFT_HALF : half === "right" ? RIGHT_HALF : undefined;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        clipPath: clip,
        filter: "drop-shadow(0 5px 7px rgba(0,0,0,.4))",
        ...style,
      }}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={body} cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor={palette.goldLight} />
          <stop offset="45%" stopColor={palette.gold} />
          <stop offset="100%" stopColor={palette.goldDeep} />
        </radialGradient>
        <radialGradient id={disc} cx="60%" cy="68%" r="80%">
          <stop offset="0%" stopColor={palette.goldLight} stopOpacity=".55" />
          <stop offset="100%" stopColor={palette.goldDeep} stopOpacity=".5" />
        </radialGradient>
      </defs>

      {/* Irregular poured-wax outline */}
      <path
        d="M60 5 C78 3 96 12 106 28 C118 46 117 72 106 90 C95 108 76 118 58 116 C38 114 20 104 11 86 C2 68 3 44 14 28 C25 12 42 7 60 5 Z"
        fill={`url(#${body})`}
      />
      <path
        d="M60 5 C78 3 96 12 106 28 C118 46 117 72 106 90 C95 108 76 118 58 116 C38 114 20 104 11 86 C2 68 3 44 14 28 C25 12 42 7 60 5 Z"
        fill="none"
        stroke={palette.goldDeep}
        strokeWidth="1.4"
        opacity=".55"
      />

      {/* Raised rim, rope ring and sunken disc */}
      <circle cx="60" cy="60" r="43" fill="none" stroke={palette.goldLight} strokeWidth="2.2" opacity=".75" />
      <circle cx="60" cy="60" r="38.5" fill="none" stroke={palette.goldDeep} strokeWidth="3" strokeDasharray="2.2 3.2" strokeLinecap="round" opacity=".7" />
      <circle cx="60" cy="60" r="34" fill={`url(#${disc})`} />
      <circle cx="60" cy="60" r="34" fill="none" stroke={palette.goldDeep} strokeWidth="1" opacity=".6" />

      {/* Monogram, embossed with an offset highlight */}
      <g fontFamily={SERIF} fontStyle="italic" fontWeight={600} textAnchor="middle">
        <text x="60.8" y="69.2" fontSize="30" fill={palette.goldLight} opacity=".85">
          {initials[0]}
          <tspan fontSize="14" dx="1" dy="-4">&amp;</tspan>
          <tspan dy="4" dx="1">{initials[1]}</tspan>
        </text>
        <text x="60" y="68.2" fontSize="30" fill={palette.goldDeep}>
          {initials[0]}
          <tspan fontSize="14" dx="1" dy="-4">&amp;</tspan>
          <tspan dy="4" dx="1">{initials[1]}</tspan>
        </text>
      </g>

      {/* Specular glint */}
      <ellipse cx="38" cy="30" rx="17" ry="8" fill="#fff" opacity=".28" transform="rotate(-32 38 30)" />
    </svg>
  );
}
