export const APP_NAME = "Selah Vie";
export const APP_TAGLINE = "Your Dream Wedding, Online.";

// Public marketing nav. "Dashboard" is intentionally NOT here — it's an
// authenticated surface, surfaced only once a user has an account/session.
export const NAV_LINKS = [
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About Us", href: "/about" },
];

export const TEMPLATE_TAGS = [
  "All",
  "Romantic",
  "Modern",
  "Rustic",
  "Minimalist",
  "Garden",
  "Luxe",
] as const;

export const SORT_OPTIONS = [
  { label: "Most Popular", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
] as const;
