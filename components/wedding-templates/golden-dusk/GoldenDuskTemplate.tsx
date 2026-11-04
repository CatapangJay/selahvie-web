"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { isSectionVisible, WeddingPartySection } from "@/components/wedding-templates/_shared/sections";

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

  const hiddenLinks = [
    ...(isSectionVisible(config, "story") ? [] : ["#story"]),
    ...(isSectionVisible(config, "gallery") ? [] : ["#gallery"]),
    ...(isSectionVisible(config, "faq") ? [] : ["#faq"]),
  ];

  return (
    <div style={{ background: "#faf8f4", color: "#2c1810", fontFamily: "var(--font-sans)" }}>
      <AudioPlayer src={musicSrc} accentColor={accent} />

      <StickyNav
        partner1Name={config.partner1Name}
        partner2Name={config.partner2Name}
        accent={accent}
        hidden={hiddenLinks}
      />

      <HeroSection config={config} accent={accent} />

      {isSectionVisible(config, "story") && <OurStorySection config={config} accent={accent} />}

      <CoupleSection config={config} accent={accent} />

      <EventDetailsSection config={config} accent={accent} />

      {isSectionVisible(config, "weddingParty") && (
        <WeddingPartySection config={config} primary={accent} accent={accent} />
      )}

      {isSectionVisible(config, "gallery") && <GallerySection config={config} accent={accent} />}

      <PrivateSections config={config} accent={accent} tone="light" />

      {isSectionVisible(config, "faq") && <FaqSection config={config} accent={accent} />}

      <TemplateFooter config={config} accent={accent} showBranding={showBranding} />
    </div>
  );
}
