"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a rendered wedding template so ALL descendant framer-motion components
 * respect the OS "reduce motion" setting automatically (`reducedMotion="user"`):
 * transform/layout animations snap to their end state and infinite loops stop.
 *
 * This is the systemic reduced-motion fix for the templates (Phase 8.1) — it
 * covers every template without touching each of the 19 animated files. The
 * global CSS block in globals.css handles CSS animations; this handles the
 * JS-driven framer animations CSS can't reach.
 */
export default function TemplateMotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
