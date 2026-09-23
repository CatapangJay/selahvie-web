"use client";

import { useCallback } from "react";
import { useWeddingStore } from "@/store/weddingStore";
import type { WeddingConfig, RSVPEntry } from "@/types/wedding";

/** Shape every template's RSVP form collects, before store metadata is added. */
export type RsvpDraft = {
  guestName: string;
  email?: string;
  attending: boolean;
  mealChoice?: string;
  plusOne?: boolean;
  plusOneName?: string;
  message?: string;
};

/**
 * Demo/preview configs must not write real entries. Bespoke demos use fixed
 * ids/slugs ending in "-demo"; the synthesized preview config uses a "-preview"
 * id (see data/demoConfigs.ts). Shared by RSVP + guestbook submission.
 */
export function isDemoConfig(config: WeddingConfig): boolean {
  return (
    config.id === "demo" ||
    config.id.endsWith("-demo") ||
    config.id.endsWith("-preview")
  );
}

/**
 * Shared RSVP submission for all wedding templates. Persists the response to
 * the wedding store so the couple sees it on their dashboard — except on demo
 * or live-preview renders, where it's a no-op (the confirmation UI still shows).
 *
 * Returns `{ submit, isDemo }`. Templates keep their own local "submitted"
 * state for the confirmation animation; they just call `submit(draft)` first.
 */
export function useRsvpSubmit(config: WeddingConfig) {
  const addRsvp = useWeddingStore((s) => s.addRsvp);
  const isDemo = isDemoConfig(config);

  const submit = useCallback(
    (draft: RsvpDraft) => {
      if (isDemo) return;
      const entry: Omit<RSVPEntry, "id" | "submittedAt"> = {
        weddingId: config.id,
        guestName: draft.guestName?.trim() || "Guest",
        email: draft.email?.trim() || undefined,
        attending: draft.attending,
        mealChoice: draft.attending ? draft.mealChoice : undefined,
        plusOne: Boolean(draft.attending && draft.plusOne),
        plusOneName: draft.attending ? draft.plusOneName?.trim() || undefined : undefined,
        message: draft.message?.trim() || undefined,
      };
      addRsvp(entry);
    },
    [addRsvp, config.id, isDemo]
  );

  return { submit, isDemo };
}
