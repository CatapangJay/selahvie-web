"use client";

import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { isSectionVisible, WeddingPartySection, FaqSection } from "@/components/wedding-templates/_shared/sections";

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

  /*  The shared entourage and FAQ sections read the site theme tokens;
      re-point them at the forest palette.                                 */
  const forestTheme = {
    background: "#2a3830",
    "--color-surface-container-low": "#243028",
    "--color-on-surface": "#f0f5ee",
    "--color-on-surface-variant": "rgba(240,245,238,0.75)",
    "--color-on-surface-muted": "rgba(240,245,238,0.55)",
  } as React.CSSProperties;

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
      {isSectionVisible(config, "weddingParty") && (
        <div style={forestTheme}><WeddingPartySection config={config} primary={gold} accent={gold} /></div>
      )}
      {isSectionVisible(config, "gallery") && (
        <GallerySection
          config={config}
          gold={gold}
          accent={accent}
        />
      )}
      {isSectionVisible(config, "faq") && (
        <div style={forestTheme}><FaqSection config={config} primary={gold} accent={gold} /></div>
      )}
      <PrivateSections config={config} accent={gold} tone="dark" />
      {isSectionVisible(config, "guestbook") && (
        <WishesSection
          config={config}
          gold={gold}
          accent={accent}
        />
      )}
      <TemplateFooter
        config={config}
        gold={gold}
        accent={accent}
        weddingDateFormatted={weddingDateFormatted}
        showBranding={showBranding}
      />
    </div>
  );
}
