"use client";

import { createElement, useMemo } from "react";
import { resolveTemplate } from "@/components/wedding-templates";
import TemplateMotionProvider from "./TemplateMotionProvider";
import { InviteeProvider } from "./InviteeContext";
import InviteeGreeting from "./InviteeGreeting";
import { greetingFor, personalizeConfig, type Invitee } from "@/lib/invitations";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  invitee: Invitee | null;
  showBranding?: boolean;
}

/**
 * Renders a wedding template as a specific guest/group sees it: audience-
 * restricted sections applied, private sections + greeting enabled, RSVP
 * prefilled. With `invitee = null` (or a base-tier config) it's the public site.
 */
export default function PersonalizedTemplate({ config, invitee, showBranding = true }: Props) {
  const view = useMemo(() => personalizeConfig(config, invitee), [config, invitee]);
  const greeting = greetingFor(config, invitee);

  return (
    <InviteeProvider invitee={invitee}>
      <TemplateMotionProvider>
        <div className="relative">
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
