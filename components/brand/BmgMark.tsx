import { APP_MONOGRAM, APP_NAME } from "@/lib/constants";

interface MarkProps {
  /** Outer diameter in px. */
  size?: number;
  /** Ring + letter colour. */
  color?: string;
  className?: string;
  /** Decorative by default; pass a label when the mark stands alone as a link/heading. */
  label?: string;
}

/**
 * The BMG monogram: three letterpress capitals inside a double hairline ring,
 * the way a monogram is pressed into the flap of an envelope. Used where the
 * full name won't fit or would repeat: nav on phones, footer crest, the
 * closing CTA and the product mock.
 */
export function BmgMark({ size = 40, color = "currentColor", className, label }: MarkProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        border: `1px solid ${color}`,
        color,
      }}
    >
      {/* The inner ring only reads at seal sizes; below that it crowds the letters. */}
      {size >= 48 && (
        <span
          className="absolute rounded-full"
          style={{ inset: size * 0.07, border: `1px solid ${color}`, opacity: 0.45 }}
        />
      )}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size * 0.26,
          lineHeight: 1,
          letterSpacing: "0.04em",
          // Optical centering: Gloock caps sit slightly high in the em box.
          transform: "translateY(0.04em)",
        }}
      >
        {APP_MONOGRAM}
      </span>
    </span>
  );
}

interface WordmarkProps {
  color?: string;
  markColor?: string;
  className?: string;
  /** Hide the words below the `sm` breakpoint, leaving only the seal. */
  compactOnMobile?: boolean;
  size?: "md" | "lg";
}

/** BMG seal + "Be My Guest" set in the display face. */
export function BmgWordmark({ color = "currentColor", markColor, className, compactOnMobile, size = "md" }: WordmarkProps) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`} style={{ color }}>
      <BmgMark size={lg ? 48 : 38} color={markColor ?? color} />
      <span
        className={compactOnMobile ? "hidden sm:inline" : undefined}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: lg ? "1.6rem" : "1.3rem",
          lineHeight: 1,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {APP_NAME}
      </span>
    </span>
  );
}
