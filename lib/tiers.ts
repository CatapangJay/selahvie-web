import type { Tier } from "@/types/wedding";

/** Flat add-on price for Personalized Invitations, in PHP cents (₱500.00). */
export const PERSONALIZED_ADDON_CENTS = 50000;

export const TIER_INFO: Record<Tier, { label: string; summary: string; features: string[] }> = {
  personalized: {
    label: "Personalized",
    summary: "Every guest opens an invitation that feels written for them.",
    features: [
      "Personal invite links for each guest or group",
      "Private sections only chosen guests can see",
      "Greet every guest by name on the hero",
      "Show extra events, like a rehearsal dinner, to select guests",
      "Let chosen guests bring more than one plus-one",
      "RSVPs arrive prefilled and update your guest list",
    ],
  },
  base: {
    label: "Base",
    summary: "The full website, RSVP tracking and a guest list. Everyone sees the same page.",
    features: [],
  },
};

export function tierPrice(templatePrice: number, tier: Tier): number {
  return templatePrice + (tier === "personalized" ? PERSONALIZED_ADDON_CENTS : 0);
}

export function configTier(config: { tier?: Tier }): Tier {
  return config.tier ?? "base";
}

/** Premium templates (guest-named envelope, etc.) can't be bought on the Base tier. */
export function resolveTier(template: { personalizedOnly?: boolean }, requested: Tier): Tier {
  return template.personalizedOnly ? "personalized" : requested;
}
