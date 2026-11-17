"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ban, Download, ImageOff, Monitor, Printer, RectangleVertical, Smartphone } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { InputField, TextareaField } from "@/components/ui/InputField";
import Select from "@/components/ui/Select";
import { downloadBlob } from "@/lib/qr";
import {
  SIGN_FORMATS,
  SIGN_STYLES,
  drawSign,
  loadSignPhoto,
  prepareSign,
  signPng,
  type SignFormat,
  type SignFormatId,
  type SignOptions,
  type SignStyleId,
} from "@/lib/qrSign";
import type { GuestTheme } from "@/lib/weddingTheme";

export interface SignCode {
  id: string;
  /** Name in the "which one" picker, e.g. "Main entrance" or "Reception". */
  label: string;
  /** Entrance name, when the plan has entrances ("You're at the …" on the sign). */
  entrance?: string;
  url: string;
}

/** What a sign is for: where its code leads, and the wording it starts with. */
export interface SignPurpose {
  id: string;
  label: string;
  /** One line on where it's used, shown under the picker. */
  hint: string;
  headline: string;
  message: string;
  /** Label for the picker when there's more than one code, e.g. "Which entrance". */
  pick?: string;
  codes: SignCode[];
}

interface Props {
  purposes: SignPurpose[];
  purposeId: string;
  onPurposeChange: (id: string) => void;
  theme: GuestTheme;
  names: string;
  meta: string;
  /** File name stem, e.g. "ana-ben". */
  stem: string;
  /** The couple's photos (hero first, then the gallery), for the photo styles. */
  photos: string[];
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
/** Longest side of each style thumbnail. */
const THUMB_PX = 220;

/**
 * Signs and cards with a code: pick what it's for (invitation, RSVP, directions,
 * registry, table finder), where it goes (card, poster, easel board, phone,
 * screen), which code when there's more than one, and the words.
 * The preview is drawn by the same code as the export.
 */
export default function SignDesigner({ purposes, purposeId, onPurposeChange, theme, names, meta, stem, photos }: Props) {
  const ids = useId();
  const purpose = purposes.find((p) => p.id === purposeId) ?? purposes[0];
  const codes = purpose?.codes ?? [];
  /** Which code, per purpose (e.g. the side entrance for the table finder). */
  const [codeIds, setCodeIds] = useState<Record<string, string>>({});
  const [formatId, setFormatId] = useState<SignFormatId>("a4");
  /** The couple's own wording, per purpose; unset means the purpose's default. */
  const [copy, setCopy] = useState<Record<string, { headline?: string; message?: string }>>({});
  const [showEntrance, setShowEntrance] = useState(true);
  const [showLink, setShowLink] = useState(true);
  const [styleId, setStyleId] = useState<SignStyleId>(photos.length ? "cover" : "band");
  const [photoUrl, setPhotoUrl] = useState<string | null>(photos[0] ?? null);
  /** The loaded photo for `photoUrl`; null while loading or when it can't be used. */
  const [photo, setPhoto] = useState<{ url: string; img: HTMLImageElement | null } | null>(null);
  const [busy, setBusy] = useState<"png" | "print" | null>(null);
  const [error, setError] = useState("");
  const [printUrl, setPrintUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const code = codes.find((c) => c.id === codeIds[purpose?.id ?? ""]) ?? codes[0];
  const headline = copy[purpose?.id ?? ""]?.headline ?? purpose?.headline ?? "";
  const message = copy[purpose?.id ?? ""]?.message ?? purpose?.message ?? "";
  const edit = (field: "headline" | "message", value: string) => {
    if (purpose) setCopy((c) => ({ ...c, [purpose.id]: { ...c[purpose.id], [field]: value } }));
  };
  const format = SIGN_FORMATS.find((f) => f.id === formatId) ?? SIGN_FORMATS[1];
  const entrance = showEntrance ? code?.entrance : undefined;
  const img = photo && photo.url === photoUrl ? photo.img : null;
  const photoBlocked = Boolean(photoUrl && photo?.url === photoUrl && !photo.img);
  const opts: SignOptions | null = code && purpose ? { url: code.url, theme, names, meta, entrance, headline: headline || purpose.headline, message: message || purpose.message, showLink, style: styleId, photo: img } : null;

  // Load the chosen photo (once per photo; loadSignPhoto caches).
  useEffect(() => {
    if (!photoUrl) return;
    let live = true;
    loadSignPhoto(photoUrl).then((loaded) => live && setPhoto({ url: photoUrl, img: loaded }));
    return () => {
      live = false;
    };
  }, [photoUrl]);

  // Redraw the preview and the style thumbnails whenever anything changes (fonts first).
  const thumbs = useRef<Partial<Record<SignStyleId, HTMLCanvasElement | null>>>({});
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !opts) return;
    let live = true;
    prepareSign(theme).then(() => {
      if (!live) return;
      drawSign(canvas, format, opts, PREVIEW_PX / Math.max(format.width, format.height));
      for (const st of SIGN_STYLES) {
        const t = thumbs.current[st.id];
        if (t) drawSign(t, format, { ...opts, style: st.id }, THUMB_PX / Math.max(format.width, format.height));
      }
    });
    return () => {
      live = false;
    };
  });

  if (!code || !opts || !purpose) return null;
  const file = `${stem}-${purpose.id}-sign-${styleId}-${format.id}${codes.length > 1 ? `-${code.id}` : ""}`;

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
    <section aria-labelledby={`${ids}-title`} className="space-y-6">
      <div className="max-w-xl space-y-1.5">
        <h2 id={`${ids}-title`} className="text-[1.0625rem] font-medium" style={{ color: "var(--color-on-surface)" }}>
          Signs &amp; cards
        </h2>
        <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          A card to tuck in with the invitations, a poster at the door, an easel by cocktail hour or a slide for
          the screen. In your colours, with the code ready to scan.
        </p>
      </div>

      <fieldset>
        <legend className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
          What it&apos;s for
        </legend>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="What the sign is for">
          {purposes.map((p) => {
            const on = p.id === purpose.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onPurposeChange(p.id)}
                className="inline-flex min-h-[40px] items-center px-4 text-sm transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                style={{
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${on ? "var(--color-primary)" : "var(--color-outline)"}`,
                  background: on ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                  color: on ? "var(--color-primary-dim)" : "var(--color-on-surface)",
                  fontWeight: on ? 500 : 400,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{purpose.hint}</p>
      </fieldset>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <fieldset>
            <legend className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
              Design
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Sign design">
              {SIGN_STYLES.map((st) => {
                const on = st.id === styleId;
                return (
                  <button
                    key={st.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`${st.label}: ${st.note}`}
                    title={st.note}
                    onClick={() => setStyleId(st.id)}
                    className="group flex flex-col items-center gap-1.5 p-2 transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${on ? "var(--color-primary)" : "var(--color-outline)"}`,
                      background: on ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                      boxShadow: on ? "inset 0 0 0 1px var(--color-primary)" : undefined,
                    }}
                  >
                    <span className="flex h-[92px] w-full items-center justify-center">
                      <canvas
                        aria-hidden
                        ref={(node) => {
                          thumbs.current[st.id] = node;
                        }}
                        className="block max-h-[92px] max-w-full"
                        style={{ borderRadius: 2, boxShadow: "0 2px 8px -3px rgb(47 30 38 / 0.35)" }}
                      />
                    </span>
                    <span className="text-xs font-medium" style={{ color: on ? "var(--color-primary-dim)" : "var(--color-on-surface)" }}>
                      {st.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
              {SIGN_STYLES.find((st) => st.id === styleId)?.note}.
            </p>
          </fieldset>

          {photos.length > 0 && (
            <fieldset>
              <legend className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
                Photo
              </legend>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Photo on the sign">
                <button
                  type="button"
                  role="radio"
                  aria-checked={photoUrl === null}
                  aria-label="No photo"
                  onClick={() => setPhotoUrl(null)}
                  className="inline-flex h-16 w-16 shrink-0 items-center justify-center transition-colors"
                  style={{
                    borderRadius: "var(--radius-sm)",
                    border: `${photoUrl === null ? 2 : 1}px solid ${photoUrl === null ? "var(--color-primary)" : "var(--color-outline)"}`,
                    color: "var(--color-on-surface-variant)",
                    background: "var(--color-surface-container-lowest)",
                  }}
                >
                  <Ban size={18} aria-hidden />
                </button>
                {photos.slice(0, 12).map((src, i) => {
                  const on = src === photoUrl;
                  return (
                    <button
                      key={src}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={i === 0 ? "Main photo" : `Gallery photo ${i}`}
                      onClick={() => setPhotoUrl(src)}
                      className="relative h-16 w-16 shrink-0 overflow-hidden transition-[box-shadow]"
                      style={{
                        borderRadius: "var(--radius-sm)",
                        boxShadow: on ? "0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary)" : "inset 0 0 0 1px var(--color-outline)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- the couple's own uploads, any host */}
                      <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  );
                })}
              </div>
              {photoBlocked && (
                <p className="mt-2 flex items-start gap-1.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                  <ImageOff size={13} aria-hidden className="mt-px shrink-0" />
                  This photo&apos;s host doesn&apos;t let it be saved into an image, so the sign uses your colours instead.
                  Upload the photo in the studio to use it here.
                </p>
              )}
            </fieldset>
          )}

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
              id={`${ids}-code`}
              label={purpose.pick ?? "Which code"}
              value={code.id}
              onChange={(id) => setCodeIds((c) => ({ ...c, [purpose.id]: id }))}
              options={codes.map((c) => ({ value: c.id, label: c.label }))}
            />
          )}

          <InputField
            id={`${ids}-headline`}
            label="Headline"
            value={headline}
            maxLength={40}
            onChange={(e) => edit("headline", e.target.value)}
            placeholder={purpose.headline}
          />
          <TextareaField
            id={`${ids}-message`}
            label="Message"
            value={message}
            rows={3}
            maxLength={180}
            onChange={(e) => edit("message", e.target.value)}
            placeholder={purpose.message}
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

          {(headline !== purpose.headline || message !== purpose.message) && (
            <button
              type="button"
              onClick={() => setCopy((c) => ({ ...c, [purpose.id]: {} }))}
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
              aria-label={`Preview: ${purpose.label} ${format.label} sign for ${names || "your wedding"}${entrance ? `, ${entrance}` : ""}`}
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
