"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import { greetingFor } from "@/lib/invitations";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { useInvitee } from "@/components/wedding-templates/_shared/InviteeContext";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";
import { DISPLAY, FONTS_HREF, dateParts, isDressCodeQuestion, makePalette, paperStyle, stripFrames } from "./theme";
import BoothIntro from "./components/BoothIntro";
import HeroSection from "./components/HeroSection";
import StorySection from "./components/StorySection";
import DetailsSection from "./components/DetailsSection";
import ScheduleSection from "./components/ScheduleSection";
import GallerySection from "./components/GallerySection";
import DressCodeSection from "./components/DressCodeSection";
import EntourageSection from "./components/EntourageSection";
import RsvpSection from "./components/RsvpSection";
import RegistrySection from "./components/RegistrySection";
import FaqSection from "./components/FaqSection";
import TemplateFooter from "./components/TemplateFooter";
import { FRAME_COUNTER, Reveal } from "./components/Motion";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

/**
 * Shutter & Strip: a photo-booth invitation. Each guest finds a marquee booth
 * with a card reserved in their name pinned to the curtain; striking a pose
 * runs a countdown and four flashes, and a strip of the couple feeds out of
 * the print slot and develops. Inside, the site alternates oat photo paper and
 * the darkroom, each section a numbered frame on the roll. Renders its own
 * guest greeting (curtain card + hero admission stub).
 */
export default function ShutterStripTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);

  // The booth is a full-screen overlay; keep the page behind it from scrolling.
  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  const palette = makePalette(config);
  const date = dateParts(config.weddingDate);
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);
  const greeting = greetingFor(config, invitee);
  const showFaq = isSectionVisible(config, "faq");
  const faq = (config.faq ?? []).filter((f) => f.question.trim());
  // The dress-code answer gets its own colour card; the rest stay in the FAQ.
  const dressCode = showFaq ? faq.find((f) => isDressCodeQuestion(f.question)) : undefined;

  return (
    <div style={{ ...paperStyle(palette), fontFamily: DISPLAY, overflowX: "clip" }}>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      <AnimatePresence>
        {!opened && (
          <BoothIntro
            key="booth"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={date}
            frames={stripFrames(config)}
            greeting={greeting}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      {opened && <AudioPlayer src={musicSrc} accentColor={palette.film} />}

      <HeroSection config={config} palette={palette} date={date} opened={opened} greeting={greeting} />

      {/* No container-type here: size containment would scope the frame counter to each section. */}
      <main style={{ counterReset: FRAME_COUNTER }}>
        {isSectionVisible(config, "story") && (
          <Reveal>
            <StorySection config={config} palette={palette} />
          </Reveal>
        )}
        <Reveal>
          <DetailsSection config={config} palette={palette} date={date} showNotes={isSectionVisible(config, "travel")} showSchedule={isSectionVisible(config, "schedule")} />
        </Reveal>
        {isSectionVisible(config, "schedule") && (
          <Reveal>
            <ScheduleSection config={config} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "gallery") && <GallerySection config={config} palette={palette} imprint={date.imprint} />}
        {dressCode && (
          <Reveal>
            <DressCodeSection item={dressCode} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "weddingParty") && (
          <Reveal>
            <EntourageSection config={config} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "rsvp") && (
          <Reveal>
            <RsvpSection config={config} palette={palette} />
          </Reveal>
        )}
        {isSectionVisible(config, "registry") && (
          <Reveal>
            <RegistrySection config={config} palette={palette} />
          </Reveal>
        )}
        {showFaq && (
          <Reveal>
            <FaqSection items={faq.filter((f) => f !== dressCode)} palette={palette} />
          </Reveal>
        )}
        <div style={paperStyle(palette)}>
          <PrivateSections config={config} accent={palette.ink} tone="light" />
        </div>
      </main>

      <TemplateFooter config={config} palette={palette} date={date} showBranding={showBranding} />
    </div>
  );
}
