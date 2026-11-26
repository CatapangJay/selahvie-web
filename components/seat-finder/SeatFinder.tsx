"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CircleAlert,
  Armchair,
  DoorOpen,
  HandHeart,
  KeyRound,
  Loader2,
  MapPin,
  Navigation,
  Play,
  RotateCwSquare,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { FROM_PARAM, type FinderResult, type FinderSite, type Seatmate } from "@/lib/seatFinder";
import type { FinderLookup } from "@/types/wedding";
import { initials } from "@/lib/seating";
import { weddingTheme, type GuestTheme } from "@/lib/weddingTheme";
import { loadThemeFonts } from "@/lib/themeFonts";
import { BmgMark } from "@/components/brand/BmgMark";
import { APP_NAME } from "@/lib/constants";
import SeatMap from "./SeatMap";
import { describeTablePlace, findRoute } from "./wayfinding";

// The wedding's theme (lib/weddingTheme), set as CSS variables on the page shell.
const INK = "var(--sf-ink)";
const INK_VARIANT = "var(--sf-ink-2)";
const OUTLINE = "var(--sf-outline)";
const SURFACE = "var(--sf-bg)";
const SURFACE_1 = "var(--sf-surface)";
const CARD = "var(--sf-card)";
const PRIMARY = "var(--sf-primary)";
const ON_PRIMARY = "var(--sf-on-primary)";
const LINK = "var(--sf-link)";
const ERROR = "var(--sf-error)";
const SERIF: React.CSSProperties = { fontFamily: "var(--sf-serif)" };

/** The couple's colour mixed into the card colour, for tints that keep their hue (light or dark). */
const tint = (pct: number) => `color-mix(in oklab, ${PRIMARY} ${pct}%, ${CARD})`;
/** A colour at reduced strength. */
const fade = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, transparent)`;

type Found = Extract<FinderResult, { status: "found" }>;

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

const metaLine = (info: FinderSite) => [info.venueName, formatDate(info.weddingDate)].filter(Boolean).join(" · ");
const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
/** "Main entrance" → "the main entrance"; labels that already start with "the" stay. */
const theDoor = (label: string) => (/^the\s/i.test(label) ? label : `the ${label.charAt(0).toLowerCase()}${label.slice(1)}`);

/** Entrance motion for the table number; loading shimmer. Reduced motion skips both. */
const PAGE_CSS = `
  .sf-rise { animation: sf-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
  @keyframes sf-rise { from { transform: translateY(0.16em); } }
  .sf-settle { animation: sf-settle 1800ms cubic-bezier(0.22, 1, 0.36, 1) both; }
  @keyframes sf-settle { from { transform: scale(1.06); } }
  .sf-sheet { animation: sf-sheet 560ms cubic-bezier(0.22, 1, 0.36, 1) both; }
  @keyframes sf-sheet { from { transform: translateY(14px); } }
  .sf-spin { animation: sf-spin 0.9s linear infinite; }
  @keyframes sf-spin { to { transform: rotate(360deg); } }
  .sf-skeleton { animation: sf-shimmer 1.4s ease-in-out infinite; }
  @keyframes sf-shimmer { 50% { opacity: 0.55; } }
  .sf-chips { scrollbar-width: none; }
  .sf-chips::-webkit-scrollbar { display: none; }
  .sf-focus:focus-visible { outline: 2px solid var(--sf-link); outline-offset: 2px; }
  /* The app's global ring is Be My Guest rose; here focus follows the wedding's colour,
     and the name field shows its own themed glow instead. */
  .sf-root :focus-visible { outline-color: var(--sf-link); }
  .sf-root input:focus-visible { outline: none; }
  @media (prefers-reduced-motion: reduce) { .sf-rise, .sf-settle, .sf-sheet, .sf-skeleton, .sf-spin { animation: none; } }
`;

export default function SeatFinder({ site }: { site: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get(FROM_PARAM) ?? "";

  const [info, setInfo] = useState<FinderSite | null>(null);
  const [loadError, setLoadError] = useState<"missing" | "error" | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/sites/${encodeURIComponent(site)}/seat`, { cache: "no-store" })
      .then(async (res) => {
        if (!live) return;
        if (res.status === 404) return setLoadError("missing");
        if (!res.ok) return setLoadError("error");
        setInfo((await res.json()) as FinderSite);
      })
      .catch(() => live && setLoadError("error"));
    return () => {
      live = false;
    };
  }, [site]);

  // Until the site loads, the house theme; then the couple's.
  const theme = info?.theme ?? HOUSE_THEME;

  // The template's own fonts (some templates ship their own stylesheet).
  useEffect(() => {
    if (info) void loadThemeFonts(info.theme);
  }, [info]);

  if (loadError) {
    return (
      <Shell theme={theme}>
        <Notice title={loadError === "missing" ? "This page isn't available" : "We couldn't load this page"}>
          {loadError === "missing"
            ? "Check the link, or ask the welcome table for your seat."
            : "Check your connection and try again. The welcome table can help too."}
        </Notice>
      </Shell>
    );
  }
  if (!info) {
    return (
      <Shell theme={theme}>
        <LoadingSkeleton />
      </Shell>
    );
  }

  const names = [info.partner1Name, info.partner2Name].map((n) => n?.trim()).filter(Boolean).join(" & ");

  return (
    <Shell theme={theme}>
      {!info.enabled ? (
        <div className="mx-auto max-w-md">
          <Welcome names={names} meta={metaLine(info)} photo={info.heroImageUrl} script={info.theme.script} />
          <Notice title="Table finder opens soon">
            The couple hasn&apos;t opened table lookups yet. Please ask the welcome table for your seat.
          </Notice>
        </div>
      ) : (
        <Finder
          site={site}
          info={info}
          names={names}
          from={from}
          onEntrance={(id) => {
            const url = new URL(window.location.href);
            url.searchParams.set(FROM_PARAM, id);
            router.replace(`${url.pathname}${url.search}`, { scroll: false });
          }}
        />
      )}

      {info.isOwner && (
        <p className="mx-auto mt-10 max-w-md text-center text-[0.8125rem] leading-relaxed" style={{ color: INK_VARIANT }}>
          You&apos;re signed in as the owner, so this page works even before it&apos;s switched on for guests.
        </p>
      )}
    </Shell>
  );
}

/** Be My Guest's own rose, used only while the wedding's theme loads (and on errors). */
const HOUSE_THEME = weddingTheme({});

/** Sets the wedding's theme as CSS variables for everything inside. */
function Shell({ theme, children }: { theme: GuestTheme; children: React.ReactNode }) {
  const vars = {
    "--sf-bg": theme.background,
    "--sf-surface": theme.surface,
    "--sf-card": theme.card,
    "--sf-ink": theme.ink,
    "--sf-ink-2": theme.inkVariant,
    "--sf-outline": theme.outline,
    "--sf-primary": theme.primary,
    "--sf-on-primary": theme.onPrimary,
    "--sf-link": theme.link,
    "--sf-error": theme.error,
    "--sf-serif": theme.serif,
    "--sf-sans": theme.sans,
    colorScheme: theme.dark ? "dark" : "light",
  } as React.CSSProperties;
  return (
    <main className="sf-root flex min-h-dvh flex-col px-4 pb-6 sm:px-6" style={{ ...vars, background: SURFACE, color: INK, fontFamily: "var(--sf-sans)" }}>
      <div className="mx-auto w-full max-w-xl flex-1 lg:max-w-6xl">{children}</div>
      <MadeWith />
      <style>{PAGE_CSS}</style>
    </main>
  );
}

/**
 * A quiet credit at the very bottom, after everything the guest came for. The
 * link opens in a new tab so the guest's table stays on screen.
 */
function MadeWith() {
  return (
    <footer className="mx-auto mt-14 flex w-full max-w-xl flex-col items-center justify-center gap-x-2 gap-y-1 pt-5 sm:flex-row text-[0.8125rem] lg:max-w-6xl" style={{ color: INK_VARIANT, borderTop: `1px solid ${OUTLINE}` }}>
      <span className="inline-flex items-center gap-2">
        <BmgMark size={20} />
        Made with {APP_NAME}
      </span>
      {/* Phones: two centred lines, no dangling dot. */}
      <span aria-hidden className="hidden sm:inline">·</span>
      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="sf-focus inline-flex min-h-[32px] items-center font-medium underline decoration-1 underline-offset-4"
        style={{ color: INK_VARIANT, borderRadius: 4 }}
      >
        Make your own wedding website
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </footer>
  );
}

/** One quiet line once the guest is found: whose wedding this is, and a way back. */
function TopBar({ names, action }: { names: string; action?: React.ReactNode }) {
  return (
    <header className="flex min-h-[60px] items-center justify-between gap-4 py-3">
      <p className="min-w-0 truncate text-[1.125rem] leading-tight" style={{ ...SERIF, color: INK }}>
        {names || "The happy couple"}
      </p>
      {action}
    </header>
  );
}

/**
 * The welcome on arrival, in the couple's colour: their names as the headline,
 * the day and place beneath, and the round-table motif from the result screen.
 * Full width on phones, a rounded panel from `sm`.
 */
function Welcome({ names, meta, photo, script, tall }: { names: string; meta?: string; photo?: string; script?: string; tall?: boolean }) {
  // A photo that fails to load falls back to the colour band.
  const [failed, setFailed] = useState(false);
  const withPhoto = Boolean(photo) && !failed;
  return (
    <header
      className="relative -mx-4 overflow-hidden sm:mx-0 sm:mt-4 sm:rounded-[28px] lg:mt-0 lg:rounded-[32px]"
      style={{ background: PRIMARY, color: withPhoto ? "#FFFFFF" : ON_PRIMARY }}
    >
      {withPhoto ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- the couple's own photo, any host */}
          <img
            src={photo}
            alt=""
            onError={() => setFailed(true)}
            className="sf-settle absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 35%" }}
          />
          {/* Clear at the top, dark where the names sit, so they read on any photo. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgb(0 0 0 / 0.1) 0%, rgb(0 0 0 / 0) 32%, rgb(0 0 0 / 0.66) 100%)" }}
          />
        </>
      ) : (
        <TableMotif />
      )}
      <div
        // Phones: a band with the form rising over it. Desktop: a tall panel beside the form.
        className={`relative flex flex-col justify-end px-6 pb-14 sm:px-8 ${tall ? "lg:min-h-[min(84dvh,780px)] lg:px-12 lg:pb-12" : ""} ${withPhoto ? "min-h-[min(40svh,340px)] pt-20" : "pt-9"}`}
        style={{ textShadow: withPhoto ? "0 1px 14px rgb(0 0 0 / 0.35)" : undefined }}
      >
        <p className={`text-[0.9375rem] ${tall ? "lg:text-[1.0625rem]" : ""}`} style={{ opacity: 0.9 }}>
          Welcome to the wedding of
        </p>
        <p className={`sf-rise mt-1.5 text-[2.5rem] leading-[1.05] tracking-[-0.01em] ${tall ? "lg:mt-3 lg:text-[3.75rem]" : ""}`} style={{ ...SERIF, textWrap: "balance" }}>
          <CoupleNames names={names || "the happy couple"} script={script} />
        </p>
        {meta && (
          <p className={`mt-3 text-[0.9375rem] leading-snug ${tall ? "lg:mt-4 lg:text-[1.0625rem]" : ""}`} style={{ opacity: 0.9 }}>
            {meta}
          </p>
        )}
      </div>
    </header>
  );
}

/**
 * "Isabel & Marco" with the ampersand as the one flourish: in the template's
 * script face when it has one, otherwise the display face in italic.
 */
function CoupleNames({ names, script }: { names: string; script?: string }) {
  const parts = names.split(/\s+&\s+/);
  if (parts.length !== 2) return <>{names}</>;
  return (
    <>
      {parts[0]}{" "}
      <span
        aria-hidden
        className="inline-block"
        style={script ? { fontFamily: script, fontSize: "1.15em", lineHeight: 0.8, padding: "0 0.06em" } : { fontStyle: "italic" }}
      >
        &amp;
      </span>
      <span className="sr-only">and</span> {parts[1]}
    </>
  );
}

function LoadingSkeleton() {
  const block = (cls: string, radius = 12, bg = SURFACE_1) => (
    <div aria-hidden className={`sf-skeleton ${cls}`} style={{ background: bg, borderRadius: radius }} />
  );
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-md">
      <div className="-mx-4 px-6 pb-14 pt-9 sm:mx-0 sm:mt-4 sm:rounded-[28px]" style={{ background: SURFACE_1 }}>
        {block("h-4 w-44", 6, OUTLINE)}
        {block("mt-3 h-10 w-60", 8, OUTLINE)}
        {block("mt-4 h-4 w-52", 6, OUTLINE)}
      </div>
      <div className="relative px-1 pt-7">
        {block("h-9 w-52", 8)}
        {block("mt-3 h-4 w-72", 6)}
        {block("mt-8 h-14 w-full", 16)}
        {block("mt-6 h-14 w-full", 999)}
      </div>
    </div>
  );
}

function Notice({ title, children, icon: Icon = MapPin }: { title: string; children: React.ReactNode; icon?: typeof MapPin }) {
  return (
    <section className="mx-auto mt-6 max-w-md px-6 py-8" style={{ background: SURFACE_1, borderRadius: 24 }}>
      <span aria-hidden className="inline-flex h-11 w-11 items-center justify-center" style={{ background: CARD, borderRadius: 999, color: INK_VARIANT }}>
        <Icon size={20} />
      </span>
      <h1 className="mt-4 text-[1.625rem] leading-tight" style={{ ...SERIF, color: INK, textWrap: "balance" }}>
        {title}
      </h1>
      <p className="mt-2 text-[1rem] leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
        {children}
      </p>
    </section>
  );
}

/** What the name field asks for, per the couple's choice in the Share tab. */
const LOOKUP_COPY: Record<FinderLookup, { label: string; placeholder: string; hint: string; lede: string; notFound: string }> = {
  full: {
    label: "Your name",
    placeholder: "e.g. Maria Santos",
    hint: "Your full name, as it's written on your invitation. A plus-one's name works too.",
    lede: "Type your name and we'll show you the room, your table, and the way there.",
    notFound: "We couldn't find that name. Try your full name as it appears on your invitation.",
  },
  first: {
    label: "Your first name",
    placeholder: "e.g. Maria",
    hint: "Just your first name. If someone shares it, we'll ask for your last name too.",
    lede: "Type your first name and we'll show you the room, your table, and the way there.",
    notFound: "We couldn't find that first name. Try it as it's written on your invitation, or add your last name.",
  },
  nickname: {
    label: "Your nickname",
    placeholder: "e.g. Mia",
    hint: "The name the couple calls you. If someone shares it, we'll ask for your last name too.",
    lede: "Type your nickname and we'll show you the room, your table, and the way there.",
    notFound: "We couldn't find that name. Try the name on your invitation, or add your last name.",
  },
};

type Phase =
  | { kind: "ask"; step: "lookup" | "code"; message?: string; offerCode?: boolean }
  | { kind: "unseated"; guestName: string }
  | { kind: "found"; result: Found };

function Finder({
  site, info, names, from, onEntrance,
}: {
  site: string; info: FinderSite; names: string; from: string; onEntrance: (id: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "ask", step: "lookup" });
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const lookup = info.lookup ?? "full";
  const copy = LOOKUP_COPY[lookup];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (phase.kind !== "ask" || !query.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(site)}/seat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, step: phase.step }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const result = (await res.json()) as FinderResult;
      if (result.status === "found") {
        setPhase({ kind: "found", result });
        window.scrollTo({ top: 0 });
      } else if (result.status === "unseated") {
        setPhase({ kind: "unseated", guestName: result.guestName });
      } else if (result.status === "needs-code") {
        // A shared first name or nickname: ask for the last name first; a shared full name needs the code.
        const oneWord = query.trim().split(/\s+/).length === 1;
        if (lookup !== "full" && oneWord && phase.step === "lookup") {
          setPhase({ kind: "ask", step: "lookup", offerCode: true, message: `More than one guest goes by ${query.trim()}. Add your last name, or use the code from your invitation.` });
        } else {
          setQuery("");
          setPhase({ kind: "ask", step: "code", message: "More than one guest has a name like that. Enter the code from your invitation, or ask the welcome table." });
        }
      } else {
        setPhase({
          kind: "ask",
          step: phase.step,
          message:
            phase.step === "code"
              ? "That code didn't match. Check it against your invitation, or ask the welcome table."
              : copy.notFound,
        });
      }
    } catch {
      setPhase({ ...phase, message: "Something went wrong. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setQuery("");
    setPhase({ kind: "ask", step: "lookup" });
  };

  if (phase.kind === "found") {
    return (
      <>
        <TopBar
          names={names}
          action={
            <button
              type="button"
              onClick={reset}
              className="sf-focus min-h-[44px] shrink-0 px-1 text-[0.9375rem] font-medium underline decoration-1 underline-offset-4"
              style={{ color: INK_VARIANT, borderRadius: 6 }}
            >
              Not you?
            </button>
          }
        />
        <Result result={phase.result} info={info} from={from} onEntrance={onEntrance} />
      </>
    );
  }

  if (phase.kind === "unseated") {
    return (
      <div className="mx-auto max-w-md">
        <TopBar names={names} />
        <Notice title={`Welcome, ${firstName(phase.guestName)}`} icon={Users}>
          Your table isn&apos;t on the chart yet. Our team at the welcome table will show you to your seat.
        </Notice>
        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={reset}
            className="sf-focus min-h-[44px] px-2 text-[0.9375rem] font-medium underline underline-offset-4"
            style={{ color: INK_VARIANT, borderRadius: 6 }}
          >
            Look up someone else
          </button>
        </p>
      </div>
    );
  }

  const isCode = phase.step === "code";
  const Lead = isCode ? KeyRound : UserRound;
  return (
    // Phones and tablets: one column. Desktop: the welcome beside the form.
    <div className="mx-auto max-w-md lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-8">
      <Welcome names={names} meta={metaLine(info)} photo={info.heroImageUrl} script={info.theme.script} tall />

      {/* Phones: a sheet rising over the welcome, like a card set down on a table. Desktop: beside it. */}
      <section
        className="sf-sheet relative -mx-4 -mt-7 rounded-t-[28px] px-5 pb-2 pt-7 sm:mx-0 sm:px-2 lg:mt-0 lg:max-w-[30rem] lg:rounded-none lg:px-0 lg:py-6"
        style={{ background: SURFACE }}
      >
        <h1 className="text-[2rem] leading-[1.1] lg:text-[2.75rem]" style={{ ...SERIF, color: INK, textWrap: "balance" }}>
          {isCode ? "Enter your invitation code" : "Find your table"}
        </h1>
        <p className="mt-2 text-[1rem] leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
          {isCode ? "It's on your invitation, or at the end of your invite link." : copy.lede}
        </p>

        <form onSubmit={submit} className="mt-7" noValidate>
          <label htmlFor="sf-query" className="block text-[0.9375rem] font-medium" style={{ color: INK }}>
            {isCode ? "Invitation code" : copy.label}
          </label>
          <div className="relative mt-2">
            <Lead aria-hidden size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: INK_VARIANT }} />
            <input
              id="sf-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete={isCode ? "off" : lookup === "first" ? "given-name" : lookup === "nickname" ? "nickname" : "name"}
              autoCapitalize={isCode ? "characters" : "words"}
              spellCheck={false}
              autoFocus
              maxLength={80}
              placeholder={isCode ? "K7QM-24PX" : copy.placeholder}
              aria-describedby="sf-hint"
              aria-invalid={phase.message ? true : undefined}
              className={`block min-h-[58px] w-full pl-12 pr-4 text-[1.0625rem] outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-[var(--sf-ink-2)] focus:shadow-[0_0_0_4px_var(--sf-ring)] ${isCode ? "uppercase tracking-[0.12em]" : ""}`}
              style={{
                background: CARD,
                border: `1px solid ${phase.message ? ERROR : OUTLINE}`,
                borderRadius: 16,
                color: INK,
                ["--sf-ring" as string]: tint(28),
              }}
            />
          </div>
          <p id="sf-hint" className="mt-2 text-[0.875rem] leading-snug" style={{ color: INK_VARIANT }}>
            {isCode ? "Letters and numbers; the dash is optional." : copy.hint}
          </p>
          {phase.message && (
            <p role="alert" className="mt-3 flex gap-2 text-[0.9375rem] leading-snug" style={{ color: ERROR }}>
              <CircleAlert aria-hidden size={18} className="mt-px shrink-0" />
              <span>{phase.message}</span>
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className="sf-focus mt-6 inline-flex min-h-[58px] w-full items-center justify-center gap-2 text-[1.0625rem] font-medium transition-[opacity,transform] duration-150 active:scale-[0.99] disabled:opacity-45"
            style={{ background: PRIMARY, color: ON_PRIMARY, borderRadius: 999 }}
          >
            {busy ? <Loader2 size={19} aria-hidden className="sf-spin" /> : <Search size={19} aria-hidden />}
            {busy ? "Looking…" : "Find my table"}
          </button>
          {isCode && (
            <button
              type="button"
              onClick={reset}
              className="sf-focus mt-3 block min-h-[44px] w-full text-center text-[0.9375rem] underline underline-offset-4"
              style={{ color: INK_VARIANT, borderRadius: 6 }}
            >
              Search by name instead
            </button>
          )}
          {!isCode && phase.kind === "ask" && phase.offerCode && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPhase({ kind: "ask", step: "code" });
              }}
              className="sf-focus mt-3 block min-h-[44px] w-full text-center text-[0.9375rem] underline underline-offset-4"
              style={{ color: INK_VARIANT, borderRadius: 6 }}
            >
              Use my invitation code instead
            </button>
          )}
        </form>

        <p className="mt-8 flex items-start gap-3 py-4 text-[0.9375rem] leading-snug" style={{ color: INK_VARIANT, borderTop: `1px solid ${OUTLINE}` }}>
          <HandHeart aria-hidden size={19} className="mt-px shrink-0" style={{ color: LINK }} />
          <span>No invitation with you? Our team at the welcome table will find your seat.</span>
        </p>
      </section>
    </div>
  );
}

/** "with Liza Reyes and Ben Lim", "with Liza Reyes and 1 more", "+2 guests". */
function withWhom(plusOnes: string[], more: number): string {
  if (!plusOnes.length) return more ? `+${more} ${more === 1 ? "guest" : "guests"}` : "";
  const names = more ? [...plusOnes, `${more} more`] : plusOnes;
  return `with ${names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`}`;
}

/**
 * Who's at the guest's table, so they know their seatmates on sight: their own
 * party, then people from their groups (family, friends, entourage) under the
 * group's name, then everyone else.
 */
function TableMates({ party, seatmates, partySize }: { party: string[]; seatmates: Seatmate[]; partySize: number }) {
  const [all, setAll] = useState(false);
  const others = seatmates.reduce((n, m) => n + 1 + m.plusOnes.length + m.more, 0);
  const yours = Math.max(partySize, 1 + party.length);
  const beside = seatmates.filter((m) => m.beside);
  const groups = [...new Set(seatmates.filter((m) => !m.beside).map((m) => m.group).filter((g): g is string => Boolean(g)))];
  const rest = seatmates.filter((m) => !m.beside && !m.group);
  const unnamedInParty = Math.max(0, yours - 1 - party.length);
  // Long tables fold: the people you came with and your groups always show; the rest after ten.
  const LIMIT = 10;
  const shownRest = all ? rest : rest.slice(0, LIMIT);

  return (
    <section aria-labelledby="sf-mates" className="mt-7 lg:col-start-2 lg:row-start-3 lg:mt-8 lg:self-start">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="sf-mates" className="text-[1.0625rem] font-medium" style={{ color: INK }}>
          Who&apos;s at your table
        </h2>
        <p className="shrink-0 text-[0.875rem] tabular-nums" style={{ color: INK_VARIANT }}>
          {others === 0 ? (yours > 1 ? `Your party of ${yours}` : "Just you so far") : `${yours + others} at this table`}
        </p>
      </div>

      {(party.length > 0 || unnamedInParty > 0) && (
        <MateGroup label="With you">
          {party.map((name) => (
            <Mate key={name} name={name} />
          ))}
          {unnamedInParty > 0 && <Mate name={`${unnamedInParty} ${unnamedInParty === 1 ? "guest" : "guests"} in your party`} quiet />}
        </MateGroup>
      )}

      {beside.length > 0 && (
        <MateGroup label="Beside you" highlight>
          {beside.map((m) => (
            <Mate key={m.name} name={m.name} plusOnes={m.plusOnes} more={m.more} highlight />
          ))}
        </MateGroup>
      )}

      {groups.map((group) => (
        <MateGroup key={group} label={group} highlight>
          {seatmates
            .filter((m) => !m.beside && m.group === group)
            .map((m) => (
              <Mate key={m.name} name={m.name} plusOnes={m.plusOnes} more={m.more} highlight />
            ))}
        </MateGroup>
      ))}

      {rest.length > 0 && (
        <MateGroup label={beside.length || groups.length || party.length || unnamedInParty ? "Also at your table" : undefined}>
          {shownRest.map((m) => (
            <Mate key={m.name} name={m.name} plusOnes={m.plusOnes} more={m.more} />
          ))}
          {rest.length > LIMIT && (
            <li>
              <button
                type="button"
                onClick={() => setAll((v) => !v)}
                aria-expanded={all}
                className="sf-focus inline-flex min-h-[40px] items-center px-3 text-[0.9375rem] font-medium underline underline-offset-4"
                style={{ color: LINK, borderRadius: 999 }}
              >
                {all ? "Show fewer" : `Show ${rest.length - LIMIT} more`}
              </button>
            </li>
          )}
        </MateGroup>
      )}

      {seatmates.length === 0 && (
        <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
          No one else is seated here yet. Others may join before the reception.
        </p>
      )}
    </section>
  );
}

function MateGroup({ label, highlight, children }: { label?: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      {label && (
        <p className="mb-2 flex items-center gap-1.5 text-[0.8125rem] font-medium" style={{ color: highlight ? LINK : INK_VARIANT }}>
          {highlight && (label === "Beside you" ? <Armchair size={13} aria-hidden /> : <Users size={13} aria-hidden />)}
          {label}
        </p>
      )}
      <ul className="flex flex-wrap gap-1.5" aria-label={label ?? "At your table"}>
        {children}
      </ul>
    </div>
  );
}

/**
 * One person as a compact pill: initials, full name, and "+2" for the guests they
 * bring (named in the tooltip). Your groups' people carry your colour.
 */
function Mate({ name, plusOnes = [], more = 0, highlight, quiet }: { name: string; plusOnes?: string[]; more?: number; highlight?: boolean; quiet?: boolean }) {
  const extra = plusOnes.length + more;
  const detail = withWhom(plusOnes, more);
  return (
    <li
      title={detail ? `${name}, ${detail}` : name}
      className="inline-flex min-h-[36px] max-w-full items-center gap-2 py-1 pl-1 pr-3"
      style={{
        borderRadius: 999,
        background: highlight ? tint(12) : quiet ? "transparent" : CARD,
        border: `1px solid ${highlight ? tint(40) : OUTLINE}`,
      }}
    >
      <span
        aria-hidden
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-[0.6875rem] font-semibold"
        style={{ borderRadius: 999, background: highlight ? PRIMARY : quiet ? "transparent" : tint(14), color: highlight ? ON_PRIMARY : LINK }}
      >
        {quiet ? <Users size={13} /> : initials(name)}
      </span>
      <span className="truncate text-[0.9375rem] leading-tight" style={{ color: quiet ? INK_VARIANT : INK }}>
        {name}
      </span>
      {extra > 0 && (
        <span className="shrink-0 text-[0.8125rem] font-medium tabular-nums" style={{ color: INK_VARIANT }}>
          +{extra}
          <span className="sr-only"> {extra === 1 ? "guest" : "guests"}{plusOnes.length ? `: ${plusOnes.join(", ")}` : ""}</span>
        </span>
      )}
    </li>
  );
}

function Result({
  result, info, from, onEntrance,
}: {
  result: Found; info: FinderSite; from: string; onEntrance: (id: string) => void;
}) {
  const { floor, tableId } = result;
  const table = floor.tables.find((t) => t.id === tableId);
  const entrances = floor.elements.filter((e) => e.kind === "entrance");
  const entrance = entrances.find((e) => e.id === from) ?? entrances[0] ?? null;
  const labelOf = (id: string, fallback: string) => info.entrances.find((e) => e.id === id)?.label ?? fallback;
  const entranceLabel = entrance ? labelOf(entrance.id, entrance.label) : "the entrance";
  // "3rd table from the left, 2nd row from the entrance" / "Next to the dance floor", as the guest walks in.
  const place = describeTablePlace(floor, tableId, entrance, result.seat);

  return (
    // Phone: table, door, map, who's at your table. Desktop: the map on the left, the rest beside it.
    <div className="lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-10">
      <TableBand name={table?.name.trim() || "Your table"} guest={firstName(result.guestName)} partySize={result.partySize} {...place} />

      {entrances.length > 1 && (
        <div className="mt-4 lg:col-start-2 lg:row-start-2 lg:mt-5">
          <p className="text-[0.875rem] font-medium" style={{ color: INK_VARIANT }}>
            Entering from
          </p>
          <div className="sf-chips -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Which entrance did you use?">
            {entrances.map((e) => {
              const on = e.id === entrance?.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onEntrance(e.id)}
                  className="sf-focus inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap px-4 text-[0.9375rem] font-medium transition-[background-color,border-color] duration-150"
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${on ? PRIMARY : OUTLINE}`,
                    background: on ? tint(12) : CARD,
                    color: INK,
                  }}
                >
                  <DoorOpen size={16} aria-hidden style={{ color: on ? LINK : INK_VARIANT }} />
                  {labelOf(e.id, e.label)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyed by door: a new entrance starts from its own door-at-the-bottom view. */}
      <Wayfinder key={entrance?.id ?? "none"} floor={floor} tableId={tableId} chairs={result.chairs} entranceId={entrance?.id ?? ""} entranceLabel={entranceLabel} theme={info.theme} />

      <TableMates party={result.party} seatmates={result.seatmates} partySize={result.partySize} />
    </div>
  );
}

/**
 * The answer, in the couple's colour: "Table" small, the number large. Names that
 * aren't "Table N" (a sweetheart table, "Family") are set as one serif line.
 */
function TableBand({ name, guest, partySize, table, seat, near }: { name: string; guest: string; partySize: number; table?: string; seat?: string; near?: string }) {
  const numbered = /^table\s+(\S{1,4})$/i.exec(name);
  // Each fact gets a short label, so "2nd from the left" reads as the table and "3rd from the left" as the seat.
  const facts: { icon: typeof MapPin; label?: string; text: string }[] = [
    ...(table ? [{ icon: Navigation, label: "Table", text: table }] : []),
    ...(seat ? [{ icon: Armchair, label: "Your seat", text: seat }] : []),
    ...(near ? [{ icon: MapPin, text: near }] : []),
    ...(partySize > 1 ? [{ icon: Users, text: `Party of ${partySize}, seated together` }] : []),
  ];
  return (
    <section
      aria-live="polite"
      className="px-5 pb-5 pt-4 sm:px-6 lg:col-start-2 lg:row-start-1"
      style={{ background: PRIMARY, color: ON_PRIMARY, borderRadius: 24 }}
    >
      <p className="text-[0.9375rem]" style={{ color: fade(ON_PRIMARY, 90) }}>
        {guest}, you&apos;re at
      </p>
      <h1 className="mt-1 leading-none" style={{ ...SERIF, textWrap: "balance" }}>
        {numbered ? (
          <span className="flex items-baseline gap-[0.35em]">
            <span className="text-[1.625rem]">Table</span>{" "}
            <span className="sf-rise inline-block text-[3.75rem] leading-[0.85] tracking-[-0.02em] tabular-nums lining-nums">{numbered[1]}</span>
          </span>
        ) : (
          <span className="sf-rise inline-block text-[2.25rem] leading-[1.08]">{name}</span>
        )}
      </h1>
      {facts.length > 0 && (
        <ul className="mt-4 space-y-2 pt-3.5" style={{ borderTop: `1px solid ${fade(ON_PRIMARY, 22)}` }}>
          {facts.map((f) => (
            <li key={f.text} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug">
              <f.icon size={17} aria-hidden className="mt-[0.1em] shrink-0" style={{ opacity: 0.85 }} />
              <span style={{ textWrap: "pretty" }}>
                {f.label && <span className="font-semibold">{f.label}: </span>}
                {f.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** A round table and its chairs, drawn once, faintly, off the edge of the band. */
function TableMotif() {
  const chairs = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { x: 100 + Math.cos(a) * 74, y: 100 + Math.sin(a) * 74 };
  });
  return (
    <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -right-16 -top-14 h-52 w-52" fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={2}>
      <circle cx={100} cy={100} r={50} />
      {chairs.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={11} />
      ))}
    </svg>
  );
}

function Wayfinder({
  floor, tableId, chairs, entranceId, entranceLabel, theme,
}: {
  floor: Found["floor"]; tableId: string; chairs?: number[]; entranceId: string; entranceLabel: string; theme: GuestTheme;
}) {
  // The search runs once per table and entrance, not on every animation tick.
  const entrance = useMemo(() => floor.elements.find((e) => e.id === entranceId) ?? null, [floor, entranceId]);
  const route = useMemo(() => (entrance ? findRoute(floor, entrance, tableId) : null), [floor, entrance, tableId]);

  // The whole room by default: a crop can hide where you are in the room.
  const [focus, setFocus] = useState(false);
  const [replay, setReplay] = useState(0);
  const [turns, setTurns] = useState(0);

  return (
    <>
      {/* Edge to edge on phones: the room gets the whole width. */}
      <section
        aria-label="Floor plan"
        className="-mx-4 mt-4 px-2 pb-3 pt-2 sm:mx-0 sm:px-4 lg:sticky lg:top-6 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0 lg:self-start"
        style={{ background: SURFACE_1, borderRadius: 28 }}
      >
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="inline-flex p-1" style={{ background: fade(INK, 7), borderRadius: 999 }} role="group" aria-label="Map view">
            {[
              { on: false, label: "Whole room" },
              { on: true, label: "My route" },
            ].map((o) => {
              const pressed = focus === o.on;
              return (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={pressed}
                  disabled={!route && o.on}
                  onClick={() => setFocus(o.on)}
                  className="sf-focus min-h-[36px] whitespace-nowrap px-3.5 text-[0.875rem] font-medium transition-[background-color,color,box-shadow] duration-150 disabled:opacity-40"
                  style={{
                    borderRadius: 999,
                    background: pressed ? CARD : "transparent",
                    color: pressed ? INK : INK_VARIANT,
                    boxShadow: pressed ? `0 1px 2px ${fade(INK, 16)}` : "none",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setTurns((n) => (n + 1) % 4)}
              aria-label="Rotate map"
              title="Rotate the map a quarter turn"
              className="sf-focus inline-flex h-11 w-11 items-center justify-center transition-colors duration-150 hover:bg-[var(--sf-card)]"
              style={{ color: INK_VARIANT, borderRadius: 999 }}
            >
              <RotateCwSquare size={19} aria-hidden />
            </button>
            {route && (
              <button
                type="button"
                onClick={() => setReplay((n) => n + 1)}
                aria-label="Replay"
                title="Replay the route"
                className="sf-focus inline-flex h-11 w-11 items-center justify-center transition-colors duration-150 hover:bg-[var(--sf-card)]"
                style={{ color: INK_VARIANT, borderRadius: 999 }}
              >
                <Play size={18} aria-hidden />
              </button>
            )}
          </div>
        </div>
        <div className="[--sf-map-max:min(58svh,560px)] lg:[--sf-map-max:calc(100svh-9rem)]">
          <SeatMap
            floor={floor}
            targetId={tableId}
            chairs={chairs}
            route={route}
            entrance={entrance}
            theme={theme}
            focus={focus && Boolean(route)}
            replayKey={replay}
            turns={turns}
          />
        </div>
        {!route && (
          <p className="px-2 pt-2 text-center text-[0.8125rem] leading-snug" style={{ color: INK_VARIANT }}>
            {entrance ? "We couldn't draw a route through the room, but your table is highlighted on the map." : "Your table is highlighted on the map."}
          </p>
        )}
        {entrance && route && (
          <p className="flex min-h-[32px] items-center justify-center px-2 pt-2 text-center text-[0.8125rem] leading-snug" style={{ color: INK_VARIANT }} aria-live="polite">
            {turns === 0 ? (
              <>Turned so {theDoor(entranceLabel)} is behind you.</>
            ) : (
              <button
                type="button"
                onClick={() => setTurns(0)}
                className="sf-focus min-h-[32px] px-1 font-medium underline underline-offset-4"
                style={{ color: INK_VARIANT, borderRadius: 6 }}
              >
                Turn back so {theDoor(entranceLabel)} is behind you
              </button>
            )}
          </p>
        )}
      </section>

    </>
  );
}
