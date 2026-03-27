export interface WeddingConfig {
  id: string;
  templateId: string;
  slug: string;
  status: "draft" | "published";

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
}

export interface RSVPEntry {
  id: string;
  weddingId: string;
  guestName: string;
  email: string;
  attending: boolean;
  mealChoice?: string;
  plusOneName?: string;
  message?: string;
  submittedAt: string;
}
