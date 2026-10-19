import type { GuestGroup, GuestListEntry, WeddingConfig } from "@/types/wedding";

/**
 * Messages between the customize studio and its live-preview iframe
 * (/studio-preview). Both sides are same-origin; each checks `event.origin`
 * and `event.source` before trusting a message.
 */
export const PREVIEW_READY = "selahvie:studio-preview-ready";
export const PREVIEW_STATE = "selahvie:studio-preview-state";

export type PreviewDevice = "desktop" | "mobile";

export interface PreviewState {
  type: typeof PREVIEW_STATE;
  config: WeddingConfig;
  guests: GuestListEntry[];
  groups: GuestGroup[];
  /** Invite code to view the site as, or "" for a public visitor. */
  inviteCode: string;
  device: PreviewDevice;
}

export function isPreviewState(data: unknown): data is PreviewState {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Partial<PreviewState>;
  return (
    d.type === PREVIEW_STATE &&
    typeof d.config === "object" &&
    d.config !== null &&
    typeof d.config.templateId === "string" &&
    Array.isArray(d.guests) &&
    Array.isArray(d.groups) &&
    typeof d.inviteCode === "string" &&
    (d.device === "desktop" || d.device === "mobile")
  );
}
