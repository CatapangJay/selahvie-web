"use client";
import { Suspense, use } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useWeddingStore } from "@/store/weddingStore";
import { useAuthStore } from "@/store/authStore";
import { getDemoConfigBySlug } from "@/data/demoConfigs";
import PersonalizedTemplate from "@/components/wedding-templates/_shared/PersonalizedTemplate";
import FindInvitation from "@/components/wedding-templates/_shared/FindInvitation";
import ViewAsSelect from "@/components/wedding-templates/_shared/ViewAsSelect";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import Link from "next/link";
import { INVITE_PARAM, findInviteeByCode, isPersonalized } from "@/lib/invitations";
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
  params: Promise<{ slug: string }>;
}

export default function PublicWeddingPage(props: Props) {
  const params = use(props.params);
  return (
    <Suspense fallback={null}>
      <WeddingSite slug={params.slug} />
    </Suspense>
  );
}

function WeddingSite({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const configs = useWeddingStore((s) => s.configs);
  const allGuests = useWeddingStore((s) => s.guests);
  const allGroups = useWeddingStore((s) => s.groups);
  const sessionEmail = useAuthStore((s) => s.sessionEmail);

  const config: WeddingConfig | undefined =
    // "/wedding/demo" keeps the original Rosé Elegy showcase.
    slug === "demo" ? DEMO_CONFIG :
    // Any bespoke template demo (obsidian-demo, enchanted-demo, …).
    getDemoConfigBySlug(slug) ??
    // Try matching a user config by unique ID first, then by published slug.
    Object.values(configs).find((c) => c.id === slug) ??
    Object.values(configs).find((c) => c.slug === slug && c.status === "published");

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

  // Resolve the viewer from ?invite=CODE (Personalized sites only).
  const personalized = isPersonalized(config);
  const guests = allGuests.filter((g) => g.weddingId === config.id);
  const groups = allGroups.filter((g) => g.weddingId === config.id);
  const code = searchParams.get(INVITE_PARAM) ?? "";
  const invitee = personalized && code ? findInviteeByCode(code, guests, groups) : null;
  const isOwner = Boolean(sessionEmail && config.ownerEmail && sessionEmail.toLowerCase() === config.ownerEmail);
  const canLookUp = personalized && !isOwner && !invitee && config.inviteLookupEnabled !== false && guests.length + groups.length > 0;

  const setInvite = (next: string) => {
    const q = new URLSearchParams(searchParams.toString());
    if (next) q.set(INVITE_PARAM, next);
    else q.delete(INVITE_PARAM);
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      <PersonalizedTemplate config={config} invitee={invitee} showBranding />

      {canLookUp && (
        <FindInvitation key={code} guests={guests} groups={groups} onFound={setInvite} invalidCode={Boolean(code)} />
      )}

      {personalized && isOwner && (
        <div
          className="fixed bottom-6 left-6 flex max-w-[calc(100vw-7rem)] items-center gap-2 py-1.5 pl-4 pr-1.5 text-sm"
          style={{
            zIndex: "var(--z-sticky)",
            background: "rgba(24, 16, 20, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: "#fdf8f7",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 999,
          }}
        >
          <label htmlFor="view-as" className="shrink-0 text-xs">
            View as <span style={{ opacity: 0.7 }}>(only you see this)</span>
          </label>
          <ViewAsSelect
            id="view-as"
            guests={guests}
            groups={groups}
            value={invitee?.code ?? ""}
            onChange={setInvite}
            className="min-h-[36px] min-w-0 cursor-pointer truncate px-3 text-sm outline-none"
            style={{ background: "#fdf8f7", color: "#2c1c22", borderRadius: 999, maxWidth: 220 }}
          />
        </div>
      )}
    </>
  );
}

