import { WeddingTemplate } from "./template";

export interface CartItem {
  templateId: string;
  template: WeddingTemplate;
  addedAt: string;
}
