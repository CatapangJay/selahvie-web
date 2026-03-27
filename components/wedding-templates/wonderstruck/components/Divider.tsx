"use client";

interface Props {
  accent: string;
  gold?: string;
}

export default function Divider({ accent, gold = "#e8d5a3" }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <div className="h-px flex-1 max-w-20" style={{ background: `linear-gradient(to right, transparent, ${accent}50)` }} />
      {/* Four-pointed star ornament */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z"
          fill={gold}
          style={{ filter: `drop-shadow(0 0 5px ${gold}80)` }}
        />
      </svg>
      <div className="h-px flex-1 max-w-20" style={{ background: `linear-gradient(to left, transparent, ${accent}50)` }} />
    </div>
  );
}
