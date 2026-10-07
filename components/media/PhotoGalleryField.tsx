"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { deletePhoto, uploadPhoto } from "@/lib/storage/client";
import { IMAGE_ACCEPT_ATTR } from "@/lib/storage/limits";
import { useDropTarget } from "./useDropTarget";

interface Props {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  /** Wedding id; photos are filed under it in storage. */
  scope: string;
  max?: number;
  hint?: string;
}

export default function PhotoGalleryField({ label, value, onChange, scope, max = 8, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const photos = value.filter(Boolean);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");

  // Uploads finish at different times; always append to the newest list.
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = value.filter(Boolean);
  }, [value]);

  const commit = (next: string[]) => {
    latest.current = next;
    onChange(next);
  };

  const handleFiles = async (files: File[]) => {
    const room = max - latest.current.length - pending;
    const batch = files.slice(0, Math.max(0, room));
    if (batch.length === 0) {
      setError(`You can add up to ${max} photos.`);
      return;
    }
    setError(files.length > batch.length ? `Only the first ${batch.length} photo${batch.length === 1 ? "" : "s"} fit. The limit is ${max}.` : "");
    setPending((n) => n + batch.length);

    for (const file of batch) {
      try {
        const url = await uploadPhoto(file, scope);
        commit([...latest.current, url]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      } finally {
        setPending((n) => n - 1);
      }
    }
  };

  const remove = (index: number) => {
    setError("");
    deletePhoto(photos[index]);
    commit(photos.filter((_, i) => i !== index));
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const full = photos.length + pending >= max;
  const { dragging, handlers } = useDropTarget(handleFiles, full);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p id={labelId} className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
        <span className="text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
          {photos.length} / {max}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT_ATTR}
        multiple
        className="hidden"
        aria-labelledby={labelId}
        onChange={(e) => {
          void handleFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((url, i) => (
          <li
            key={url}
            className="relative aspect-square overflow-hidden rounded-xl"
            style={{ background: "var(--color-surface-container-high)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gallery photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.92)", color: "var(--color-error)" }}
            >
              <X size={15} aria-hidden />
            </button>
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move photo ${i + 1} earlier`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 disabled:invisible"
                style={{ background: "rgba(255,255,255,0.92)", color: "#2c1c22" }}
              >
                <ChevronLeft size={15} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === photos.length - 1}
                aria-label={`Move photo ${i + 1} later`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 disabled:invisible"
                style={{ background: "rgba(255,255,255,0.92)", color: "#2c1c22" }}
              >
                <ChevronRight size={15} aria-hidden />
              </button>
            </div>
          </li>
        ))}

        {Array.from({ length: pending }).map((_, i) => (
          <li
            key={`pending-${i}`}
            className="flex aspect-square items-center justify-center rounded-xl"
            style={{ background: "var(--color-surface-container-high)" }}
            aria-label="Uploading photo"
          >
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-primary)" }} aria-hidden />
          </li>
        ))}

        {!full && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-labelledby={labelId}
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl px-3 text-center transition-colors"
              style={{
                background: dragging ? "var(--color-surface-container-high)" : "var(--color-surface)",
                border: `1.5px dashed ${dragging ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                color: "var(--color-on-surface-variant)",
              }}
              {...handlers}
            >
              <ImagePlus size={22} style={{ color: "var(--color-primary)" }} aria-hidden />
              <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Add photos</span>
              <span className="text-xs font-light">Browse or drop</span>
            </button>
          </li>
        )}
      </ul>

      {hint && !error && (
        <p className="mt-2 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>{hint}</p>
      )}
      <p className="sr-only" role="status" aria-live="polite">{pending > 0 ? "Uploading photos" : ""}</p>
      {error && (
        <p className="mt-2 text-sm" style={{ color: "var(--color-error)" }} role="alert">{error}</p>
      )}
    </div>
  );
}
