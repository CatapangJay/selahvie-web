"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowUpLeft, ArrowUpRight, CornerUpLeft, CornerUpRight, DoorOpen, MapPin, RotateCcw, Search, Users } from "lucide-react";
import { FROM_PARAM, type FinderResult, type FinderSite } from "@/lib/seatFinder";
import SeatMap from "./SeatMap";
import { directions, findRoute, type Step } from "./wayfinding";

const INK = "#2F1E26";
const INK_VARIANT = "#604C55";
const OUTLINE = "#DFD4D4";
const SURFACE = "#FDF8F7";
const SURFACE_1 = "#FAF1F1";
const ERROR = "#AE3F2C";
const FALLBACK_ACCENT = "#A75463";

/** The accent mixed toward white, for tints that keep the couple's hue. */
const tint = (accent: string, pct: number) => `color-mix(in oklab, ${accent} ${pct}%, white)`;

type Found = Extract<FinderResult, { status: "found" }>;

/** The couple's colour when it reads well as a fill under white text; otherwise ink. */
function usableAccent(hex: string | undefined): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex?.trim() ?? "");
  if (!m) return FALLBACK_ACCENT;
  const n = parseInt(m[1], 16);
  const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  // White on it needs 4.5:1 → luminance ≤ ~0.18.
  return L <= 0.18 ? `#${m[1]}` : INK;
}

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
  .sf-skeleton { animation: sf-shimmer 1.4s ease-in-out infinite; }
  @keyframes sf-shimmer { 50% { opacity: 0.55; } }
  .sf-chips { scrollbar-width: none; }
  .sf-chips::-webkit-scrollbar { display: none; }
  .sf-focus:focus-visible { outline: 2px solid var(--sf-accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .sf-rise, .sf-skeleton { animation: none; } }
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

  const accent = usableAccent(info?.primaryColor);

  if (loadError) {
    return (
      <Shell accent={accent}>
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
      <Shell accent={accent}>
        <LoadingSkeleton />
      </Shell>
    );
  }

  const names = [info.partner1Name, info.partner2Name].map((n) => n?.trim()).filter(Boolean).join(" & ");

  return (
    <Shell accent={accent}>
      {!info.enabled ? (
        <div className="mx-auto max-w-md">
          <TopBar names={names} meta={metaLine(info)} />
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
          accent={accent}
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

function Shell({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh px-4 pb-12 sm:px-6" style={{ background: SURFACE, color: INK, ["--sf-accent" as string]: accent }}>
      <div className="mx-auto w-full max-w-xl lg:max-w-6xl">{children}</div>
      <style>{PAGE_CSS}</style>
    </main>
  );
}

/** One quiet line: whose wedding this is, and (once found) a way back. */
function TopBar({ names, meta, action }: { names: string; meta?: string; action?: React.ReactNode }) {
  return (
    <header className="flex min-h-[60px] items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-serif text-[1.125rem] leading-tight" style={{ color: INK }}>
          {names || "The happy couple"}
        </p>
        {meta && (
          <p className="mt-0.5 truncate text-[0.8125rem] leading-snug" style={{ color: INK_VARIANT }}>
            {meta}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}

function LoadingSkeleton() {
  const block = (cls: string, radius = 12) => <div aria-hidden className={`sf-skeleton ${cls}`} style={{ background: SURFACE_1, borderRadius: radius }} />;
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-md">
      <div className="py-4">{block("h-5 w-32", 6)}</div>
      <div className="mt-8 space-y-3">
        {block("h-10 w-56", 8)}
        {block("h-4 w-72", 6)}
        <div className="h-6" />
        {block("h-14 w-full", 14)}
        {block("h-14 w-full", 999)}
      </div>
    </div>
  );
}

function Notice({ title, children, icon: Icon = MapPin }: { title: string; children: React.ReactNode; icon?: typeof MapPin }) {
  return (
    <section className="mx-auto mt-6 max-w-md px-6 py-8" style={{ background: SURFACE_1, borderRadius: 24 }}>
      <span aria-hidden className="inline-flex h-11 w-11 items-center justify-center" style={{ background: "#FFFFFF", borderRadius: 999, color: INK_VARIANT }}>
        <Icon size={20} />
      </span>
      <h1 className="mt-4 font-serif text-[1.625rem] leading-tight" style={{ color: INK, textWrap: "balance" }}>
        {title}
      </h1>
      <p className="mt-2 text-[1rem] leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
        {children}
      </p>
    </section>
  );
}

type Phase =
  | { kind: "ask"; step: "lookup" | "code"; message?: string }
  | { kind: "unseated"; guestName: string }
  | { kind: "found"; result: Found };

function Finder({
  site, info, names, from, accent, onEntrance,
}: {
  site: string; info: FinderSite; names: string; from: string; accent: string; onEntrance: (id: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "ask", step: "lookup" });
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

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
        setQuery("");
        setPhase({ kind: "ask", step: "code", message: "More than one guest has a name like that. Enter the code from your invitation, or ask the welcome table." });
      } else {
        setPhase({
          kind: "ask",
          step: phase.step,
          message:
            phase.step === "code"
              ? "That code didn't match. Check it against your invitation, or ask the welcome table."
              : "We couldn't find that name. Try your full name as it appears on your invitation.",
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
        <Result result={phase.result} info={info} from={from} accent={accent} onEntrance={onEntrance} />
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
          <button type="button" onClick={reset} className="sf-focus min-h-[44px] px-2 text-[0.9375rem] font-medium underline underline-offset-4" style={{ color: INK_VARIANT, borderRadius: 6 }}>
            Look up someone else
          </button>
        </p>
      </div>
    );
  }

  const isCode = phase.step === "code";
  return (
    <div className="mx-auto max-w-md">
      <TopBar names={names} meta={metaLine(info)} />
      <section className="pt-8 sm:pt-12">
        <h1 className="font-serif text-[2.25rem] leading-[1.1]" style={{ color: INK, textWrap: "balance" }}>
          {isCode ? "Enter your invitation code" : "Find your table"}
        </h1>
        <p className="mt-2 text-[1rem] leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
          {isCode ? "We'll use it to find your seat." : "We'll show you the room and the way to your seat."}
        </p>
        <form onSubmit={submit} className="mt-8" noValidate>
          <label htmlFor="sf-query" className="block text-[0.9375rem] font-medium" style={{ color: INK }}>
            {isCode ? "Invitation code" : "Your name"}
          </label>
          <input
            id="sf-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete={isCode ? "off" : "name"}
            autoCapitalize={isCode ? "characters" : "words"}
            autoFocus
            maxLength={80}
            placeholder={isCode ? "e.g. K7QM-24PX" : "e.g. Maria Santos"}
            aria-describedby="sf-hint"
            aria-invalid={phase.message ? true : undefined}
            className="mt-2 block min-h-[56px] w-full px-4 text-[1.0625rem] outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-[#7D6A72] focus:shadow-[0_0_0_3px_var(--sf-ring)]"
            style={{
              background: "#FFFFFF",
              border: `1px solid ${phase.message ? ERROR : OUTLINE}`,
              borderRadius: 14,
              color: INK,
              ["--sf-ring" as string]: tint(accent, 30),
            }}
          />
          <p id="sf-hint" className="mt-2 text-[0.875rem] leading-snug" style={{ color: INK_VARIANT }}>
            {isCode ? "It's printed on your invitation, or at the end of your invite link." : "As it appears on your invitation. A plus-one's name works too."}
          </p>
          {phase.message && (
            <p role="alert" className="mt-3 text-[0.9375rem] leading-snug" style={{ color: ERROR }}>
              {phase.message}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className="sf-focus mt-6 inline-flex min-h-[56px] w-full items-center justify-center gap-2 text-[1rem] font-medium text-white transition-[opacity,transform] duration-150 active:scale-[0.99] disabled:opacity-50"
            style={{ background: accent, borderRadius: 999 }}
          >
            <Search size={18} aria-hidden />
            {busy ? "Looking…" : "Find my table"}
          </button>
          {isCode && (
            <button type="button" onClick={reset} className="sf-focus mt-3 block min-h-[44px] w-full text-center text-[0.9375rem] underline underline-offset-4" style={{ color: INK_VARIANT, borderRadius: 6 }}>
              Search by name instead
            </button>
          )}
        </form>
      </section>
    </div>
  );
}

const STEP_ICON: Record<Step["icon"], typeof ArrowUp> = {
  enter: DoorOpen,
  straight: ArrowUp,
  left: CornerUpLeft,
  right: CornerUpRight,
  "slight-left": ArrowUpLeft,
  "slight-right": ArrowUpRight,
  arrive: MapPin,
};

function Result({
  result, info, from, accent, onEntrance,
}: {
  result: Found; info: FinderSite; from: string; accent: string; onEntrance: (id: string) => void;
}) {
  const { floor, tableId } = result;
  const table = floor.tables.find((t) => t.id === tableId);
  const entrances = floor.elements.filter((e) => e.kind === "entrance");
  const entrance = entrances.find((e) => e.id === from) ?? entrances[0] ?? null;
  const labelOf = (id: string, fallback: string) => info.entrances.find((e) => e.id === id)?.label ?? fallback;
  const entranceLabel = entrance ? labelOf(entrance.id, entrance.label) : "the entrance";

  return (
    // Phone: table, door, map, steps. Desktop: the map on the left, the rest beside it.
    <div className="lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] lg:gap-x-10">
      <TableBand name={table?.name.trim() || "Your table"} guest={firstName(result.guestName)} partySize={result.partySize} accent={accent} />

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
                    border: `1px solid ${on ? accent : OUTLINE}`,
                    background: on ? tint(accent, 12) : "#FFFFFF",
                    color: INK,
                  }}
                >
                  <DoorOpen size={16} aria-hidden style={{ color: on ? accent : INK_VARIANT }} />
                  {labelOf(e.id, e.label)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Wayfinder floor={floor} tableId={tableId} entranceId={entrance?.id ?? ""} entranceLabel={entranceLabel} accent={accent} />
    </div>
  );
}

/**
 * The answer, in the couple's colour: "Table" small, the number large. Names that
 * aren't "Table N" (a sweetheart table, "Family") are set as one serif line.
 */
function TableBand({ name, guest, partySize, accent }: { name: string; guest: string; partySize: number; accent: string }) {
  const numbered = /^table\s+(\S{1,4})$/i.exec(name);
  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden px-6 pb-5 pt-4 text-white lg:col-start-2 lg:row-start-1 lg:pb-6 lg:pt-5"
      style={{ background: accent, borderRadius: 28 }}
    >
      <TableMotif />
      <p className="relative text-[0.9375rem]" style={{ color: "rgb(255 255 255 / 0.9)" }}>
        {guest}, you&apos;re seated at
      </p>
      <div className="relative mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <h1 className="font-serif" style={{ textWrap: "balance" }}>
          {numbered ? (
            <span className="flex items-baseline gap-3 leading-none">
              <span className="text-[1.75rem]">Table</span>{" "}
              <span className="sf-rise inline-block text-[5.25rem] leading-[0.9] tracking-[-0.02em] tabular-nums">{numbered[1]}</span>
            </span>
          ) : (
            <span className="sf-rise inline-block pt-1 text-[2.5rem] leading-[1.05]">{name}</span>
          )}
        </h1>
        {partySize > 1 && (
          <p
            className="mb-1 inline-flex min-h-[32px] shrink-0 items-center gap-1.5 px-3 text-[0.875rem] font-medium"
            style={{ background: "rgb(255 255 255 / 0.16)", borderRadius: 999 }}
          >
            <Users size={15} aria-hidden />
            Party of {partySize}
          </p>
        )}
      </div>
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
    <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -right-16 -top-14 h-52 w-52" fill="none" stroke="white" strokeOpacity={0.18} strokeWidth={2}>
      <circle cx={100} cy={100} r={50} />
      {chairs.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={11} />
      ))}
    </svg>
  );
}

function Wayfinder({
  floor, tableId, entranceId, entranceLabel, accent,
}: {
  floor: Found["floor"]; tableId: string; entranceId: string; entranceLabel: string; accent: string;
}) {
  // The search runs once per table and entrance, not on every animation tick.
  const entrance = useMemo(() => floor.elements.find((e) => e.id === entranceId) ?? null, [floor, entranceId]);
  const route = useMemo(() => (entrance ? findRoute(floor, entrance, tableId) : null), [floor, entrance, tableId]);
  const steps = useMemo(() => (route ? directions(route, floor, entranceLabel, tableId) : []), [route, floor, entranceLabel, tableId]);

  const [focus, setFocus] = useState(true);
  const [replay, setReplay] = useState(0);
  const [progress, setProgress] = useState(0);
  const active = steps.reduce((a, s, i) => (progress >= s.at - 0.001 ? i : a), 0);

  return (
    <>
      {/* Edge to edge on phones: the room gets the whole width. */}
      <section
        aria-label="Floor plan"
        className="-mx-4 mt-4 px-2 pb-3 pt-2 sm:mx-0 sm:px-4 lg:sticky lg:top-6 lg:col-start-1 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-start"
        style={{ background: SURFACE_1, borderRadius: 28 }}
      >
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="inline-flex p-1" style={{ background: "rgb(47 30 38 / 0.06)", borderRadius: 999 }} role="group" aria-label="Map view">
            {[
              { on: true, label: "My route" },
              { on: false, label: "Whole room" },
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
                    background: pressed ? "#FFFFFF" : "transparent",
                    color: pressed ? INK : INK_VARIANT,
                    boxShadow: pressed ? "0 1px 2px rgb(47 30 38 / 0.14)" : "none",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {route && (
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              aria-label="Replay"
              title="Replay the route"
              className="sf-focus inline-flex h-11 w-11 shrink-0 items-center justify-center transition-colors duration-150 hover:bg-white"
              style={{ color: INK_VARIANT, borderRadius: 999 }}
            >
              <RotateCcw size={18} aria-hidden />
            </button>
          )}
        </div>
        <div className="[--sf-map-max:min(58svh,560px)] lg:[--sf-map-max:calc(100svh-9rem)]">
          <SeatMap floor={floor} targetId={tableId} route={route} entrance={entrance} accent={accent} focus={focus && Boolean(route)} replayKey={replay} onProgress={setProgress} />
        </div>
        {route && (
          <p className="px-2 pt-2 text-center text-[0.8125rem] leading-snug" style={{ color: INK_VARIANT }}>
            Turned so {theDoor(entranceLabel)} is behind you.
          </p>
        )}
      </section>

      <section aria-labelledby="sf-steps" className="mt-7 lg:col-start-2 lg:row-start-3 lg:mt-8">
        <h2 id="sf-steps" className="text-[1rem] font-medium" style={{ color: INK }}>
          {steps.length > 0 ? "How to get there" : "Finding your way"}
        </h2>
        {steps.length > 0 ? (
          <ol className="mt-4" aria-label="Directions">
            {steps.map((s, i) => {
              const Icon = STEP_ICON[s.icon];
              const on = i === active;
              const done = i < active;
              const last = i === steps.length - 1;
              return (
                <li key={i} aria-current={on ? "step" : undefined} className="relative grid grid-cols-[40px_1fr] gap-x-4 pb-5 last:pb-0">
                  {!last && (
                    <span
                      aria-hidden
                      className="absolute bottom-1 left-[19px] top-11 w-[2px] transition-colors duration-300"
                      style={{ background: done ? tint(accent, 45) : OUTLINE, borderRadius: 2 }}
                    />
                  )}
                  <span
                    aria-hidden
                    className="relative inline-flex h-10 w-10 items-center justify-center transition-[background-color,color,box-shadow] duration-300"
                    style={{
                      borderRadius: 999,
                      background: on ? accent : done ? tint(accent, 14) : "#FFFFFF",
                      color: on ? "#FFFFFF" : done ? accent : INK_VARIANT,
                      boxShadow: on ? `0 0 0 5px ${tint(accent, 18)}` : `inset 0 0 0 1px ${done ? "transparent" : OUTLINE}`,
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <span
                    className="self-center text-[1rem] leading-snug transition-colors duration-300"
                    style={{ color: on ? INK : INK_VARIANT, fontWeight: on ? 500 : 400, textWrap: "pretty" }}
                  >
                    {s.text}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-2 text-[1rem] leading-relaxed" style={{ color: INK_VARIANT }}>
            {entrance ? "We couldn't draw a route through the room, but your table is highlighted on the map." : "Your table is highlighted on the map."}
          </p>
        )}
      </section>
    </>
  );
}
