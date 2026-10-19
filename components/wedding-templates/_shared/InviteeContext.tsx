"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { GuestMatcher, Invitee } from "@/lib/invitations";

const InviteeContext = createContext<Invitee | null>(null);
const GuestMatcherContext = createContext<GuestMatcher | null>(null);

/**
 * Makes the resolved viewer (guest or group) available to every template section,
 * plus the matcher the RSVP form uses to recognise guests on the open invitation.
 */
export function InviteeProvider({
  invitee,
  matcher = null,
  children,
}: {
  invitee: Invitee | null;
  matcher?: GuestMatcher | null;
  children: ReactNode;
}) {
  return (
    <InviteeContext.Provider value={invitee}>
      <GuestMatcherContext.Provider value={matcher}>{children}</GuestMatcherContext.Provider>
    </InviteeContext.Provider>
  );
}

/** The guest or group viewing the site, or null for a public visitor. */
export function useInvitee(): Invitee | null {
  return useContext(InviteeContext);
}

/** Null when open-invitation matching is off for this site. */
export function useGuestMatcher(): GuestMatcher | null {
  return useContext(GuestMatcherContext);
}
