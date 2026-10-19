"use client";

import { useEffect } from "react";
import { useWeddingStore } from "@/store/weddingStore";
import { templates } from "@/data/templates";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import WebsiteCard from "@/components/dashboard/WebsiteCard";
import { useAuthStore } from "@/store/authStore";

const GETTING_STARTED = [
  { title: "Choose a template", body: "Browse the gallery and preview each design with your names." },
  { title: "Make it yours", body: "Add your story, photos, schedule and colors. No design skills needed." },
  { title: "Share it and watch RSVPs arrive", body: "Publish, send the link, and manage your guest list in one place." },
];

export default function DashboardPage() {
  const configs = useWeddingStore((s) => s.configs);
  const rsvps = useWeddingStore((s) => s.rsvps);
  const status = useWeddingStore((s) => s.status);
  const account = useAuthStore((s) => s.account);
  const ready = status === "ready";

  // Pick up RSVPs that arrived since the websites were loaded.
  useEffect(() => {
    if (useWeddingStore.getState().status === "ready") void useWeddingStore.getState().reload();
  }, []);

  // The store only holds this account's websites.
  const configList = Object.values(configs);

  // Aggregate glance across this account's websites.
  const totalAttending = rsvps.filter((r) => r.attending).length;
  const publishedCount = configList.filter((c) => c.status === "published").length;
  const rawFirst = account?.name?.split(" ")[0];
  const firstName = rawFirst ? rawFirst[0].toUpperCase() + rawFirst.slice(1) : "";
  const hasSites = ready && configList.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pt-14">
      <div
        className="mb-10 flex flex-col gap-5 pb-8 sm:flex-row sm:items-end sm:justify-between"
        style={{ borderBottom: "1px solid var(--color-outline)" }}
      >
        <div className="min-w-0">
          <h1
            className="text-[1.75rem] leading-tight sm:text-[2.125rem]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--color-on-surface)", textWrap: "balance" }}
          >
            {firstName ? `Welcome back, ${firstName}` : "Your dashboard"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            {!ready ? (
              "Gathering your websites…"
            ) : hasSites ? (
              <>
                {configList.length} {configList.length === 1 ? "website" : "websites"}
                {publishedCount > 0 && <> · {publishedCount} published</>}
                {totalAttending > 0 && (
                  <> · <span style={{ color: "var(--color-primary-dim)", fontWeight: 500 }}>{totalAttending}</span> guests attending</>
                )}
              </>
            ) : (
              "Your wedding website and guest list will live here."
            )}
          </p>
        </div>
        {hasSites && (
          <Link
            href="/templates"
            className="btn-outline inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 self-start px-4 text-sm sm:self-auto"
            style={{ borderRadius: "var(--radius-sm)", letterSpacing: "normal" }}
          >
            <Plus size={15} aria-hidden />
            Add a template
          </Link>
        )}
      </div>

      {status === "error" ? null : !ready ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 w-full" rounded="md" />
          ))}
        </div>
      ) : configList.length === 0 ? (
        <section
          aria-labelledby="getting-started"
          className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16"
          style={{
            background: "var(--color-surface-container-low)",
            border: "1px solid var(--color-outline)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div className="flex flex-col items-start">
            <h2
              id="getting-started"
              className="text-[1.5rem] leading-snug"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--color-on-surface)", textWrap: "balance" }}
            >
              Start with a template you love
            </h2>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              Every design can be previewed with your own names before you buy. Once it&apos;s yours, it appears here,
              ready to personalize and share.
            </p>
            <Link
              href="/templates"
              className="btn-primary mt-7 inline-flex min-h-[44px] items-center gap-2 px-5 text-sm"
              style={{ borderRadius: "var(--radius-sm)", letterSpacing: "normal" }}
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
                  style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", color: "var(--color-primary-dim)" }}
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
