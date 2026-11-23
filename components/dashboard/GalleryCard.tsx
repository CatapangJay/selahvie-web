"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { ExternalLink, Pencil, Plus, Users } from "lucide-react";
import { mix } from "@/lib/color";
import { weddingTheme } from "@/lib/weddingTheme";
import { TIER_INFO, configTier } from "@/lib/tiers";
import { countdownLabel, daysUntil, longDate, type GuestTally } from "@/lib/weddingOverview";
import type { WeddingConfig } from "@/types/wedding";
import type { WeddingTemplate } from "@/types/template";

interface Props {
  config: WeddingConfig;
  template: WeddingTemplate;
  coupleLabel: string;
  tally: GuestTally;
}

/**
 * A website in the gallery, dressed as a little invitation in the couple's own
 * theme: their palette, their serif and their photo, with a hairline frame like
 * a printed card. Status and guests stay in plain product language underneath.
 */
export default function GalleryCard({ config, template, coupleLabel, tally }: Props) {
  const theme = useMemo(() => weddingTheme(config), [config]);
  const published = config.status === "published";
  const photo = config.heroImageUrl?.trim() || template.previewImage;
  const [photoOk, setPhotoOk] = useState(true);
  const toGo = countdownLabel(config.weddingDate);
  const upcoming = (daysUntil(config.weddingDate) ?? -1) >= 0;
  const siteHref = `/wedding/${config.slug || config.id}`;

  // The theme as variables so hover and focus states can use it from class names.
  const vars = {
    "--gc-bg": theme.background,
    "--gc-ink": theme.ink,
    "--gc-ink2": theme.inkVariant,
    "--gc-primary": theme.primary,
    "--gc-on-primary": theme.onPrimary,
    "--gc-outline": theme.outline,
    "--gc-card": theme.card,
    "--gc-link": theme.link,
    "--gc-hover": mix(theme.card, theme.ink, 0.06),
    // The app's global focus ring reads --color-primary; inside the card it uses the couple's
    // link colour, which holds 4.5:1 on their background (light or dark palettes alike).
    "--color-primary": theme.link,
  } as CSSProperties;

  return (
    <li
      className="group flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(47,30,38,0.45)] motion-reduce:hover:translate-y-0"
      style={{ ...vars, background: theme.background, color: theme.ink, border: `1px solid ${theme.outline}`, borderRadius: "var(--radius-lg)" }}
    >
      {/* Template fonts that the app doesn't already load. React dedupes identical stylesheets. */}
      {theme.fontsHref && <link rel="stylesheet" href={theme.fontsHref} precedence="default" />}

      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: theme.surface }}>
        {photoOk && (
          // eslint-disable-next-line @next/next/no-img-element -- the couple's own upload, any host
          <img
            src={photo}
            alt=""
            onError={() => setPhotoOk(false)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
            style={config.heroImageUrl ? undefined : { opacity: 0.8 }}
          />
        )}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
          style={{
            borderRadius: "var(--radius-full)",
            background: published ? "var(--color-success)" : "rgba(253,248,247,0.94)",
            color: published ? "#fff" : "var(--color-on-surface)",
            boxShadow: "0 2px 8px rgba(20,8,12,0.18)",
          }}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: published ? "#fff" : "var(--color-on-surface-variant)" }} />
          {published ? "Live" : "Draft"}
        </span>
      </div>

      {/* The printed card */}
      <div className="flex flex-1 flex-col p-3">
        <div
          className="flex flex-1 flex-col items-center px-4 pb-4 pt-5 text-center"
          style={{ border: `1px solid ${theme.outline}`, borderRadius: "calc(var(--radius-lg) - 0.5rem)" }}
        >
          <p className="text-xs" style={{ color: theme.inkVariant }}>
            {config.weddingDate ? longDate(config.weddingDate) : "Date to be set"}
          </p>
          <h3
            className="mt-1.5 text-[1.5rem] leading-[1.15]"
            style={{ fontFamily: theme.serif, fontWeight: 400, color: theme.ink, textWrap: "balance" }}
          >
            {coupleLabel}
          </h3>
          {toGo && (
            <p className="mt-1 text-sm font-medium" style={{ color: upcoming ? theme.link : theme.inkVariant }}>
              {toGo}
            </p>
          )}

          {/* A small rule with a dot, the way an invitation separates its lines */}
          <div aria-hidden className="my-4 flex w-24 items-center gap-2">
            <span className="h-px flex-1" style={{ background: theme.line }} />
            <span className="h-1 w-1 rounded-full" style={{ background: theme.line }} />
            <span className="h-px flex-1" style={{ background: theme.line }} />
          </div>

          {tally.invitations > 0 ? (
            <div className="w-full max-w-[15rem]">
              <p className="text-sm" style={{ color: theme.ink }}>
                <span className="font-semibold tabular-nums">{tally.attending}</span>
                <span style={{ color: theme.inkVariant }}> of {tally.people} coming</span>
                {tally.waiting > 0 && <span style={{ color: theme.inkVariant }}> · {tally.waiting} to reply</span>}
                {tally.declined > 0 && <span style={{ color: theme.inkVariant }}> · {tally.declined} declined</span>}
              </p>
              <div
                aria-hidden
                className="mt-2 flex h-1.5 overflow-hidden"
                style={{ background: mix(theme.background, theme.ink, 0.1), borderRadius: "var(--radius-full)" }}
              >
                <span style={{ flexGrow: tally.attending, background: theme.line }} />
                <span style={{ flexGrow: tally.declined, background: mix(theme.inkVariant, theme.background, 0.45) }} />
                <span style={{ flexGrow: tally.waiting }} />
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: theme.inkVariant }}>No guests yet</p>
          )}

          <p className="mt-auto pt-4 text-[0.6875rem]" style={{ color: theme.inkVariant }}>
            {template.name} · {TIER_INFO[configTier(config)].label} plan
          </p>
        </div>
      </div>

      {/* Actions, in the couple's colours */}
      <div className="flex gap-2 px-3 pb-3">
        <Link
          href={`/dashboard/manage/${config.id}?tab=guests`}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 px-3 text-sm font-medium transition-[filter] duration-150 hover:brightness-[0.92]"
          style={{ background: theme.primary, color: theme.onPrimary, borderRadius: "var(--radius-sm)" }}
        >
          <Users size={15} aria-hidden />
          Guests
        </Link>
        <Link
          href={`/dashboard/customize/${config.id}`}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 px-3 text-sm font-medium transition-colors duration-150 hover:bg-[var(--gc-hover)]"
          style={{ background: theme.card, color: theme.ink, border: `1px solid ${theme.outline}`, borderRadius: "var(--radius-sm)" }}
        >
          <Pencil size={14} aria-hidden />
          Customize
        </Link>
        <Link
          href={siteHref}
          target="_blank"
          rel="noopener"
          aria-label={`${published ? "View" : "Preview"} ${coupleLabel}'s website (opens in a new tab)`}
          title={published ? "View site" : "Preview"}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center transition-colors duration-150 hover:bg-[var(--gc-hover)]"
          style={{ background: theme.card, color: theme.ink, border: `1px solid ${theme.outline}`, borderRadius: "var(--radius-sm)" }}
        >
          <ExternalLink size={15} aria-hidden />
        </Link>
      </div>
    </li>
  );
}

/** The last tile: a quiet way to start another website. */
export function AddWebsiteTile() {
  return (
    <li>
      <Link
        href="/templates"
        className="flex h-full min-h-[18rem] flex-col items-center justify-center gap-3 p-6 text-center transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
        style={{ border: "1px dashed var(--color-outline)", borderRadius: "var(--radius-lg)", color: "var(--color-on-surface-variant)" }}
      >
        <span
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--color-primary-container-strong)", color: "var(--color-primary)" }}
        >
          <Plus size={22} strokeWidth={2} />
        </span>
        <span className="text-base font-semibold" style={{ color: "var(--color-on-surface)" }}>Start another website</span>
        <span className="max-w-[16rem] text-sm leading-relaxed">For a second celebration, an engagement party, or a fresh look.</span>
      </Link>
    </li>
  );
}
