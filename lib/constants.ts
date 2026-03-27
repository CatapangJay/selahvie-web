export const APP_NAME = "Selah Vie";
export const APP_TAGLINE = "Your Dream Wedding, Online.";

export const NAV_LINKS = [
  { label: "Templates", href: "/templates" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Dashboard", href: "/dashboard" },
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
