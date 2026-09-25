"use client";

import { useWeddingStore } from "@/store/weddingStore";
import { templates } from "@/data/templates";
import Link from "next/link";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import WebsiteCard from "@/components/dashboard/WebsiteCard";
import { useHydrated } from "@/lib/useHydrated";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const configs = useWeddingStore((s) => s.configs);
  const rsvps = useWeddingStore((s) => s.rsvps);
  const hydrated = useHydrated();
  const account = useAuthStore((s) => s.currentAccount)();

  // Show only the signed-in account's purchases. Legacy configs created before
  // ownership existed (no ownerEmail) fall back to visible so nothing is orphaned.
  const configList = Object.values(configs).filter(
    (c) => !c.ownerEmail || c.ownerEmail === account?.email
  );
  const ownedIds = new Set(configList.map((c) => c.id));

  // Aggregate glance across this account's websites.
  const totalAttending = rsvps.filter((r) => r.attending && ownedIds.has(r.weddingId)).length;
  const publishedCount = configList.filter((c) => c.status === "published").length;
  const firstName = account?.name?.split(" ")[0];

  return (
    <div
      className="mx-auto max-w-7xl px-6"
      style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}
    >
      <div className="mb-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>
            {hydrated && firstName ? `Welcome back, ${firstName}` : "Your account"}
          </p>
          <h1 className="headline-md" style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}>Dashboard</h1>
          {hydrated && configList.length > 0 && (
            <p className="mt-3 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
              {configList.length} {configList.length === 1 ? "website" : "websites"}
              {publishedCount > 0 && <> · {publishedCount} published</>}
              {totalAttending > 0 && <> · <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>{totalAttending}</span> guests attending</>}
            </p>
          )}
        </div>
        <Link href="/templates">
          <ButtonSecondary size="sm">Add a template</ButtonSecondary>
        </Link>
      </div>

      {!hydrated ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 w-full" rounded="md" />
          ))}
        </div>
      ) : configList.length === 0 ? (
        <EmptyState
          glyph="∅"
          title="No websites yet"
          body="Browse our template gallery, pick the one that matches your vision, and purchase to get started. Once it's yours, you'll customize it and manage RSVPs right here."
          actionLabel="Browse templates"
          actionHref="/templates"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {configList.map((config) => {
            const template = templates.find((t) => t.id === config.templateId);
            if (!template) return null;
            return <WebsiteCard key={config.id} config={config} template={template} />;
          })}
        </div>
      )}
    </div>
  );
}
