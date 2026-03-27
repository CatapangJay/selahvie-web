interface Props {
  /** Hex color for the divider lines & ornament. Defaults to gold. */
  color?: string;
}

export default function Divider({ color = "#c9a84c" }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 my-8" aria-hidden>
      <div className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to right, transparent, ${color}60)` }} />
      {/* Diamond ornament */}
      <svg width="10" height="10" viewBox="0 0 10 10" fill={color} style={{ opacity: 0.7 }}>
        <polygon points="5,0 10,5 5,10 0,5" />
      </svg>
      <div className="h-px w-4" style={{ background: color, opacity: 0.8 }} />
      <svg width="6" height="6" viewBox="0 0 10 10" fill={color}>
        <polygon points="5,0 10,5 5,10 0,5" />
      </svg>
      <div className="h-px w-4" style={{ background: color, opacity: 0.8 }} />
      <svg width="10" height="10" viewBox="0 0 10 10" fill={color} style={{ opacity: 0.7 }}>
        <polygon points="5,0 10,5 5,10 0,5" />
      </svg>
      <div className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to left, transparent, ${color}60)` }} />
    </div>
  );
}
