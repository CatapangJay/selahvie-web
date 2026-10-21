import type { CSSProperties } from "react";
import type { Palette } from "../theme";
import { capizStyle } from "../theme";

/**
 * A capiz shell panel: square shell panes held in a thin wood lattice. Each
 * pane gets a slightly different sheen so the panel reads as real shell.
 */
export function CapizPanes({ palette: p, cols = 4, rows = 6, gap = 5, style }: { palette: Palette; cols?: number; rows?: number; gap?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap,
        padding: gap,
        background: p.narraDeep,
        ...style,
      }}
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <span
          key={i}
          style={{
            ...capizStyle(p, 82 + ((i * 7) % 12)),
            backgroundPosition: `${(i * 37) % 100}% ${(i * 53) % 100}%`,
            backgroundSize: "220% 220%",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,.35), inset 0 -6px 10px rgba(120,80,40,.12)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Calado fretwork: the carved wooden transom pattern over old doorways —
 * a row of interlocking scrolls around a central sunburst.
 */
export function Calado({ color, width = "min(86%, 22rem)", style }: { color: string; width?: string; style?: CSSProperties }) {
  const scroll = (x: number, flip: boolean) => (
    <g key={x} transform={`translate(${x} 0) ${flip ? "scale(-1 1) translate(-40 0)" : ""}`}>
      <path d="M2 30 C 2 14, 18 8, 26 16 C 32 22, 26 30, 20 28 C 14 26, 16 18, 22 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M38 30 C 38 22, 32 18, 28 22" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 0 400 44" style={{ display: "block", width, height: "auto", margin: "0 auto", ...style }}>
      <line x1="0" y1="38" x2="400" y2="38" stroke={color} strokeWidth="1.5" />
      <line x1="0" y1="42" x2="400" y2="42" stroke={color} strokeWidth="0.75" opacity=".6" />
      {[0, 40, 80, 120].map((x, i) => scroll(x, i % 2 === 1))}
      {[240, 280, 320, 360].map((x, i) => scroll(x, i % 2 === 0))}
      <g transform="translate(200 34)">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="0" y1="0" x2="0" y2="-26" stroke={color} strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${-80 + i * 20})`} />
        ))}
        <path d="M-14 0 A 14 14 0 0 1 14 0 Z" fill={color} />
      </g>
    </svg>
  );
}

/** Mount Banahaw at dusk: the twin-peaked ridge with the lower Cristobal shoulder. */
export function Banahaw({ far, near, style }: { far: string; near: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 1440 260" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "clamp(110px, 22vw, 240px)", ...style }}>
      <path d="M0 210 C 160 190, 260 150, 380 128 C 470 112, 540 140, 610 92 C 660 58, 700 40, 742 34 C 780 30, 812 58, 850 52 C 900 44, 940 96, 1010 120 C 1110 154, 1250 170, 1440 186 L1440 260 L0 260 Z" fill={far} />
      <path d="M0 236 C 220 214, 360 200, 520 206 C 700 214, 860 190, 1040 196 C 1200 202, 1330 218, 1440 222 L1440 260 L0 260 Z" fill={near} />
    </svg>
  );
}

/** Four small brass corner brackets, like the hardware on an aparador. */
export function Brackets({ color, inset = 8, size = 16 }: { color: string; inset?: number; size?: number }) {
  const b = { position: "absolute", width: size, height: size, borderColor: color, borderStyle: "solid", borderWidth: 0 } as const;
  return (
    <>
      <span aria-hidden style={{ ...b, top: inset, left: inset, borderTopWidth: 2, borderLeftWidth: 2 }} />
      <span aria-hidden style={{ ...b, top: inset, right: inset, borderTopWidth: 2, borderRightWidth: 2 }} />
      <span aria-hidden style={{ ...b, bottom: inset, left: inset, borderBottomWidth: 2, borderLeftWidth: 2 }} />
      <span aria-hidden style={{ ...b, bottom: inset, right: inset, borderBottomWidth: 2, borderRightWidth: 2 }} />
    </>
  );
}
