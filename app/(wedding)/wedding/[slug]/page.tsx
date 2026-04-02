"use client";

import { useWeddingStore } from "@/store/weddingStore";
import { resolveTemplate } from "@/components/wedding-templates";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";

// ─── Demo configs ────────────────────────────────────────────────────────────

const DEMO_CONFIG: WeddingConfig = {
  id: "demo",
  templateId: "t1",
  slug: "demo",
  status: "published",
  partner1Name: "Alexandra",
  partner2Name: "James",
  weddingDate: "2026-09-20",
  venueName: "The Grand Rosewood Estate",
  venueAddress: "1 Rosewood Lane",
  venueCity: "Napa Valley, CA",
  primaryColor: "#7c5454",
  accentColor: "#c99999",
  themePresetId: "rp1",
  heroImageUrl: "https://picsum.photos/seed/demo-hero/1200/800",
  galleryImageUrls: [
    "https://picsum.photos/seed/demo-gallery-1/800/800",
    "https://picsum.photos/seed/demo-gallery-2/800/800",
    "https://picsum.photos/seed/demo-gallery-3/800/800",
    "https://picsum.photos/seed/demo-gallery-4/800/800",
  ],
  coupleStory:
    "We met on a rainy Tuesday in a tiny coffee shop in San Francisco. James spilled his latte on Alexandra's laptop, she laughed instead of getting angry, and he knew she was the one. Three years, countless adventures, and one very memorable proposal on the Brooklyn Bridge later—here we are, ready to say yes forever.",
  rsvpDeadline: "2026-08-01",
  mealOptions: ["Chicken", "Fish", "Vegetarian"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "romantic",
  musicCustomUrl: "",
};

const OBSIDIAN_DEMO_CONFIG: WeddingConfig = {
  id: "obsidian-demo",
  templateId: "t6",
  slug: "obsidian-demo",
  status: "published",
  partner1Name: "Isabelle",
  partner2Name: "Étienne",
  weddingDate: "2026-12-31",
  venueName: "Château de Lumière",
  venueAddress: "12 Rue des Étoiles",
  venueCity: "Paris, France",
  primaryColor: "#c9a84c",
  accentColor: "#e8c97a",
  themePresetId: "ov1",
  heroImageUrl: "https://picsum.photos/seed/obsidian-hero/1200/800",
  galleryImageUrls: [
    "https://picsum.photos/seed/obsidian-g1/800/800",
    "https://picsum.photos/seed/obsidian-g2/800/600",
    "https://picsum.photos/seed/obsidian-g3/600/800",
    "https://picsum.photos/seed/obsidian-g4/800/800",
    "https://picsum.photos/seed/obsidian-g5/800/600",
    "https://picsum.photos/seed/obsidian-g6/600/800",
  ],
  coupleStory:
    "They found each other in a small Montmartre gallery at midnight—both reaching for the same painting. Isabelle insisted she'd seen it first. Étienne agreed, then asked if she'd like to debate it over wine. That argument never really ended. Instead it turned into a life. A year later, under the same painting now hanging in their apartment, he asked her to marry him. She said yes before he finished the question.",
  rsvpDeadline: "2026-11-15",
  mealOptions: ["Filet Mignon", "Sole Meunière", "Risotto Truffe"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "dreams",
  musicCustomUrl: "",
};

const WONDERSTRUCK_DEMO_CONFIG: WeddingConfig = {
  id: "wonderstruck-demo",
  templateId: "t7",
  slug: "wonderstruck-demo",
  status: "published",
  partner1Name: "Sophia",
  partner2Name: "Eliot",
  weddingDate: "2026-11-07",
  venueName: "The Enchanted Conservatory",
  venueAddress: "7 Moonlark Lane",
  venueCity: "Edinburgh, Scotland",
  primaryColor: "#e8d5a3",
  accentColor: "#c8b4e8",
  themePresetId: "ws1",
  heroImageUrl: "https://picsum.photos/seed/wonderstruck-hero/1200/800",
  galleryImageUrls: [
    "https://picsum.photos/seed/ws-g1/800/800",
    "https://picsum.photos/seed/ws-g2/800/600",
    "https://picsum.photos/seed/ws-g3/600/800",
    "https://picsum.photos/seed/ws-g4/800/800",
    "https://picsum.photos/seed/ws-g5/800/600",
    "https://picsum.photos/seed/ws-g6/600/800",
  ],
  coupleStory:
    "It was a stormy November evening when Sophia walked into the wrong lecture hall and sat beside Eliot. Neither corrected the mistake. They stayed through the entire talk on 18th-century poetry, and afterwards argued about it over hot cider for three hours. That was the night they both knew — completely wonderstruck.",
  rsvpDeadline: "2026-09-30",
  mealOptions: ["Chicken", "Fish", "Vegetarian"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "sweet",
  musicCustomUrl: "",
};

const BOTANICAL_SERENITY_DEMO_CONFIG: WeddingConfig = {
  id: "botanical-serenity-demo",
  templateId: "t11",
  slug: "botanical-serenity-demo",
  status: "published",
  partner1Name: "Mei",
  partner2Name: "Luca",
  weddingDate: "September 20, 2026",
  venueName: "Jardin Botanica",
  venueAddress: "14 Via delle Rose",
  venueCity: "Florence, Italy",
  primaryColor: "#3d6b2e",
  accentColor: "#c8745a",
  themePresetId: "bs1",
  heroImageUrl: "https://picsum.photos/seed/botanical-hero/1200/1600",
  galleryImageUrls: [
    "https://picsum.photos/seed/bs-g1/800/1000",
    "https://picsum.photos/seed/bs-g2/800/1000",
    "https://picsum.photos/seed/bs-g3/800/1000",
    "https://picsum.photos/seed/bs-g4/1000/800",
    "https://picsum.photos/seed/bs-g5/1000/800",
  ],
  coupleStory:
    "They met at a botanical illustration workshop in a sun-filled atelier, both drawing the same persimmon branch from opposite sides of the table.\n\nLuca passed his sketchbook across first. Mei laughed at how different their lines were — his bold and gestural, hers precise and quiet. By the end of the afternoon they had swapped notebooks, and something important had shifted.\n\nTwo years later, standing in the same garden that first brought them together, he asked. She had already answered before the words fully formed.",
  rsvpDeadline: "2026-08-01",
  mealOptions: ["Garden Tasting Menu", "Grilled Sea Bass", "Roasted Vegetable"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "romantic",
  musicCustomUrl: "",
};

const GOLDEN_DUSK_DEMO_CONFIG: WeddingConfig = {
  id: "golden-dusk-demo",
  templateId: "t10",
  slug: "golden-dusk-demo",
  status: "published",
  partner1Name: "Priya",
  partner2Name: "Arjun",
  weddingDate: "2026-11-14",
  venueName: "The Grand Mahal",
  venueAddress: "12 Shanti Nagar",
  venueCity: "Jaipur, Rajasthan",
  primaryColor: "#c97830",
  accentColor: "#e8b87a",
  themePresetId: "gd1",
  heroImageUrl: "https://picsum.photos/seed/golden-dusk-hero/1600/900",
  galleryImageUrls: [
    "https://picsum.photos/seed/gd-g1/600/800",
    "https://picsum.photos/seed/gd-g2/600/800",
    "https://picsum.photos/seed/gd-g3/600/800",
    "https://picsum.photos/seed/gd-g4/600/800",
    "https://picsum.photos/seed/gd-g5/600/800",
    "https://picsum.photos/seed/gd-g6/800/600",
    "https://picsum.photos/seed/gd-g7/800/600",
    "https://picsum.photos/seed/gd-g8/600/800",
    "https://picsum.photos/seed/gd-g9/600/800",
  ],
  coupleStory:
    "We met in the heart of Delhi, in narrow streets ablaze with marigolds. A simple hello that unfolded our shared destiny. Neighbours once unknown, our childhood side by side, felt like fate as we walked with hearts open wide.\n\nDaily rides on the city, laughter in the air. Flowers and dreams, stories we'd freely share. Friendship grew slowly, gentle and true. Until slowly it became between me and you, to journey towards life, our destiny drawn anew.\n\nFrom childhood paths to journey's end, from friendship to love, we are here, our love story complete. A lifetime of laughter, love and memories shared.",
  rsvpDeadline: "2026-10-01",
  mealOptions: ["Vegetarian", "Non-Vegetarian", "Jain"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "romantic",
  musicCustomUrl: "",
};

const FOREST_BLOOM_DEMO_CONFIG: WeddingConfig = {
  id: "forest-bloom-demo",
  templateId: "t9",
  slug: "forest-bloom-demo",
  status: "published",
  partner1Name: "Daniel",
  partner2Name: "Clara",
  weddingDate: "2026-08-17",
  venueName: "Hotel La Belle",
  venueAddress: "42 Jardín de las Rosas",
  venueCity: "Tagaytay City, Cavite",
  primaryColor: "#c8a415",
  accentColor: "#3a5c43",
  themePresetId: "fb1",
  heroImageUrl: "https://picsum.photos/seed/forest-bloom-hero/1200/800",
  galleryImageUrls: [
    "https://picsum.photos/seed/fb-g1/800/1000",
    "https://picsum.photos/seed/fb-g2/1000/800",
    "https://picsum.photos/seed/fb-g3/800/1000",
    "https://picsum.photos/seed/fb-g4/1000/800",
    "https://picsum.photos/seed/fb-g5/800/800",
    "https://picsum.photos/seed/fb-g6/800/1000",
  ],
  coupleStory:
    "Daniel and Clara first crossed paths at a small botanical garden exhibit, both reaching for the same pressed-flower guidebook. He insisted she take it first. She said she'd share it over coffee instead. They've been sharing everything since that afternoon — adventures, morning walks, quiet evenings — and now, a lifetime.",
  rsvpDeadline: "2026-07-01",
  mealOptions: ["Grilled Chicken", "Steamed Fish", "Garden Vegetarian"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "romantic",
  musicCustomUrl: "",
};

const ENCHANTED_DEMO_CONFIG: WeddingConfig = {
  id: "enchanted-demo",
  templateId: "t8",
  slug: "enchanted-demo",
  status: "published",
  partner1Name: "Amara",
  partner2Name: "Rowan",
  weddingDate: "2026-10-17",
  venueName: "The Whispering Grove Estate",
  venueAddress: "3 Elderwood Path",
  venueCity: "County Kerry, Ireland",
  primaryColor: "#d4af37",
  accentColor: "#7ec8a4",
  themePresetId: "eg1",
  heroImageUrl: "https://picsum.photos/seed/enchanted-hero/1200/800",
  galleryImageUrls: [
    "https://picsum.photos/seed/eg-g1/800/1000",
    "https://picsum.photos/seed/eg-g2/1000/800",
    "https://picsum.photos/seed/eg-g3/800/1000",
    "https://picsum.photos/seed/eg-g4/1000/800",
    "https://picsum.photos/seed/eg-g5/800/800",
    "https://picsum.photos/seed/eg-g6/800/1000",
  ],
  coupleStory:
    "On a fog-draped morning in the Irish countryside, Amara was sketching the ruins of an old abbey when Rowan appeared from the tree line with a thermos of tea and a lost expression. Neither had planned to be there. By the time the fog lifted, they had talked for three hours and knew, with the quiet certainty of something ancient, that this beginning had been written long before either of them arrived.",
  rsvpDeadline: "2026-08-31",
  mealOptions: ["Roast Lamb", "Pan-Seared Salmon", "Wild Mushroom Risotto"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "tenderness",
  musicCustomUrl: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: { slug: string };
}

export default function PublicWeddingPage({ params }: Props) {
  const { configs } = useWeddingStore();
  const isDemo              = params.slug === "demo";
  const isObsidianDemo       = params.slug === "obsidian-demo";
  const isWonderstruck       = params.slug === "wonderstruck-demo";
  const isEnchanted          = params.slug === "enchanted-demo";
  const isForestBloom         = params.slug === "forest-bloom-demo";
  const isGoldenDusk             = params.slug === "golden-dusk-demo";
  const isBotanicalSerenity       = params.slug === "botanical-serenity-demo";

  const config: WeddingConfig | undefined =
    isDemo              ? DEMO_CONFIG :
    isObsidianDemo      ? OBSIDIAN_DEMO_CONFIG :
    isWonderstruck      ? WONDERSTRUCK_DEMO_CONFIG :
    isEnchanted         ? ENCHANTED_DEMO_CONFIG :
    isForestBloom       ? FOREST_BLOOM_DEMO_CONFIG :
    isGoldenDusk        ? GOLDEN_DUSK_DEMO_CONFIG :
    isBotanicalSerenity ? BOTANICAL_SERENITY_DEMO_CONFIG :
    // Try matching by unique config ID first, then fall back to slug
    Object.values(configs).find((c) => c.id === params.slug) ??
    Object.values(configs).find((c) => c.slug === params.slug && c.status === "published");

  if (!config) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="headline-sm mb-4">Wedding site not found</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
          This wedding website hasn&apos;t been published yet, or the link may be incorrect.
        </p>
        <Link href="/templates">
          <ButtonSecondary>Create Your Own</ButtonSecondary>
        </Link>
      </div>
    );
  }

  // Resolve the correct template component based on the config's templateId
  const TemplateComponent = resolveTemplate(config.templateId);

  return <TemplateComponent config={config} showBranding />;
}

