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
  /** Per-section show/hide for the optional shared sections. Absent key = shown. */
  sectionVisibility?: Partial<Record<OptionalSectionKey, boolean>>;
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
  message?: string; // wishes / note to the couple
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
  partySize: number; // 1 = just them; 2+ includes plus-ones/family
  status: "invited" | "attending" | "declined" | "pending";
  note?: string;
  createdAt: string; // ISO
}
