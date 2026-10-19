"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import PersonalizedTemplate from "@/components/wedding-templates/_shared/PersonalizedTemplate";
import { findInviteeByCode, isPersonalized } from "@/lib/invitations";
import { PREVIEW_READY, isPreviewState, type PreviewState } from "@/lib/studioPreview";

const noop = () => () => {};

/**
 * The page inside the studio's preview iframe. It renders whatever draft the
 * parent studio posts, so edits show up as the couple types. The iframe gives
 * templates their own viewport, so full-height heroes, fixed bars and
 * breakpoints behave as they do on the real site.
 */
export default function StudioPreviewFrame() {
  const [state, setState] = useState<PreviewState | null>(null);
  const standalone = useSyncExternalStore(noop, () => window.parent === window, () => false);

  useEffect(() => {
    if (window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      if (isPreviewState(e.data)) setState(e.data);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Phones scroll by swiping and show no scrollbar; hiding it also keeps the
  // full 390px width for the layout.
  const device = state?.device;
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollbarWidth = device === "mobile" ? "none" : "";
    return () => {
      root.style.scrollbarWidth = "";
    };
  }, [device]);

  // A "-preview" id turns RSVP and guestbook submissions into no-ops.
  const config = useMemo(() => (state ? { ...state.config, id: `${state.config.id}-preview` } : null), [state]);

  if (!state || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center" aria-busy={!standalone}>
        {standalone && (
          <p className="max-w-sm text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            This page shows a live preview inside the customization studio.
          </p>
        )}
      </div>
    );
  }

  const invitee =
    isPersonalized(state.config) && state.inviteCode
      ? findInviteeByCode(state.inviteCode, state.guests, state.groups)
      : null;

  return <PersonalizedTemplate config={config} invitee={invitee} guests={state.guests} showBranding={false} />;
}
