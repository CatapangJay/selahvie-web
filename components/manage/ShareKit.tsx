"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, ExternalLink, Lock } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { configTier, hasModule, upgradePrice } from "@/lib/tiers";
import { downloadFile, formatPrice } from "@/lib/utils";
import { downloadBlob, fileStem, qrExtent, qrMatrix, qrPath, qrPngBlob, qrSvgMarkup } from "@/lib/qr";
import { ceremonyVenue, invitationPath, receptionVenue, RSVP_ANCHOR, safeUrl, sitePath } from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  onUpgrade: () => void;
}

interface ShareCode {
  id: string;
  label: string;
  hint: string;
  url: string;
}

const QR_DARK = "#1a1416";
const QR_LIGHT = "#ffffff";

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

/** QR codes for the printed invitations, programs and table cards (Premium). */
export default function ShareKit({ config, onUpgrade }: Props) {
  const unlocked = hasModule(config, "qrCodes");
  // Only rendered on the client once the wedding store has loaded, so `window` is available.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const codes = useMemo(() => shareCodes(config, origin), [config, origin]);
  const stem = fileStem(config.partner1Name, config.partner2Name);
  const published = config.status === "published";

  return (
    <div className="space-y-8">
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
            <p className="mt-2 max-w-md text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
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

      <div inert={!unlocked} className="space-y-6" style={{ opacity: unlocked ? 1 : 0.5 }}>
        <div className="max-w-2xl space-y-2">
          <p className="text-[0.9375rem]" style={{ color: "var(--color-on-surface-variant)" }}>
            Download a code for each place guests might scan. They&apos;re high-contrast with a clear margin and
            built to survive a little wear, so they print well at 2.5&nbsp;cm (1&nbsp;inch) and up.
          </p>
          {!published && (
            <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              Your website is still a draft. The codes are ready to download, and they&apos;ll open for guests once
              you publish.
            </p>
          )}
        </div>

        <ul className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
          {codes.map((code) => (
            <QrCard key={code.id} code={code} stem={stem} />
          ))}
        </ul>

        {hasModule(config, "invitationDownload") && (
          <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            <Link
              href={invitationPath(config)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 hover:text-[var(--color-primary)]"
              style={{ color: "var(--color-primary-dim)" }}
            >
              See the printable invitation
              <ExternalLink size={13} aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function QrCard({ code, stem }: { code: ShareCode; stem: string }) {
  const matrix = useMemo(() => qrMatrix(code.url), [code.url]);
  const extent = qrExtent(matrix);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const filename = `${stem}-${code.id}-qr`;
  const titleId = `qr-${code.id}-title`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Select the link and copy it instead.");
    }
  };

  const downloadPng = async () => {
    setError("");
    try {
      downloadBlob(`${filename}.png`, await qrPngBlob(code.url, 1200, QR_DARK, QR_LIGHT));
    } catch {
      setError("Couldn't create the image. Try the SVG instead.");
    }
  };

  return (
    <li
      className="flex flex-col gap-4 p-5"
      style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)" }}
      aria-labelledby={titleId}
    >
      <div>
        <h3 id={titleId} className="text-[0.9375rem] font-medium" style={{ color: "var(--color-on-surface)" }}>
          {code.label}
        </h3>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{code.hint}</p>
      </div>

      <svg
        viewBox={`0 0 ${extent} ${extent}`}
        className="mx-auto block aspect-square w-full max-w-[200px]"
        shapeRendering="crispEdges"
        role="img"
        aria-label={`QR code for ${code.label}`}
        style={{ borderRadius: "var(--radius-sm)" }}
      >
        <rect width={extent} height={extent} fill={QR_LIGHT} />
        <path d={qrPath(matrix)} fill={QR_DARK} />
      </svg>

      <div
        className="flex min-w-0 items-center gap-1 py-1 pl-3 pr-1"
        style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-outline)" }}
      >
        <input
          readOnly
          value={code.url}
          aria-label={`${code.label} link`}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          style={{ color: "var(--color-on-surface-variant)" }}
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center transition-colors hover:text-[var(--color-primary)]"
          style={{ color: copied ? "var(--color-success)" : "var(--color-on-surface-variant)", borderRadius: "var(--radius-sm)" }}
          aria-label={`Copy ${code.label} link`}
        >
          {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</p>

      <div className="mt-auto flex gap-2">
        <ButtonSecondary size="sm" className="flex-1" onClick={downloadPng} aria-label={`Download ${code.label} QR code as PNG`}>
          <Download size={13} aria-hidden />
          PNG
        </ButtonSecondary>
        <ButtonSecondary
          size="sm"
          className="flex-1"
          onClick={() => downloadFile(`${filename}.svg`, qrSvgMarkup(code.url, QR_DARK, QR_LIGHT), "image/svg+xml")}
          aria-label={`Download ${code.label} QR code as SVG`}
        >
          <Download size={13} aria-hidden />
          SVG
        </ButtonSecondary>
      </div>
      {error && (
        <p role="alert" className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </li>
  );
}
