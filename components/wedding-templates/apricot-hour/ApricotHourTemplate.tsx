"use client";

import { Fragment, useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import { groupEntourage } from "@/lib/entourage";
import { greetingFor } from "@/lib/invitations";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { useInvitee } from "@/components/wedding-templates/_shared/InviteeContext";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";
import { SANS, cssImage, dateParts, makePalette } from "./theme";
import GiftTagIntro from "./components/GiftTagIntro";
import HeroSection from "./components/HeroSection";
import StorySection from "./components/StorySection";
import VenueSection from "./components/VenueSection";
import ScheduleSection from "./components/ScheduleSection";
import EntourageSection from "./components/EntourageSection";
import GallerySection from "./components/GallerySection";
import RsvpSection from "./components/RsvpSection";
import RegistrySection from "./components/RegistrySection";
import FaqSection from "./components/FaqSection";
import TemplateFooter from "./components/TemplateFooter";
import { Reveal, sunsetRamp, type Band } from "./components/Band";
import { Horizon } from "./components/Ornaments";

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

/**
 * Apricot Hour: a ribbon-tied gift tag written out to the guest opens onto a
 * morning sky, and the page darkens through golden hour to dusk as you scroll,
 * each section a band of the sunset joined by rolling horizons.
 */
export default function ApricotHourTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);

  // The intro is a full-screen overlay; keep the page behind it from scrolling.
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
  const rsvpDeadline = dateParts(config.rsvpDeadline);
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);
  const greeting = greetingFor(config, invitee);
  const travel = config.travel;

  // Only sections that will actually render take a band, so the sunset always runs its full course.
  const sections: { key: string; when: boolean; render: (band: Band) => ReactNode }[] = [
    {
      key: "story",
      when: isSectionVisible(config, "story") && Boolean(config.coupleStory?.trim()),
      render: (band) => <StorySection config={config} palette={palette} band={band} />,
    },
    {
      key: "venue",
      when:
        Boolean(config.venueName || config.venueAddress || config.venueCity) ||
        (isSectionVisible(config, "travel") && Boolean(travel?.directions || travel?.accommodations || travel?.notes)),
      render: (band) => <VenueSection config={config} palette={palette} band={band} showNotes={isSectionVisible(config, "travel")} />,
    },
    {
      key: "schedule",
      when: isSectionVisible(config, "schedule") && (config.schedule ?? []).some((e) => e.title.trim()),
      render: (band) => <ScheduleSection config={config} palette={palette} band={band} />,
    },
    {
      key: "entourage",
      when: isSectionVisible(config, "weddingParty") && groupEntourage(config.weddingParty ?? []).length > 0,
      render: (band) => <EntourageSection config={config} palette={palette} band={band} />,
    },
    {
      key: "gallery",
      when: isSectionVisible(config, "gallery") && config.galleryImageUrls.some((u) => cssImage(u)),
      render: (band) => <GallerySection config={config} palette={palette} band={band} />,
    },
    {
      key: "registry",
      when: isSectionVisible(config, "registry") && (config.registryLinks ?? []).some((l) => l.label.trim()),
      render: (band) => <RegistrySection config={config} palette={palette} band={band} />,
    },
    {
      key: "faq",
      when: isSectionVisible(config, "faq") && (config.faq ?? []).some((f) => f.question.trim()),
      render: (band) => <FaqSection config={config} palette={palette} band={band} />,
    },
    {
      key: "rsvp",
      when: isSectionVisible(config, "rsvp"),
      render: (band) => <RsvpSection config={config} palette={palette} band={band} rsvpDeadline={rsvpDeadline} />,
    },
  ];
  const shown = sections.filter((s) => s.when);
  const bands = sunsetRamp(palette, shown.length);

  return (
    <div style={{ background: palette.morning, color: palette.ink, fontFamily: SANS, overflowX: "clip" }}>
      <AnimatePresence>
        {!opened && (
          <GiftTagIntro
            key="intro"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={date}
            greeting={greeting}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      {opened && <AudioPlayer src={musicSrc} accentColor={palette.apricot} />}

      <HeroSection config={config} palette={palette} date={date} opened={opened} greeting={greeting} />

      <main>
        {shown.map((section, i) => {
          const band = bands[i];
          const above = i === 0 ? palette.butter : bands[i - 1].bg;
          return (
            <Fragment key={section.key}>
              {above !== band.bg && <Horizon from={above} to={band.bg} ridge={`color-mix(in srgb, ${above} 45%, ${band.bg})`} flip={i % 2 === 1} />}
              <Reveal>{section.render(band)}</Reveal>
            </Fragment>
          );
        })}
        <div style={{ background: bands.at(-1)?.bg ?? palette.butter }}>
          <PrivateSections config={config} accent={palette.apricot} tone={bands.at(-1)?.dark ? "dark" : "light"} />
        </div>
        <Horizon from={bands.at(-1)?.bg ?? palette.butter} to={palette.ink} ridge={`color-mix(in srgb, ${bands.at(-1)?.bg ?? palette.butter} 40%, ${palette.ink})`} />
      </main>

      <TemplateFooter config={config} palette={palette} date={date} showBranding={showBranding} />
    </div>
  );
}
