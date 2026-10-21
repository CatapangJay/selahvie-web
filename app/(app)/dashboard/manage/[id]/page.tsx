"use client";

import { useEffect, useState, use, type KeyboardEvent } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Users, MailCheck, Sparkles, Lock, Armchair, ExternalLink, Pencil } from "lucide-react";
import { useWeddingStore } from "@/store/weddingStore";
import { useCartStore } from "@/store/cartStore";
import { useOwnedConfig } from "@/lib/useOwnedConfig";
import { templates } from "@/data/templates";
import Skeleton from "@/components/ui/Skeleton";
import GuestListManager from "@/components/manage/GuestListManager";
import RsvpDashboard from "@/components/manage/RsvpDashboard";
import PersonalizationEditor from "@/components/manage/PersonalizationEditor";
import SeatingPlanner from "@/components/manage/SeatingPlanner";

interface Props {
  params: Promise<{ id: string }>;
}

type Tab = "rsvps" | "guests" | "seating" | "personalize";
const TABS: readonly Tab[] = ["rsvps", "guests", "seating", "personalize"];

const HEADER_ACTION =
  "btn-outline inline-flex min-h-[40px] items-center justify-center gap-2 px-4 text-sm";

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
      e.key === "ArrowRight" ? TABS[(i + 1) % TABS.length]
      : e.key === "ArrowLeft" ? TABS[(i - 1 + TABS.length) % TABS.length]
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
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-14">
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
  const personalized = config.tier === "personalized";

  const handleUpgrade = () => {
    addUpgrade(config.id, template ?? templates[0], coupleLabel);
    router.push("/checkout");
  };

  const tabs: { id: Tab; label: string; icon: typeof Users; badge: number; locked?: boolean }[] = [
    { id: "rsvps", label: "RSVPs", icon: MailCheck, badge: rsvpCount },
    { id: "guests", label: "Guest list", icon: Users, badge: guestCount },
    { id: "seating", label: "Seating", icon: Armchair, badge: config.seatingPlan?.tables.length ?? 0, locked: !personalized },
    { id: "personalize", label: "Personalize", icon: Sparkles, badge: 0, locked: !personalized },
  ];

  const published = config.status === "published";
  const meta = [
    config.weddingDate ? formatWeddingDate(config.weddingDate) : null,
    config.venueName?.trim() || null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-14">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1
            className="text-[1.75rem] leading-tight sm:text-[2.125rem]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--color-on-surface)", textWrap: "balance" }}
          >
            {coupleLabel}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium"
              style={{
                borderRadius: "var(--radius-full)",
                background: published ? "rgba(63, 119, 77, 0.1)" : "var(--color-surface-container-high)",
                color: published ? "var(--color-success)" : "var(--color-on-surface-variant)",
              }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5"
                style={{ borderRadius: "var(--radius-full)", background: "currentColor" }}
              />
              {published ? "Published" : "Draft"}
            </span>
            {meta.map((m) => (
              <span key={m} className="inline-flex items-center gap-2">
                <span aria-hidden style={{ color: "var(--color-outline)" }}>·</span>
                {m}
              </span>
            ))}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/dashboard/customize/${config.id}`}
            className={HEADER_ACTION}
            style={{ borderRadius: "var(--radius-sm)", letterSpacing: "normal" }}
          >
            <Pencil size={14} aria-hidden />
            Edit website
          </Link>
          <Link
            href={`/wedding/${config.slug || config.id}`}
            target="_blank"
            rel="noopener"
            className={HEADER_ACTION}
            style={{ borderRadius: "var(--radius-sm)", letterSpacing: "normal" }}
          >
            <ExternalLink size={14} aria-hidden />
            {published ? "View site" : "Preview"}
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
        </div>
      </header>

      {!published && (
        <p
          className="mt-6 px-4 py-3 text-sm"
          style={{
            background: "var(--color-surface-container-low)",
            border: "1px solid var(--color-outline)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-on-surface-variant)",
          }}
        >
          Guests can&apos;t find this website or RSVP until it&apos;s published.{" "}
          <Link
            href={`/dashboard/customize/${config.id}?step=publish`}
            className="font-medium underline underline-offset-4 hover:text-[var(--color-primary)]"
            style={{ color: "var(--color-primary-dim)" }}
          >
            Review and publish
          </Link>
        </p>
      )}

      {/* Tabs */}
      <div
        className="mt-8 mb-10 flex gap-1 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--color-outline)" }}
        role="tablist"
        aria-label="Manage guests"
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
              className="relative -mb-px flex min-h-[44px] shrink-0 items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:text-[var(--color-on-surface)]"
              style={{
                color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                borderBottom: `2px solid ${active ? "var(--color-primary)" : "transparent"}`,
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={15} aria-hidden />
              {label}
              {locked && <Lock size={12} aria-label="Locked on Base plan" />}
              {badge > 0 && (
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-xs tabular-nums"
                  style={{
                    background: active ? "var(--color-primary-container-strong)" : "var(--color-surface-container-high)",
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

      <div id="manage-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "rsvps" ? (
          <RsvpDashboard weddingId={config.id} />
        ) : tab === "guests" ? (
          <GuestListManager
            weddingId={config.id}
            coupleLabel={coupleLabel}
            personalized={personalized}
            siteSlug={config.slug || config.id}
            onUpgrade={handleUpgrade}
          />
        ) : tab === "seating" ? (
          <SeatingPlanner
            config={config}
            coupleLabel={coupleLabel}
            onUpgrade={handleUpgrade}
            onOpenGuests={() => openTab("guests")}
          />
        ) : (
          <PersonalizationEditor config={config} onUpgrade={handleUpgrade} onOpenGuests={() => openTab("guests")} />
        )}
      </div>
    </div>
  );
}
