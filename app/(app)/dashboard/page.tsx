"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useWeddingStore } from "@/store/weddingStore";
import { templates } from "@/data/templates";
import Link from "next/link";
import { ArrowRight, LayoutGrid, LayoutPanelLeft, Plus } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import WebsiteCard from "@/components/dashboard/WebsiteCard";
import FeaturedWedding from "@/components/dashboard/FeaturedWedding";
import NextSteps, { stepsFor } from "@/components/dashboard/NextSteps";
import RecentReplies from "@/components/dashboard/RecentReplies";
import GalleryCard, { AddWebsiteTile } from "@/components/dashboard/GalleryCard";
import { useAuthStore } from "@/store/authStore";
import { coupleLabelOf, daysUntil, featuredFirst, guestTally } from "@/lib/weddingOverview";
import { hasModule } from "@/lib/tiers";

const GETTING_STARTED = [
  { title: "Choose a template", body: "Browse the gallery and preview each design with your names." },
  { title: "Make it yours", body: "Add your story, photos, schedule and colors. No design skills needed." },
  { title: "Share it and watch RSVPs arrive", body: "Publish, send the link, and manage your guest list in one place." },
];

type View = "overview" | "gallery";
const VIEW_KEY = "bmg:dashboard-view";
/** Other tabs changing the saved view keep this one in step. */
const subscribeToView = (onChange: () => void) => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === VIEW_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
};
const storedView = (): View => {
  try {
    return window.localStorage.getItem(VIEW_KEY) === "gallery" ? "gallery" : "overview";
  } catch {
    return "overview";
  }
};

export default function DashboardPage() {
  const configs = useWeddingStore((s) => s.configs);
  const rsvps = useWeddingStore((s) => s.rsvps);
  const guests = useWeddingStore((s) => s.guests);
  const status = useWeddingStore((s) => s.status);
  const account = useAuthStore((s) => s.account);
  const ready = status === "ready";

  // Overview or gallery, remembered on this device. The server snapshot (overview) is used only
  // while hydrating; later visits in the same session read the saved choice on first paint.
  const saved = useSyncExternalStore(subscribeToView, storedView, () => "overview" as View);
  const [choice, setChoice] = useState<View | null>(null);
  const view: View = choice ?? saved;
  const chooseView = (next: View) => {
    setChoice(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Private mode: the choice still applies for this visit.
    }
  };

  // Pick up RSVPs that arrived since the websites were loaded.
  useEffect(() => {
    if (useWeddingStore.getState().status === "ready") void useWeddingStore.getState().reload();
  }, []);

  // The store only holds this account's websites. Websites whose template was retired are skipped.
  const sites = featuredFirst(Object.values(configs)).flatMap((config) => {
    const template = templates.find((t) => t.id === config.templateId);
    if (!template) return [];
    const own = guests.filter((g) => g.weddingId === config.id);
    return [
      {
        config,
        template,
        label: coupleLabelOf(config, template),
        tally: guestTally(own),
        replies: rsvps.filter((r) => r.weddingId === config.id).length,
      },
    ];
  });
  const several = sites.length > 1;
  const [featured, ...others] = sites;
  const publishedCount = sites.filter((s) => s.config.status === "published").length;

  const rawFirst = account?.name?.split(" ")[0];
  const firstName = rawFirst ? rawFirst[0].toUpperCase() + rawFirst.slice(1) : "";
  const hasSites = ready && sites.length > 0;

  // Websites are already soonest-first; keep that order, the two most urgent steps each, five in all.
  const steps = sites
    .flatMap((s) =>
      stepsFor({
        id: s.config.id,
        label: s.label,
        published: s.config.status === "published",
        hasDate: Boolean(s.config.weddingDate),
        hasPhoto: Boolean(s.config.heroImageUrl?.trim()),
        invitations: s.tally.invitations,
        waiting: s.tally.waiting,
        several,
        daysAway: daysUntil(s.config.weddingDate),
        personalized: hasModule(s.config, "personalization"),
      })
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 2)
    )
    .slice(0, 5);
  const labels: Record<string, string> = Object.fromEntries(sites.map((s) => [s.config.id, s.label]));
  // Only replies for websites listed here (a retired template's site is skipped above).
  const latest = rsvps
    .filter((r) => labels[r.weddingId])
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 6);

  // One plain sentence about the wedding that's next, instead of a wall of numbers.
  const days = featured ? daysUntil(featured.config.weddingDate) : null;
  const lede =
    featured && days !== null && days >= 0
      ? `${featured.label} is ${days === 0 ? "today" : days === 1 ? "tomorrow" : `${days.toLocaleString("en-US")} days away`}.` +
        (featured.tally.invitations === 0
          ? ""
          : featured.tally.attending + featured.tally.declined === 0
            ? ` ${featured.tally.people} ${featured.tally.people === 1 ? "person" : "people"} invited, no replies yet.`
            : ` ${featured.tally.attending} ${featured.tally.attending === 1 ? "person is" : "people are"} coming${featured.tally.waiting > 0 ? `, ${featured.tally.waiting} still to reply` : ""}.`)
      : "";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1
            className="text-[1.875rem] leading-tight sm:text-[2.375rem]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em", color: "var(--color-on-surface)", textWrap: "balance" }}
          >
            {firstName ? `Welcome back, ${firstName}` : "Your dashboard"}
          </h1>
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-on-surface-variant)", textWrap: "pretty" }}>
            {!ready ? (
              "Gathering your websites…"
            ) : hasSites ? (
              <>
                {lede && <span style={{ color: "var(--color-on-surface)" }}>{lede} </span>}
                {sites.length} {sites.length === 1 ? "website" : "websites"}
                {publishedCount > 0 && <>, {publishedCount} live</>}.
              </>
            ) : (
              "Your wedding website and guest list will live here."
            )}
          </p>
        </div>
        {hasSites && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ViewToggle view={view} onChange={chooseView} />
            <Link
              href="/templates"
              className="btn-outline inline-flex min-h-[44px] items-center justify-center gap-2 px-4 text-sm"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <Plus size={15} aria-hidden />
              <span className="sm:hidden">Add<span className="sr-only"> a template</span></span>
              <span className="hidden sm:inline">Add a template</span>
            </Link>
          </div>
        )}
      </header>

      {status === "error" ? null : !ready ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-[22rem] w-full" rounded="md" />
          <div className="space-y-6">
            <Skeleton className="h-56 w-full" rounded="md" />
            <Skeleton className="h-40 w-full" rounded="md" />
          </div>
        </div>
      ) : sites.length === 0 ? (
        <GettingStarted />
      ) : view === "gallery" ? (
        <ul aria-label="Your websites" className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr))]">
          {sites.map((s) => (
            <GalleryCard key={s.config.id} config={s.config} template={s.template} coupleLabel={s.label} tally={s.tally} />
          ))}
          <AddWebsiteTile />
        </ul>
      ) : (
        // Source order is the phone order: the next wedding, what to do, then the other websites.
        // On wide screens the updates column spans both rows beside them.
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-8 lg:gap-y-8">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <FeaturedWedding
              key={featured.config.id}
              config={featured.config}
              template={featured.template}
              coupleLabel={featured.label}
              tally={featured.tally}
              replies={featured.replies}
            />
          </div>
          <aside className="min-w-0 space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-label="Updates">
            <NextSteps steps={steps} />
            <RecentReplies replies={latest} labels={labels} several={several} />
          </aside>
          {others.length > 0 && (
            <section aria-labelledby="all-websites" className="min-w-0 pt-2 lg:col-start-1 lg:row-start-2 lg:pt-0">
              <h2 id="all-websites" className="mb-3 text-base font-semibold" style={{ color: "var(--color-on-surface)" }}>
                Your other websites
              </h2>
              <ul className="space-y-3">
                {others.map((s) => (
                  <WebsiteCard key={s.config.id} config={s.config} template={s.template} coupleLabel={s.label} tally={s.tally} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/** Overview (the next wedding and what to do) or Gallery (every website as a card). */
function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const options: { value: View; label: string; icon: typeof LayoutGrid }[] = [
    { value: "overview", label: "Overview", icon: LayoutPanelLeft },
    { value: "gallery", label: "Gallery", icon: LayoutGrid },
  ];
  return (
    <div
      role="group"
      aria-label="Dashboard view"
      className="inline-flex p-1"
      style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-sm)" }}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const on = view === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(value)}
            className="inline-flex min-h-[36px] items-center gap-1.5 px-3 text-sm transition-colors duration-150"
            style={{
              borderRadius: "calc(var(--radius-sm) - 1px)",
              background: on ? "var(--color-surface-container-lowest)" : "transparent",
              color: on ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
              fontWeight: on ? 600 : 400,
              boxShadow: on ? "0 1px 3px rgba(47,30,38,0.12)" : undefined,
            }}
          >
            <Icon size={15} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function GettingStarted() {
  return (
    <section
      aria-labelledby="getting-started"
      className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="flex flex-col items-start">
        <h2
          id="getting-started"
          className="text-[1.625rem] leading-snug"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.01em", color: "var(--color-on-surface)", textWrap: "balance" }}
        >
          Start with a template you love
        </h2>
        <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
          Every design can be previewed with your own names before you buy. Once it&apos;s yours, it appears here, ready to
          personalize and share.
        </p>
        <Link
          href="/templates"
          className="btn-primary mt-7 inline-flex min-h-[44px] items-center gap-2 px-5 text-sm"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          Browse templates
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <ol className="flex flex-col" aria-label="How it works">
        {GETTING_STARTED.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-4 py-5 first:pt-0 last:pb-0"
            style={{ borderTop: i === 0 ? undefined : "1px solid var(--color-outline)" }}
          >
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "var(--color-primary-container-strong)", color: "var(--color-primary-dim)" }}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
