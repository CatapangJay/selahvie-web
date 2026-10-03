"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Invitee } from "@/lib/invitations";

const InviteeContext = createContext<Invitee | null>(null);

/** Makes the resolved viewer (guest or group) available to every template section. */
export function InviteeProvider({ invitee, children }: { invitee: Invitee | null; children: ReactNode }) {
  return <InviteeContext.Provider value={invitee}>{children}</InviteeContext.Provider>;
}

/** The guest or group viewing the site, or null for a public visitor. */
export function useInvitee(): Invitee | null {
  return useContext(InviteeContext);
}
