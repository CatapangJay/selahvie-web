"use client";

import { useEffect, useState, type ReactNode } from "react";

const DURATION = 280;

interface CollapseProps {
  open: boolean;
  /** Called only while the content is open or animating closed, so a closed item costs nothing. */
  children: () => ReactNode;
}

/**
 * Animates height between 0 and the content's natural height. The content
 * stays mounted until the close animation finishes, then unmounts.
 */
export default function Collapse({ open, children }: CollapseProps) {
  const [mounted, setMounted] = useState(open);
  // Only animate in when opened after mount; an item that starts open just appears.
  const [animateIn, setAnimateIn] = useState(false);

  if (open && !mounted) {
    setMounted(true);
    setAnimateIn(true);
  }

  useEffect(() => {
    if (open || !mounted) return;
    const timer = window.setTimeout(() => setMounted(false), DURATION + 40);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div className={open && animateIn ? "accordion-body accordion-body-in" : "accordion-body"} data-open={open} aria-hidden={!open || undefined} inert={!open || undefined}>
      <div className="min-h-0 overflow-hidden">{children()}</div>
    </div>
  );
}
