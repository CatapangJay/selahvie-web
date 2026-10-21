import type { CSSProperties } from "react";

/**
 * Rolling horizon between two bands of the sunset. `from` is the colour above
 * the hills, `to` the band below; a lighter back ridge gives the hills depth.
 */
export function Horizon({ from, to, ridge, flip = false }: { from: string; to: string; ridge: string; flip?: boolean }) {
  return (
    <div aria-hidden style={{ background: from, lineHeight: 0, transform: flip ? "scaleX(-1)" : undefined }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "clamp(44px, 8vw, 96px)" }}>
        <path d="M0 70 C 180 20, 360 20, 560 58 S 940 110, 1120 64 S 1360 26, 1440 46 L1440 120 L0 120 Z" fill={ridge} />
        <path d="M0 96 C 220 60, 420 64, 640 88 S 1040 120, 1240 92 S 1400 70, 1440 78 L1440 120 L0 120 Z" fill={to} />
      </svg>
    </div>
  );
}

/** Hand-drawn posy sprig: a curved stem, two leaves and three five-petal blooms. */
export function Sprig({ color, bloom, style }: { color: string; bloom: string; style?: CSSProperties }) {
  const petals = (cx: number, cy: number, r: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = (i * 72 - 90) * (Math.PI / 180);
      return <ellipse key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} rx={r * 0.78} ry={r * 0.5} transform={`rotate(${i * 72} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r})`} fill={bloom} />;
    });
  return (
    <svg aria-hidden viewBox="0 0 120 140" style={style}>
      <path d="M60 136 C 58 100, 50 70, 34 40 M58 96 C 70 74, 84 58, 92 34 M57 112 C 50 100, 40 94, 26 92" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M57 112 C 46 116, 34 112, 26 92 C 40 92, 52 100, 57 112 Z" fill={color} opacity=".55" />
      <path d="M60 80 C 70 82, 80 76, 84 66 C 72 64, 64 70, 60 80 Z" fill={color} opacity=".55" />
      {petals(34, 36, 9)}
      <circle cx="34" cy="36" r="4.5" fill={color} />
      {petals(92, 30, 8)}
      <circle cx="92" cy="30" r="4" fill={color} />
      {petals(60, 18, 7)}
      <circle cx="60" cy="18" r="3.5" fill={color} />
    </svg>
  );
}

/**
 * A small sun at a given height above a horizon line: 0 = high noon, 1 = just
 * set. Used to mark how the light changes through the day's schedule.
 */
export function SunMark({ progress, sun, line }: { progress: number; sun: string; line: string }) {
  const cy = 10 + progress * 22;
  return (
    <svg aria-hidden viewBox="0 0 44 36" width="44" height="36" style={{ display: "block" }}>
      <defs>
        <clipPath id={`sky-${Math.round(progress * 100)}`}>
          <rect x="0" y="0" width="44" height="30" />
        </clipPath>
      </defs>
      <circle cx="22" cy={cy} r="8" fill={sun} clipPath={`url(#sky-${Math.round(progress * 100)})`} />
      <line x1="4" y1="30" x2="40" y2="30" stroke={line} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
