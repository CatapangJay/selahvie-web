"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Monitor, Printer, RectangleVertical, Smartphone } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { InputField, TextareaField } from "@/components/ui/InputField";
import Select from "@/components/ui/Select";
import { downloadBlob } from "@/lib/qr";
import { DEFAULT_HEADLINE, DEFAULT_MESSAGE, SIGN_FORMATS, drawSign, prepareSign, signPng, type SignFormat, type SignFormatId } from "@/lib/qrSign";
import type { GuestTheme } from "@/lib/weddingTheme";

export interface SignCode {
  id: string;
  /** Entrance name, when the plan has entrances. */
  entrance?: string;
  url: string;
}

interface Props {
  codes: SignCode[];
  theme: GuestTheme;
  names: string;
  meta: string;
  /** File name stem, e.g. "ana-ben". */
  stem: string;
}

const FORMAT_ICON: Record<SignFormatId, typeof Monitor> = {
  a5: RectangleVertical,
  a4: RectangleVertical,
  a3: RectangleVertical,
  easel: RectangleVertical,
  social: Smartphone,
  screen: Monitor,
};

/** Longest side of the on-screen preview, in device pixels. */
const PREVIEW_PX = 900;

/**
 * Signs for the day, between the ceremony and the reception: pick where it goes
 * (card, poster, easel board, phone, screen), which door's code, and the words.
 * The preview is drawn by the same code as the export.
 */
export default function SignDesigner({ codes, theme, names, meta, stem }: Props) {
  const ids = useId();
  const [codeId, setCodeId] = useState(codes[0]?.id ?? "");
  const [formatId, setFormatId] = useState<SignFormatId>("a4");
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [showEntrance, setShowEntrance] = useState(true);
  const [showLink, setShowLink] = useState(true);
  const [busy, setBusy] = useState<"png" | "print" | null>(null);
  const [error, setError] = useState("");
  const [printUrl, setPrintUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const code = codes.find((c) => c.id === codeId) ?? codes[0];
  const format = SIGN_FORMATS.find((f) => f.id === formatId) ?? SIGN_FORMATS[1];
  const entrance = showEntrance ? code?.entrance : undefined;
  const opts = code ? { url: code.url, theme, names, meta, entrance, headline, message, showLink } : null;

  // Redraw the preview whenever anything changes (fonts first, so canvas has them).
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !opts) return;
    let live = true;
    prepareSign(theme).then(() => {
      if (live) drawSign(canvas, format, opts, PREVIEW_PX / Math.max(format.width, format.height));
    });
    return () => {
      live = false;
    };
  });

  if (!code || !opts) return null;
  const file = `${stem}-find-your-table-${format.id}${code.entrance && codes.length > 1 ? `-${code.id}` : ""}`;

  const download = async () => {
    setError("");
    setBusy("png");
    try {
      downloadBlob(`${file}.png`, await signPng(format, opts));
    } catch {
      setError("Couldn't make the image. Try a smaller size, or try again.");
    } finally {
      setBusy(null);
    }
  };

  const print = async () => {
    setError("");
    setBusy("print");
    try {
      setPrintUrl(URL.createObjectURL(await signPng(format, opts)));
    } catch {
      setError("Couldn't get the sign ready to print. Try downloading the PNG instead.");
      setBusy(null);
    }
  };

  const landscape = format.width > format.height;

  return (
    <section aria-labelledby={`${ids}-title`} className="space-y-5 pt-6" style={{ borderTop: "1px solid var(--color-outline)" }}>
      <div className="max-w-xl space-y-1.5">
        <h3 id={`${ids}-title`} className="text-[1.0625rem] font-medium" style={{ color: "var(--color-on-surface)" }}>
          Signs for the day
        </h3>
        <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          For the entrance, an easel by cocktail hour, or a screen while guests make their way from the ceremony
          to the reception. In your colours, with the code ready to scan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <fieldset>
            <legend className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
              Where it goes
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Sign size">
              {SIGN_FORMATS.map((f) => {
                const on = f.id === format.id;
                const Icon = FORMAT_ICON[f.id];
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setFormatId(f.id)}
                    className="flex min-h-[56px] items-start gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${on ? "var(--color-primary)" : "var(--color-outline)"}`,
                      background: on ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                    }}
                  >
                    <Icon
                      size={16}
                      aria-hidden
                      className={`mt-0.5 shrink-0 ${f.id === "a5" ? "scale-75" : f.id === "a3" || f.id === "easel" ? "scale-110" : ""}`}
                      style={{ color: on ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)" }}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{f.label}</span>
                      <span className="block text-xs leading-snug" style={{ color: "var(--color-on-surface-variant)" }}>{f.use}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {codes.length > 1 && (
            <Select
              id={`${ids}-door`}
              label="Which entrance's code"
              value={code.id}
              onChange={setCodeId}
              options={codes.map((c) => ({ value: c.id, label: c.entrance ?? "Find your table" }))}
            />
          )}

          <InputField
            id={`${ids}-headline`}
            label="Headline"
            value={headline}
            maxLength={40}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={DEFAULT_HEADLINE}
          />
          <TextareaField
            id={`${ids}-message`}
            label="Message"
            value={message}
            rows={3}
            maxLength={180}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={DEFAULT_MESSAGE}
          />

          <div className="space-y-2.5 text-sm" style={{ color: "var(--color-on-surface)" }}>
            {code.entrance && (
              <label className="flex items-center gap-2.5">
                <input type="checkbox" checked={showEntrance} onChange={(e) => setShowEntrance(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                Say which entrance this is (&ldquo;You&apos;re at the {code.entrance.replace(/^the\s+/i, "")}&rdquo;)
              </label>
            )}
            <label className="flex items-center gap-2.5">
              <input type="checkbox" checked={showLink} onChange={(e) => setShowLink(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
              Print the link too, for guests without a camera
            </label>
          </div>

          {(headline !== DEFAULT_HEADLINE || message !== DEFAULT_MESSAGE) && (
            <button
              type="button"
              onClick={() => {
                setHeadline(DEFAULT_HEADLINE);
                setMessage(DEFAULT_MESSAGE);
              }}
              className="text-sm underline underline-offset-4"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Use the original wording
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div
            className="flex items-center justify-center p-4 sm:p-6"
            style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", minHeight: 320 }}
          >
            <canvas
              ref={previewRef}
              role="img"
              aria-label={`Preview: ${format.label} sign for ${names || "your wedding"}${entrance ? `, ${entrance}` : ""}`}
              className="block h-auto shadow-[0_12px_32px_-16px_rgb(47_30_38_/_0.35)]"
              style={{ width: "100%", maxWidth: landscape ? 560 : 340, borderRadius: 4 }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            {format.print
              ? `${format.label.split(" · ")[1]} at print quality (${format.width} × ${format.height} px). Print at 100% or “actual size”.`
              : `${format.width} × ${format.height} px, sized for ${format.id === "screen" ? "a TV or projector" : "phones"}.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonPrimary size="sm" onClick={download} disabled={busy !== null}>
              <Download size={14} aria-hidden />
              {busy === "png" ? "Making the image…" : "Download PNG"}
            </ButtonPrimary>
            {format.print && (
              <ButtonSecondary size="sm" onClick={print} disabled={busy !== null}>
                <Printer size={14} aria-hidden />
                {busy === "print" ? "Getting it ready…" : "Print or save as PDF"}
              </ButtonSecondary>
            )}
          </div>
          {error && (
            <p role="alert" className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
          )}
        </div>
      </div>

      {printUrl && format.print && (
        <SignPrint
          url={printUrl}
          format={format}
          onDone={() => {
            URL.revokeObjectURL(printUrl);
            setPrintUrl(null);
            setBusy(null);
          }}
        />
      )}
    </section>
  );
}

/**
 * The sign alone, page-sized, for the print dialog (and "Save as PDF"). While it's
 * mounted, print styles hide the rest of the app; it unmounts when the dialog closes.
 */
function SignPrint({ url, format, onDone }: { url: string; format: SignFormat; onDone: () => void }) {
  const ready = useRef(false);
  useEffect(() => {
    window.addEventListener("afterprint", onDone);
    return () => window.removeEventListener("afterprint", onDone);
  }, [onDone]);

  return createPortal(
    <div data-sign-print="">
      <style>{`
        @media screen { [data-sign-print] { display: none; } }
        @media print {
          @page { size: ${format.print!.width} ${format.print!.height}; margin: 0; }
          body > *:not([data-sign-print]) { display: none !important; }
          html, body { background: #fff !important; margin: 0 !important; }
          [data-sign-print] img { display: block; width: ${format.print!.width}; height: ${format.print!.height}; }
        }
      `}</style>
      {/* eslint-disable-next-line @next/next/no-img-element -- a local blob, printed as is */}
      <img
        src={url}
        alt=""
        onLoad={() => {
          if (ready.current) return;
          ready.current = true;
          // Let the image paint before the dialog snapshots the page.
          requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
        }}
      />
    </div>,
    document.body
  );
}
