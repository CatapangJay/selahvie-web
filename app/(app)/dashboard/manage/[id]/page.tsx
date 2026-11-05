"use client";

import { useEffect, useState, use, type KeyboardEvent } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Users, MailCheck, Sparkles, Lock, Armchair, ExternalLink, Pencil, QrCode, CalendarDays, MapPin, EyeOff, ChevronLeft } from "lucide-react";
import { useWeddingStore } from "@/store/weddingStore";
import { useCartStore } from "@/store/cartStore";
import { useOwnedConfig } from "@/lib/useOwnedConfig";
import { templates } from "@/data/templates";
import { configTier, hasModule, upgradePrice } from "@/lib/tiers";
import type { Tier } from "@/types/wedding";
import Skeleton from "@/components/ui/Skeleton";
import GuestListManager from "@/components/manage/GuestListManager";
import RsvpDashboard from "@/components/manage/RsvpDashboard";
import PersonalizationEditor from "@/components/manage/PersonalizationEditor";
import SeatingPlanner from "@/components/manage/SeatingPlanner";
import ShareKit from "@/components/manage/ShareKit";
import SmsInvites from "@/components/manage/SmsInvites";

interface Props {
  params: Promise<{ id: string }>;
}

type Tab = "rsvps" | "guests" | "seating" | "personalize" | "share";
const TABS: readonly Tab[] = ["rsvps", "guests", "seating", "personalize", "share"];

const HEADER_ACTION = "inline-flex min-h-[40px] items-center justify-center gap-2 px-4 text-sm font-medium transition-colors";


/** "2027-06-14" → "June 14, 2027", read as a local date (not UTC midnight). */
const formatWeddingDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function ManageWeddingPage(props: Props) {
  const params = use(props.params);
  const router = useRouter();
  const status = useWeddingStore((s) => s.status);
  const config = useOwnedConfig(params.id);
  const rsvpCount = useWeddingStore((s) => s.rsvps).filter((r) => r.weddingId === params.id).length;
  const guestCount = useWeddingStore((s) => s.guests).filter((g) => g.weddingId === params.id).length;
  const addUpgrade = useCartStore((s) => s.addUpgrade);

  // ?tab=guests lets other screens (e.g. the customize studio) deep-link here.
  const requestedTab = useSearchParams().get("tab");
  const [tab, setTab] = useState<Tab>(
    TABS.includes(requestedTab as Tab) ? (requestedTab as Tab) : "rsvps"
  );

  // Keep the open tab in the URL so a refresh or shared link lands on it.
  const openTab = (next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  };

  // Roving focus across the tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(tab);
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? TABS[(i + 1) % TABS.length]
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? TABS[(i - 1 + TABS.length) % TABS.length]
      : e.key === "Home" ? TABS[0]
      : e.key === "End" ? TABS[TABS.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    openTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  // Pick up RSVPs (and the guest statuses they update) that arrived since loading.
  useEffect(() => {
    if (useWeddingStore.getState().status === "ready") void useWeddingStore.getState().reload();
  }, []);

  if (status === "error") return null;
  if (status !== "ready") {
    return (
      <div className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-10 h-16 w-full max-w-md" rounded="md" />
        <Skeleton className="h-96 w-full" rounded="md" />
      </div>
    );
  }
  if (!config) notFound();

  const template = templates.find((t) => t.id === config.templateId);
  const coupleLabel =
    config.partner1Name && config.partner2Name
      ? `${config.partner1Name} & ${config.partner2Name}`
      : template?.name ?? "Your wedding";
  const tier = configTier(config);
  const personalized = hasModule(config, "personalization");

  const handleUpgrade = (to: Tier = "premium") => {
    addUpgrade(config.id, template ?? templates[0], coupleLabel, tier, to);
    router.push("/checkout");
  };

  const tabs: { id: Tab; label: string; icon: typeof Users; badge: number; locked?: boolean }[] = [
    { id: "rsvps", label: "RSVPs", icon: MailCheck, badge: rsvpCount },
    { id: "guests", label: "Guest list", icon: Users, badge: guestCount },
    { id: "seating", label: "Seating", icon: Armchair, badge: config.seatingPlan?.tables.length ?? 0, locked: !hasModule(config, "seating") },
    { id: "personalize", label: "Personalize", icon: Sparkles, badge: 0, locked: !personalized },
    { id: "share", label: "Share", icon: QrCode, badge: 0, locked: !hasModule(config, "qrCodes") },
  ];

  const published = config.status === "published";

  const seating = tab === "seating";

  return (
    <div className="lg:flex">
      {/* Sidebar: the manage sections. A scrolling strip on small screens. */}
      <aside
        className="shrink-0 lg:sticky lg:top-[65px] lg:flex lg:h-[calc(100dvh-65px)] lg:w-60 lg:flex-col"
        style={{ background: "var(--color-surface-container-low)", borderRight: "1px solid var(--color-outline)" }}
      >
        <Link
          href="/dashboard"
          className="hidden items-center gap-1.5 px-5 pb-2 pt-5 text-xs transition-colors hover:text-[var(--color-on-surface)] lg:flex"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <ChevronLeft size={14} aria-hidden /> All websites
        </Link>
        <div
          className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:py-1"
          role="tablist"
          aria-label="Manage"
          aria-orientation="vertical"
        >
          {tabs.map(({ id, label, icon: Icon, badge, locked }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls="manage-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => openTab(id)}
                onKeyDown={onTabKey}
                className="flex min-h-[40px] shrink-0 items-center gap-2.5 px-3 text-sm transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] lg:w-full"
                style={{
                  borderRadius: "var(--radius-sm)",
                  color: active ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                  background: active ? "var(--color-primary-container-strong)" : undefined,
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon size={16} aria-hidden />
                <span className="flex-1 text-left">{label}</span>
                {locked && <Lock size={12} aria-label="Comes with Premium" />}
                {badge > 0 && (
                  <span
                    className="inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-xs tabular-nums"
                    style={{
                      background: active ? "var(--color-surface-container-lowest)" : "var(--color-surface-container-high)",
                      color: active ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* The seating workspace fills the window exactly; other sections scroll as a page. */}
      <div className={`min-w-0 flex-1 ${seating ? "lg:flex lg:h-[calc(100dvh-65px)] lg:flex-col lg:overflow-hidden" : "pb-20"}`}>
        <header className="shrink-0" style={{ background: "var(--color-primary)", color: "#fff" }}>
          <div className={`flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 ${seating ? "py-4" : "py-6"}`}>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1
                  className={`leading-tight ${seating ? "text-[1.5rem]" : "text-[1.625rem] sm:text-[2rem]"}`}
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 400, textWrap: "balance" }}
                >
                  {coupleLabel}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium"
                  style={{ borderRadius: "var(--radius-full)", background: "rgb(255 255 255 / 0.16)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.28)" }}
                >
                  <span aria-hidden className="h-1.5 w-1.5" style={{ borderRadius: "var(--radius-full)", background: published ? "#BFE3C8" : "#fff" }} />
                  {published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                {config.weddingDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} aria-hidden className="opacity-80" />
                    {formatWeddingDate(config.weddingDate)}
                  </span>
                )}
                {config.venueName?.trim() && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <MapPin size={14} aria-hidden className="opacity-80" />
                    <span className="truncate">{config.venueName.trim()}</span>
                  </span>
                )}
                {!published && (
                  <span className="inline-flex items-center gap-1.5">
                    <EyeOff size={14} aria-hidden className="opacity-80" />
                    Guests can&apos;t see it yet.
                    <Link
                      href={`/dashboard/customize/${config.id}?step=publish`}
                      className="font-medium underline decoration-white/50 underline-offset-4 hover:decoration-white"
                    >
                      Review and publish
                    </Link>
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/dashboard/customize/${config.id}`}
                className={`${HEADER_ACTION} bg-white text-[var(--color-primary-dim)] hover:bg-[var(--color-surface-container-low)]`}
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                <Pencil size={14} aria-hidden />
                Edit website
              </Link>
              <Link
                href={`/wedding/${config.slug || config.id}`}
                target="_blank"
                rel="noopener"
                className={`${HEADER_ACTION} text-white hover:bg-white/10`}
                style={{ borderRadius: "var(--radius-sm)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.55)" }}
              >
                <ExternalLink size={14} aria-hidden />
                {published ? "View site" : "Preview"}
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </div>
          </div>
        </header>

        <div
          id="manage-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className={seating ? "flex min-h-0 flex-1 flex-col p-3 sm:p-4" : "mx-auto max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-8"}
        >
          {tab === "rsvps" ? (
            <RsvpDashboard weddingId={config.id} />
          ) : tab === "guests" ? (
            <GuestListManager
              weddingId={config.id}
              coupleLabel={coupleLabel}
              personalized={personalized}
              upgradeCents={upgradePrice(tier, "premium")}
              siteSlug={config.slug || config.id}
              onUpgrade={() => handleUpgrade()}
            />
          ) : tab === "seating" ? (
            <SeatingPlanner
              config={config}
              coupleLabel={coupleLabel}
              onUpgrade={() => handleUpgrade()}
              onOpenGuests={() => openTab("guests")}
            />
          ) : tab === "share" ? (
            <div className="space-y-12">
              <ShareKit config={config} onUpgrade={() => handleUpgrade()} />
              {hasModule(config, "sms") && <SmsInvites config={config} />}
            </div>
          ) : (
            <PersonalizationEditor config={config} onUpgrade={() => handleUpgrade()} onOpenGuests={() => openTab("guests")} />
          )}
        </div>
      </div>
    </div>
  );
}
