"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import HeroSection from "./components/HeroSection";
import SaveTheDateBanner from "./components/SaveTheDateBanner";
import StorySection from "./components/StorySection";
import DetailsSection from "./components/DetailsSection";
import ScheduleSection from "./components/ScheduleSection";
import GallerySection from "./components/GallerySection";
import RsvpSection from "./components/RsvpSection";
import TemplateFooter from "./components/TemplateFooter";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

export default function ObsidianVowTemplate({ config, showBranding = true }: Props) {
  const accent     = config.accentColor || "#c9a84c";
  const musicSrc   = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);

  const weddingDateFormatted = config.weddingDate
    ? new Date(config.weddingDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div style={{ background: "#0a0908", color: "#f5f0e8" }}>
      {/* Floating ambient music player — driven by the couple's music config */}
      <AudioPlayer src={musicSrc} accentColor={accent} />

      <HeroSection
        config={config}
        primary={config.primaryColor || "#c9a84c"}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
      />
      <SaveTheDateBanner accent={accent} weddingDateFormatted={weddingDateFormatted} />
      <StorySection config={config} accent={accent} />
      <DetailsSection config={config} accent={accent} weddingDateFormatted={weddingDateFormatted} />
      <ScheduleSection accent={accent} />
      <GallerySection config={config} accent={accent} />
      <RsvpSection config={config} accent={accent} />
      <TemplateFooter
        config={config}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
        show={showBranding}
      />
    </div>
  );
}
