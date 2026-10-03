import { WeddingTemplate } from "./template";
import type { Tier } from "./wedding";

/**
 * - "template": buy a new wedding website at a tier.
 * - "upgrade": add Personalized Invitations to a website already owned.
 */
export interface CartItem {
  /** Template items: the template id. Upgrade items: `upgrade:<weddingId>`. */
  id: string;
  kind: "template" | "upgrade";
  templateId: string;
  template: WeddingTemplate;
  tier: Tier;
  /** Upgrade items only: the wedding website being upgraded. */
  weddingId?: string;
  /** Upgrade items only: display label, e.g. "Alex & Sam". */
  weddingLabel?: string;
  addedAt: string;
}
