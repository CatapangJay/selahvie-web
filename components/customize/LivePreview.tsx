"use client";

import { useEffect, useRef, useState } from "react";
import { PREVIEW_READY, PREVIEW_STATE, type PreviewDevice, type PreviewState } from "@/lib/studioPreview";
import type { GuestGroup, GuestListEntry, WeddingConfig } from "@/types/wedding";

export type { PreviewDevice };

const VIEWPORT: Record<PreviewDevice, number> = { desktop: 1280, mobile: 390 };
const MOBILE_MAX_HEIGHT = 844;
const GUTTER = 24;

interface Props {
  config: WeddingConfig;
  guests: GuestListEntry[];
  groups: GuestGroup[];
  inviteCode: string;
  device: PreviewDevice;
}

/**
 * The couple's draft rendered in an iframe at a real device width, scaled
 * down to fit the canvas. Every change is posted to the frame, so it updates
 * as they type without reloading or losing its scroll position.
 */
export default function LivePreview({ config, guests, groups, inviteCode, device }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Bumped each time the frame (re)loads and asks for the draft.
  const [readyCount, setReadyCount] = useState(0);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow) return;
      if ((e.data as { type?: string } | null)?.type === PREVIEW_READY) setReadyCount((n) => n + 1);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!readyCount) return;
    const message: PreviewState = { type: PREVIEW_STATE, config, guests, groups, inviteCode, device };
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, [readyCount, config, guests, groups, inviteCode, device]);

  const viewport = VIEWPORT[device];
  const availWidth = Math.max(0, size.width - GUTTER * 2);
  const availHeight = Math.max(0, size.height - GUTTER * 2);
  const scale = availWidth ? Math.min(1, availWidth / viewport) : 1;
  const boxHeight = device === "mobile" ? Math.min(availHeight, MOBILE_MAX_HEIGHT * scale) : availHeight;
  const frameHeight = boxHeight / scale;
  const measured = size.width > 0 && size.height > 0;
  const mobile = device === "mobile";

  return (
    <div ref={canvasRef} className="relative min-h-0 flex-1 overflow-hidden">
      {/* Stays mounted while hidden so the frame keeps its scroll position. */}
      <div
        className="absolute left-1/2 top-6 -translate-x-1/2 overflow-hidden"
        style={{
          visibility: measured ? "visible" : "hidden",
          width: viewport * scale,
          height: boxHeight,
          borderRadius: mobile ? "1.75rem" : "var(--radius-md)",
          background: "var(--color-surface-container-lowest)",
          boxShadow: mobile
            ? "0 0 0 1px var(--color-outline), 0 0 0 6px var(--color-surface-container-lowest), 0 0 0 7px var(--color-outline), 0 24px 48px -12px rgb(47 30 38 / 0.22)"
            : "0 0 0 1px var(--color-outline), 0 24px 48px -16px rgb(47 30 38 / 0.18)",
        }}
      >
        {!readyCount && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Loading preview…</p>
          </div>
        )}
        <iframe
          ref={frameRef}
          src="/studio-preview"
          title="Live preview of your website"
          className="block origin-top-left border-0"
          style={{
            width: viewport,
            height: frameHeight,
            transform: `scale(${scale})`,
            visibility: readyCount ? undefined : "hidden",
          }}
        />
      </div>
    </div>
  );
}
