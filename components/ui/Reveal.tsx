"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Stagger index — multiplies the base delay for sequenced reveals. */
  index?: number;
  /** Entrance direction. */
  from?: "up" | "left" | "right" | "none";
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "section";
}

const OFFSET = 28;

/**
 * Elegant scroll-in reveal (fade + gentle rise/slide), used across the marketing
 * page. Honors reduced motion: when the OS prefers reduced motion, content
 * renders instantly at full opacity with no transform — never gated invisible.
 * Uses `whileInView` with `once` so it fires as each block scrolls in.
 */
export default function Reveal({ children, index = 0, from = "up", className, style, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const offset =
    from === "up" ? { y: OFFSET } : from === "left" ? { x: -OFFSET } : from === "right" ? { x: OFFSET } : {};

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.09 },
    },
  };

  return (
    <MotionTag
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </MotionTag>
  );
}
