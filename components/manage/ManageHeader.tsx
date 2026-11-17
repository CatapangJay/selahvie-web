"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, EyeOff, MapPin, Pencil } from "lucide-react";
import { mix } from "@/lib/color";
import { weddingTheme } from "@/lib/weddingTheme";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  coupleLabel: string;
  /** The seating workspace: the window doesn't scroll, so a shorter header and no sticky bar. */
  compact?: boolean;
}

/** Height of the app bar above (components/layout/AppHeader: h-16 + 1px border). */
const APP_BAR = 65;

/** "2027-06-14" → "June 14, 2027", read as a local date (not UTC midnight). */
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "214 days to go", "Tomorrow", "Today's the day"; nothing once it's passed. */
function countdown(iso?: string): string {
  if (!iso) return "";
  const day = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(day.getTime())) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "";
  if (days === 0) return "Today's the day";
  if (days === 1) return "Tomorrow";
  return `${days.toLocaleString("en-US")} days to go`;
}

const ACTION = "inline-flex items-center justify-center gap-2 font-medium transition-[background-color,filter] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--mh-primary)] focus-visible:ring-offset-[var(--mh-bg)]";

/**
 * The wedding at the top of the manage page, dressed in the couple's own theme:
 * their palette, their serif, and their hero photo fading in from the right.
 * Once it scrolls away, a slim bar with the names and the two actions stays on top.
 */
export default function ManageHeader({ config, coupleLabel, compact = false }: Props) {
  const theme = useMemo(() => weddingTheme(config), [config]);
  const published = config.status === "published";
  const photo = config.heroImageUrl?.trim() || "";
  const [photoOk, setPhotoOk] = useState(true);
  const showPhoto = Boolean(photo) && photoOk;
  const venue = config.venueName?.trim();
  const toGo = countdown(config.weddingDate);
  const siteHref = `/wedding/${config.slug || config.id}`;
  const editHref = `/dashboard/customize/${config.id}`;

  // The slim bar appears once the full header has scrolled under the app bar.
  const fullRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = fullRef.current;
    if (!el || compact) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      rootMargin: `-${APP_BAR}px 0px 0px 0px`,
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [compact]);

  // The theme as variables, so hover and focus states can use it from class names.
  const vars = {
    "--mh-bg": theme.background,
    "--mh-ink": theme.ink,
    "--mh-ink2": theme.inkVariant,
    "--mh-primary": theme.primary,
    "--mh-on-primary": theme.onPrimary,
    "--mh-outline": theme.outline,
    "--mh-card": theme.card,
    "--mh-hover": mix(theme.background, theme.ink, 0.07),
    "--mh-serif": theme.serif,
  } as CSSProperties;

  const status = (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium"
      style={{ borderRadius: "var(--radius-full)", background: theme.card, color: theme.ink, boxShadow: `inset 0 0 0 1px ${theme.outline}` }}
    >
      <span aria-hidden className="h-1.5 w-1.5" style={{ borderRadius: "var(--radius-full)", background: published ? "#3E9B5F" : theme.inkVariant }} />
      {published ? "Published" : "Draft"}
    </span>
  );

  const actions = (size: "md" | "sm") => {
    const box = size === "md" ? "min-h-[40px] px-4 text-sm" : "min-h-[36px] px-3 text-[0.8125rem]";
    return (
      <>
        <Link
          href={editHref}
          className={`${ACTION} ${box} hover:brightness-[0.92]`}
          style={{ borderRadius: "var(--radius-sm)", background: theme.primary, color: theme.onPrimary }}
        >
          <Pencil size={14} aria-hidden />
          Edit website
        </Link>
        <Link
          href={siteHref}
          target="_blank"
          rel="noopener"
          className={`${ACTION} ${box} hover:bg-[var(--mh-hover)]`}
          style={{ borderRadius: "var(--radius-sm)", color: theme.ink, background: theme.card, boxShadow: `inset 0 0 0 1px ${theme.outline}` }}
        >
          <ExternalLink size={14} aria-hidden />
          {published ? "View site" : "Preview"}
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </>
    );
  };

  return (
    <>
      {!compact && (
        // Takes no room in the page, so the content doesn't jump when the bar appears.
        <div className="sticky h-0" style={{ ...vars, top: APP_BAR, zIndex: "var(--z-dropdown)" }}>
          <div
            inert={!stuck}
            aria-hidden={!stuck}
            className="flex items-center gap-3 overflow-hidden px-4 py-2 sm:px-6 lg:px-8"
            style={{
              background: theme.background,
              color: theme.ink,
              borderBottom: `1px solid ${theme.outline}`,
              boxShadow: "0 10px 24px -18px rgb(23 18 26 / 0.45)",
              opacity: stuck ? 1 : 0,
              transform: stuck ? "translateY(0)" : "translateY(-8px)",
              pointerEvents: stuck ? undefined : "none",
              transition: "opacity 200ms cubic-bezier(0.25, 1, 0.5, 1), transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {showPhoto && (
              // eslint-disable-next-line @next/next/no-img-element -- the couple's own upload, any host
              <img src={photo} alt="" className="h-9 w-9 shrink-0 object-cover" style={{ borderRadius: "var(--radius-full)", boxShadow: `0 0 0 2px ${theme.card}` }} />
            )}
            <div className="flex min-w-0 flex-1 items-baseline gap-x-3">
              <p className="truncate text-[1.125rem] leading-tight" style={{ fontFamily: theme.serif }}>{coupleLabel}</p>
              {config.weddingDate && (
                <p className="hidden shrink-0 text-xs sm:block" style={{ color: theme.inkVariant }}>{shortDate(config.weddingDate)}</p>
              )}
            </div>
            <div className="hidden sm:block">{status}</div>
            <div className="flex shrink-0 gap-2">{actions("sm")}</div>
          </div>
        </div>
      )}

      <header
        ref={fullRef}
        className="relative shrink-0 overflow-hidden"
        style={{ ...vars, background: theme.background, color: theme.ink, borderBottom: `1px solid ${theme.outline}` }}
      >
        {showPhoto && (
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[min(52%,720px)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- the couple's own upload, any host */}
            <img
              src={photo}
              alt=""
              onError={() => setPhotoOk(false)}
              className="h-full w-full object-cover opacity-30 sm:opacity-100"
              style={{
                objectPosition: "center 35%",
                // Fades into the theme from the left (and a touch at the bottom), so the names read on the background.
                maskImage: "linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.55) 38%, #000 78%), linear-gradient(to top, transparent 0%, #000 30%)",
                maskComposite: "intersect",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.55) 38%, #000 78%), linear-gradient(to top, transparent 0%, #000 30%)",
                WebkitMaskComposite: "source-in",
              }}
            />
          </div>
        )}
        {!showPhoto && (
          // No photo yet: a soft wash of their colour, so the header still feels theirs.
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse 60% 120% at 100% 0%, ${mix(theme.background, theme.primary, 0.16)}, transparent 70%)` }}
          />
        )}

        <div className={`relative flex flex-col gap-4 px-4 sm:px-6 lg:px-8 ${compact ? "py-4 sm:flex-row sm:items-center sm:justify-between" : "py-7 sm:py-9"}`}>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1
                className={`leading-[1.1] ${compact ? "text-[1.5rem]" : "text-[1.875rem] sm:text-[2.375rem]"}`}
                style={{ fontFamily: theme.serif, fontWeight: 400, textWrap: "balance", letterSpacing: "-0.01em" }}
              >
                {coupleLabel}
              </h1>
              {status}
            </div>
            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm" style={{ color: theme.inkVariant }}>
              {config.weddingDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} aria-hidden />
                  {longDate(config.weddingDate)}
                  {toGo && !compact && (
                    <span className="font-medium" style={{ color: theme.link }}>
                      · {toGo}
                    </span>
                  )}
                </span>
              )}
              {venue && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin size={14} aria-hidden />
                  <span className="truncate">{venue}</span>
                </span>
              )}
            </p>
            {!published && !compact && (
              <p className="flex flex-wrap items-center gap-x-1.5 text-sm" style={{ color: theme.inkVariant }}>
                <EyeOff size={14} aria-hidden />
                Guests can&apos;t see it yet.
                <Link
                  href={`${editHref}?step=publish`}
                  className="font-medium underline underline-offset-4"
                  style={{ color: theme.link, textDecorationColor: mix(theme.link, theme.background, 0.5) }}
                >
                  Review and publish
                </Link>
              </p>
            )}
          </div>
          <div className={`flex shrink-0 flex-wrap gap-2 ${compact ? "" : "pt-1"}`}>{actions("md")}</div>
        </div>
      </header>
    </>
  );
}
