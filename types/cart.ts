import { WeddingTemplate } from "./template";
import type { Tier } from "./wedding";

/**
 * - "template": buy a new wedding website at a tier.
 * - "upgrade": move a website already owned to a higher package (`tier` is the target).
 */
export interface CartItem {
  /** Template items: the template id. Upgrade items: `upgrade:<weddingId>`. */
  id: string;
  kind: "template" | "upgrade";
  templateId: string;
  template: WeddingTemplate;
  tier: Tier;
  /** Upgrade items only: the package the website is on now (for the price shown; the server re-checks). */
  fromTier?: Tier;
  /** Upgrade items only: the wedding website being upgraded. */
  weddingId?: string;
  /** Upgrade items only: display label, e.g. "Alex & Sam". */
  weddingLabel?: string;
  addedAt: string;
}
