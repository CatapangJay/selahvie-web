"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, MailCheck } from "lucide-react";
import { useWeddingStore } from "@/store/weddingStore";
import { templates } from "@/data/templates";
import GuestListManager from "@/components/manage/GuestListManager";
import RsvpDashboard from "@/components/manage/RsvpDashboard";

interface Props {
  params: { id: string };
}

type Tab = "rsvps" | "guests";

export default function ManageWeddingPage({ params }: Props) {
  const config = useWeddingStore((s) => s.getConfig)(params.id);
  const summary = useWeddingStore((s) => s.getRsvpSummary)(params.id);
  const guestCount = useWeddingStore((s) => s.guests).filter((g) => g.weddingId === params.id).length;

  const [tab, setTab] = useState<Tab>("rsvps");

  if (!config) notFound();

  const template = templates.find((t) => t.id === config.templateId);
  const coupleLabel =
    config.partner1Name && config.partner2Name
      ? `${config.partner1Name} & ${config.partner2Name}`
      : template?.name ?? "Your wedding";

  const tabs: { id: Tab; label: string; icon: typeof Users; badge: number }[] = [
    { id: "rsvps", label: "RSVPs", icon: MailCheck, badge: summary.total },
    { id: "guests", label: "Guest list", icon: Users, badge: guestCount },
  ];

  return (
    <div
      className="mx-auto max-w-5xl px-6"
      style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}
    >
      <Link
        href="/dashboard"
        className="mb-10 inline-flex items-center gap-2 label-luxury transition-opacity hover:opacity-70"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>
        Guests &amp; RSVPs
      </p>
      <h1 className="headline-md" style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}>
        {coupleLabel}
      </h1>
      {config.status === "draft" && (
        <p className="mt-3 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
          This website is still a draft. Publish it from your dashboard so guests can find it and RSVP.
        </p>
      )}

      {/* Tabs */}
      <div
        className="mt-10 mb-10 flex gap-1"
        style={{ borderBottom: "1px solid var(--color-outline)" }}
        role="tablist"
        aria-label="Guests and RSVPs"
      >
        {tabs.map(({ id, label, icon: Icon, badge }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className="relative -mb-px flex min-h-[44px] items-center gap-2 px-4 py-2.5 text-sm transition-colors"
              style={{
                color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                borderBottom: `2px solid ${active ? "var(--color-primary)" : "transparent"}`,
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={15} />
              {label}
              {badge > 0 && (
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center px-1 text-xs"
                  style={{
                    background: active ? "var(--color-primary-container-strong)" : "var(--color-surface-container-high)",
                    color: active ? "var(--color-primary-dim)" : "var(--color-on-surface-muted)",
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

      {tab === "rsvps" ? (
        <RsvpDashboard weddingId={config.id} />
      ) : (
        <GuestListManager weddingId={config.id} coupleLabel={coupleLabel} />
      )}
    </div>
  );
}
