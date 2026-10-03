"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { useInvitee } from "@/components/wedding-templates/_shared/InviteeContext";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";
import { dateParts, makePalette, paperStyle } from "./theme";
import EnvelopeIntro from "./components/EnvelopeIntro";
import HeroSection from "./components/HeroSection";
import DetailsSection from "./components/DetailsSection";
import StorySection from "./components/StorySection";
import ScheduleSection from "./components/ScheduleSection";
import GallerySection from "./components/GallerySection";
import RsvpSection from "./components/RsvpSection";
import TemplateFooter from "./components/TemplateFooter";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

/**
 * Jewel Tones: a sealed envelope addressed to the viewing guest opens onto a
 * save-the-date card, then the invitation website. Personalized tier only; the
 * guest's name comes from the invite context (InviteeProvider).
 */
export default function JewelTonesTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);

  // The intro is a full-screen overlay; keep the page behind it from scrolling.
  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  const palette = makePalette(config);
  const date = dateParts(config.weddingDate);
  const rsvpDeadline = dateParts(config.rsvpDeadline);
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);
  const showRsvp = isSectionVisible(config, "rsvp");

  return (
    <div style={{ background: palette.tealDeep, color: palette.ink }}>
      <AnimatePresence>
        {!opened && (
          <EnvelopeIntro
            key="envelope"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={date}
            guestLabel={invitee ? "Reserved for" : "An invitation for"}
            guestName={invitee?.displayName.trim() || "Our Dear Guest"}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      {opened && <AudioPlayer src={musicSrc} accentColor={palette.gold} />}

      <main>
        <HeroSection config={config} palette={palette} date={date} opened={opened} showRsvp={showRsvp} />
        <DetailsSection config={config} palette={palette} date={date} rsvpDeadline={rsvpDeadline} showRsvp={showRsvp} />
        {isSectionVisible(config, "story") && <StorySection config={config} palette={palette} />}
        {isSectionVisible(config, "schedule") && <ScheduleSection config={config} palette={palette} />}
        {isSectionVisible(config, "gallery") && <GallerySection config={config} palette={palette} />}
        <div style={paperStyle(palette.cream, palette.creamDeep)}>
          <PrivateSections config={config} accent={palette.raspberry} tone="light" />
        </div>
        {showRsvp && <RsvpSection config={config} palette={palette} rsvpDeadline={rsvpDeadline} />}
      </main>

      <TemplateFooter config={config} palette={palette} date={date} showBranding={showBranding} />
    </div>
  );
}
