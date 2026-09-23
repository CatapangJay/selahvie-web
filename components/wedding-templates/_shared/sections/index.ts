import type { WeddingConfig, OptionalSectionKey } from "@/types/wedding";

export { default as ScheduleSection } from "./ScheduleSection";
export { default as WeddingPartySection } from "./WeddingPartySection";
export { default as RegistrySection } from "./RegistrySection";
export { default as TravelSection } from "./TravelSection";
export { default as FaqSection } from "./FaqSection";
export { default as GuestbookSection } from "./GuestbookSection";

/** True when a section should render (default shown; hidden only if explicitly false). */
export function isSectionVisible(config: WeddingConfig, key: OptionalSectionKey): boolean {
  return config.sectionVisibility?.[key] !== false;
}

/** Human labels + order for the studio's section manager. */
export const OPTIONAL_SECTIONS: { key: OptionalSectionKey; label: string }[] = [
  { key: "schedule", label: "Order of Events" },
  { key: "weddingParty", label: "Wedding Party" },
  { key: "travel", label: "Travel & Stay" },
  { key: "registry", label: "Registry" },
  { key: "faq", label: "FAQ" },
  { key: "guestbook", label: "Guestbook" },
];
