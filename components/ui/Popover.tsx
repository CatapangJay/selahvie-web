"use client";

import { useEffect, useLayoutEffect, useRef, type HTMLAttributes, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const GAP = 6;
const MARGIN = 8;

interface Props extends HTMLAttributes<HTMLDivElement> {
  anchorRef: RefObject<HTMLElement | null>;
  /** Called on a pointer press outside both the anchor and the panel. */
  onDismiss: () => void;
  /** Be at least as wide as the anchor. */
  matchWidth?: boolean;
}

/**
 * A panel anchored to a trigger. It's portaled to <body> with fixed
 * positioning so scrolling containers can't clip it, flips above the trigger
 * when there's more room there, and follows the trigger as the page scrolls.
 */
export default function Popover({ anchorRef, onDismiss, matchWidth, className, style, children, ...rest }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      if (matchWidth) panel.style.minWidth = `${r.width}px`;

      const height = panel.scrollHeight + 2;
      const below = vh - r.bottom - GAP - MARGIN;
      const above = r.top - GAP - MARGIN;
      const flip = height > below && above > below;
      const room = Math.max(120, flip ? above : below);
      const shown = Math.min(height, room);

      panel.style.maxHeight = `${room}px`;
      panel.style.top = `${flip ? r.top - GAP - shown : r.bottom + GAP}px`;
      panel.style.left = `${Math.max(MARGIN, Math.min(r.left, vw - panel.offsetWidth - MARGIN))}px`;
    };

    let frame = 0;
    const schedule = (e?: Event) => {
      // The panel's own scrolling doesn't move the anchor.
      if (e && e.target instanceof Node && panel.contains(e.target)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panel.contains(target) && !anchorRef.current?.contains(target)) dismissRef.current();
    };

    place();
    const resize = new ResizeObserver(() => schedule());
    resize.observe(panel);
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [anchorRef, matchWidth]);

  return createPortal(
    <div
      ref={panelRef}
      className={cn("popover-in fixed overflow-y-auto overscroll-contain", className)}
      style={{
        top: 0,
        left: 0,
        zIndex: "var(--z-popover)",
        maxWidth: `calc(100vw - ${MARGIN * 2}px)`,
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 16px 40px -12px rgb(47 30 38 / 0.22), 0 2px 6px rgb(47 30 38 / 0.06)",
        color: "var(--color-on-surface)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>,
    document.body
  );
}
