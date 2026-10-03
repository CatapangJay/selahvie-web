interface Props {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * A small, elegant floral-sprig ornament — a single stem with a few leaves and
 * a blossom, echoing the pressed-flower motif used as a section divider on the
 * reference. Purely decorative (aria-hidden). Inherits the wedding palette via
 * the `color` prop (defaults to the brand rose).
 */
export default function FloralSprig({ size = 56, color = "var(--color-primary)", className }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 40 64"
      fill="none"
      className={className}
      aria-hidden
      style={{ display: "block" }}
    >
      {/* stem */}
      <path d="M20 63 L20 20" stroke={color} strokeWidth="0.9" strokeLinecap="round" />
      {/* lower leaves */}
      <path d="M20 50 C12 47, 8 42, 7 36 C14 37, 19 42, 20 50 Z" fill={color} opacity="0.28" />
      <path d="M20 44 C28 41, 32 36, 33 30 C26 31, 21 36, 20 44 Z" fill={color} opacity="0.28" />
      <path d="M20 37 C13 35, 10 31, 9 26 C15 27, 19 31, 20 37 Z" fill={color} opacity="0.22" />
      {/* blossom — five soft petals around a center */}
      <g transform="translate(20 13)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-6.5"
            rx="3.2"
            ry="6"
            fill={color}
            opacity="0.55"
            transform={`rotate(${deg})`}
          />
        ))}
        <circle cx="0" cy="0" r="3" fill={color} />
      </g>
    </svg>
  );
}
