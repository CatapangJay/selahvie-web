"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";

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

export default function WonderstuckTemplate({ config, showBranding = true }: Props) {
  /* Palette — couples choose these in the customizer.
     Defaults are the "Enchanted" colour story:
       accent = moonlit amethyst, gold = stardust gold */
  const accent   = config.accentColor  || "#c8b4e8";
  const gold     = config.primaryColor || "#e8d5a3";
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
    <div style={{ background: "#0c0d1a", color: "#f0ecf8", fontFamily: "var(--font-sans)" }}>
      <AudioPlayer src={musicSrc} accentColor={accent} />

      <HeroSection
        config={config}
        accent={accent}
        gold={gold}
        weddingDateFormatted={weddingDateFormatted}
      />
      <SaveTheDateBanner
        accent={accent}
        gold={gold}
        weddingDateFormatted={weddingDateFormatted}
      />
      <StorySection config={config} accent={accent} gold={gold} />
      <DetailsSection
        config={config}
        accent={accent}
        gold={gold}
        weddingDateFormatted={weddingDateFormatted}
      />
      <ScheduleSection accent={accent} gold={gold} />
      <GallerySection  config={config} accent={accent} gold={gold} />
      <RsvpSection     config={config} accent={accent} gold={gold} />
      <TemplateFooter
        config={config}
        accent={accent}
        gold={gold}
        weddingDateFormatted={weddingDateFormatted}
        show={showBranding}
      />
    </div>
  );
}
