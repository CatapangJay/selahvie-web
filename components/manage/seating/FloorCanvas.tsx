"use client";

import { useEffect, useId, useRef, type ComponentProps } from "react";
import { Expand, Lock, LockOpen, Minus, Plus, RotateCcw, Search, Shrink, X } from "lucide-react";
import FloorSurface from "./FloorSurface";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2;
const ZOOM_STEPS = [0.5, 0.65, 0.8, 1, 1.25, 1.5, 1.75, 2];
export const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z * 100) / 100));
export const stepZoom = (z: number, dir: 1 | -1) =>
  dir > 0 ? ZOOM_STEPS.find((s) => s > z + 0.001) ?? ZOOM_MAX : [...ZOOM_STEPS].reverse().find((s) => s < z - 0.001) ?? ZOOM_MIN;

/** Narrowest the plan renders at 100%, so seats stay legible on small screens (it scrolls instead). */
const MIN_PLAN_PX = 680;

interface Props extends Omit<ComponentProps<typeof FloorSurface>, "readOnly" | "style"> {
  zoom: number;
  onZoom: (z: number) => void;
  onLocked: (v: boolean) => void;
  expanded: boolean;
  onExpanded: (v: boolean) => void;
  onQuery: (q: string) => void;
}

export default function FloorCanvas({ zoom, onZoom, onLocked, expanded, onExpanded, onQuery, ...surface }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchId = useId();

  // Ctrl/⌘ + wheel (and trackpad pinch, which arrives as ctrl+wheel) zooms the plan, not the page.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      onZoom(clampZoom(zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom, onZoom]);

  const { locked, query = "" } = surface;

  return (
    <div
      className="relative h-full"
      style={{
        background: "var(--color-surface-container-low)",
        border: "1px solid var(--color-outline)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div
        ref={scrollRef}
        className="overflow-auto overscroll-contain"
        style={{ height: "100%", borderRadius: "inherit" }}
      >
        <FloorSurface
          {...surface}
          style={{
            width: `max(${zoom * 100}%, ${Math.round(MIN_PLAN_PX * zoom)}px)`,
            margin: "0 auto",
          }}
        />
      </div>

      {/* Table search, top left. */}
      <div className="pointer-events-none absolute left-3 top-3 z-[5] flex">
        <label htmlFor={searchId} className="sr-only">Find a table by name or tag</label>
        <div
          className="pointer-events-auto relative flex items-center"
          style={{
            background: "var(--color-surface-container-lowest)",
            border: "1px solid var(--color-outline)",
            borderRadius: "var(--radius-full)",
            boxShadow: "0 1px 2px rgb(47 30 38 / 0.06)",
          }}
        >
          <Search size={14} aria-hidden className="pointer-events-none absolute left-3" style={{ color: "var(--color-on-surface-variant)" }} />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onQuery("")}
            placeholder="Find a table or tag"
            autoComplete="off"
            className="h-9 w-48 bg-transparent pl-8 pr-8 text-sm outline-none placeholder:text-[var(--color-on-surface-variant)] sm:w-56"
            style={{ color: "var(--color-on-surface)", borderRadius: "var(--radius-full)" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear table search"
              className="absolute right-1.5 inline-flex h-6 w-6 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)]"
              style={{ borderRadius: "var(--radius-full)", color: "var(--color-on-surface-variant)" }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* View controls, top right. */}
      <div
        role="toolbar"
        aria-label="Floor plan view"
        aria-orientation="vertical"
        className="absolute right-3 top-3 z-[5] flex flex-col items-center p-1"
        style={{
          background: "var(--color-surface-container-lowest)",
          border: "1px solid var(--color-outline)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 1px 2px rgb(47 30 38 / 0.06)",
        }}
      >
        <RailButton label="Zoom in" onClick={() => onZoom(stepZoom(zoom, 1))} disabled={zoom >= ZOOM_MAX}>
          <Plus size={15} />
        </RailButton>
        <output
          aria-live="polite"
          aria-label="Zoom level"
          className="flex h-7 w-9 items-center justify-center text-[0.6875rem] font-medium tabular-nums"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {Math.round(zoom * 100)}%
        </output>
        <RailButton label="Zoom out" onClick={() => onZoom(stepZoom(zoom, -1))} disabled={zoom <= ZOOM_MIN}>
          <Minus size={15} />
        </RailButton>
        <RailDivider />
        <RailButton label="Reset zoom" onClick={() => onZoom(1)} disabled={zoom === 1}>
          <RotateCcw size={15} />
        </RailButton>
        <RailButton label={locked ? "Unlock layout" : "Lock layout"} pressed={Boolean(locked)} onClick={() => onLocked(!locked)}>
          {locked ? <Lock size={15} /> : <LockOpen size={15} />}
        </RailButton>
        <RailDivider />
        <RailButton label={expanded ? "Exit focus view" : "Focus view"} pressed={expanded} onClick={() => onExpanded(!expanded)}>
          {expanded ? <Shrink size={15} /> : <Expand size={15} />}
        </RailButton>
      </div>
    </div>
  );
}

function RailButton({ label, onClick, disabled, pressed, children }: { label: string; onClick: () => void; disabled?: boolean; pressed?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:bg-[var(--color-primary-container-strong)] aria-pressed:text-[var(--color-primary-dim)]"
      style={{ borderRadius: "var(--radius-sm)", color: "var(--color-on-surface-variant)" }}
    >
      {children}
    </button>
  );
}

function RailDivider() {
  return <span aria-hidden className="my-1 h-px w-6" style={{ background: "var(--color-outline)" }} />;
}
