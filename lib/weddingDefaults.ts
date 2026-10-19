import type { Tier, WeddingConfig } from "@/types/wedding";

export const DEFAULT_PRIMARY_COLOR = "#A75463";
export const DEFAULT_ACCENT_COLOR = "#C69D63";

/** A freshly purchased website: sample photos and sensible RSVP defaults, everything else blank. */
export function defaultWeddingConfig(id: string, templateId: string, tier: Tier = "base"): WeddingConfig {
  return {
    id,
    templateId,
    slug: id,
    status: "draft",
    tier,
    partner1Name: "",
    partner2Name: "",
    weddingDate: "",
    venueName: "",
    venueAddress: "",
    venueCity: "",
    primaryColor: DEFAULT_PRIMARY_COLOR,
    accentColor: DEFAULT_ACCENT_COLOR,
    themePresetId: "",
    heroImageUrl: `https://picsum.photos/seed/${id}-hero/1200/800`,
    galleryImageUrls: [
      `https://picsum.photos/seed/${id}-g1/800/800`,
      `https://picsum.photos/seed/${id}-g2/800/800`,
      `https://picsum.photos/seed/${id}-g3/800/800`,
      `https://picsum.photos/seed/${id}-g4/800/800`,
    ],
    coupleStory: "",
    rsvpDeadline: "",
    mealOptions: ["Chicken", "Fish", "Vegetarian"],
    allowPlusOne: true,
    customQuestions: [],
    musicTrackId: "none",
    musicCustomUrl: "",
    registryLinks: [],
    travel: { accommodations: "", directions: "", notes: "" },
    faq: [],
    weddingParty: [],
    schedule: [],
  };
}
