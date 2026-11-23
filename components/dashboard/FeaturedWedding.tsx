"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ExternalLink, MapPin, Pencil, Users } from "lucide-react";
import GuestBar, { TallyLegend } from "@/components/dashboard/GuestBar";
import { TIER_INFO, configTier } from "@/lib/tiers";
import { countdownLabel, daysUntil, longDate, type GuestTally } from "@/lib/weddingOverview";
import type { WeddingConfig } from "@/types/wedding";
import type { WeddingTemplate } from "@/types/template";

interface Props {
  config: WeddingConfig;
  template: WeddingTemplate;
  coupleLabel: string;
  tally: GuestTally;
  replies: number;
}

/**
 * The wedding coming up next, given the room: its photo, the countdown, who's
 * coming, and the three things a couple does most (guests, edit, view).
 */
export default function FeaturedWedding({ config, template, coupleLabel, tally, replies }: Props) {
  const published = config.status === "published";
  const photo = config.heroImageUrl?.trim() || template.previewImage;
  const [photoOk, setPhotoOk] = useState(true);
  const toGo = countdownLabel(config.weddingDate);
  const upcoming = (daysUntil(config.weddingDate) ?? -1) >= 0;
  const siteHref = `/wedding/${config.slug || config.id}`;

  return (
    <article
      aria-labelledby={`featured-${config.id}`}
      className="grid overflow-hidden md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-lg)" }}
    >
      <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[20rem]" style={{ background: "var(--color-surface-container)" }}>
        {photoOk && (
          // eslint-disable-next-line @next/next/no-img-element -- the couple's own upload, any host
          <img
            src={photo}
            alt=""
            onError={() => setPhotoOk(false)}
            className="absolute inset-0 h-full w-full object-cover"
            style={config.heroImageUrl ? undefined : { opacity: 0.75 }}
          />
        )}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
          style={{
            borderRadius: "var(--radius-full)",
            background: published ? "var(--color-success)" : "rgba(253,248,247,0.92)",
            color: published ? "#fff" : "var(--color-on-surface)",
          }}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: published ? "#fff" : "var(--color-on-surface-variant)" }} />
          {published ? "Live" : "Draft"}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div>
          {toGo && (
            <p className="text-sm font-semibold" style={{ color: upcoming ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)" }}>
              {toGo}
            </p>
          )}
          <h2
            id={`featured-${config.id}`}
            className="mt-1 text-[1.75rem] leading-[1.1] sm:text-[2.125rem]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em", color: "var(--color-on-surface)", textWrap: "balance" }}
          >
            {coupleLabel}
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            {config.weddingDate ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden />
                {longDate(config.weddingDate)}
              </span>
            ) : (
              <Link href={`/dashboard/customize/${config.id}`} className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4" style={{ color: "var(--color-primary-dim)" }}>
                <CalendarDays size={14} aria-hidden />
                Add your date
              </Link>
            )}
            {config.venueName?.trim() && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin size={14} aria-hidden />
                <span className="truncate">{config.venueName}</span>
              </span>
            )}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            {template.name} · {TIER_INFO[configTier(config)].label} plan
          </p>
        </div>

        <div className="space-y-2.5">
          {tally.invitations > 0 ? (
            <>
              <p className="text-sm" style={{ color: "var(--color-on-surface)" }}>
                <span className="font-semibold tabular-nums">{tally.people}</span> {tally.people === 1 ? "person" : "people"} invited
                {replies > 0 && (
                  <span style={{ color: "var(--color-on-surface-variant)" }}>
                    {" "}· {replies} {replies === 1 ? "reply" : "replies"} on the website
                  </span>
                )}
              </p>
              <GuestBar tally={tally} />
              <TallyLegend tally={tally} />
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              No guests yet. Add your list to track who&rsquo;s coming.
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <Link
            href={`/dashboard/manage/${config.id}?tab=guests`}
            className="btn-primary inline-flex min-h-[44px] items-center gap-2 px-4 text-sm"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <Users size={15} aria-hidden />
            {tally.invitations > 0 ? "Manage guests" : "Add guests"}
          </Link>
          <Link
            href={`/dashboard/customize/${config.id}`}
            className="btn-outline inline-flex min-h-[44px] items-center gap-2 px-4 text-sm"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <Pencil size={14} aria-hidden />
            Edit website
          </Link>
          <Link
            href={siteHref}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-[44px] items-center gap-2 px-3 text-sm font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--color-primary-dim)" }}
          >
            <ExternalLink size={14} aria-hidden />
            {published ? "View site" : "Preview"}
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
