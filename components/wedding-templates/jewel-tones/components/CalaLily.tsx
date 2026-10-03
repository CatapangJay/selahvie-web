import { useId, type CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

/** A single calla lily: ivory spathe, golden spadix, green stem. Decorative only. */
export default function CalaLily({ className, style }: Props) {
  const uid = useId().replace(/:/g, "");
  const petal = `${uid}-petal`;
  const stem = `${uid}-stem`;

  return (
    <svg viewBox="0 0 100 280" className={className} style={style} aria-hidden focusable="false">
      <defs>
        <linearGradient id={petal} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#fffdf6" />
          <stop offset="62%" stopColor="#f3f0dc" />
          <stop offset="100%" stopColor="#c9d49a" />
        </linearGradient>
        <linearGradient id={stem} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5d8b4c" />
          <stop offset="100%" stopColor="#86ad6c" />
        </linearGradient>
      </defs>

      <path d="M52 276 C54 220 44 170 47 118" fill="none" stroke={`url(#${stem})`} strokeWidth="5" strokeLinecap="round" />

      {/* Spathe */}
      <path
        d="M46 124 C16 108 10 56 36 6 C50 30 80 38 78 84 C77 108 62 124 46 124 Z"
        fill={`url(#${petal})`}
        stroke="#d9d6bd"
        strokeWidth="0.8"
      />
      <path d="M40 120 C34 84 40 48 36 10" fill="none" stroke="#d9d6bd" strokeWidth="1" opacity=".7" />
      <path d="M60 112 C70 90 74 64 72 52" fill="none" stroke="#fff" strokeWidth="2" opacity=".55" />

      {/* Spadix */}
      <ellipse cx="52" cy="78" rx="4.6" ry="19" fill="#e8c24f" transform="rotate(12 52 78)" />
      <ellipse cx="50.8" cy="72" rx="1.6" ry="9" fill="#f7e08f" opacity=".7" transform="rotate(12 52 78)" />
    </svg>
  );
}
