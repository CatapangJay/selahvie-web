export const APP_NAME = "Be My Guest";
export const APP_MONOGRAM = "BMG";
export const APP_TAGLINE = "Invite beautifully. Host effortlessly.";

// Public marketing nav. "Dashboard" is intentionally NOT here — it's an
// authenticated surface, surfaced only once a user has an account/session.
export const NAV_LINKS = [
  { label: "Templates", href: "/templates" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

/** Demo credentials shown on the login page. The user lives in Supabase Auth. */
export const DEMO_ACCOUNT = {
  name: "Alex & Sam",
  email: "demo@selahvie.com",
  password: "demo1234",
} as const;

// Public inbox for the landing-page contact form (opens the visitor's mail app).
export const CONTACT_EMAIL = "hello@selahvie.com";

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
