export type TemplateTag = "Romantic" | "Modern" | "Rustic" | "Minimalist" | "Garden" | "Luxe";

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
}

export interface WeddingTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number; // PHP cents, e.g. 4900 = ₱49.00
  previewImage: string;
  previewImages: string[];
  tags: TemplateTag[];
  features: string[];
  colorPalettes: ColorPalette[];
  isFeatured: boolean;
  createdAt: string;
}
