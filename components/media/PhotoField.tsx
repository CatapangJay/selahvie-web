"use client";

import { useId, useRef, useState } from "react";
import { Check, Images, ImagePlus, Loader2, RefreshCw, Trash2, X } from "lucide-react";
import { deletePhoto, uploadPhoto } from "@/lib/storage/client";
import { IMAGE_ACCEPT_ATTR } from "@/lib/storage/limits";
import { useDropTarget } from "./useDropTarget";

interface Props {
  label: string;
  /** Current photo URL; empty/undefined when none. */
  value?: string;
  /** Called with the new URL, or "" when the photo is removed. */
  onChange: (url: string) => void;
  /** Wedding id; photos are filed under it in storage. */
  scope: string;
  /** CSS aspect-ratio of the frame, e.g. "16/9". */
  aspect?: string;
  hint?: string;
  /**
   * Photos already on this website (e.g. the gallery), offered as a quick pick
   * instead of a new upload. These are shared, so they are never deleted from
   * storage when this field moves on from one of them.
   */
  library?: string[];
}

export default function PhotoField({ label, value, onChange, scope, aspect = "16/9", hint, library = [] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [choosing, setChoosing] = useState(false);
  const pickerId = useId();
  const choices = [...new Set(library.filter(Boolean))];

  /** Drop the old file from storage, unless something else on the site still shows it. */
  const release = (url: string | undefined) => {
    if (url && !choices.includes(url)) deletePhoto(url);
  };

  const choose = (url: string) => {
    setChoosing(false);
    setError("");
    if (url === value) return;
    const previous = value;
    onChange(url);
    release(previous);
  };

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadPhoto(file, scope);
      const previous = value;
      onChange(url);
      release(previous);
      setChoosing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    const previous = value;
    setError("");
    onChange("");
    release(previous);
  };

  const { dragging, handlers } = useDropTarget(handleFiles, busy);
  const pick = () => inputRef.current?.click();

  return (
    <div>
      <p id={labelId} className="label-luxury mb-2" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT_ATTR}
        className="hidden"
        aria-labelledby={labelId}
        onChange={(e) => {
          void handleFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {value ? (
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ aspectRatio: aspect, background: "var(--color-surface-container-high)" }}
          {...handlers}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 p-3"
            style={{ background: "linear-gradient(to top, rgba(20,12,14,0.55), transparent)" }}
          >
            {choices.length > 0 && (
              <button
                type="button"
                onClick={() => setChoosing((v) => !v)}
                disabled={busy}
                aria-expanded={choosing}
                aria-controls={pickerId}
                className="label-luxury inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.92)", color: "#2c1c22" }}
              >
                <Images size={13} aria-hidden /> Your photos
              </button>
            )}
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="label-luxury inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.92)", color: "#2c1c22" }}
            >
              <RefreshCw size={13} aria-hidden /> {choices.length > 0 ? "Upload" : "Replace"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="label-luxury inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.92)", color: "var(--color-error)" }}
            >
              <Trash2 size={13} aria-hidden /> Remove
            </button>
          </div>
          {(busy || dragging) && <Overlay busy={busy} />}
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          aria-labelledby={labelId}
          className="relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl px-6 text-center transition-colors disabled:cursor-wait"
          style={{
            aspectRatio: aspect,
            minHeight: 140,
            background: dragging ? "var(--color-surface-container-high)" : "var(--color-surface)",
            border: `1.5px dashed ${dragging ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
            color: "var(--color-on-surface-variant)",
          }}
          {...handlers}
        >
          {busy ? (
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-primary)" }} aria-hidden />
          ) : (
            <ImagePlus size={22} style={{ color: "var(--color-primary)" }} aria-hidden />
          )}
          <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
            {busy ? "Uploading…" : "Upload a photo"}
          </span>
          <span className="text-xs font-light">Click to browse or drop a file here. JPG, PNG, WebP or GIF, up to 5 MB.</span>
        </button>
      )}

      {!value && choices.length > 0 && !choosing && (
        <button
          type="button"
          onClick={() => setChoosing(true)}
          disabled={busy}
          aria-expanded={false}
          aria-controls={pickerId}
          className="mt-2 inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline disabled:opacity-50"
          style={{ color: "var(--color-primary)" }}
        >
          <Images size={15} aria-hidden /> Or choose from your photos
        </button>
      )}

      {choosing && choices.length > 0 && (
        <div
          id={pickerId}
          role="group"
          aria-label={`Choose the ${label.toLowerCase()} from your photos`}
          className="mt-3 rounded-xl p-3"
          style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}
        >
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
              Your photos
            </p>
            <button
              type="button"
              onClick={() => setChoosing(false)}
              aria-label="Close your photos"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-container-high)]"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <X size={15} aria-hidden />
            </button>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {choices.map((url, i) => {
              const current = url === value;
              return (
                <li key={url}>
                  <button
                    type="button"
                    onClick={() => choose(url)}
                    disabled={busy}
                    aria-pressed={current}
                    aria-label={current ? `Photo ${i + 1}, current ${label.toLowerCase()}` : `Use photo ${i + 1} as the ${label.toLowerCase()}`}
                    className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90 disabled:cursor-wait"
                    style={{
                      background: "var(--color-surface-container-high)",
                      outline: current ? "2px solid var(--color-primary)" : undefined,
                      outlineOffset: 2,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {current && (
                      <span
                        aria-hidden
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: "var(--color-primary)", color: "#fff" }}
                      >
                        <Check size={13} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hint && !error && (
        <p className="mt-2 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>{hint}</p>
      )}
      <p className="sr-only" role="status" aria-live="polite">{busy ? "Uploading photo" : ""}</p>
      {error && (
        <p className="mt-2 text-sm" style={{ color: "var(--color-error)" }} role="alert">{error}</p>
      )}
    </div>
  );
}

function Overlay({ busy }: { busy: boolean }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm"
      style={{ background: "rgba(255,255,255,0.78)", color: "#2c1c22" }}
    >
      {busy ? <Loader2 size={22} className="animate-spin" aria-hidden /> : <ImagePlus size={22} aria-hidden />}
      {busy ? "Uploading…" : "Drop to replace"}
    </div>
  );
}
