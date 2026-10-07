"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
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
}

export default function PhotoField({ label, value, onChange, scope, aspect = "16/9", hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadPhoto(file, scope);
      const previous = value;
      onChange(url);
      deletePhoto(previous);
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
    deletePhoto(previous);
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
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="label-luxury inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.92)", color: "#2c1c22" }}
            >
              <RefreshCw size={13} aria-hidden /> Replace
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
