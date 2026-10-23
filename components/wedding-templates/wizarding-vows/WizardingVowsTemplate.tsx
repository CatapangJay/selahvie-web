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
import { BOOK, FONTS_HREF, dateParts, isDressCodeQuestion, makePalette, parchmentStyle } from "./theme";
import OwlPostIntro from "./components/OwlPostIntro";
import HeroSection, { type NavLink } from "./components/HeroSection";
import StorySection from "./components/StorySection";
import MapSection from "./components/MapSection";
import ScheduleSection from "./components/ScheduleSection";
import GallerySection from "./components/GallerySection";
import DressCodeSection from "./components/DressCodeSection";
import EntourageSection from "./components/EntourageSection";
import RsvpSection from "./components/RsvpSection";
import RegistrySection from "./components/RegistrySection";
import FaqSection from "./components/FaqSection";
import TemplateFooter from "./components/TemplateFooter";
import { Reveal } from "./components/Motion";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

/**
 * Wizarding Vows: a letter by owl post, kept modern and quiet. A kraft
 * envelope addressed to the guest in sepia quill lies among dried flowers;
 * breaking the wax seal draws out an aged, crested letter calling all witches
 * and wizards. Inside, the site alternates charcoal chalkboard and light-brown
 * linen with antique-gold hairlines: a breathing portrait, the date set
 * between rules, an enchanted map whose footsteps carry the guest's name to
 * the venue, a timetable, moving portraits, house scarves for the dress code,
 * a reply by owl and a vault for gifts. Renders its own guest greeting
 * (envelope address, letter salutation and a platform ticket in the hero).
 */
export default function WizardingVowsTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);

  // The owl post is a full-screen overlay; keep the page behind it from scrolling.
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
  // The dress-code answer gets the scarves; the rest stay in the FAQ.
  const dressCode = showFaq ? faq.find((f) => isDressCodeQuestion(f.question)) : undefined;
  const showSchedule = isSectionVisible(config, "schedule") && (config.schedule ?? []).some((e) => e.title.trim());
  const showRegistry = isSectionVisible(config, "registry") && (config.registryLinks ?? []).some((l) => l.label.trim());
  const showRsvp = isSectionVisible(config, "rsvp");
  const hasVenue = Boolean(config.venueName || config.venueAddress || config.venueCity);
  const firstTime = showSchedule ? config.schedule?.find((e) => e.time.trim())?.time : undefined;

  const links: NavLink[] = [
    hasVenue && { href: "#map", label: "Map" },
    showSchedule && { href: "#timetable", label: "Timetable" },
    showRsvp && { href: "#rsvp", label: "Reply" },
    showRegistry && { href: "#vault", label: "Vault" },
  ].filter((l): l is NavLink => Boolean(l));

  return (
    <div style={{ ...parchmentStyle(palette), fontFamily: BOOK, overflowX: "clip" }}>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      <AnimatePresence>
        {!opened && (
          <OwlPostIntro
            key="owl-post"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={date}
            venueName={config.venueName}
            venueCity={config.venueCity}
            time={firstTime}
            greeting={greeting}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      {opened && <AudioPlayer src={musicSrc} accentColor={palette.gilt} />}

      <HeroSection config={config} palette={palette} date={date} time={firstTime} opened={opened} greeting={greeting} links={links} />

      <main>
        {isSectionVisible(config, "story") && (
          <Reveal>
            <StorySection config={config} palette={palette} />
          </Reveal>
        )}
        <MapSection
          config={config}
          palette={palette}
          date={date}
          guestName={greeting?.name}
          showNotes={isSectionVisible(config, "travel")}
          showSchedule={isSectionVisible(config, "schedule")}
        />
        {showSchedule && <ScheduleSection config={config} palette={palette} />}
        {isSectionVisible(config, "gallery") && <GallerySection config={config} palette={palette} />}
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
        {showRsvp && <RsvpSection config={config} palette={palette} />}
        {showRegistry && <RegistrySection config={config} palette={palette} />}
        {showFaq && (
          <Reveal>
            <FaqSection items={faq.filter((f) => f !== dressCode)} palette={palette} />
          </Reveal>
        )}
        <div style={parchmentStyle(palette)}>
          <PrivateSections config={config} accent={palette.wax} tone="light" />
        </div>
      </main>

      <TemplateFooter config={config} palette={palette} date={date} showBranding={showBranding} />
    </div>
  );
}
