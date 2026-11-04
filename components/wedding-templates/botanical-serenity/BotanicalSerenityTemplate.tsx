"use client";

import type { WeddingConfig } from "@/types/wedding";
import HeroSection from "./components/HeroSection";
import CeremonySection from "./components/CeremonySection";
import OurStorySection from "./components/OurStorySection";
import CoupleSection from "./components/CoupleSection";
import GallerySection from "./components/GallerySection";
import WishesSection from "./components/WishesSection";
import TemplateFooter from "./components/TemplateFooter";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import { isSectionVisible, WeddingPartySection, FaqSection } from "@/components/wedding-templates/_shared/sections";
import { resolveMusicSrc } from "@/data/musicTracks";

interface Props {
  config: WeddingConfig;
}

const BG = "#f7f5f0";
const TEXT_DEEP = "#1a2c10";

export default function BotanicalSerenityTemplate({ config }: Props) {
  const green = config.primaryColor || "#3d6b2e";
  const floral = config.accentColor || "#c8745a";
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);

  return (
    <main style={{ background: BG, overflowX: "hidden" }}>
      <AudioPlayer src={musicSrc} accentColor={green} />
      <HeroSection
        config={config}
        green={green}
        floral={floral}
        bg={BG}
        textDeep={TEXT_DEEP}
      />
      <CeremonySection
        config={config}
        green={green}
        floral={floral}
        bg={BG}
        textDeep={TEXT_DEEP}
      />
      {isSectionVisible(config, "story") && (
        <OurStorySection
          config={config}
          green={green}
          floral={floral}
          bg={BG}
          textDeep={TEXT_DEEP}
        />
      )}
      <CoupleSection
        config={config}
        green={green}
        floral={floral}
        bg={BG}
        textDeep={TEXT_DEEP}
      />
      {isSectionVisible(config, "weddingParty") && (
        <WeddingPartySection config={config} primary={green} accent={floral} />
      )}
      {isSectionVisible(config, "gallery") && (
        <GallerySection
          config={config}
          green={green}
          floral={floral}
          bg={BG}
          textDeep={TEXT_DEEP}
        />
      )}
      {isSectionVisible(config, "faq") && <FaqSection config={config} primary={green} accent={floral} />}
      <PrivateSections config={config} accent={green} tone="light" />
      {isSectionVisible(config, "guestbook") && (
        <WishesSection
          config={config}
          green={green}
          floral={floral}
          bg={BG}
          textDeep={TEXT_DEEP}
        />
      )}
      <TemplateFooter
        config={config}
        green={green}
        floral={floral}
        textDeep={TEXT_DEEP}
      />
    </main>
  );
}
