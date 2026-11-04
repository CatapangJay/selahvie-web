"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import Skeleton from "@/components/ui/Skeleton";
import { getDemoConfigBySlug } from "@/data/demoConfigs";
import { resolveFontPreset } from "@/data/fontPresets";
import { INVITE_PARAM } from "@/lib/invitations";
import { canvasToBlob, downloadBlob, fileStem, qrExtent, qrPath } from "@/lib/qr";
import { hasModule } from "@/lib/tiers";
import { RSVP_ANCHOR, sitePath } from "@/lib/weddingDetails";
import type { SiteResponse } from "@/lib/db/site";
import type { WeddingConfig } from "@/types/wedding";
import {
  CARD_H,
  CARD_W,
  PRINT_SCALE,
  cardContent,
  cardPalette,
  drawCard,
  fontString,
  layoutCard,
  type CardLayout,
  type FontFamilies,
  type FontSpec,
} from "./cardLayout";

type Loaded =
  | { kind: "ok"; slug: string; config: WeddingConfig }
  | { kind: "missing" | "error"; slug: string };

export default function InvitationView({ slug }: { slug: string }) {
  const demoConfig = getDemoConfigBySlug(slug);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const current = demoConfig ? ({ kind: "ok", slug, config: demoConfig } as const) : loaded?.slug === slug ? loaded : null;

  useEffect(() => {
    if (demoConfig) return;
    let cancelled = false;
    fetch(`/api/sites/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setLoaded({ kind: res.status === 404 ? "missing" : "error", slug });
          return;
        }
        const data = (await res.json()) as SiteResponse;
        if (!cancelled) setLoaded({ kind: "ok", slug, config: data.config });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ kind: "error", slug });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, demoConfig]);

  if (!current) {
    return (
      <Shell>
        <div aria-busy="true" aria-label="Loading the invitation">
          <Skeleton className="mx-auto aspect-[5/7] w-full max-w-[30rem]" rounded="sm" />
        </div>
      </Shell>
    );
  }

  if (current.kind !== "ok") {
    const missing = current.kind === "missing";
    return (
      <Notice
        title={missing ? "We couldn’t find this invitation" : "We couldn’t load this invitation"}
        body={
          missing
            ? "This wedding website hasn’t been published yet, or the link may be incorrect."
            : "Check your connection and try again."
        }
        action={missing ? null : <ButtonSecondary onClick={() => window.location.reload()}>Try again</ButtonSecondary>}
      />
    );
  }

  const { config } = current;
  if (!hasModule(config, "invitationDownload")) {
    return (
      <Notice
        title="This invitation isn’t available to download"
        body="Everything you need is on the wedding website, including the date, the venue and the RSVP."
        action={
          <Link href={sitePath(config)} className="btn-outline inline-flex min-h-[44px] items-center px-5 text-sm" style={{ borderRadius: "var(--radius-sm)" }}>
            Go to the website
          </Link>
        }
      />
    );
  }

  return <Invitation config={config} />;
}

function Shell({ children, back }: { children: React.ReactNode; back?: string }) {
  return (
    <main className="invitation-page mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-8 sm:py-12">
      {back && (
        <Link
          href={back}
          className="mb-8 inline-flex min-h-[44px] items-center gap-2 self-start text-sm transition-colors hover:text-[var(--color-primary)] print:hidden"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <ArrowLeft size={15} aria-hidden />
          Back to the website
        </Link>
      )}
      {children}
    </main>
  );
}

function Notice({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="headline-sm mb-4" style={{ textWrap: "balance" }}>{title}</h1>
      <p className="mb-8 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{body}</p>
      {action}
    </main>
  );
}

/** Every face the card uses, so the canvas can draw with them once loaded. */
const FACES: Omit<FontSpec, "size" | "leading">[] = [
  { role: "serif", weight: 400 },
  { role: "serif", weight: 400, italic: true },
  { role: "serif", weight: 500 },
  { role: "sans", weight: 400 },
  { role: "sans", weight: 500 },
];

/** The couple's font preset as concrete family lists (canvas can't read CSS variables). */
function resolveFamilies(presetId: string | undefined): FontFamilies {
  const preset = resolveFontPreset(presetId);
  const root = getComputedStyle(document.documentElement);
  const resolve = (value: string, fallback: string) =>
    value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => root.getPropertyValue(name).trim() || fallback);
  return { serif: resolve(preset.serif, "Georgia, serif"), sans: resolve(preset.sans, "system-ui, sans-serif") };
}

/** Card units → CSS, relative to the card's width (1000 units = 100cqw). */
const u = (n: number) => `${n / 10}cqw`;

function Invitation({ config }: { config: WeddingConfig }) {
  const invite = useSearchParams().get(INVITE_PARAM) ?? "";
  const [state, setState] = useState<{ layout: CardLayout; families: FontFamilies } | { error: true } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Laid out on the client only: it needs the page's origin, its fonts and a canvas to measure with.
  useEffect(() => {
    let cancelled = false;
    // A guest who came from their personal link keeps it on the RSVP code.
    const site = sitePath(config);
    const query = invite ? `?${INVITE_PARAM}=${encodeURIComponent(invite)}` : "";
    const content = cardContent(config, `${window.location.origin}${site}${query}#${RSVP_ANCHOR}`, `${window.location.host}${site}`);
    const families = resolveFamilies(config.fontPresetId);
    Promise.all(FACES.map((f) => document.fonts.load(fontString({ ...f, size: 40, leading: 1 }, families))))
      .then(() => document.fonts.ready)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        try {
          setState({ layout: layoutCard(content, families, cardPalette(config)), families });
        } catch {
          setState({ error: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [config, invite]);

  const stem = fileStem(config.partner1Name, config.partner2Name);
  const ready = state && "layout" in state ? state : null;

  const downloadImage = async () => {
    if (!ready) return;
    setSaving(true);
    setSaveError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = CARD_W * PRINT_SCALE;
      canvas.height = CARD_H * PRINT_SCALE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");
      drawCard(ctx, ready.layout, ready.families, PRINT_SCALE);
      downloadBlob(`${stem}-invitation.png`, await canvasToBlob(canvas));
    } catch {
      setSaveError("We couldn’t create the image. Try “Print or save as PDF” instead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell back={sitePath(config)}>
      <style>{PRINT_CSS}</style>
      <div className="mb-8 text-center print:hidden">
        <h1 className="headline-sm" style={{ textWrap: "balance" }}>Your invitation</h1>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          Save it to your phone, or print it on 5 × 7 in card. The code on it opens the RSVP.
        </p>
      </div>

      {state && "error" in state ? (
        <p role="alert" className="text-center text-sm" style={{ color: "var(--color-error)" }}>
          We couldn’t prepare the invitation in this browser. Everything is on the{" "}
          <Link href={sitePath(config)} className="underline underline-offset-4">wedding website</Link>.
        </p>
      ) : ready ? (
        <Card layout={ready.layout} families={ready.families} />
      ) : (
        <div aria-busy="true" aria-label="Preparing the invitation">
          <Skeleton className="mx-auto aspect-[5/7] w-full max-w-[30rem]" rounded="sm" />
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 print:hidden">
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonPrimary size="lg" onClick={downloadImage} disabled={!ready || saving} aria-busy={saving}>
            <Download size={15} aria-hidden />
            {saving ? "Preparing image…" : "Download image"}
          </ButtonPrimary>
          <ButtonSecondary size="lg" onClick={() => window.print()} disabled={!ready}>
            <Printer size={15} aria-hidden />
            Print or save as PDF
          </ButtonSecondary>
        </div>
        <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
          The image is 1500 × 2100 px, sharp enough to print at 5 × 7 in.
        </p>
        {saveError && (
          <p role="alert" className="text-sm" style={{ color: "var(--color-error)" }}>{saveError}</p>
        )}
      </div>
    </Shell>
  );
}

function Card({ layout, families }: { layout: CardLayout; families: FontFamilies }) {
  const { palette } = layout;
  return (
    <article
      className="invitation-card relative mx-auto w-full max-w-[30rem] overflow-hidden"
      style={{
        containerType: "inline-size",
        aspectRatio: `${CARD_W} / ${CARD_H}`,
        background: palette.paper,
        color: palette.ink,
        boxShadow: "0 8px 24px rgba(47, 30, 38, 0.07), 0 1px 2px rgba(47, 30, 38, 0.06)",
      }}
      aria-label="Wedding invitation"
    >
      <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {layout.shapes.map((shape, i) =>
          shape.kind === "frame" ? (
            <rect
              key={i}
              x={shape.inset}
              y={shape.inset}
              width={CARD_W - shape.inset * 2}
              height={CARD_H - shape.inset * 2}
              fill="none"
              stroke={shape.color}
              strokeWidth={shape.stroke}
            />
          ) : shape.kind === "line" ? (
            <rect key={i} x={shape.x1} y={shape.y - shape.stroke / 2} width={shape.x2 - shape.x1} height={shape.stroke} fill={shape.color} />
          ) : shape.kind === "diamond" ? (
            <polygon
              key={i}
              points={`${shape.cx},${shape.cy - shape.r} ${shape.cx + shape.r},${shape.cy} ${shape.cx},${shape.cy + shape.r} ${shape.cx - shape.r},${shape.cy}`}
              fill={shape.color}
            />
          ) : null
        )}
      </svg>

      {layout.lines.map((line, i) => {
        const tracking = line.font.tracking ?? 0;
        return (
          <p
            key={i}
            className="absolute m-0 whitespace-nowrap"
            style={{
              top: u(line.y),
              ...(line.align === "center" ? { left: 0, right: 0, textAlign: "center", paddingLeft: `${tracking}em` } : { left: u(line.x) }),
              height: u(line.font.size * line.font.leading),
              fontFamily: families[line.font.role],
              fontSize: u(line.font.size),
              lineHeight: u(line.font.size * line.font.leading),
              fontWeight: line.font.weight,
              fontStyle: line.font.italic ? "italic" : "normal",
              letterSpacing: tracking ? `${tracking}em` : "normal",
              color: line.color,
            }}
          >
            {line.text}
          </p>
        );
      })}

      {layout.shapes.map((shape, i) =>
        shape.kind === "qr" ? (
          <svg
            key={i}
            viewBox={`0 0 ${qrExtent(shape.matrix)} ${qrExtent(shape.matrix)}`}
            className="absolute"
            style={{ left: u(shape.x), top: u(shape.y), width: u(shape.side), height: u(shape.side) }}
            shapeRendering="crispEdges"
            role="img"
            aria-label="QR code that opens the RSVP"
          >
            <rect width="100%" height="100%" fill={shape.light} />
            <path d={qrPath(shape.matrix)} fill={shape.dark} />
          </svg>
        ) : null
      )}
    </article>
  );
}

const PRINT_CSS = `
@page { size: 5in 7in; margin: 0; }
@media print {
  html, body { background: #fff !important; margin: 0 !important; }
  body * { visibility: hidden !important; }
  .invitation-card, .invitation-card * { visibility: visible !important; }
  .invitation-page { padding: 0 !important; min-height: 0 !important; }
  .invitation-card {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 5in !important;
    max-width: none !important;
    height: 7in !important;
    margin: 0 !important;
    box-shadow: none !important;
    animation: none !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .invitation-card { animation: invitation-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both; }
}
@keyframes invitation-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
`;
