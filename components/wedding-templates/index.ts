/**
 * Wedding Template Registry
 *
 * Each entry maps a WeddingTemplate ID (from data/templates.ts) to its
 * corresponding React component. Add a new entry here whenever a new
 * template is created under components/wedding-templates/.
 */

import type { ComponentType } from "react";
import type { WeddingConfig } from "@/types/wedding";

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
import GoldenDuskTemplate     from "./golden-dusk";

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
  // t2: SageAndThistleTemplate,  ← add future templates here
};

/**
 * Resolve the correct template component for a given template ID.
 * Always returns a valid component (defaults to Rosé Elegy).
 */
export function resolveTemplate(templateId: string): ComponentType<TemplateComponentProps> {
  return templateRegistry[templateId] ?? RoseElegyTemplate;
}
