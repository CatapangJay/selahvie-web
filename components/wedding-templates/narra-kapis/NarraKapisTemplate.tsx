"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import { greetingFor } from "@/lib/invitations";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { useInvitee } from "@/components/wedding-templates/_shared/InviteeContext";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";
import { FONTS_HREF, SERIF, banigStyle, dateParts, makePalette } from "./theme";
import CapizWindowIntro from "./components/CapizWindowIntro";
import HeroSection from "./components/HeroSection";
import StorySection from "./components/StorySection";
import DetailsSection from "./components/DetailsSection";
import ScheduleSection from "./components/ScheduleSection";
import EntourageSection from "./components/EntourageSection";
import GallerySection from "./components/GallerySection";
import RsvpSection from "./components/RsvpSection";
import RegistrySection from "./components/RegistrySection";
import FaqSection from "./components/FaqSection";
import TemplateFooter from "./components/TemplateFooter";
import { Reveal } from "./components/Motion";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

/**
 * Narra & Kapis: a Filipino heritage-house invitation. A closed capiz window
 * holds a note written out to the guest; sliding it open reveals a framed
 * sepia portrait, then rooms of narra wood, banig and shell. Renders its own
 * guest greeting (window note + hero line).
 */
export default function NarraKapisTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);

  // The window is a full-screen overlay; keep the page behind it from scrolling.
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
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);
  const greeting = greetingFor(config, invitee);

  return (
    <div style={{ background: palette.narraDeep, color: palette.ink, fontFamily: SERIF, overflowX: "clip" }}>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      <AnimatePresence>
        {!opened && (
          <CapizWindowIntro
            key="window"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={date}
            greeting={greeting}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      {opened && <AudioPlayer src={musicSrc} accentColor={palette.brass} />}

      <HeroSection config={config} palette={palette} date={date} opened={opened} greeting={greeting} />

      <main>
        {isSectionVisible(config, "story") && (
          <Reveal>
            <StorySection config={config} palette={palette} />
          </Reveal>
        )}
        <Reveal>
          <DetailsSection config={config} palette={palette} date={date} showNotes={isSectionVisible(config, "travel")} />
        </Reveal>
        {isSectionVisible(config, "schedule") && (
          <Reveal>
            <ScheduleSection config={config} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "weddingParty") && (
          <Reveal>
            <EntourageSection config={config} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "gallery") && <GallerySection config={config} palette={palette} />}
        {isSectionVisible(config, "rsvp") && (
          <Reveal>
            <RsvpSection config={config} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "registry") && (
          <Reveal>
            <RegistrySection config={config} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "faq") && (
          <Reveal>
            <FaqSection config={config} palette={palette} />
          </Reveal>
        )}
        <div style={banigStyle(palette)}>
          <PrivateSections config={config} accent={palette.narra} tone="light" />
        </div>
      </main>

      <TemplateFooter config={config} palette={palette} date={date} showBranding={showBranding} />
    </div>
  );
}
