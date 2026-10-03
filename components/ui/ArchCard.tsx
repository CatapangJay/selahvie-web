import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * A card with a fully-arched (tombstone) top — the signature shape from the
 * reference's Services and Packages sections. The arch is a large top radius;
 * bottom corners stay softly rounded. Used for image cards and pricing panels.
 */
export default function ArchCard({ children, className, style }: Props) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        borderTopLeftRadius: "999px",
        borderTopRightRadius: "999px",
        borderBottomLeftRadius: "var(--radius-lg)",
        borderBottomRightRadius: "var(--radius-lg)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
