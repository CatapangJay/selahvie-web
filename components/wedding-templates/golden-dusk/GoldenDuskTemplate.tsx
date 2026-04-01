"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";

import StickyNav            from "./components/StickyNav";
import HeroSection          from "./components/HeroSection";
import OurStorySection      from "./components/OurStorySection";
import CoupleSection        from "./components/CoupleSection";
import EventDetailsSection  from "./components/EventDetailsSection";
import GallerySection       from "./components/GallerySection";
import FaqSection           from "./components/FaqSection";
import TemplateFooter       from "./components/TemplateFooter";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

export default function GoldenDuskTemplate({ config, showBranding = true }: Props) {
  /*  Default palette — warm amber / saffron on cream
      Couples override these in the customiser:
        primaryColor → amber/saffron accent (#c97830)
        accentColor  → secondary (currently unused in palette but available) */
  const accent   = config.primaryColor || "#c97830";
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);

  return (
    <div style={{ background: "#faf8f4", color: "#2c1810", fontFamily: "var(--font-sans)" }}>
      <AudioPlayer src={musicSrc} accentColor={accent} />

      <StickyNav
        partner1Name={config.partner1Name}
        partner2Name={config.partner2Name}
        accent={accent}
      />

      <HeroSection config={config} accent={accent} />

      <OurStorySection config={config} accent={accent} />

      <CoupleSection config={config} accent={accent} />

      <EventDetailsSection config={config} accent={accent} />

      <GallerySection config={config} accent={accent} />

      <FaqSection accent={accent} />

      {showBranding && (
        <TemplateFooter config={config} accent={accent} />
      )}
    </div>
  );
}
