"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";

import HeroSection       from "./components/HeroSection";
import SaveTheDateBanner from "./components/SaveTheDateBanner";
import StorySection      from "./components/StorySection";
import DetailsSection    from "./components/DetailsSection";
import ScheduleSection   from "./components/ScheduleSection";
import GallerySection    from "./components/GallerySection";
import RsvpSection       from "./components/RsvpSection";
import TemplateFooter    from "./components/TemplateFooter";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

export default function EnchantedGroveTemplate({ config, showBranding = true }: Props) {
  /*  Default palette — deep forest midnight + magical gold
      Couples override these in the customiser:
        primaryColor → gold (used for ornaments, node glows, countdown)
        accentColor  → forest/teal (used for ambient glows, text)        */
  const gold     = config.primaryColor || "#d4af37";
  const accent   = config.accentColor  || "#7ec8a4";
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);

  const weddingDateFormatted = config.weddingDate
    ? new Date(config.weddingDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div style={{ background: "#060e12", color: "#eef5ee", fontFamily: "var(--font-sans)" }}>
      <AudioPlayer src={musicSrc} accentColor={gold} />

      <HeroSection
        config={config}
        gold={gold}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
      />
      <SaveTheDateBanner
        gold={gold}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
      />
      {isSectionVisible(config, "story") && <StorySection config={config} gold={gold} accent={accent} />}
      <DetailsSection
        config={config}
        gold={gold}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
      />
      <ScheduleSection gold={gold} accent={accent} />
      {isSectionVisible(config, "gallery") && <GallerySection config={config} gold={gold} accent={accent} />}
      <PrivateSections config={config} accent={gold} tone="dark" />
      {isSectionVisible(config, "rsvp") && <RsvpSection config={config} gold={gold} accent={accent} />}
      <TemplateFooter
        config={config}
        gold={gold}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
        show={showBranding}
      />
    </div>
  );
}
