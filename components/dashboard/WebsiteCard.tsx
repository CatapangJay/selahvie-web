"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Pencil, Users } from "lucide-react";
import GuestBar from "@/components/dashboard/GuestBar";
import { TIER_INFO, configTier } from "@/lib/tiers";
import { countdownLabel, longDate, type GuestTally } from "@/lib/weddingOverview";
import type { WeddingConfig } from "@/types/wedding";
import type { WeddingTemplate } from "@/types/template";

interface Props {
  config: WeddingConfig;
  template: WeddingTemplate;
  coupleLabel: string;
  tally: GuestTally;
}

/** One website in the "All websites" list: thumbnail, names, state, guests, and its actions. */
export default function WebsiteCard({ config, template, coupleLabel, tally }: Props) {
  const published = config.status === "published";
  const photo = config.heroImageUrl?.trim() || template.previewImage;
  const [photoOk, setPhotoOk] = useState(true);
  const when = [longDate(config.weddingDate), countdownLabel(config.weddingDate)].filter(Boolean).join(" · ");

  return (
    <li
      className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 p-3 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:p-4"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ borderRadius: "var(--radius-sm)", background: "var(--color-surface-container)" }}>
        {photoOk && (
          // eslint-disable-next-line @next/next/no-img-element -- the couple's own upload, any host
          <img src={photo} alt="" onError={() => setPhotoOk(false)} className="h-full w-full object-cover" style={config.heroImageUrl ? undefined : { opacity: 0.75 }} />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-[1.125rem] leading-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--color-on-surface)" }}>
            {coupleLabel}
          </h3>
          <span
            className="shrink-0 px-2 py-0.5 text-[0.6875rem] font-medium"
            style={{
              borderRadius: "var(--radius-full)",
              background: published ? "#E6F0E8" : "var(--color-surface-container-high)",
              color: published ? "#2F5E3B" : "var(--color-on-surface-variant)",
            }}
          >
            {published ? "Live" : "Draft"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
          {when || "No date yet"} · {template.name} · {TIER_INFO[configTier(config)].label}
        </p>
        {tally.invitations > 0 ? (
          <div className="mt-2 flex items-center gap-3">
            <div className="w-28 shrink-0 sm:w-36">
              <GuestBar tally={tally} size="sm" />
            </div>
            <p className="truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
              <span className="font-semibold" style={{ color: "var(--color-on-surface)" }}>{tally.attending}</span> of {tally.people} coming
            </p>
          </div>
        ) : (
          <p className="mt-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>No guests yet</p>
        )}
      </div>

      <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
        <Link
          href={`/dashboard/manage/${config.id}?tab=guests`}
          className="btn-outline inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 px-3 text-sm sm:flex-none"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <Users size={14} aria-hidden />
          Guests
        </Link>
        <Link
          href={`/dashboard/customize/${config.id}`}
          className="btn-outline inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 px-3 text-sm sm:flex-none"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <Pencil size={13} aria-hidden />
          Customize
        </Link>
        <Link
          href={`/wedding/${config.slug || config.id}`}
          target="_blank"
          rel="noopener"
          aria-label={`${published ? "View" : "Preview"} ${coupleLabel}'s website (opens in a new tab)`}
          title={published ? "View site" : "Preview"}
          className="btn-outline inline-flex h-10 w-10 items-center justify-center"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <ExternalLink size={14} aria-hidden />
        </Link>
      </div>
    </li>
  );
}
