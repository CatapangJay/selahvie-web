"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { resolveMusicSrc } from "@/data/musicTracks";
import { greetingFor } from "@/lib/invitations";
import { dressCodeOf } from "@/lib/weddingDetails";
import AudioPlayer from "@/components/wedding-templates/_shared/AudioPlayer";
import PrivateSections from "@/components/wedding-templates/_shared/PrivateSections";
import { useInvitee } from "@/components/wedding-templates/_shared/InviteeContext";
import { isSectionVisible } from "@/components/wedding-templates/_shared/sections";
import { FONTS_HREF, SANS, cssImage, dateParts, makePalette } from "./theme";
import LiftIntro from "./components/LiftIntro";
import HeroSection from "./components/HeroSection";
import CountdownStrip from "./components/CountdownStrip";
import Directory, { type FloorEntry } from "./components/Directory";
import StorySection from "./components/StorySection";
import DetailsSection from "./components/DetailsSection";
import ScheduleSection from "./components/ScheduleSection";
import EntourageSection from "./components/EntourageSection";
import GallerySection from "./components/GallerySection";
import DressCodeSection from "./components/DressCodeSection";
import TravelSection from "./components/TravelSection";
import RsvpSection from "./components/RsvpSection";
import GuestbookPanel from "./components/GuestbookPanel";
import RegistrySection from "./components/RegistrySection";
import FaqSection from "./components/FaqSection";
import TemplateFooter from "./components/TemplateFooter";
import { Arrived, DirectoryShown, PortalTarget, Reveal } from "./components/Motion";

const noSubscribe = () => () => {};

/** Sections a shared link may point at (e.g. …/wedding/slug#rsvp). */
const SECTION_IDS = new Set(["mz-directory", "story", "details", "schedule", "entourage", "gallery", "attire", "travel", "rsvp", "registry", "faq", "guestbook"]);
/** A link straight to a section skips the lift; every other visit plays it. */
const deepLinked = () => SECTION_IDS.has(window.location.hash.slice(1));

interface Props {
  config: WeddingConfig;
  showBranding?: boolean;
}

/**
 * Mezzanine: a grand old hotel's lift arriving at the celebration floor.
 * The guest presses the call button under a bronze transom (floor dial,
 * a place card with their name); the needle swings to M and the brushed
 * bronze doors slide apart onto the couple's photograph. Inside, sections
 * are floors: a lobby directory lists them and each heading carries its
 * round floor button. Oxblood, bronze and table-linen white; Gloock, Marcellus
 * SC and Albert Sans. Renders its own guest greeting (place card + hero line).
 */
export default function MezzanineTemplate({ config, showBranding = true }: Props) {
  const invitee = useInvitee();
  const [startedNow, setStarted] = useState(false);
  const [arrivedNow, setArrived] = useState(false);
  const [openedNow, setOpened] = useState(false);
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);

  // A guest arriving on a link to a section (#rsvp) walks straight in. Read from the
  // browser after hydration; the server always renders the closed doors.
  const returning = useSyncExternalStore(noSubscribe, deepLinked, () => false);
  const started = startedNow || returning;
  const arrived = arrivedNow || returning;
  const opened = openedNow || returning;

  const handleStart = useCallback(() => setStarted(true), []);
  // The doors are mostly open: release the page so the guest can scroll while they settle.
  const handleArrive = useCallback(() => {
    setArrived(true);
    // Focus would otherwise fall to <body> as the overlay goes; hand it to the names.
    requestAnimationFrame(() => document.getElementById("mz-hero-title")?.focus({ preventScroll: true }));
  }, []);
  const handleDone = useCallback(() => setOpened(true), []);

  // Deep links land on their floor once the doors are out of the way.
  useEffect(() => {
    if (!returning || startedNow) return;
    const target = window.location.hash.slice(1);
    if (target) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView());
  }, [returning, startedNow]);

  // Hold the page still while the doors are closed.
  useEffect(() => {
    if (arrived) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [arrived]);

  const palette = makePalette(config);
  const date = dateParts(config.weddingDate);
  const musicSrc = resolveMusicSrc(config.musicTrackId, config.musicCustomUrl);
  const greeting = greetingFor(config, invitee);
  const dressCode = dressCodeOf(config);
  const story = config.coupleStory?.trim() ?? "";
  const travel = config.travel;

  const show = {
    story: isSectionVisible(config, "story") && Boolean(story),
    schedule: isSectionVisible(config, "schedule") && (config.schedule ?? []).some((s) => s.title?.trim() || s.time?.trim()),
    weddingParty: isSectionVisible(config, "weddingParty") && (config.weddingParty ?? []).length > 0,
    gallery: isSectionVisible(config, "gallery") && ((config.galleryImageUrls ?? []).length > 0 || Object.values(config.galleryAlbums ?? {}).some((a) => (a ?? []).length > 0)),
    travel: isSectionVisible(config, "travel") && Boolean(travel?.directions?.trim() || travel?.accommodations?.trim() || travel?.notes?.trim()),
    rsvp: isSectionVisible(config, "rsvp"),
    registry: isSectionVisible(config, "registry") && (config.registryLinks ?? []).some((l) => l.label.trim()),
    faq: isSectionVisible(config, "faq") && (config.faq ?? []).some((f) => f.question.trim()),
    guestbook: isSectionVisible(config, "guestbook"),
  };

  // Floors in page order; numbering follows only what this guest can see. Labels match the section titles.
  const floors: FloorEntry[] = [
    show.story && { id: "story", label: "How we got here" },
    { id: "details", label: "Where & when" },
    show.schedule && { id: "schedule", label: "The evening" },
    show.weddingParty && { id: "entourage", label: "Standing with us" },
    show.gallery && { id: "gallery", label: "Photographs" },
    dressCode && { id: "attire", label: "What to wear" },
    show.travel && { id: "travel", label: "Getting here" },
    show.rsvp && { id: "rsvp", label: "Your reply" },
    show.registry && { id: "registry", label: "Gifts" },
    show.faq && { id: "faq", label: "Questions" },
  ].filter((f): f is FloorEntry => Boolean(f));
  const floorOf = (id: string) => floors.findIndex((f) => f.id === id) + 1;

  return (
    <PortalTarget.Provider value={portal}>
      <Arrived.Provider value={arrived}>
      <DirectoryShown.Provider value={floors.length >= 2}>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
      {/* Overlays live outside the container root: its containment would scope `position: fixed`. */}
      <div ref={setPortal} />
      <AnimatePresence>
        {!opened && (
          <LiftIntro
            key="lift"
            palette={palette}
            partner1={config.partner1Name}
            partner2={config.partner2Name}
            date={date}
            greeting={greeting}
            heroImage={cssImage(config.heroImageUrl)}
            onStart={handleStart}
            onArrive={handleArrive}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>

      {started && <AudioPlayer src={musicSrc} accentColor={palette.bronze} />}

      {/* While the doors are shut the page behind them is inert, so focus and screen readers stay in the lift. */}
      <div inert={!arrived} style={{ background: palette.linen, color: palette.ink, containerType: "inline-size", fontFamily: SANS, overflowX: "clip" }}>
        <HeroSection config={config} palette={palette} date={date} started={started} greeting={greeting} showRsvpLink={show.rsvp} instant={returning} />
        <CountdownStrip date={date} palette={palette} />
        <Directory floors={floors} palette={palette} />

        <main>
          {show.story && (
            <Reveal>
              <StorySection story={story} floor={floorOf("story")} palette={palette} />
            </Reveal>
          )}
          <Reveal>
            <DetailsSection config={config} floor={floorOf("details")} palette={palette} date={date} />
          </Reveal>
          {show.schedule && (
            <Reveal>
              <ScheduleSection items={config.schedule ?? []} floor={floorOf("schedule")} palette={palette} />
            </Reveal>
          )}
          {show.weddingParty && (
            <Reveal>
              <EntourageSection config={config} floor={floorOf("entourage")} palette={palette} />
            </Reveal>
          )}
          {show.gallery && (
            <Reveal>
              <GallerySection config={config} floor={floorOf("gallery")} palette={palette} />
            </Reveal>
          )}
          {dressCode && (
            <DressCodeSection title={dressCode.title} description={dressCode.description} swatches={dressCode.palette} floor={floorOf("attire")} palette={palette} />
          )}
          {show.travel && (
            <Reveal>
              <TravelSection travel={travel} floor={floorOf("travel")} palette={palette} />
            </Reveal>
          )}
          {show.rsvp && <RsvpSection config={config} floor={floorOf("rsvp")} palette={palette} />}
          {show.registry && (
            <Reveal>
              <RegistrySection config={config} floor={floorOf("registry")} palette={palette} />
            </Reveal>
          )}
          {show.faq && (
            <Reveal>
              <FaqSection items={config.faq ?? []} floor={floorOf("faq")} palette={palette} />
            </Reveal>
          )}
          {show.guestbook && <GuestbookPanel config={config} palette={palette} />}
          <PrivateSections config={config} accent={palette.oxblood} tone="light" />
        </main>

        <TemplateFooter config={config} palette={palette} date={date} showBranding={showBranding} />
      </div>
      </DirectoryShown.Provider>
      </Arrived.Provider>
    </PortalTarget.Provider>
  );
}
