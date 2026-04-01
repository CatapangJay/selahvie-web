"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";

import HeroSection       from "./components/HeroSection";
import InvitationSection from "./components/InvitationSection";
import LocationSection   from "./components/LocationSection";
import CoupleSection     from "./components/CoupleSection";
import GallerySection    from "./components/GallerySection";
import WishesSection     from "./components/WishesSection";
import TemplateFooter    from "./components/TemplateFooter";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

export default function ForestBloomTemplate({ config, showBranding = true }: Props) {
  /*  Default palette — dark sage green + amber gold
      Couples override these in the customiser:
        primaryColor → gold / amber  (#c8a415)
        accentColor  → sage / forest (#3a5c43)             */
  const gold   = config.primaryColor || "#c8a415";
  const accent = config.accentColor  || "#3a5c43";
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);

  const weddingDateFormatted = config.weddingDate
    ? new Date(config.weddingDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const weddingDate = config.weddingDate ? new Date(config.weddingDate) : null;
  const dateShort = weddingDate
    ? [
        String(weddingDate.getDate()).padStart(2, "0"),
        String(weddingDate.getMonth() + 1).padStart(2, "0"),
        String(weddingDate.getFullYear()),
      ].join(" / ")
    : "";

  return (
    <div style={{ background: "#2a3830", color: "#f0f5ee", fontFamily: "var(--font-sans)" }}>
      <AudioPlayer src={musicSrc} accentColor={gold} />

      <HeroSection
        config={config}
        gold={gold}
        sage={accent}
        weddingDateFormatted={weddingDateFormatted}
        dateShort={dateShort}
      />
      <InvitationSection
        config={config}
        gold={gold}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
        dateShort={dateShort}
      />
      <LocationSection
        config={config}
        gold={gold}
        accent={accent}
      />
      <CoupleSection
        config={config}
        gold={gold}
        accent={accent}
      />
      <GallerySection
        config={config}
        gold={gold}
        accent={accent}
      />
      <WishesSection
        config={config}
        gold={gold}
        accent={accent}
      />
      {showBranding && (
        <TemplateFooter
          config={config}
          gold={gold}
          accent={accent}
          weddingDateFormatted={weddingDateFormatted}
        />
      )}
    </div>
  );
}
