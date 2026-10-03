"use client";

import { useCallback } from "react";
import { useWeddingStore } from "@/store/weddingStore";
import { matchGuestByName, plusOneAllowance } from "@/lib/invitations";
import { useInvitee } from "./InviteeContext";
import type { WeddingConfig, RSVPEntry } from "@/types/wedding";

/** Shape every template's RSVP form collects, before store metadata is added. */
export type RsvpDraft = {
  guestName: string;
  email?: string;
  attending: boolean;
  mealChoice?: string;
  plusOne?: boolean;
  plusOneName?: string;
  /** Names from the multi-guest field (used when the invitee may bring more than one). */
  additionalGuestNames?: string[];
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
 * The response is linked to a guest-list entry (via the invite link, or a
 * confident name match) and that guest's status is updated. Opening an invite
 * link never RSVPs on its own; only submitting does.
 *
 * Returns `{ submit, isDemo, prefillName, maxPlusOnes }`. Templates keep their own local
 * "submitted" state for the confirmation animation; they just call
 * `submit(draft)` first, and seed their name field with `prefillName`. When
 * `maxPlusOnes > 1` (a guest the couple allowed extra seats), they render
 * `AdditionalGuestsField` instead of the single plus-one control.
 */
export function useRsvpSubmit(config: WeddingConfig) {
  const addRsvp = useWeddingStore((s) => s.addRsvp);
  const updateGuest = useWeddingStore((s) => s.updateGuest);
  const invitee = useInvitee();
  const isDemo = isDemoConfig(config);
  const maxPlusOnes = plusOneAllowance(config, invitee);

  const submit = useCallback(
    (draft: RsvpDraft) => {
      if (isDemo) return;
      const guestName = draft.guestName?.trim() || "Guest";

      let guestId = invitee?.kind === "guest" ? invitee.guestId : undefined;
      if (!guestId) {
        const guests = useWeddingStore.getState().guests.filter((g) => g.weddingId === config.id);
        const match = matchGuestByName(guestName, guests);
        if (match.status === "match") guestId = match.guest.id;
      }

      const named = draft.attending
        ? (draft.additionalGuestNames ?? [])
            .map((n) => n.trim())
            .filter(Boolean)
            .slice(0, Math.max(maxPlusOnes, 0))
        : [];
      const single = draft.attending ? draft.plusOneName?.trim() || undefined : undefined;
      const additionalGuests = named.length > 0 ? named.length : draft.attending && draft.plusOne ? 1 : 0;

      const entry: Omit<RSVPEntry, "id" | "submittedAt"> = {
        weddingId: config.id,
        guestName,
        email: draft.email?.trim() || undefined,
        attending: draft.attending,
        mealChoice: draft.attending ? draft.mealChoice : undefined,
        plusOne: additionalGuests > 0,
        plusOneName: named[0] ?? single,
        additionalGuests,
        additionalGuestNames: named.length > 0 ? named : single ? [single] : undefined,
        message: draft.message?.trim() || undefined,
        guestId,
      };
      addRsvp(entry);
      if (guestId) updateGuest(guestId, { status: draft.attending ? "attending" : "declined" });
    },
    [addRsvp, updateGuest, config.id, isDemo, invitee, maxPlusOnes]
  );

  const prefillName = invitee?.kind === "guest" ? invitee.displayName : "";

  return { submit, isDemo, prefillName, maxPlusOnes };
}
