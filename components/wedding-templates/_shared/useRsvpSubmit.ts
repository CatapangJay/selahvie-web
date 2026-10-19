"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { rsvpInsert } from "@/lib/db/mappers";
import { plusOneAllowance } from "@/lib/invitations";
import { useInvitee } from "./InviteeContext";
import { useOpenInviteMatch } from "./useOpenInviteMatch";
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
 * Shared RSVP submission for all wedding templates. Saves the response to
 * Supabase so the couple sees it on their dashboard — except on demo or
 * live-preview renders, where it's a no-op (the confirmation UI still shows).
 *
 * The response is linked to a guest-list entry (via the invite link, the name
 * typed on the open invitation, or — in the database — a confident name match)
 * and the database updates that guest's status. Opening an invite link never
 * RSVPs on its own; only submitting does.
 *
 * Returns `{ submit, isDemo, prefillName, maxPlusOnes, matching }`. Templates
 * seed their name field with `prefillName`, call `matching.checkName` when it
 * loses focus, and render `OpenInviteNotice` under it. When `maxPlusOnes > 1`
 * they render `AdditionalGuestsField` instead of the single plus-one control.
 * `submit(draft)` resolves to false when it held the response back so the guest
 * can see what their name unlocked (or enter a code), or when sending failed
 * (the notice says so); show the confirmation only when it resolves to true.
 */
export function useRsvpSubmit(config: WeddingConfig) {
  const invitee = useInvitee();
  const isDemo = isDemoConfig(config);
  const { matching, settle, takeUnseen, setSendError } = useOpenInviteMatch(invitee?.kind !== "guest");
  const baseAllowance = plusOneAllowance(config, invitee);
  const maxPlusOnes = matching.state.step === "matched" ? matching.state.allowance : baseAllowance;

  const submit = useCallback(
    async (draft: RsvpDraft): Promise<boolean> => {
      const guestName = draft.guestName?.trim() || "Guest";
      setSendError("");

      let guestId = invitee?.kind === "guest" ? invitee.guestId : undefined;
      let allowed = maxPlusOnes;
      if (!guestId && matching.active) {
        const settled = await settle(guestName);
        const changesForm =
          settled.step === "needs-code" || (settled.step === "matched" && settled.allowance !== baseAllowance);
        if (changesForm && takeUnseen()) return false;
        if (settled.step === "matched") {
          guestId = settled.guestId;
          allowed = settled.allowance;
        } else {
          allowed = baseAllowance;
        }
      }
      if (isDemo) return true;

      // Read the fields the guest was shown, then cap at what they're allowed.
      const named = draft.attending && maxPlusOnes > 1
        ? (draft.additionalGuestNames ?? []).map((n) => n.trim()).filter(Boolean)
        : [];
      const single = draft.attending && maxPlusOnes === 1 ? draft.plusOneName?.trim() || undefined : undefined;
      const requested = maxPlusOnes > 1 ? named.length : draft.attending && maxPlusOnes === 1 && (draft.plusOne || single) ? 1 : 0;
      const additionalGuests = Math.min(requested, Math.max(allowed, 0));
      const names = (named.length > 0 ? named : single ? [single] : []).slice(0, additionalGuests);

      const entry: Omit<RSVPEntry, "id" | "submittedAt"> = {
        weddingId: config.id,
        guestName,
        email: draft.email?.trim() || undefined,
        attending: draft.attending,
        mealChoice: draft.attending ? draft.mealChoice : undefined,
        plusOne: additionalGuests > 0,
        plusOneName: names[0],
        additionalGuests,
        additionalGuestNames: names.length > 0 ? names : undefined,
        message: draft.message?.trim() || undefined,
        guestId,
      };
      // The database re-checks the allowance and links/updates the guest.
      const { error } = await createClient().from("rsvps").insert(rsvpInsert(entry));
      if (error) {
        console.error("[rsvp] send failed:", error.message);
        setSendError("We couldn't send your RSVP. Check your connection and try again.");
        return false;
      }
      return true;
    },
    [config.id, isDemo, invitee, maxPlusOnes, baseAllowance, matching.active, settle, takeUnseen, setSendError]
  );

  const prefillName = invitee?.kind === "guest" ? invitee.displayName : "";

  return { submit, isDemo, prefillName, maxPlusOnes, matching };
}
