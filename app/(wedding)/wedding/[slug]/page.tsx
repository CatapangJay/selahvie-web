"use client";

import { useWeddingStore } from "@/store/weddingStore";
import { resolveTemplate } from "@/components/wedding-templates";
import { getDemoConfigBySlug } from "@/data/demoConfigs";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";

// ─── Legacy demo config (kept for the /wedding/demo entry link) ──────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: { slug: string };
}

export default function PublicWeddingPage({ params }: Props) {
  const { configs } = useWeddingStore();

  const config: WeddingConfig | undefined =
    // "/wedding/demo" keeps the original Rosé Elegy showcase.
    params.slug === "demo" ? DEMO_CONFIG :
    // Any bespoke template demo (obsidian-demo, enchanted-demo, …).
    getDemoConfigBySlug(params.slug) ??
    // Try matching a user config by unique ID first, then by published slug.
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

