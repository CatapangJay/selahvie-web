"use client";
import { Suspense, use, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getDemoConfigBySlug } from "@/data/demoConfigs";
import PersonalizedTemplate from "@/components/wedding-templates/_shared/PersonalizedTemplate";
import FindInvitation from "@/components/wedding-templates/_shared/FindInvitation";
import ViewAsSelect from "@/components/wedding-templates/_shared/ViewAsSelect";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import Link from "next/link";
import { INVITE_PARAM, findInviteeByCode, isPersonalized, type FindResult } from "@/lib/invitations";
import { supabaseGuestMatcher } from "@/lib/db/matcher";
import type { SiteResponse } from "@/lib/db/site";
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

type Loaded =
  | { kind: "ok"; slug: string; code: string; data: SiteResponse }
  | { kind: "missing" | "error"; slug: string; code: string };

function WeddingSite({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const code = searchParams.get(INVITE_PARAM) ?? "";
  // "/wedding/demo" keeps the original Rosé Elegy showcase; bespoke template
  // demos (obsidian-demo, enchanted-demo, …) resolve by slug.
  const demoConfig: WeddingConfig | undefined = slug === "demo" ? DEMO_CONFIG : getDemoConfigBySlug(slug);
  const isDemo = Boolean(demoConfig);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const current = loaded?.slug === slug ? loaded : null;
  // The owner resolves "View as" locally, so switching guests doesn't refetch.
  const isOwner = current?.kind === "ok" && current.data.isOwner;
  const fetchCode = isOwner ? "" : code;

  useEffect(() => {
    if (isDemo) return;
    let cancelled = false;
    const query = fetchCode ? `?${INVITE_PARAM}=${encodeURIComponent(fetchCode)}` : "";
    fetch(`/api/sites/${encodeURIComponent(slug)}${query}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setLoaded({ kind: res.status === 404 ? "missing" : "error", slug, code: fetchCode });
          return;
        }
        const data = (await res.json()) as SiteResponse;
        if (!cancelled) setLoaded({ kind: "ok", slug, code: fetchCode, data });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ kind: "error", slug, code: fetchCode });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, fetchCode, isDemo]);

  const setInvite = useCallback(
    (next: string) => {
      const q = new URLSearchParams(searchParams.toString());
      if (next) q.set(INVITE_PARAM, next);
      else q.delete(INVITE_PARAM);
      const qs = q.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  if (demoConfig) return <PersonalizedTemplate config={demoConfig} invitee={null} showBranding />;

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy="true">
        <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (current.kind !== "ok") {
    const missing = current.kind === "missing";
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-4xl mb-4">{missing ? "🔍" : "☁️"}</p>
        <h1 className="headline-sm mb-4">{missing ? "Wedding site not found" : "We couldn’t load this website"}</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
          {missing
            ? "This wedding website hasn’t been published yet, or the link may be incorrect."
            : "Check your connection and try again."}
        </p>
        {missing ? (
          <Link href="/templates">
            <ButtonSecondary>Create Your Own</ButtonSecondary>
          </Link>
        ) : (
          <ButtonSecondary onClick={() => window.location.reload()}>Try again</ButtonSecondary>
        )}
      </div>
    );
  }

  return <LiveSite data={current.data} code={code} codeChecked={current.code === code} setInvite={setInvite} />;
}

interface LiveSiteProps {
  data: SiteResponse;
  code: string;
  /** The server has resolved `code` (so a missing invitee means the code is wrong). */
  codeChecked: boolean;
  setInvite: (code: string) => void;
}

function LiveSite({ data, code, codeChecked, setInvite }: LiveSiteProps) {
  const { config, isOwner, hasInvitees } = data;
  const personalized = isPersonalized(config);
  const guests = useMemo(() => data.guests ?? [], [data.guests]);
  const groups = useMemo(() => data.groups ?? [], [data.groups]);
  // The owner has the guest list; visitors get the invitee the server resolved.
  const invitee = isOwner ? (personalized && code ? findInviteeByCode(code, guests, groups) : null) : data.invitee;
  const visitorMatcher = useMemo(
    () => (!isOwner && hasInvitees ? supabaseGuestMatcher(config.id) : null),
    [isOwner, hasInvitees, config.id]
  );
  const canLookUp = personalized && !isOwner && !invitee && config.inviteLookupEnabled !== false && hasInvitees;

  const find = useCallback(
    async (query: string, step: "lookup" | "code"): Promise<FindResult> => {
      const res = await fetch(`/api/sites/${config.id}/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, step }),
      });
      if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
      return (await res.json()) as FindResult;
    },
    [config.id]
  );

  return (
    <>
      <PersonalizedTemplate
        config={config}
        invitee={invitee}
        guests={isOwner ? guests : undefined}
        matcher={isOwner ? undefined : visitorMatcher}
        showBranding
      />

      {canLookUp && (
        <FindInvitation key={code} find={find} onFound={setInvite} invalidCode={Boolean(code) && codeChecked} />
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
            className="min-w-0"
            style={{ background: "#fdf8f7", color: "#2c1c22", maxWidth: 220 }}
          />
        </div>
      )}
    </>
  );
}

