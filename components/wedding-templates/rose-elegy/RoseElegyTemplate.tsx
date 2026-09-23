"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import { resolveFontPreset } from "@/data/fontPresets";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import HeroSection from "./components/HeroSection";
import SaveTheDateBanner from "./components/SaveTheDateBanner";
import StorySection from "./components/StorySection";
import DetailsSection from "./components/DetailsSection";
import ScheduleSection from "./components/ScheduleSection";
import GallerySection from "./components/GallerySection";
import RsvpSection from "./components/RsvpSection";
import TemplateFooter from "./components/TemplateFooter";
import {
  ScheduleSection as ScheduleSectionShared,
  WeddingPartySection,
  RegistrySection,
  TravelSection,
  FaqSection,
  GuestbookSection,
  isSectionVisible,
} from "@/components/wedding-templates/_shared/sections";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

export default function RoseElegyTemplate({ config, showBranding = true }: Props) {
  const primary  = config.primaryColor || "#7c5454";
  const accent   = config.accentColor  || "#c99999";
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);
  const font     = resolveFontPreset(config.fontPresetId);

  const weddingDateFormatted = config.weddingDate
    ? new Date(config.weddingDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      style={{
        "--wedding-primary": primary,
        "--wedding-accent": accent,
        // Font preset overrides the two family vars for this template subtree only.
        "--font-serif": font.serif,
        "--font-sans": font.sans,
        fontFamily: "var(--font-sans)",
      } as React.CSSProperties}
    >
      {/* Floating ambient music player — driven by the couple's music config */}
      <AudioPlayer src={musicSrc} accentColor={primary} />

      <HeroSection
        config={config}
        primary={primary}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
      />
      <SaveTheDateBanner primary={primary} weddingDateFormatted={weddingDateFormatted} />
      <StorySection config={config} accent={accent} />
      <DetailsSection
        config={config}
        primary={primary}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
      />
      <ScheduleSection primary={primary} accent={accent} />
      {isSectionVisible(config, "schedule") && <ScheduleSectionShared config={config} primary={primary} accent={accent} />}
      {isSectionVisible(config, "weddingParty") && <WeddingPartySection config={config} primary={primary} accent={accent} />}
      <GallerySection config={config} primary={primary} />
      {isSectionVisible(config, "travel") && <TravelSection config={config} primary={primary} accent={accent} />}
      {isSectionVisible(config, "registry") && <RegistrySection config={config} primary={primary} accent={accent} />}
      {isSectionVisible(config, "faq") && <FaqSection config={config} primary={primary} accent={accent} />}
      <RsvpSection config={config} primary={primary} accent={accent} />
      {isSectionVisible(config, "guestbook") && (
        <GuestbookSection config={config} primary={primary} accent={accent} />
      )}
      <TemplateFooter
        config={config}
        primary={primary}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
        show={showBranding}
      />
    </div>
  );
}
