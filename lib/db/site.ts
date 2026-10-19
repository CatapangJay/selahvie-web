import { personalizeConfig, visiblePrivateSections, type Invitee } from "@/lib/invitations";
import type { GuestGroup, GuestListEntry, WeddingConfig } from "@/types/wedding";

/** GET /api/sites/[site] */
export interface SiteResponse {
  config: WeddingConfig;
  /** The guest or group the `invite` code belongs to (Personalized sites only). */
  invitee: Invitee | null;
  /** The site has a guest list or groups, so "Find your invitation" can work. */
  hasInvitees: boolean;
  isOwner: boolean;
  /** Owner only: the full guest list and groups, for "View as". */
  guests?: GuestListEntry[];
  groups?: GuestGroup[];
}

export type { FindResult } from "@/lib/invitations";

/**
 * The config as this visitor may receive it: private sections they aren't in
 * are dropped and the content of audience-restricted sections is emptied, so
 * nothing meant for other guests reaches the browser.
 */
export function redactForViewer(config: WeddingConfig, invitee: Invitee | null): WeddingConfig {
  const hidden = personalizeConfig(config, invitee).sectionVisibility ?? {};
  const restricted = (key: string) =>
    Boolean(config.sectionAudiences?.[key as keyof typeof config.sectionAudiences]) &&
    hidden[key as keyof typeof hidden] === false;

  return {
    ...config,
    ownerEmail: undefined,
    privateSections: visiblePrivateSections(config, invitee),
    schedule: restricted("schedule") ? [] : config.schedule,
    weddingParty: restricted("weddingParty") ? [] : config.weddingParty,
    travel: restricted("travel") ? { accommodations: "", directions: "", notes: "" } : config.travel,
    registryLinks: restricted("registry") ? [] : config.registryLinks,
    faq: restricted("faq") ? [] : config.faq,
    coupleStory: restricted("story") ? "" : config.coupleStory,
    galleryImageUrls: restricted("gallery") ? [] : config.galleryImageUrls,
  };
}
