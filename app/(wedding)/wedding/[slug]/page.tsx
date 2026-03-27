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

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: { slug: string };
}

export default function PublicWeddingPage({ params }: Props) {
  const { configs } = useWeddingStore();
  const isDemo              = params.slug === "demo";
  const isObsidianDemo       = params.slug === "obsidian-demo";
  const isWonderstruck       = params.slug === "wonderstruck-demo";

  const config: WeddingConfig | undefined =
    isDemo              ? DEMO_CONFIG :
    isObsidianDemo      ? OBSIDIAN_DEMO_CONFIG :
    isWonderstruck      ? WONDERSTRUCK_DEMO_CONFIG :
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

