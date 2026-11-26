import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Kept for existing call sites; sections no longer move on scroll. */
  index?: number;
  from?: "up" | "left" | "right" | "none";
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "section";
}

/**
 * Formerly a fade-and-slide on scroll. The home page now moves in three places
 * only (the hero's entrance, hover and press, and two dealt scroll moments), so a
 * section simply stands: whole at rest, for every reader, crawler and screenshot.
 * The wrapper stays so call sites (home, about, templates) keep their layout.
 */
export default function Reveal({ children, className, style, as = "div" }: Props) {
  const Tag = as;
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}
