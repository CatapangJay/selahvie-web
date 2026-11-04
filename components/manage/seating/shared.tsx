import type { DragEvent } from "react";
import {
  Cake,
  Camera,
  DoorOpen,
  Gift,
  Grape,
  Mic,
  Music,
  Shapes,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import type { GuestSide, VenueElementKind } from "@/types/wedding";

export const GUEST_MIME = "application/x-selahvie-guest";

export const isGuestDrag = (e: DragEvent) => e.dataTransfer.types.includes(GUEST_MIME);

export const newId = (prefix = "tb") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Seat and avatar fills: the side colours a step darker, so white initials stay
 * readable at seat size (rose-dim 7.5:1, deep sage 5.9:1, ink-variant 7.5:1).
 */
export const SEAT_FILL: Record<GuestSide | "none", string> = {
  partner1: "var(--color-primary-dim)",
  partner2: "#4E6B55",
  none: "var(--color-on-surface-variant)",
};

export const ELEMENT_ICON: Record<VenueElementKind, LucideIcon> = {
  stage: Mic,
  danceFloor: Sparkles,
  grazing: Grape,
  photobooth: Camera,
  bar: Wine,
  cake: Cake,
  music: Music,
  buffet: UtensilsCrossed,
  gifts: Gift,
  entrance: DoorOpen,
  custom: Shapes,
};

/** lucide has no half-moon table; drawn to match its 24px, 2px-stroke grid. */
export function HalfMoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 16a9 9 0 0 1 18 0Z" />
    </svg>
  );
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const statusLabel = (status: string) => status[0].toUpperCase() + status.slice(1);
