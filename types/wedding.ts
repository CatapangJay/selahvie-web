export interface WeddingConfig {
  id: string;
  templateId: string;
  slug: string;
  status: "draft" | "published";
  /** Lowercased email of the buyer this purchase belongs to (mock auth). */
  ownerEmail?: string;

  // Step 1: Couple Info
  partner1Name: string;
  partner2Name: string;
  weddingDate: string; // ISO
  venueName: string;
  venueAddress: string;
  venueCity: string;

  // Step 2: Theme
  primaryColor: string; // hex
  accentColor: string; // hex
  themePresetId: string;

  // Step 3: Media
  heroImageUrl: string;
  galleryImageUrls: string[];
  coupleStory: string;

  // Step 4: RSVP Settings
  rsvpDeadline: string; // ISO date
  mealOptions: string[];
  allowPlusOne: boolean;
  customQuestions: string[];

  // Step 5 (Music): ID of a built-in track, "custom", or "none"
  musicTrackId: string;
  // Only used when musicTrackId === "custom"
  musicCustomUrl: string;

  // ─── Redesign: richer published-site sections (all optional, V1 local) ───
  registryLinks?: RegistryLink[];
  travel?: TravelInfo;
  faq?: FaqItem[];
  weddingParty?: WeddingPartyMember[];
  schedule?: ScheduleEvent[];

  // ─── Deeper customization ───
  /** Font pairing preset id (see data/fontPresets.ts); undefined = template default. */
  fontPresetId?: string;
  /** Per-section show/hide. Absent key = shown. */
  sectionVisibility?: Partial<Record<AudienceSectionKey, boolean>>;

  // ─── Tier ───
  /** Purchase tier. Absent = "base". */
  tier?: Tier;

  // ─── Personalized Invitations (tier: "personalized" only) ───
  /** Content blocks only the targeted groups/guests can see. */
  privateSections?: PrivateSection[];
  /** Sections restricted to an audience. Absent or empty audience = everyone. */
  sectionAudiences?: Partial<Record<AudienceSectionKey, Audience>>;
  /** Greeting shown over the hero when a guest opens their invitation. */
  inviteGreeting?: InviteGreeting;
  /** Show the "Find your invitation" name/code prompt on the public site. Default true. */
  inviteLookupEnabled?: boolean;
}

export type Tier = "base" | "personalized";

/** Sections that can be restricted to a group/guest audience. */
export type AudienceSectionKey = OptionalSectionKey | "story" | "gallery" | "rsvp";

/** Who can see a piece of personalized content. Matching any listed group or guest grants access. */
export interface Audience {
  groupIds: string[];
  guestIds: string[];
}

export type PrivateSectionKind = "text" | "photo" | "event";

export interface PrivateSection {
  id: string;
  kind: PrivateSectionKind;
  title: string;
  body: string;
  /** kind "photo" */
  photoUrl?: string;
  /** kind "event" */
  eventDate?: string; // ISO date
  eventTime?: string; // free-text, e.g. "7:00 PM"
  eventLocation?: string;
  audience: Audience;
}

export interface InviteGreeting {
  enabled: boolean;
  message: string;
}

/** Keys for the optional, couple-editable shared sections. */
export type OptionalSectionKey =
  | "schedule"
  | "weddingParty"
  | "travel"
  | "registry"
  | "faq"
  | "guestbook";

export interface RegistryLink {
  id: string;
  label: string; // e.g. "Amazon Registry", "Honeymoon Fund"
  url: string;
  note?: string;
}

export interface TravelInfo {
  accommodations: string; // free-text hotel block / notes
  directions: string;
  notes: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface WeddingPartyMember {
  id: string;
  name: string;
  role: string; // "Maid of Honor", "Best Man", ...
  photoUrl?: string;
}

export interface ScheduleEvent {
  id: string;
  time: string; // free-text, e.g. "4:00 PM"
  title: string;
  description?: string;
}

export interface RSVPEntry {
  id: string;
  weddingId: string; // WeddingConfig.id this response belongs to
  guestName: string;
  email?: string;
  attending: boolean;
  mealChoice?: string;
  plusOne: boolean;
  plusOneName?: string;
  /** Extra guests this response brings. Absent on older entries = `plusOne ? 1 : 0`. */
  additionalGuests?: number;
  /** Names of the extra guests, when given. */
  additionalGuestNames?: string[];
  message?: string; // wishes / note to the couple
  /** Guest-list entry this response was linked to (invite link or name match). */
  guestId?: string;
  submittedAt: string; // ISO
}

/** A public well-wish left by a guest on the published site. */
export interface GuestbookEntry {
  id: string;
  weddingId: string;
  name: string;
  message: string;
  createdAt: string; // ISO
}

/** A guest the couple has invited (managed from the dashboard). */
export interface GuestListEntry {
  id: string;
  weddingId: string;
  name: string;
  email?: string;
  /**
   * Total seats for this invitation, the guest included. 1 = just them; 2+ includes
   * plus-ones/family. On Personalized sites a guest can name `partySize - 1` extra guests.
   */
  partySize: number;
  status: "invited" | "attending" | "declined" | "pending";
  note?: string;
  groupIds: string[];
  /** Hard-to-guess code used for the personal invite link and code entry. */
  inviteCode: string;
  createdAt: string; // ISO
}

/** A named set of guests (Family, Entourage, …) with its own shared invite link. */
export interface GuestGroup {
  id: string;
  weddingId: string;
  name: string;
  inviteCode: string;
  createdAt: string; // ISO
}
