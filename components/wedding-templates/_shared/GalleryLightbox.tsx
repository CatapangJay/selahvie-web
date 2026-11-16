"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Shared photo viewer for template galleries: a native modal <dialog> (focus
 * trap, Escape and the top layer for free, so no template's containment or
 * transforms can clip it) with tap/click, wheel, pinch and button zoom, drag to
 * pan, swipe or arrow keys to move on. Each template supplies the frame the
 * photo sits in and the colours of the night around it, so the viewer always
 * looks like part of that invitation.
 */

export interface LightboxPhoto {
  src: string;
  alt: string;
  /** Album name, for captions. */
  album?: string;
}

export interface LightboxTheme {
  /** Background of the whole viewer: a CSS background, or the template's own textured surface style. */
  backdrop: string | CSSProperties;
  /** Text and icon colour on the backdrop. */
  text: string;
  /** Focus outline and the counter's accent. */
  accent: string;
  /** Font for the counter in the control bar. */
  font: string;
  /** Fill and ring of the round controls; defaults to a light wash of `text`. */
  controlFill?: string;
  controlRing?: string;
}

export interface FrameContext {
  photo: LightboxPhoto;
  index: number;
  count: number;
  /** The photo's natural width ÷ height, once it has loaded. */
  ratio: number;
}

interface Props {
  photos: LightboxPhoto[];
  /** Index of the photo on show, or null when closed. */
  index: number | null;
  onIndex: (index: number | null) => void;
  theme: LightboxTheme;
  /**
   * Wraps the zoomable photo window in the template's own frame (mat, gilt,
   * print border…) and adds any caption. Receives the window as `photo`.
   */
  renderFrame: (photo: ReactNode, ctx: FrameContext) => ReactNode;
  /** Corner shape of the photo window; may depend on the photo's proportions. */
  windowRadius?: string | ((ratio: number) => string);
  /** Extra styles on the photo window (an inner hairline, a tint behind the photo). */
  windowStyle?: CSSProperties;
  /** CSS filter for the photo itself (e.g. the template's black-and-white). */
  imageFilter?: string;
  /** Room the frame and caption need around the photo, so the whole thing fits the screen. */
  reserve?: { x?: string; y?: string };
}

const MIN = 1;
const MAX = 4;
const STEP = 1.6;
const TAP_ZOOM = 2.5;
const EASE = [0.22, 1, 0.36, 1] as const;

type Pt = { x: number; y: number };

/** Ask Unsplash for a sharper copy to zoom into; any other host is used as given. */
function sharpSrc(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", "2000");
      u.searchParams.delete("h");
      u.searchParams.set("q", "85");
      return u.href;
    }
  } catch {
    /* not a URL we can improve */
  }
  return url;
}

export default function GalleryLightbox({ photos, index, onIndex, theme, renderFrame, windowRadius, windowStyle, imageFilter, reserve }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Pt>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [ratio, setRatio] = useState(3 / 4);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<{ start: Pt; moved: number; pinchDist: number; startOffset: Pt; startScale: number } | null>(null);

  const open = index !== null;
  const photo = index === null ? null : photos[index];
  const count = photos.length;

  // Show the copy the gallery already loaded at once, so the frame opens at its full size, then swap
  // in the sharper copy for zooming when it has finished downloading.
  const [sharp, setSharp] = useState<{ for: string; url: string } | null>(null);
  const src = photo?.src;
  useEffect(() => {
    if (!src) return;
    const url = sharpSrc(src);
    if (url === src) return;
    const img = new Image();
    img.onload = () => setSharp({ for: src, url });
    img.src = url;
    return () => {
      img.onload = null;
    };
  }, [src]);
  const shown = photo && sharp?.for === photo.src ? sharp.url : photo?.src;

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (index === null || count < 2) return;
      reset();
      onIndex((index + delta + count) % count);
    },
    [index, count, onIndex, reset],
  );

  // Open and close the native modal.
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Keep the page from scrolling behind the open photo.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  /** Keep the zoomed photo covering its window: never pan past an edge. */
  const clamp = useCallback((next: Pt, s: number): Pt => {
    const w = windowRef.current;
    if (!w || s <= 1) return { x: 0, y: 0 };
    const maxX = ((s - 1) * w.clientWidth) / 2;
    const maxY = ((s - 1) * w.clientHeight) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
  }, []);

  /** Zoom to `target`, keeping the screen point `at` (or the window centre) where it is. */
  const zoomTo = useCallback(
    (target: number, at?: Pt, from?: { scale: number; offset: Pt }) => {
      const w = windowRef.current;
      if (!w) return;
      const s0 = from?.scale ?? scale;
      const t0 = from?.offset ?? offset;
      const s1 = Math.max(MIN, Math.min(MAX, target));
      const rect = w.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = ((at?.x ?? cx) - cx - t0.x) / s0;
      const py = ((at?.y ?? cy) - cy - t0.y) / s0;
      setScale(s1);
      setOffset(clamp({ x: t0.x + (s0 - s1) * px, y: t0.y + (s0 - s1) * py }, s1));
    },
    [scale, offset, clamp],
  );

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "+" || e.key === "=") zoomTo(scale * STEP);
    else if (e.key === "-" || e.key === "_") zoomTo(scale / STEP);
    else if (e.key === "0") reset();
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = {
      start: { x: e.clientX, y: e.clientY },
      // A second finger means a pinch, never a tap.
      moved: pts.length > 1 ? 99 : 0,
      pinchDist: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startOffset: offset,
      startScale: scale,
    };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length > 1 && g.pinchDist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      zoomTo(g.startScale * (dist / g.pinchDist), mid, { scale: g.startScale, offset: g.startOffset });
      return;
    }
    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;
    g.moved = Math.max(g.moved, Math.hypot(dx, dy));
    if (scale > 1) setOffset(clamp({ x: g.startOffset.x + dx, y: g.startOffset.y + dy }, scale));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      // One finger lifted from a pinch: carry on panning from where things are now.
      const [rest] = [...pointers.current.values()];
      if (g) gesture.current = { ...g, start: rest, startOffset: offset, startScale: scale, pinchDist: 0 };
      return;
    }
    setDragging(false);
    gesture.current = null;
    if (!g) return;
    const dx = e.clientX - g.start.x;
    if (g.moved < 6) {
      // A tap: zoom in where it landed, or back out.
      if (scale > 1) reset();
      else zoomTo(TAP_ZOOM, { x: e.clientX, y: e.clientY });
    } else if (scale === 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - g.start.y)) {
      go(dx < 0 ? 1 : -1);
    }
  };

  const onWheel = (e: ReactWheelEvent) => {
    zoomTo(scale * Math.exp(-e.deltaY * 0.0015), { x: e.clientX, y: e.clientY });
  };

  const zoomed = scale > 1.01;
  const radius = typeof windowRadius === "function" ? windowRadius(ratio) : windowRadius;
  const fill = theme.controlFill ?? `color-mix(in srgb, ${theme.text} 10%, transparent)`;
  const ring = theme.controlRing ?? `color-mix(in srgb, ${theme.text} 22%, transparent)`;
  const round = "grid size-11 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40";
  const roundStyle: CSSProperties = { color: theme.text, outlineColor: theme.accent };
  const close = () => dialog.current?.close();

  const pane = photo && (
    <div
      ref={windowRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      className="relative select-none overflow-hidden"
      style={{ borderRadius: radius, touchAction: "none", cursor: zoomed ? (dragging ? "grabbing" : "grab") : "zoom-in", ...windowStyle }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- couples paste photos from any host, beyond next/image's remote patterns */}
      <img
        src={shown}
        alt={photo.alt}
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
        }}
        style={{
          display: "block",
          width: "auto",
          height: "auto",
          maxWidth: `min(calc(100vw - ${reserve?.x ?? "3.5rem"}), 68rem)`,
          maxHeight: `calc(100svh - ${reserve?.y ?? "14rem"})`,
          filter: imageFilter,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          transformOrigin: "center",
          transition: dragging || reduce ? "none" : "transform .45s cubic-bezier(.22,1,.36,1)",
          willChange: "transform",
        }}
      />
    </div>
  );

  return (
    <dialog
      ref={dialog}
      aria-label={photo ? `${photo.alt}, enlarged` : "Photo viewer"}
      onClose={() => {
        reset();
        onIndex(null);
      }}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        // A click on the backdrop around the photo closes it.
        if (e.target === e.currentTarget) close();
      }}
      className="m-0 h-svh max-h-none w-screen max-w-none p-0 backdrop:bg-transparent"
      style={{ ...(typeof theme.backdrop === "string" ? { background: theme.backdrop } : theme.backdrop), color: theme.text, border: 0 }}
    >
      {photo && index !== null && (
        <div
          className="flex h-full flex-col items-center justify-center gap-5 px-4 pb-5 pt-16 sm:px-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button type="button" onClick={close} aria-label="Close photo" className={`${round} absolute right-4 top-4 sm:right-6 sm:top-6`} style={{ ...roundStyle, background: fill }}>
            <X size={20} aria-hidden />
          </button>

          <motion.figure
            key={photo.src}
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative m-0 flex min-h-0 flex-col items-center"
          >
            {renderFrame(pane, { photo, index, count, ratio })}
          </motion.figure>

          {/* Previous, zoom out, where we are, zoom in, next. */}
          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: fill, boxShadow: `inset 0 0 0 1px ${ring}`, fontFamily: theme.font }}>
            <button type="button" onClick={() => go(-1)} disabled={count < 2} aria-label="Previous photo" className={`${round} hover:bg-white/10`} style={roundStyle}>
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button type="button" onClick={() => zoomTo(scale / STEP)} disabled={!zoomed} aria-label="Zoom out" className={`${round} hover:bg-white/10`} style={roundStyle}>
              <ZoomOut size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label={zoomed ? "Reset zoom" : `Photo ${index + 1} of ${count}`}
              className="min-w-[4.5rem] rounded-full px-2 text-center tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ minHeight: 44, fontSize: 13, fontWeight: 500, letterSpacing: "0.12em", color: theme.accent, outlineColor: theme.accent }}
            >
              <span aria-live="polite">{zoomed ? `${Math.round(scale * 100)}%` : `${index + 1} / ${count}`}</span>
            </button>
            <button type="button" onClick={() => zoomTo(scale * STEP)} disabled={scale >= MAX} aria-label="Zoom in" className={`${round} hover:bg-white/10`} style={roundStyle}>
              <ZoomIn size={18} aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} disabled={count < 2} aria-label="Next photo" className={`${round} hover:bg-white/10`} style={roundStyle}>
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
