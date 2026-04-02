"use client";

import type { WeddingConfig } from "@/types/wedding";
import HeroSection from "./components/HeroSection";
import CeremonySection from "./components/CeremonySection";
import OurStorySection from "./components/OurStorySection";
import CoupleSection from "./components/CoupleSection";
import GallerySection from "./components/GallerySection";
import WishesSection from "./components/WishesSection";
import TemplateFooter from "./components/TemplateFooter";

interface Props {
  config: WeddingConfig;
}

const BG = "#f7f5f0";
const TEXT_DEEP = "#1a2c10";

export default function BotanicalSerenityTemplate({ config }: Props) {
  const green = config.primaryColor || "#3d6b2e";
  const floral = config.accentColor || "#c8745a";

  return (
    <main style={{ background: BG, overflowX: "hidden" }}>
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
      <OurStorySection
        config={config}
        green={green}
        floral={floral}
        bg={BG}
        textDeep={TEXT_DEEP}
      />
      <CoupleSection
        config={config}
        green={green}
        floral={floral}
        bg={BG}
        textDeep={TEXT_DEEP}
      />
      <GallerySection
        config={config}
        green={green}
        floral={floral}
        bg={BG}
        textDeep={TEXT_DEEP}
      />
      <WishesSection
        config={config}
        green={green}
        floral={floral}
        bg={BG}
        textDeep={TEXT_DEEP}
      />
      <TemplateFooter
        config={config}
        green={green}
        floral={floral}
        textDeep={TEXT_DEEP}
      />
    </main>
  );
}
