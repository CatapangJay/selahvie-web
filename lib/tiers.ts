import type { ModuleKey, Tier } from "@/types/wedding";

/** Lowest to highest. Upgrades only move right. */
export const TIERS: Tier[] = ["essential", "classic", "premium"];

/** What each package adds to the template price, in PHP cents. */
export const TIER_ADDON_CENTS: Record<Tier, number> = {
  essential: 0,
  classic: 30000, // ₱300.00
  premium: 80000, // ₱800.00
};

/** Modules each package unlocks. Everything not listed here (details, RSVP, schedule…) is in every package. */
export const TIER_MODULES: Record<Tier, ModuleKey[]> = {
  essential: [],
  classic: ["entourage", "gallery", "music", "faq"],
  premium: [
    "entourage",
    "gallery",
    "music",
    "faq",
    "guestbook",
    "qrCodes",
    "invitationDownload",
    "personalization",
    "seating",
    "sms",
  ],
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  entourage: "Entourage",
  gallery: "Gallery",
  music: "Background music",
  faq: "FAQ",
  guestbook: "Guestbook",
  qrCodes: "QR codes",
  invitationDownload: "Invitation download",
  personalization: "Personalized invitations",
  seating: "Seating chart",
  sms: "Text invitations",
};

export const TIER_INFO: Record<Tier, { label: string; summary: string; features: string[] }> = {
  essential: {
    label: "Essential",
    summary: "Your website with the details, schedule, RSVP and a guest list.",
    features: [
      "Homepage, countdown and wedding details with maps",
      "RSVP with dietary needs and guest contact details",
      "Order of events, travel notes and registry links",
      "Guest list with groups and CSV import",
    ],
  },
  classic: {
    label: "Classic",
    summary: "Everything in Essential, plus the parts that tell your story.",
    features: [
      "Entourage with photos and personal messages",
      "Gallery sorted into prenup, engagement and memories",
      "Background music",
      "FAQ for guests",
    ],
  },
  premium: {
    label: "Premium",
    summary: "Everything in Classic, plus an invitation that feels written for each guest.",
    features: [
      "Guestbook for well wishes",
      "QR codes for RSVP, maps, registry and your invitation",
      "Downloadable invitation for guests",
      "Text each guest their own invitation link by SMS",
      "Personal invite links and a greeting with each guest's name",
      "Private sections and extra events for chosen guests",
      "Let chosen guests bring more than one plus-one",
      "Seating chart with a drag-and-drop floor plan",
    ],
  },
};

/** Values written before the three-package lineup. */
const LEGACY_TIERS: Record<string, Tier> = { base: "classic", personalized: "premium" };

/** Any stored tier value (current or legacy) → a current tier. Unknown or absent = "essential". */
export function normalizeTier(value: unknown): Tier {
  if (typeof value !== "string") return "essential";
  if ((TIERS as string[]).includes(value)) return value as Tier;
  return LEGACY_TIERS[value] ?? "essential";
}

export function configTier(config: { tier?: Tier | string }): Tier {
  return normalizeTier(config.tier);
}

export const tierRank = (tier: Tier) => TIERS.indexOf(tier);

export function tierPrice(templatePrice: number, tier: Tier): number {
  return templatePrice + TIER_ADDON_CENTS[tier];
}

/** What moving an owned website from one package to a higher one costs. 0 when it isn't an upgrade. */
export function upgradePrice(from: Tier, to: Tier): number {
  return Math.max(0, TIER_ADDON_CENTS[to] - TIER_ADDON_CENTS[from]);
}

/** Packages above `tier`, cheapest first. */
export function higherTiers(tier: Tier): Tier[] {
  return TIERS.slice(tierRank(tier) + 1);
}

export function tierHasModule(tier: Tier, module: ModuleKey): boolean {
  return TIER_MODULES[tier].includes(module);
}

export function hasModule(config: { tier?: Tier | string }, module: ModuleKey): boolean {
  return tierHasModule(configTier(config), module);
}

/** The cheapest package that includes `module`. */
export function tierFor(module: ModuleKey): Tier {
  return TIERS.find((t) => tierHasModule(t, module)) ?? "premium";
}

/** Premium templates (guest-named envelope, etc.) are built around personalization, so they're only sold on Premium. */
export function resolveTier(template: { personalizedOnly?: boolean }, requested: Tier): Tier {
  return template.personalizedOnly ? "premium" : requested;
}
