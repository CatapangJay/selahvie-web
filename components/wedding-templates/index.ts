/**
 * Wedding Template Registry
 *
 * Each entry maps a WeddingTemplate ID (from data/templates.ts) to its
 * corresponding React component. Add a new entry here whenever a new
 * template is created under components/wedding-templates/.
 */

import type { ComponentType } from "react";
import type { WeddingConfig, AudienceSectionKey } from "@/types/wedding";
import { OPTIONAL_SECTIONS } from "./_shared/sections";

export interface TemplateComponentProps {
  config: WeddingConfig;
  /** Show the "Created with Selah Vie" footer branding. Default: true */
  showBranding?: boolean;
}

// Lazy imports keep the bundle small — only the used template is shipped.
import RoseElegyTemplate    from "./rose-elegy";
import ObsidianVowTemplate  from "./obsidian-vow";
import WonderstuckTemplate  from "./wonderstruck";
import EnchantedGroveTemplate from "./enchanted-grove";
import ForestBloomTemplate    from "./forest-bloom";
import GoldenDuskTemplate          from "./golden-dusk";
import BotanicalSerenityTemplate   from "./botanical-serenity";
import JewelTonesTemplate          from "./jewel-tones";

/**
 * Map of template ID → renderer component.
 * Falls back to `RoseElegyTemplate` when an ID is not found.
 */
export const templateRegistry: Record<string, ComponentType<TemplateComponentProps>> = {
  t1: RoseElegyTemplate,
  t6: ObsidianVowTemplate,
  t7: WonderstuckTemplate,
  t8: EnchantedGroveTemplate,
  t9: ForestBloomTemplate,
  t10: GoldenDuskTemplate,
  t11: BotanicalSerenityTemplate,
  t12: JewelTonesTemplate,
  // t2: SageAndThistleTemplate,  ← add future templates here
};

/**
 * Resolve the correct template component for a given template ID.
 * Always returns a valid component (defaults to Rosé Elegy).
 */
export function resolveTemplate(templateId: string): ComponentType<TemplateComponentProps> {
  return templateRegistry[templateId] ?? RoseElegyTemplate;
}

const CORE_AUDIENCE_SECTIONS: { key: AudienceSectionKey; label: string }[] = [
  { key: "story", label: "Our Story" },
  { key: "gallery", label: "Gallery" },
  { key: "rsvp", label: "RSVP" },
];

/**
 * Sections each template can restrict to an audience (Personalized tier).
 * Must mirror the `isSectionVisible` gates inside each template.
 */
const AUDIENCE_SECTIONS_BY_TEMPLATE: Record<string, AudienceSectionKey[]> = {
  t1: ["story", "gallery", "rsvp", "schedule", "weddingParty", "travel", "registry", "faq", "guestbook"],
  t6: ["story", "gallery", "rsvp"],
  t7: ["story", "gallery", "rsvp"],
  t8: ["story", "gallery", "rsvp"],
  t9: ["gallery"],
  t10: ["story", "gallery"],
  t11: ["story", "gallery"],
  t12: ["story", "gallery", "schedule", "rsvp"],
};

export function audienceSectionsFor(templateId: string): { key: AudienceSectionKey; label: string }[] {
  const keys = AUDIENCE_SECTIONS_BY_TEMPLATE[templateId] ?? AUDIENCE_SECTIONS_BY_TEMPLATE.t1;
  const labels = [...CORE_AUDIENCE_SECTIONS, ...OPTIONAL_SECTIONS];
  return keys.map((key) => ({ key, label: labels.find((l) => l.key === key)?.label ?? key }));
}
