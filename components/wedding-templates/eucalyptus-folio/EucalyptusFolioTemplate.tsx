"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import { greetingFor } from "@/lib/invitations";
import { dressCodeOf } from "@/lib/weddingDetails";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { useInvitee } from "@/components/wedding-templates/_shared/InviteeContext";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";
import { FONTS_HREF, SANS, dateParts, makePalette, paperStyle } from "./theme";
import FoldIntro from "./components/FoldIntro";
import HeroSection from "./components/HeroSection";
import StorySection from "./components/StorySection";
import CountdownBand from "./components/CountdownBand";
import DetailsSection from "./components/DetailsSection";
import ScheduleSection from "./components/ScheduleSection";
import EntourageSection from "./components/EntourageSection";
import GallerySection from "./components/GallerySection";
import DressCodeSection from "./components/DressCodeSection";
import RsvpSection from "./components/RsvpSection";
import GuestbookSheet from "./components/GuestbookSheet";
import RegistrySection from "./components/RegistrySection";
import FaqSection from "./components/FaqSection";
import TemplateFooter from "./components/TemplateFooter";
import { Reveal, SHEET_COUNTER } from "./components/Motion";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

/**
 * Eucalyptus Folio: a botanist's herbarium folio. The invitation arrives as a
 * sheet of rag paper folded in four around a typed specimen label made out to
 * the guest; it unfolds top, bottom, then the two doors. Inside, every section
 * is a numbered sheet with real pressed eucalyptus (CC0 herbarium scans),
 * olive-ink type and a rust accent. Renders its own guest greeting (cover
 * label + hero slip).
 */
export default function EucalyptusFolioTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [started, setStarted] = useState(false);
  const [opened, setOpened] = useState(false);
  const handleStart = useCallback(() => setStarted(true), []);
  const handleDone = useCallback(() => setOpened(true), []);

  // Hold the page still while the folio covers it.
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
  const dressCode = dressCodeOf(config);
  const showRsvp = isSectionVisible(config, "rsvp");
  const showGuestbook = isSectionVisible(config, "guestbook");

  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
      {/* The overlay sits outside the container root: size containment would scope its fixed position. */}
      <AnimatePresence>
        {!opened && (
          <FoldIntro
            key="folio"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={date}
            greeting={greeting}
            onStart={handleStart}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>

      {started && <AudioPlayer src={musicSrc} accentColor={palette.rust} />}

      <div style={{ ...paperStyle(palette), containerType: "inline-size", fontFamily: SANS, overflowX: "clip" }}>
        <HeroSection config={config} palette={palette} date={date} started={started} greeting={greeting} showRsvpLink={showRsvp} showGuestbookLink={showGuestbook} />

        {/* The counter lives on <main>: the root's style containment would scope it per section. */}
        <main style={{ counterReset: SHEET_COUNTER }}>
          {isSectionVisible(config, "story") && (
            <Reveal>
              <StorySection config={config} palette={palette} />
            </Reveal>
          )}
          {date.date && <CountdownBand target={date.date} palette={palette} />}
          <Reveal>
            <DetailsSection config={config} palette={palette} date={date} showTravel={isSectionVisible(config, "travel")} />
          </Reveal>
          {isSectionVisible(config, "schedule") && (
            <Reveal>
              <ScheduleSection config={config} palette={palette} />
            </Reveal>
          )}
          {isSectionVisible(config, "weddingParty") && (
            <Reveal>
              <EntourageSection config={config} palette={palette} />
            </Reveal>
          )}
          {isSectionVisible(config, "gallery") && (
            <Reveal>
              <GallerySection config={config} palette={palette} />
            </Reveal>
          )}
          {dressCode && (
            <Reveal>
              <DressCodeSection title={dressCode.title} description={dressCode.description} swatches={dressCode.palette} palette={palette} />
            </Reveal>
          )}
          {showRsvp && (
            <Reveal>
              <RsvpSection config={config} palette={palette} />
            </Reveal>
          )}
          {showGuestbook && <GuestbookSheet config={config} palette={palette} />}
          {isSectionVisible(config, "registry") && (
            <Reveal>
              <RegistrySection config={config} palette={palette} />
            </Reveal>
          )}
          {isSectionVisible(config, "faq") && (
            <Reveal>
              <FaqSection items={config.faq ?? []} palette={palette} />
            </Reveal>
          )}
          <PrivateSections config={config} accent={palette.rust} tone="light" />
        </main>

        <TemplateFooter config={config} palette={palette} date={date} showBranding={showBranding} />
      </div>
    </>
  );
}
