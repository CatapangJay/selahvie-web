import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Rounded pill (for text lines) vs. block (for media). */
  rounded?: "sm" | "md" | "full";
}

/**
 * Content-loading skeleton (DESIGN.md: skeletons, not center-spinners). The
 * shimmer uses a CSS animation, so it respects the global reduced-motion block.
 */
export default function Skeleton({ className, rounded = "sm" }: Props) {
  const radius =
    rounded === "full" ? "9999px" : rounded === "md" ? "var(--radius-md)" : "var(--radius-sm)";
  return (
    <div
      className={cn("skeleton-shimmer", className)}
      style={{ borderRadius: radius }}
      aria-hidden
    />
  );
}
