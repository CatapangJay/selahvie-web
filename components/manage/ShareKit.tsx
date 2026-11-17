"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Copy, Download, ExternalLink, Globe, Info, Lock, MessageSquareText, QrCode, Signpost } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { configTier, hasModule, upgradePrice } from "@/lib/tiers";
import { downloadFile, formatPrice } from "@/lib/utils";
import { downloadBlob, fileStem, qrExtent, qrMatrix, qrPath, qrPngBlob, qrSvgMarkup } from "@/lib/qr";
import { ceremonyVenue, invitationPath, receptionVenue, RSVP_ANCHOR, safeUrl, sitePath } from "@/lib/weddingDetails";
import { planOf } from "@/lib/seating";
import { entrancesOf, seatFinderPath } from "@/lib/seatFinder";
import { weddingTheme, type GuestTheme } from "@/lib/weddingTheme";
import SignDesigner, { type SignPurpose } from "@/components/manage/SignDesigner";
import SmsInvites from "@/components/manage/SmsInvites";
import type { WeddingConfig } from "@/types/wedding";

/** "2026-10-31" → "October 31, 2026". */
function formatWeddingDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

interface Props {
  config: WeddingConfig;
  onUpgrade: () => void;
}

interface ShareCode {
  id: string;
  label: string;
  hint: string;
  url: string;
  /** Table finder codes: which door the code is for (signs say "You're at the …"). */
  sign?: { entrance?: string };
  /** Something to sort out before the code is useful, shown on its card. */
  note?: string;
}

/** How each code is drawn: the wedding's theme (lib/weddingTheme), plus what the sign prints. */
interface QrLook {
  theme: GuestTheme;
  names: string;
  meta: string;
}

type Section = "codes" | "signs" | "texts";
const SECTIONS: readonly Section[] = ["codes", "signs", "texts"];

const MUTED = { color: "var(--color-on-surface-variant)" } as const;
const TEXT_LINK =
  "inline-flex items-center gap-1.5 font-medium underline underline-offset-4 hover:text-[var(--color-primary)]";

/** The codes worth printing for this website. Codes with nothing to point at are left out. */
function shareCodes(config: WeddingConfig, origin: string): ShareCode[] {
  const site = `${origin}${sitePath(config)}`;
  const codes: ShareCode[] = [
    { id: "rsvp", label: "RSVP", hint: "Opens your website at the RSVP form.", url: `${site}#${RSVP_ANCHOR}` },
  ];

  const ceremony = ceremonyVenue(config).mapUrl;
  const reception = receptionVenue(config);
  if (ceremony) {
    codes.push({
      id: reception ? "ceremony-map" : "map",
      label: reception ? "Ceremony location" : "Location",
      hint: "Opens the venue in Google Maps.",
      url: ceremony,
    });
  }
  if (reception?.mapUrl) {
    codes.push({ id: "reception-map", label: "Reception location", hint: "Opens the reception venue in Google Maps.", url: reception.mapUrl });
  }

  const registry = (config.registryLinks ?? []).flatMap((l) => safeUrl(l.url) ?? []);
  if (registry.length === 1) {
    codes.push({ id: "registry", label: "Gift registry", hint: "Opens your registry.", url: registry[0] });
  } else if (registry.length > 1) {
    codes.push({ id: "registry", label: "Gift registry", hint: "Opens the registry section of your website.", url: `${site}#registry` });
  }

  codes.push({
    id: "invitation",
    label: "Digital invitation",
    hint: "Opens the invitation guests can save or print.",
    url: `${origin}${invitationPath(config)}`,
  });
  return codes;
}

/** One "Find your table" code per entrance on the floor plan, so the route starts at that door. */
function tableFinderCodes(config: WeddingConfig, origin: string): ShareCode[] {
  const plan = planOf(config);
  const entrances = entrancesOf(plan);
  const note =
    Object.keys(plan.assignments).length === 0
      ? "No one is seated yet. Seat guests on the Seating tab so there's a table to find."
      : entrances.length === 0
        ? "Add an Entrance to the floor plan (Seating → room features) so guests get directions too."
        : undefined;
  if (entrances.length === 0) {
    return [{ id: "table-finder", label: "Find your table", hint: "Guests type their name and see their table on the floor plan.", url: `${origin}${seatFinderPath(config)}`, sign: {}, note }];
  }
  return entrances.map((e, i) => ({
    id: entrances.length > 1 ? `table-finder-${i + 1}-${fileStem(e.label)}` : "table-finder",
    label: entrances.length > 1 ? `Find your table: ${e.label}` : "Find your table",
    hint: `For ${e.label.toLowerCase().startsWith("the ") ? e.label : `the ${e.label.toLowerCase()}`}. Guests type their name and get a route to their table from there.`,
    url: `${origin}${seatFinderPath(config, e.id)}`,
    sign: { entrance: e.label },
    note,
  }));
}

/** "2027-05-01" → "May 1". */
const monthDay = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
};

/** What a sign or card can be for, each with its codes and starting wording. Purposes with nothing to point at are left out. */
function signPurposes(config: WeddingConfig, codes: ShareCode[], finderCodes: ShareCode[] | null): SignPurpose[] {
  const find = (id: string) => codes.find((c) => c.id === id);
  const purposes: SignPurpose[] = [];
  const invitation = find("invitation");
  if (invitation) {
    purposes.push({
      id: "invitation",
      label: "Invitation",
      hint: "Tuck it in with printed invitations, or send it to guests. It opens your invitation.",
      headline: "You're invited",
      message: "Scan for our invitation, the details of the day, and to let us know you're coming.",
      codes: [{ id: invitation.id, label: invitation.label, url: invitation.url }],
    });
  }
  const by = monthDay(config.rsvpDeadline);
  purposes.push({
    id: "rsvp",
    label: "RSVP",
    hint: "An insert for save-the-dates and invitations. It opens your website at the RSVP form.",
    headline: "Kindly reply",
    message: `Scan to let us know if you can join us${by ? ` by ${by}` : ""}. It only takes a minute.`,
    codes: [{ id: "rsvp", label: "RSVP", url: find("rsvp")!.url }],
  });
  const maps = codes.filter((c) => c.id.endsWith("map"));
  if (maps.length) {
    purposes.push({
      id: "directions",
      label: "Directions",
      hint: "For the ceremony programme or the welcome table, so guests can find their way to the reception.",
      headline: "Find your way",
      message: "Scan for directions on Google Maps.",
      pick: "Which venue",
      codes: maps.map((c) => ({ id: c.id, label: c.label.replace(/ location$/, "").replace(/^Location$/, "Venue"), url: c.url })),
    });
  }
  const registry = find("registry");
  if (registry) {
    purposes.push({
      id: "registry",
      label: "Registry",
      hint: "A card for the gift table, or to tuck in with the invitations.",
      headline: "With love",
      message: "Having you with us is the greatest gift. If you'd like to give something more, scan to see our registry.",
      codes: [{ id: registry.id, label: registry.label, url: registry.url }],
    });
  }
  if (finderCodes) {
    purposes.push({
      id: "table-finder",
      label: "Table finder",
      hint: "For the entrance on the day. Guests type their name and see their table and the way there.",
      headline: "Find your table",
      message: "Scan with your phone camera and type your name. We'll show you your table and the way there.",
      pick: "Which entrance",
      codes: finderCodes.map((c) => ({ id: c.id, label: c.sign?.entrance ?? "Find your table", entrance: c.sign?.entrance, url: c.url })),
    });
  }
  return purposes;
}

/**
 * Everything for getting the website in front of guests: the link itself, then
 * QR codes (the day-of table finder's among them), signs and cards built around
 * them, and text invitations, each in its own sub-tab (Premium).
 */
export default function ShareKit({ config, onUpgrade }: Props) {
  const unlocked = hasModule(config, "qrCodes");
  const seating = hasModule(config, "seating");
  const sms = hasModule(config, "sms");
  // Only rendered on the client once the wedding store has loaded, so `window` is available.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const codes = useMemo(() => shareCodes(config, origin), [config, origin]);
  const finderCodes = useMemo(() => tableFinderCodes(config, origin), [config, origin]);
  // The table finder is part of Premium: its codes sit with the others.
  const allCodes = useMemo(() => (seating ? [...codes, ...finderCodes] : codes), [codes, finderCodes, seating]);
  const stem = fileStem(config.partner1Name, config.partner2Name);
  const published = config.status === "published";
  // Codes and signs use the couple's chosen colours and fonts.
  const look = useMemo<QrLook>(
    () => ({
      theme: weddingTheme(config),
      names: [config.partner1Name, config.partner2Name].map((n) => n?.trim()).filter(Boolean).join(" & "),
      meta: [formatWeddingDate(config.weddingDate), (receptionVenue(config)?.name || config.venueName)?.trim()].filter(Boolean).join(" · "),
    }),
    [config]
  );
  const purposes = useMemo(() => signPurposes(config, codes, seating ? finderCodes : null), [config, codes, finderCodes, seating]);
  const [purposeId, setPurposeId] = useState(purposes[0]?.id ?? "rsvp");
  const photos = useMemo(
    () => [...new Set([config.heroImageUrl, ...(config.galleryImageUrls ?? [])].filter((u): u is string => Boolean(u?.trim())))],
    [config.heroImageUrl, config.galleryImageUrls]
  );

  const tabs: { id: Section; label: string; icon: typeof QrCode; tag?: ReactNode }[] = [
    { id: "codes", label: "QR codes", icon: QrCode, tag: <Count n={allCodes.length} /> },
    { id: "signs", label: "Signs & cards", icon: Signpost },
    ...(sms ? ([{ id: "texts", label: "Text invites", icon: MessageSquareText }] as const) : []),
  ];
  const available = tabs.map((t) => t.id);

  // ?share=signs deep-links a sub-tab, like ?tab= does for the manage sections.
  // The table finder used to have its own tab; old ?share=finder links land on the codes.
  const shareParam = useSearchParams().get("share");
  const requested = (shareParam === "finder" ? "codes" : shareParam) as Section | null;
  const [section, setSection] = useState<Section>(requested && SECTIONS.includes(requested) ? requested : "codes");
  const current = available.includes(section) ? section : "codes";

  const open = (next: Section, focus = false) => {
    setSection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("share", next);
    window.history.replaceState(null, "", url);
    if (focus) document.getElementById(`share-tab-${next}`)?.focus();
  };

  // Roving focus across the sub-tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = available.indexOf(current);
    const next =
      e.key === "ArrowRight" ? available[(i + 1) % available.length]
      : e.key === "ArrowLeft" ? available[(i - 1 + available.length) % available.length]
      : e.key === "Home" ? available[0]
      : e.key === "End" ? available[available.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    open(next, true);
  };

  const panel = (id: Section) => ({
    id: `share-panel-${id}`,
    role: "tabpanel" as const,
    "aria-labelledby": `share-tab-${id}`,
    hidden: current !== id,
    tabIndex: 0,
    className: "ribbon-swap focus-visible:outline-none",
  });

  return (
    <div className="space-y-8">
      <SiteLink url={`${origin}${sitePath(config)}`} path={sitePath(config)} published={published} configId={config.id} />

      {!unlocked && (
        <div
          className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          style={{ background: "var(--color-primary-container)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
        >
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
              <Lock size={12} aria-hidden />
              Premium plan
            </p>
            <h2 className="headline-sm mt-2" style={{ fontSize: "1.35rem" }}>QR codes for everything you print</h2>
            <p className="mt-2 max-w-md text-sm" style={MUTED}>
              Put codes for your RSVP, the venue map, your registry and a downloadable invitation on save-the-dates,
              programs and table cards.
            </p>
          </div>
          <div className="shrink-0">
            <ButtonPrimary size="lg" onClick={onUpgrade}>
              Upgrade for {formatPrice(upgradePrice(configTier(config), "premium"))}
            </ButtonPrimary>
            <p className="mt-2 text-center text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
              One-time upgrade for this website
            </p>
          </div>
        </div>
      )}

      <div inert={!unlocked} style={{ opacity: unlocked ? 1 : 0.5 }}>
        {tabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Ways to share"
            className="-mx-1 mb-8 flex gap-1 overflow-x-auto px-1"
            style={{ boxShadow: "inset 0 -1px 0 var(--color-outline)" }}
          >
            {tabs.map(({ id, label, icon: Icon, tag }) => {
              const active = current === id;
              return (
                <button
                  key={id}
                  id={`share-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`share-panel-${id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => open(id)}
                  onKeyDown={onTabKey}
                  className="relative inline-flex min-h-[44px] shrink-0 items-center gap-2 px-3 text-sm transition-colors duration-150 hover:text-[var(--color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                  style={{
                    borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                    color: active ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  <Icon size={15} aria-hidden />
                  {label}
                  {tag}
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-0.5 origin-center transition-transform duration-200"
                    style={{
                      background: "var(--color-primary)",
                      borderRadius: "2px 2px 0 0",
                      transform: active ? "scaleX(1)" : "scaleX(0)",
                      transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}

        <div {...panel("codes")}>
          <PanelIntro title="QR codes">
            A code for each place guests might scan: save-the-dates, programs, table cards. They&apos;re high-contrast
            with a clear margin, so they print well at 2.5&nbsp;cm (1&nbsp;inch) and up.
          </PanelIntro>
          <QrGrid codes={allCodes} stem={stem} look={look} />
          {hasModule(config, "invitationDownload") && (
            <p className="mt-6 text-sm">
              <Link href={invitationPath(config)} target="_blank" rel="noopener" className={TEXT_LINK} style={{ color: "var(--color-primary-dim)" }}>
                See the printable invitation
                <ExternalLink size={13} aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </p>
          )}
        </div>

        <div {...panel("signs")}>
          <SignDesigner
            purposes={purposes}
            purposeId={purposeId}
            onPurposeChange={setPurposeId}
            theme={look.theme}
            names={look.names}
            meta={look.meta}
            stem={stem}
            photos={photos}
          />
        </div>

        {sms && (
          <div {...panel("texts")}>
            <SmsInvites config={config} />
          </div>
        )}
      </div>
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-xs tabular-nums"
      style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)", borderRadius: "var(--radius-full)" }}
    >
      {n}
    </span>
  );
}

function PanelIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl space-y-1.5">
        <h2 className="text-[1.0625rem] font-medium" style={{ color: "var(--color-on-surface)" }}>{title}</h2>
        <p className="text-sm" style={MUTED}>{children}</p>
      </div>
    </div>
  );
}

/** The website's own link: the thing couples share most, so it sits above everything else. */
function SiteLink({ url, path, published, configId }: { url: string; path: string; published: boolean; configId: string }) {
  return (
    <section
      aria-labelledby="site-link-title"
      className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8"
      style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
    >
      <div className="min-w-0 lg:max-w-xs">
        <h2 id="site-link-title" className="flex items-center gap-2 text-[1.0625rem] font-medium" style={{ color: "var(--color-on-surface)" }}>
          <Globe size={16} aria-hidden style={{ color: "var(--color-primary)" }} />
          Your website link
        </h2>
        <p className="mt-1 text-sm" style={MUTED}>
          {published ? (
            "Paste it into messages, group chats and emails."
          ) : (
            <>
              Still a draft: guests will see it once you{" "}
              <Link href={`/dashboard/customize/${configId}?step=publish`} className="font-medium underline underline-offset-4" style={{ color: "var(--color-primary-dim)" }}>
                publish
              </Link>
              . Everything here is ready ahead of time.
            </>
          )}
        </p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <CopyField url={url} label="Your website" className="min-h-[44px] flex-1" />
        <Link
          href={path}
          target="_blank"
          rel="noopener"
          className="btn-outline label-luxury inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 px-5 text-xs"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <ExternalLink size={13} aria-hidden />
          {published ? "Open" : "Preview"}
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </div>
    </section>
  );
}

/** A read-only link with a copy button. */
function CopyField({ url, label, className = "" }: { url: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
    }
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <div
        className="flex h-full min-w-0 items-center gap-1 py-1 pl-3 pr-1"
        style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-outline)" }}
      >
        <input
          readOnly
          value={url}
          aria-label={`${label} link`}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          style={MUTED}
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1.5 px-2.5 text-xs font-medium transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]"
          style={{ color: copied ? "var(--color-success)" : "var(--color-on-surface-variant)", borderRadius: "var(--radius-sm)" }}
          aria-label={`Copy ${label} link`}
        >
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          <span aria-hidden>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</p>
      {error && (
        <p role="alert" className="mt-1 text-xs" style={{ color: "var(--color-error)" }}>
          Couldn&apos;t copy. Select the link and copy it instead.
        </p>
      )}
    </div>
  );
}

function QrGrid({ codes, stem, look }: { codes: ShareCode[]; stem: string; look: QrLook }) {
  return (
    <ul className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))" }}>
      {codes.map((code) => (
        <QrCard key={code.id} code={code} stem={stem} look={look} />
      ))}
    </ul>
  );
}

/** One code: the QR as it will print, what it opens, its link, and the downloads. */
function QrCard({ code, stem, look }: { code: ShareCode; stem: string; look: QrLook }) {
  const { qrDark, qrLight } = look.theme;
  const matrix = useMemo(() => qrMatrix(code.url), [code.url]);
  const extent = qrExtent(matrix);
  const [error, setError] = useState("");
  const filename = `${stem}-${code.id}-qr`;
  const titleId = `qr-${code.id}-title`;

  const downloadPng = async () => {
    setError("");
    try {
      downloadBlob(`${filename}.png`, await qrPngBlob(code.url, 1200, qrDark, qrLight));
    } catch {
      setError("Couldn't create the image. Try the SVG instead.");
    }
  };

  return (
    <li
      aria-labelledby={titleId}
      className="flex flex-col gap-3 p-4"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
    >
      <div className="flex items-center justify-center p-3" style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-sm)" }}>
        <svg
          viewBox={`0 0 ${extent} ${extent}`}
          className="block aspect-square w-full max-w-[148px]"
          shapeRendering="crispEdges"
          role="img"
          aria-label={`QR code for ${code.label}`}
          style={{ borderRadius: 4 }}
        >
          <rect width={extent} height={extent} fill={qrLight} />
          <path d={qrPath(matrix)} fill={qrDark} />
        </svg>
      </div>

      <div>
        <h3 id={titleId} className="text-[0.9375rem] font-medium leading-snug" style={{ color: "var(--color-on-surface)" }}>
          {code.label}
        </h3>
        <p className="mt-0.5 text-[0.8125rem] leading-snug" style={MUTED}>{code.hint}</p>
        {code.note && (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-snug" style={{ color: "var(--color-on-surface)" }}>
            <Info size={13} aria-hidden className="mt-px shrink-0" style={{ color: "var(--color-primary)" }} />
            {code.note}
          </p>
        )}
      </div>

      <div className="mt-auto space-y-2">
        <CopyField url={code.url} label={code.label} />
        <div className="flex gap-2">
          <ButtonSecondary size="sm" className="flex-1" onClick={downloadPng} aria-label={`Download ${code.label} QR code as PNG`}>
            <Download size={13} aria-hidden />
            PNG
          </ButtonSecondary>
          <ButtonSecondary
            size="sm"
            className="flex-1"
            onClick={() => downloadFile(`${filename}.svg`, qrSvgMarkup(code.url, qrDark, qrLight), "image/svg+xml")}
            aria-label={`Download ${code.label} QR code as SVG`}
          >
            <Download size={13} aria-hidden />
            SVG
          </ButtonSecondary>
        </div>
        {error && (
          <p role="alert" className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
        )}
      </div>
    </li>
  );
}
