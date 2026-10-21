"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import { groupEntourage } from "@/lib/entourage";
import { greetingFor } from "@/lib/invitations";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { useInvitee } from "@/components/wedding-templates/_shared/InviteeContext";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";
import { BODY, FONTS_HREF, cssImage, makePalette, numeralDate } from "./theme";
import Preloader from "./components/Preloader";
import HeroSection from "./components/HeroSection";
import StorySection from "./components/StorySection";
import VenueSection from "./components/VenueSection";
import PhotoBreak from "./components/PhotoBreak";
import ScheduleSection from "./components/ScheduleSection";
import EntourageSection from "./components/EntourageSection";
import GallerySection from "./components/GallerySection";
import RsvpSection from "./components/RsvpSection";
import RegistrySection from "./components/RegistrySection";
import FaqSection from "./components/FaqSection";
import TemplateFooter from "./components/TemplateFooter";
import { Reveal } from "./components/Motion";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

type SectionKey = "story" | "venue" | "schedule" | "entourage" | "gallery" | "rsvp" | "registry" | "faq";

/**
 * Monochrome: a hairline-framed title card reserved for the viewing guest opens
 * onto a black-and-white portrait, then a contact sheet of numbered ink, stone
 * and paper panels. Renders its own guest greeting (title card + hero caption).
 */
export default function MonochromeTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);

  // The title card is a full-screen overlay; keep the page behind it from scrolling.
  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  const palette = makePalette(config);
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);
  const greeting = greetingFor(config, invitee);
  const showGallery = isSectionVisible(config, "gallery");
  // The first gallery photo becomes the full-bleed break after the venue.
  const breakPhoto = showGallery && cssImage(config.galleryImageUrls[0]) ? config.galleryImageUrls[0] : undefined;
  const travel = config.travel;

  // Frame numbers follow only the sections that actually render, so they never skip.
  const renders: Record<SectionKey, boolean> = {
    story: isSectionVisible(config, "story") && Boolean(config.coupleStory?.trim()),
    venue:
      Boolean(config.venueName || config.venueAddress || config.venueCity) ||
      (isSectionVisible(config, "travel") && Boolean(travel?.directions || travel?.accommodations || travel?.notes)),
    schedule: isSectionVisible(config, "schedule") && (config.schedule ?? []).some((e) => e.title.trim()),
    entourage: isSectionVisible(config, "weddingParty") && groupEntourage(config.weddingParty ?? []).length > 0,
    gallery: showGallery && config.galleryImageUrls.slice(breakPhoto ? 1 : 0).some((u) => cssImage(u)),
    rsvp: isSectionVisible(config, "rsvp"),
    registry: isSectionVisible(config, "registry") && (config.registryLinks ?? []).some((l) => l.label.trim()),
    faq: isSectionVisible(config, "faq") && (config.faq ?? []).some((f) => f.question.trim()),
  };
  const order = (Object.keys(renders) as SectionKey[]).filter((k) => renders[k]);
  const index = (key: SectionKey) => String(order.indexOf(key) + 1).padStart(2, "0");

  return (
    <div style={{ background: palette.ink, color: "#fff", fontFamily: BODY, overflowX: "clip" }}>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      <AnimatePresence>
        {!opened && (
          <Preloader
            key="preloader"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={numeralDate(config.weddingDate)}
            guestName={greeting?.name ?? null}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      {opened && <AudioPlayer src={musicSrc} accentColor="#ffffff" />}

      <HeroSection config={config} palette={palette} opened={opened} greeting={greeting} />

      <main>
        {renders.story && (
          <Reveal>
            <StorySection config={config} palette={palette} index={index("story")} />
          </Reveal>
        )}
        {renders.venue && (
          <Reveal>
            <VenueSection config={config} palette={palette} index={index("venue")} showNotes={isSectionVisible(config, "travel")} />
          </Reveal>
        )}
        <PhotoBreak url={breakPhoto} caption={`${config.partner1Name} & ${config.partner2Name}`} />
        {renders.schedule && (
          <Reveal>
            <ScheduleSection config={config} palette={palette} index={index("schedule")} />
          </Reveal>
        )}
        {renders.entourage && (
          <Reveal>
            <EntourageSection config={config} palette={palette} index={index("entourage")} />
          </Reveal>
        )}
        {renders.gallery && (
          <Reveal>
            <GallerySection config={config} palette={palette} index={index("gallery")} skip={breakPhoto ? 1 : 0} />
          </Reveal>
        )}
        {renders.rsvp && (
          <Reveal>
            <RsvpSection config={config} palette={palette} index={index("rsvp")} />
          </Reveal>
        )}
        {renders.registry && (
          <Reveal>
            <RegistrySection config={config} palette={palette} index={index("registry")} />
          </Reveal>
        )}
        {renders.faq && (
          <Reveal>
            <FaqSection config={config} palette={palette} index={index("faq")} />
          </Reveal>
        )}
        <div style={{ background: palette.stone }}>
          <PrivateSections config={config} accent={palette.slate} tone="light" />
        </div>
      </main>

      <TemplateFooter config={config} palette={palette} showBranding={showBranding} />
    </div>
  );
}
