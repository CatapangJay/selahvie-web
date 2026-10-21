"use client";

import { createElement, useMemo, type CSSProperties } from "react";
import { rendersOwnGreeting, resolveTemplate } from "@/components/wedding-templates";
import { resolveFontPreset } from "@/data/fontPresets";
import TemplateMotionProvider from "./TemplateMotionProvider";
import { InviteeProvider } from "./InviteeContext";
import InviteeGreeting from "./InviteeGreeting";
import {
  greetingFor,
  isOpenInviteMatchingOn,
  localGuestMatcher,
  personalizeConfig,
  type GuestMatcher,
  type Invitee,
} from "@/lib/invitations";
import type { GuestListEntry, WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  invitee: Invitee | null;
  /** This wedding's guest list, when it's on the client (previews, the owner). */
  guests?: GuestListEntry[];
  /** Recognises guests on the open invitation without the list (live sites). Takes precedence over `guests`. */
  matcher?: GuestMatcher | null;
  showBranding?: boolean;
}

/**
 * Renders a wedding template as a specific guest/group sees it: audience-
 * restricted sections applied, private sections + greeting enabled, RSVP
 * prefilled. With `invitee = null` (or a base-tier config) it's the public site.
 */
export default function PersonalizedTemplate({ config, invitee, guests, matcher: remoteMatcher, showBranding = true }: Props) {
  const view = useMemo(() => personalizeConfig(config, invitee), [config, invitee]);
  const greeting = rendersOwnGreeting(config.templateId) ? null : greetingFor(config, invitee);
  const matcher = useMemo(() => {
    if (!isOpenInviteMatchingOn(config)) return null;
    if (remoteMatcher !== undefined) return remoteMatcher;
    return guests?.length ? localGuestMatcher(guests) : null;
  }, [config, guests, remoteMatcher]);

  const font = resolveFontPreset(config.fontPresetId);
  // The default preset leaves each template on its own fonts. Any other preset overrides the
  // family variables for the whole subtree, so every template follows the couple's choice.
  const fontVars: CSSProperties | undefined =
    font.id === "default"
      ? undefined
      : ({ "--font-serif": font.serif, "--font-sans": font.sans, "--wedding-serif": font.serif } as CSSProperties);

  return (
    <InviteeProvider invitee={invitee} matcher={matcher}>
      <TemplateMotionProvider>
        <div className="relative" style={fontVars}>
          {greeting && <InviteeGreeting name={greeting.name} message={greeting.message} />}
          {/* Registry components are module-level; keyed by viewer so form state (RSVP prefill) resets on switch. */}
          {createElement(resolveTemplate(config.templateId), {
            key: invitee?.id ?? "public",
            config: view,
            showBranding,
          })}
        </div>
      </TemplateMotionProvider>
    </InviteeProvider>
  );
}
