"use client";

import { useState, useRef, useEffect, useMemo, use, type CSSProperties, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ExternalLink, Eye, Info, Lock, Monitor,
  PanelLeftClose, PanelLeftOpen, Pause, Play, Plus, Smartphone, Users, X,
} from "lucide-react";
import { useWeddingStore } from "@/store/weddingStore";
import { useCartStore } from "@/store/cartStore";
import { useOwnedConfig } from "@/lib/useOwnedConfig";
import { templates } from "@/data/templates";
import { InputField, TextareaField } from "@/components/ui/InputField";
import DateField from "@/components/ui/DateField";
import Collapse from "@/components/ui/Collapse";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { cn, generateSlug } from "@/lib/utils";
import { TIER_INFO, configTier } from "@/lib/tiers";
import { musicTracks, CUSTOM_TRACK_ID, NO_MUSIC_ID } from "@/data/musicTracks";
import SectionsEditor from "@/components/customize/SectionsEditor";
import EntourageEditor from "@/components/customize/EntourageEditor";
import { audienceSectionsFor } from "@/components/wedding-templates";
import LivePreview, { type PreviewDevice } from "@/components/customize/LivePreview";
import GuestListManager from "@/components/manage/GuestListManager";
import PersonalizationEditor from "@/components/manage/PersonalizationEditor";
import ViewAsSelect from "@/components/wedding-templates/_shared/ViewAsSelect";
import PhotoField from "@/components/media/PhotoField";
import PhotoGalleryField from "@/components/media/PhotoGalleryField";
import Skeleton from "@/components/ui/Skeleton";
import type { WeddingConfig } from "@/types/wedding";

type StepId = "couple" | "look" | "story" | "rsvp" | "entourage" | "sections" | "guests" | "personalize" | "publish";

interface Step {
  id: StepId;
  group: string;
  label: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  { id: "couple", group: "Your website", label: "Couple & venue" },
  { id: "look", group: "Your website", label: "Colors" },
  { id: "story", group: "Your website", label: "Photos, story & music" },
  { id: "rsvp", group: "Your website", label: "RSVP settings" },
  { id: "entourage", group: "Your website", label: "Entourage", optional: true },
  { id: "sections", group: "Your website", label: "Extra sections", optional: true },
  { id: "guests", group: "Your guests", label: "Guest list", optional: true },
  { id: "personalize", group: "Your guests", label: "Personal touches", optional: true },
  { id: "publish", group: "Publish", label: "Review & publish" },
];
const GROUPS = [...new Set(STEPS.map((s) => s.group))];
/** Height of a sticky group heading; open step headers stick just beneath it. */
const GROUP_BAR = 48;
const ESSENTIALS: StepId[] = ["couple", "look", "story", "rsvp"];
/** Steps whose editors need more room than a form column. */
const WIDE_STEPS: StepId[] = ["guests", "personalize"];

const isStepId = (v: string | null): v is StepId => STEPS.some((s) => s.id === v);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const formatDate = (iso: string, dateStyle: "long" | "medium" = "long") =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { dateStyle }) : "";

/** Whether each step has what it needs. Drives the step checkboxes. */
function stepsDone(config: WeddingConfig, guestCount: number): Record<StepId, boolean> {
  return {
    couple: Boolean(config.partner1Name && config.partner2Name && config.weddingDate),
    look: Boolean(config.themePresetId || config.primaryColor),
    story: Boolean(config.heroImageUrl && config.coupleStory),
    rsvp: Boolean(config.rsvpDeadline),
    entourage: Boolean(config.weddingParty?.some((m) => m.name.trim())),
    sections: Boolean(
      config.schedule?.length || config.faq?.length || config.registryLinks?.length
    ),
    guests: guestCount > 0,
    personalize: configTier(config) === "personalized" && Boolean(config.privateSections?.length),
    publish: config.status === "published",
  };
}

/** Selectable option (palette, music track): white tile, rose outline when chosen. */
const optionStyle = (selected: boolean): CSSProperties => ({
  background: selected ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
  border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-outline)"}`,
  boxShadow: selected ? "inset 0 0 0 1px var(--color-primary)" : undefined,
  borderRadius: "var(--radius-md)",
});

const RING = "color-mix(in oklab, var(--color-on-surface-variant) 45%, transparent)";
const HAIRLINE = "1px solid var(--color-outline)";
/** Viewport below the 64px app header and its 1px border. */
const STUDIO_HEIGHT = "h-[calc(100dvh-65px)]";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CustomizePage(props: Props) {
  const params = use(props.params);
  const status = useWeddingStore((s) => s.status);
  const config = useOwnedConfig(params.id);

  if (status === "error") return null;
  if (status !== "ready") {
    return (
      <div className={cn("flex flex-col", STUDIO_HEIGHT)} aria-busy="true">
        <div className="flex h-[61px] shrink-0 items-center gap-4 px-4 sm:px-6" style={{ borderBottom: HAIRLINE }}>
          <Skeleton className="h-8 w-8" rounded="full" />
          <Skeleton className="h-6 w-48" rounded="sm" />
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="w-full space-y-6 p-6 lg:w-[26rem] xl:w-[28rem]" style={{ borderRight: HAIRLINE }}>
            <Skeleton className="h-6 w-40" rounded="sm" />
            <Skeleton className="h-12 w-full" rounded="sm" />
            <Skeleton className="h-12 w-full" rounded="sm" />
            <Skeleton className="h-12 w-full" rounded="sm" />
          </div>
          <div className="hidden flex-1 p-6 lg:block" style={{ background: "var(--color-surface-container-low)" }}>
            <Skeleton className="h-full w-full" rounded="md" />
          </div>
        </div>
      </div>
    );
  }
  if (!config) notFound();
  return <CustomizeStudio config={config} />;
}

function CustomizeStudio({ config }: { config: WeddingConfig }) {
  const updateConfig = useWeddingStore((s) => s.updateConfig);
  const publishConfig = useWeddingStore((s) => s.publishConfig);
  const allGuests = useWeddingStore((s) => s.guests);
  const allGroups = useWeddingStore((s) => s.groups);
  const addUpgrade = useCartStore((s) => s.addUpgrade);
  const router = useRouter();
  const searchParams = useSearchParams();

  const guests = useMemo(() => allGuests.filter((g) => g.weddingId === config.id), [allGuests, config.id]);
  const groups = useMemo(() => allGroups.filter((g) => g.weddingId === config.id), [allGroups, config.id]);

  const template = templates.find((t) => t.id === config.templateId);
  const initialStep = searchParams.get("step");
  // The open accordion item. A deep link opens that step; otherwise the first unfinished essential.
  const [step, setStep] = useState<StepId | null>(() => {
    if (isStepId(initialStep)) return initialStep;
    const done = stepsDone(config, 0);
    return ESSENTIALS.find((id) => !done[id]) ?? null;
  });
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [viewAs, setViewAs] = useState("");
  const [mealInput, setMealInput] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const scrollToOpen = useRef(isStepId(initialStep));

  // Audio preview state for music picker
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const stopPreview = () => {
    previewRef.current?.pause();
    previewRef.current = null;
    setPreviewingId(null);
  };

  const togglePreview = (id: string, src: string) => {
    if (previewingId === id) { stopPreview(); return; }
    stopPreview();
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    previewRef.current = audio;
    setPreviewingId(id);
    audio.addEventListener("ended", stopPreview);
  };

  // Stop any playing preview when the page unmounts (e.g. navigating away)
  useEffect(() => stopPreview, []);

  const update = (data: Partial<WeddingConfig>) => updateConfig(config.id, data);

  const goTo = (id: StepId) => {
    stopPreview();
    setStep(id);
    setPanelOpen(true);
    setMobileView("edit");
    scrollToOpen.current = true;
    window.history.replaceState(null, "", `?step=${id}`);
  };

  const collapse = () => {
    stopPreview();
    setStep(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

  // Ease a newly opened step to the top of the panel (under its group heading). The step that
  // was open collapses above it meanwhile, so keep re-measuring until that settles.
  useEffect(() => {
    if (!step || !scrollToOpen.current) return;
    scrollToOpen.current = false;
    const body = bodyRef.current;
    const item = body?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (!body || !item) return;
    const gap = () => item.getBoundingClientRect().top - body.getBoundingClientRect().top - GROUP_BAR;
    const settle = () => {
      body.scrollTop += gap();
    };
    const end = performance.now() + 340;
    let raf = 0;
    const tick = () => {
      if (performance.now() >= end) return settle();
      body.scrollTop += gap() * 0.2;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const timer = window.setTimeout(settle, 380);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [step]);

  const tier = configTier(config);
  const personalized = tier === "personalized";
  const published = config.status === "published";
  const coupleLabel =
    config.partner1Name && config.partner2Name
      ? `${config.partner1Name} & ${config.partner2Name}`
      : config.partner1Name || config.partner2Name || "Your wedding website";
  const siteHref = `/wedding/${config.slug || config.id}`;

  const done = stepsDone(config, guests.length);
  const essentialsDone = ESSENTIALS.filter((id) => done[id]).length;

  const wide = step !== null && WIDE_STEPS.includes(step);

  const chosenPalette = template?.colorPalettes.find((p) => p.id === config.themePresetId);
  const gallery = config.galleryImageUrls?.length ?? 0;
  const filledSections = [
    config.schedule?.length && "Schedule",
    config.registryLinks?.length && "Registry",
    config.faq?.length && "FAQ",
  ].filter(Boolean);
  const entourageCount = config.weddingParty?.filter((m) => m.name.trim()).length ?? 0;
  /** One line shown under a collapsed step, so the couple can scan what's set. */
  const summaries: Record<StepId, string> = {
    couple: [
      config.partner1Name && config.partner2Name ? `${config.partner1Name} & ${config.partner2Name}` : "",
      formatDate(config.weddingDate, "medium"),
      config.venueName,
    ].filter(Boolean).join(" · "),
    look: chosenPalette?.name ?? (config.primaryColor ? "Custom colors" : ""),
    story: [
      config.heroImageUrl && "Hero photo",
      gallery > 0 && plural(gallery, "gallery photo"),
      config.coupleStory && "Your story",
    ].filter(Boolean).join(" · "),
    rsvp: config.rsvpDeadline ? `Reply by ${formatDate(config.rsvpDeadline, "medium")}` : "",
    entourage: entourageCount ? `${entourageCount} ${entourageCount === 1 ? "person" : "people"}` : "",
    sections: filledSections.join(", "),
    guests: guests.length
      ? `${plural(guests.length, "guest")}${groups.length ? ` in ${plural(groups.length, "group")}` : ""}`
      : "",
    personalize: !personalized
      ? "Comes with the Personalized plan"
      : config.privateSections?.length
        ? plural(config.privateSections.length, "private section")
        : "",
    publish: published ? "Live" : essentialsDone === ESSENTIALS.length ? "Ready when you are" : "",
  };

  const handleUpgrade = () => {
    addUpgrade(config.id, template ?? templates[0], coupleLabel);
    router.push("/checkout");
  };

  const handlePublish = async () => {
    // Names that are all non-Latin characters leave nothing to build a slug from.
    const baseSlug =
      generateSlug(config.partner1Name || "partner1", config.partner2Name || "partner2")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "our-wedding";

    setPublishing(true);
    setPublishError("");
    try {
      const slug = await publishConfig(config.id, baseSlug);
      router.push(`/wedding/${slug}`);
    } catch {
      setPublishError("We couldn't publish your website. Please try again.");
      setPublishing(false);
    }
  };

  const addMeal = (e: FormEvent) => {
    e.preventDefault();
    const meal = mealInput.trim();
    if (!meal) return;
    if (!config.mealOptions.includes(meal)) update({ mealOptions: [...config.mealOptions, meal] });
    setMealInput("");
  };

  const descriptions: Record<StepId, ReactNode> = {
    couple: "Your names, date and venue appear throughout your website.",
    look: "Start from one of this template's palettes, or set your own colors.",
    story: "The first things guests see and hear when they open your website.",
    rsvp: "Set a reply-by date and choose what to ask guests when they respond.",
    entourage:
      "Parents, sponsors, the best man, maid of honor and everyone else walking down the aisle. Only people with a name appear on your website.",
    sections: "Fonts, schedule, registry, travel and more. A section only shows on your website once it has content.",
    guests: (
      <>
        {personalized
          ? "Add the people you're inviting and sort them into groups. Each guest and group gets a personal invite link."
          : "Add the people you're inviting to track replies and head count in one place."}{" "}
        This step is optional. Anyone with your website link can RSVP, and you can add or import guests after publishing too.
      </>
    ),
    personalize: (
      <>
        Greet guests by name, give chosen guests extra seats, and show private sections only to the people you pick.
        {personalized && " Use “View as” above the preview to see the site as one of your guests."}
      </>
    ),
    publish: published
      ? "Your website is live. Anything you change in these steps appears on it automatically."
      : "Check the details below, then publish when you're ready to share your website.",
  };

  const canViewAs = personalized && guests.length + groups.length > 0;

  const stepHeader = (s: Step, open: boolean) => {
    const locked = s.id === "personalize" && !personalized;
    const summary = summaries[s.id] || (s.optional && !done[s.id] ? "Optional" : "");
    return (
      <h3
        className={open ? "sticky z-[1]" : undefined}
        style={open ? { top: GROUP_BAR, background: "var(--color-surface-container-lowest)", borderBottom: HAIRLINE } : undefined}
      >
        <button
          type="button"
          id={`step-${s.id}-header`}
          aria-expanded={open}
          aria-controls={open ? `step-${s.id}-panel` : undefined}
          onClick={() => (open ? collapse() : goTo(s.id))}
          className="flex min-h-[60px] w-full items-center gap-3.5 px-5 py-3 text-left transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
        >
          <StepMark done={done[s.id]} locked={locked} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
              {s.label}
            </span>
            {!open && summary && (
              <span className="mt-0.5 block truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                {summary}
              </span>
            )}
          </span>
          <ChevronDown
            size={16}
            aria-hidden
            className="shrink-0 transition-transform duration-200 ease-out"
            style={{ color: "var(--color-on-surface-variant)", transform: open ? "rotate(180deg)" : undefined }}
          />
        </button>
      </h3>
    );
  };

  return (
    <div className={cn("flex flex-col", STUDIO_HEIGHT)}>
      {/* Studio bar */}
      <div
        className="flex shrink-0 items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6"
        style={{ borderBottom: HAIRLINE, background: "var(--color-surface)" }}
      >
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--color-surface-container)]"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <ArrowLeft size={18} aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-[1.125rem] leading-tight sm:text-[1.25rem]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--color-on-surface)" }}
          >
            {coupleLabel}
          </h1>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            <span
              className="shrink-0 rounded-full px-2 py-px font-medium"
              style={
                published
                  ? { background: "var(--color-success)", color: "#fff" }
                  : { background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }
              }
            >
              {published ? "Published" : "Draft"}
            </span>
            <span className="truncate">
              {template?.name ?? "Custom"} · {TIER_INFO[tier].label} plan
              <span className="hidden md:inline"> · {published ? "Edits go live automatically" : "Saves automatically"}</span>
            </span>
          </p>
        </div>

        {/* Edit / preview switch on small screens */}
        <div
          role="group"
          aria-label="Show"
          className="flex shrink-0 rounded-full p-0.5 lg:hidden"
          style={{ background: "var(--color-surface-container)" }}
        >
          {(["edit", "preview"] as const).map((view) => {
            const active = mobileView === view;
            return (
              <button
                key={view}
                type="button"
                aria-pressed={active}
                onClick={() => setMobileView(view)}
                className="min-h-[36px] rounded-full px-3.5 text-sm transition-colors duration-150"
                style={{
                  background: active ? "var(--color-surface-container-lowest)" : "transparent",
                  color: active ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                  fontWeight: active ? 500 : 400,
                  boxShadow: active ? "0 1px 2px rgb(47 30 38 / 0.12)" : undefined,
                }}
              >
                {view === "edit" ? "Edit" : "Preview"}
              </button>
            );
          })}
        </div>

        <Link
          href={`/dashboard/manage/${config.id}`}
          aria-label="Guests and RSVPs"
          title="Guests and RSVPs"
          className="btn-outline inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-2 px-2.5 text-sm md:px-4"
          style={{ borderRadius: "var(--radius-sm)", letterSpacing: "normal" }}
        >
          <Users size={15} aria-hidden />
          <span className="hidden md:inline" aria-hidden>Guests &amp; RSVPs</span>
        </Link>

        {published ? (
          <Link
            href={siteHref}
            target="_blank"
            className="btn-outline hidden min-h-[40px] shrink-0 items-center gap-2 px-4 text-sm sm:inline-flex"
            style={{ borderRadius: "var(--radius-sm)", letterSpacing: "normal" }}
          >
            <Eye size={14} aria-hidden />
            View live site
          </Link>
        ) : (
          step !== "publish" && (
            <ButtonPrimary size="sm" className="hidden shrink-0 sm:inline-flex" onClick={() => goTo("publish")}>
              Review &amp; publish
            </ButtonPrimary>
          )
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Editor panel */}
        <aside
          id="studio-panel"
          aria-label="Edit your website"
          className={cn(
            "min-h-0 w-full shrink-0 flex-col",
            mobileView === "edit" ? "flex" : "hidden",
            panelOpen ? "lg:flex" : "lg:hidden",
            wide ? "lg:w-[40rem] xl:w-[44rem]" : "lg:w-[26rem] xl:w-[28rem]"
          )}
          style={{ background: "var(--color-surface-container-lowest)", borderRight: HAIRLINE }}
        >
          {/* Panel header */}
          <div className="relative flex shrink-0 items-center gap-2 py-3 pl-5 pr-3" style={{ borderBottom: HAIRLINE }}>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[1.25rem] leading-tight" style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--color-on-surface)" }}>
                Set up your website
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                {published
                  ? "Your website is live"
                  : essentialsDone === ESSENTIALS.length
                    ? "The essentials are done. Publish when you're ready."
                    : `${essentialsDone} of ${ESSENTIALS.length} essentials done`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              aria-label="Hide editor"
              title="Hide editor"
              aria-controls="studio-panel"
              aria-expanded
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--color-surface-container)] lg:flex"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <PanelLeftClose size={18} aria-hidden />
            </button>
            <div
              role="progressbar"
              aria-label="Essentials complete"
              aria-valuemin={0}
              aria-valuemax={ESSENTIALS.length}
              aria-valuenow={essentialsDone}
              className="absolute inset-x-0 -bottom-px h-0.5"
            >
              <div
                className="h-full w-full origin-left transition-transform duration-300 ease-out"
                style={{ background: "var(--color-primary)", transform: `scaleX(${essentialsDone / ESSENTIALS.length})` }}
              />
            </div>
          </div>

          {/* Steps, one open at a time */}
          <div ref={bodyRef} className="relative min-h-0 flex-1 overflow-y-auto pb-10 [overflow-anchor:none]">
            {GROUPS.map((group, groupIndex) => {
              const items = STEPS.filter((s) => s.group === group);
              const finished = items.filter((s) => done[s.id]).length;
              return (
                <div key={group} role="group" aria-labelledby={`group-${groupIndex}`}>
                  <h3
                    id={`group-${groupIndex}`}
                    className="sticky top-0 z-[2] flex items-center justify-between gap-3 px-5"
                    style={{
                      height: GROUP_BAR,
                      background: "var(--color-surface-container-low)",
                      borderBottom: HAIRLINE,
                      color: "var(--color-on-surface)",
                    }}
                  >
                    <span className="text-base font-medium">{group}</span>
                    {items.length > 1 && (
                      <span className="text-xs font-normal tabular-nums" style={{ color: "var(--color-on-surface-variant)" }}>
                        {finished} of {items.length} done
                      </span>
                    )}
                  </h3>
                  {items.map((s) => {
                    const next = STEPS[STEPS.indexOf(s) + 1];
                    return (
                      <section key={s.id} data-step={s.id} style={{ borderBottom: HAIRLINE }}>
                        {stepHeader(s, s.id === step)}
                        <Collapse open={s.id === step}>
                          {() => (
                            <div
                              id={`step-${s.id}-panel`}
                              role="region"
                              aria-labelledby={`step-${s.id}-header`}
                              className="@container px-5 pb-8 pt-5"
                            >
                <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  {descriptions[s.id]}
                </p>

                {s.id === "couple" && (
                  <div className="space-y-7">
                    <div className="grid grid-cols-1 gap-7 @lg:grid-cols-2">
                      <InputField label="Partner 1 name" id="p1" placeholder="Alexandra" autoComplete="off" value={config.partner1Name} onChange={(e) => update({ partner1Name: e.target.value })} />
                      <InputField label="Partner 2 name" id="p2" placeholder="James" autoComplete="off" value={config.partner2Name} onChange={(e) => update({ partner2Name: e.target.value })} />
                    </div>
                    <DateField label="Wedding date" id="date" value={config.weddingDate} onChange={(v) => update({ weddingDate: v })} />
                    <InputField label="Venue name" id="venue" placeholder="The Grand Ballroom" value={config.venueName} onChange={(e) => update({ venueName: e.target.value })} />
                    <InputField label="Venue address" id="venueAddr" placeholder="123 Rose Avenue" value={config.venueAddress} onChange={(e) => update({ venueAddress: e.target.value })} />
                    <InputField label="City" id="city" placeholder="San Francisco, CA" value={config.venueCity} onChange={(e) => update({ venueCity: e.target.value })} />
                  </div>
                )}

                {s.id === "look" && (
                  <div className="space-y-10">
                    {template && template.colorPalettes.length > 0 && (
                      <fieldset>
                        <legend className="mb-3 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                          {template.name} palettes
                        </legend>
                        <div className="grid grid-cols-1 gap-2.5 @lg:grid-cols-2">
                          {template.colorPalettes.map((palette) => {
                            const selected = config.themePresetId === palette.id;
                            return (
                              <button
                                key={palette.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => update({ themePresetId: palette.id, primaryColor: palette.primary, accentColor: palette.accent })}
                                className="flex min-h-[56px] items-center gap-4 px-4 py-3 text-left transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                                style={optionStyle(selected)}
                              >
                                <span className="flex -space-x-1.5" aria-hidden>
                                  {[palette.primary, palette.accent, palette.background].map((c, i) => (
                                    <Swatch key={i} color={c} size={24} />
                                  ))}
                                </span>
                                <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                                  {palette.name}
                                </span>
                                {selected && <Check size={16} aria-hidden style={{ color: "var(--color-primary)" }} />}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}

                    <fieldset>
                      <legend className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Custom colors</legend>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                        Click a swatch to pick a color, or type a hex code.
                      </p>
                      <div className="mt-5 grid grid-cols-1 gap-7 @lg:grid-cols-2">
                        <ColorField id="primaryColor" label="Primary color" placeholder="#7c5454" value={config.primaryColor} onChange={(v) => update({ primaryColor: v })} />
                        <ColorField id="accentColor" label="Accent color" placeholder="#c99999" value={config.accentColor} onChange={(v) => update({ accentColor: v })} />
                      </div>
                    </fieldset>
                  </div>
                )}

                {s.id === "story" && (
                  <div className="space-y-10">
                    <PhotoField
                      label="Hero photo"
                      scope={config.id}
                      value={config.heroImageUrl}
                      onChange={(url) => update({ heroImageUrl: url })}
                      hint="The big photo guests see first. A landscape photo works best."
                    />

                    <PhotoGalleryField
                      label="Gallery"
                      scope={config.id}
                      value={config.galleryImageUrls}
                      onChange={(urls) => update({ galleryImageUrls: urls })}
                      hint="Photos appear in this order. Some templates feature the first few in the story section."
                    />

                    <TextareaField
                      label="Your love story"
                      id="story"
                      rows={7}
                      placeholder="How you met, the proposal, or anything that makes the two of you, you."
                      value={config.coupleStory}
                      onChange={(e) => update({ coupleStory: e.target.value })}
                    />

                    <fieldset>
                      <legend className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Background music</legend>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                        Plays softly while guests browse. Use the play button to hear a track.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[{ id: NO_MUSIC_ID, label: "No music" }, { id: CUSTOM_TRACK_ID, label: "My own MP3 link" }].map(({ id, label }) => {
                          const selected = config.musicTrackId === id || (!config.musicTrackId && id === NO_MUSIC_ID);
                          return (
                            <button
                              key={id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => { stopPreview(); update({ musicTrackId: id }); }}
                              className="min-h-[40px] px-4 text-sm transition-colors duration-150"
                              style={{ ...optionStyle(selected), borderRadius: "var(--radius-full)", color: "var(--color-on-surface)" }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <ul className="mt-4 grid grid-cols-1 gap-2.5 @2xl:grid-cols-2">
                        {musicTracks.map((track) => {
                          const selected = config.musicTrackId === track.id;
                          const previewing = previewingId === track.id;
                          return (
                            <li key={track.id} className="flex items-center gap-3 p-3 transition-colors duration-150" style={optionStyle(selected)}>
                              <button
                                type="button"
                                onClick={() => togglePreview(track.id, track.src)}
                                aria-label={previewing ? `Pause ${track.name}` : `Play ${track.name}`}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-150"
                                style={{
                                  background: previewing ? "var(--color-primary)" : "var(--color-surface-container-high)",
                                  color: previewing ? "#fff" : "var(--color-on-surface)",
                                }}
                              >
                                {previewing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
                              </button>
                              <button
                                type="button"
                                aria-pressed={selected}
                                onClick={() => update({ musicTrackId: track.id })}
                                className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-left"
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                                    {track.name}
                                    <span className="font-normal" style={{ color: "var(--color-on-surface-variant)" }}> · {track.mood}</span>
                                  </span>
                                  <span className="mt-0.5 block truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                                    {track.description}
                                  </span>
                                </span>
                                {selected && <Check size={16} aria-hidden style={{ color: "var(--color-primary)" }} />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      {config.musicTrackId === CUSTOM_TRACK_ID && (
                        <div className="mt-6">
                          <InputField
                            label="MP3 link"
                            id="musicUrl"
                            type="url"
                            placeholder="https://your-host.com/your-track.mp3"
                            value={config.musicCustomUrl ?? ""}
                            onChange={(e) => update({ musicCustomUrl: e.target.value })}
                          />
                          <p className="mt-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                            Use a public MP3 link that allows cross-origin requests (CORS).
                          </p>
                        </div>
                      )}

                      {config.musicTrackId && config.musicTrackId !== NO_MUSIC_ID && config.musicTrackId !== CUSTOM_TRACK_ID && (
                        <p className="mt-3 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                          Music by{" "}
                          <a href="https://www.bensound.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            Bensound.com
                          </a>
                        </p>
                      )}
                    </fieldset>
                  </div>
                )}

                {s.id === "rsvp" && (
                  <div className="space-y-10">
                    <DateField
                      label="Reply by"
                      id="rsvpDeadline"
                      value={config.rsvpDeadline}
                      onChange={(v) => update({ rsvpDeadline: v })}
                    />

                    <fieldset>
                      <legend className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Meal options</legend>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                        Guests choose one when they RSVP.
                      </p>
                      {config.mealOptions.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {config.mealOptions.map((opt) => (
                            <li
                              key={opt}
                              className="flex min-h-[36px] items-center gap-1 pl-3.5 pr-1 text-sm"
                              style={{
                                background: "var(--color-surface-container)",
                                borderRadius: "var(--radius-full)",
                                color: "var(--color-on-surface)",
                              }}
                            >
                              {opt}
                              <button
                                type="button"
                                onClick={() => update({ mealOptions: config.mealOptions.filter((o) => o !== opt) })}
                                aria-label={`Remove ${opt}`}
                                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--color-surface-container-high)]"
                                style={{ color: "var(--color-on-surface-variant)" }}
                              >
                                <X size={13} aria-hidden />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <form onSubmit={addMeal} className="mt-4 flex items-end gap-3">
                        <div className="min-w-0 flex-1">
                          <InputField
                            id="mealInput"
                            aria-label="New meal option"
                            placeholder="Add an option, e.g. Vegan"
                            value={mealInput}
                            onChange={(e) => setMealInput(e.target.value)}
                          />
                        </div>
                        <ButtonSecondary size="sm" type="submit" disabled={!mealInput.trim()}>
                          <Plus size={13} aria-hidden />
                          Add
                        </ButtonSecondary>
                      </form>
                    </fieldset>

                    <div className="flex items-start justify-between gap-6 py-5" style={{ borderTop: HAIRLINE, borderBottom: HAIRLINE }}>
                      <div>
                        <p id="plus-one-label" className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                          Allow plus-ones
                        </p>
                        <p id="plus-one-hint" className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                          Every guest can bring one extra person when they RSVP.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={config.allowPlusOne}
                        aria-labelledby="plus-one-label"
                        aria-describedby="plus-one-hint"
                        onClick={() => update({ allowPlusOne: !config.allowPlusOne })}
                        className="mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200"
                        style={{ background: config.allowPlusOne ? "var(--color-primary)" : "var(--color-surface-container-highest)" }}
                      >
                        <span
                          className="h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out"
                          style={{ transform: config.allowPlusOne ? "translateX(20px)" : "translateX(0)" }}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {s.id === "entourage" && (
                  <EntourageEditor
                    config={config}
                    update={update}
                    shownOnSite={audienceSectionsFor(config.templateId).some((x) => x.key === "weddingParty")}
                  />
                )}

                {s.id === "sections" && <SectionsEditor config={config} update={update} />}

                {s.id === "guests" && (
                  <div className="space-y-6">
                    {personalized && !published && (
                      <Note>Invite links start working as soon as you publish. You can copy them now or later.</Note>
                    )}
                    <GuestListManager
                      weddingId={config.id}
                      coupleLabel={coupleLabel}
                      personalized={personalized}
                      siteSlug={config.slug || config.id}
                      onUpgrade={handleUpgrade}
                    />
                  </div>
                )}

                {s.id === "personalize" && (
                  <PersonalizationEditor config={config} onUpgrade={handleUpgrade} onOpenGuests={() => goTo("guests")} />
                )}

                {s.id === "publish" && (
                  <ReviewStep
                    config={config}
                    templatePalette={chosenPalette?.name}
                    guestCount={guests.length}
                    groupCount={groups.length}
                    done={done}
                    published={published}
                    onEdit={goTo}
                  />
                )}

                {/* Step actions */}
                {s.id === "publish" ? (
                  <div className="mt-8">
                    {publishError && (
                      <p role="alert" className="mb-3 text-sm" style={{ color: "var(--color-error)" }}>
                        {publishError}
                      </p>
                    )}
                    {published ? (
                      <Link
                        href={`/dashboard/manage/${config.id}`}
                        className="btn-primary label-luxury inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-5"
                        style={{ borderRadius: "var(--radius-sm)", color: "#fff" }}
                      >
                        See RSVPs
                        <ArrowRight size={14} aria-hidden />
                      </Link>
                    ) : (
                      <ButtonPrimary className="w-full justify-center" onClick={handlePublish} disabled={publishing} aria-busy={publishing}>
                        {publishing ? "Publishing…" : "Publish website"}
                      </ButtonPrimary>
                    )}
                  </div>
                ) : (
                  next && (
                    <div className="mt-10 flex justify-end">
                      <ButtonSecondary size="sm" onClick={() => goTo(next.id)} title={`Next: ${next.label}`}>
                        {s.optional && !done[s.id] ? "Skip for now" : "Continue"}
                        <ArrowRight size={13} aria-hidden />
                      </ButtonSecondary>
                    </div>
                  )
                )}
                            </div>
                          )}
                        </Collapse>
                      </section>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Live preview */}
        <section
          aria-label="Website preview"
          className={cn("min-w-0 flex-1 flex-col", mobileView === "preview" ? "flex" : "hidden", "lg:flex")}
          style={{ background: "var(--color-surface-container-low)" }}
        >
          <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6" style={{ borderBottom: HAIRLINE }}>
            {!panelOpen && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                aria-controls="studio-panel"
                aria-expanded={false}
                className="-ml-2 hidden min-h-[40px] items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors duration-150 hover:bg-[var(--color-surface-container)] lg:inline-flex"
                style={{ color: "var(--color-on-surface)" }}
              >
                <PanelLeftOpen size={18} aria-hidden />
                Show editor
              </button>
            )}
            <p className="min-w-0 text-sm" style={{ color: "var(--color-on-surface)" }}>
              Live preview
              <span className="hidden xl:inline" style={{ color: "var(--color-on-surface-variant)" }}>
                {" "}· {published ? "matches your live site" : "only you can see this draft"}
              </span>
            </p>

            <div className="ml-auto flex items-center gap-2">
              {canViewAs && (
                <>
                  <label htmlFor="studio-view-as" className="hidden text-sm sm:inline" style={{ color: "var(--color-on-surface-variant)" }}>
                    View as
                  </label>
                  <ViewAsSelect
                    id="studio-view-as"
                    guests={guests}
                    groups={groups}
                    value={viewAs}
                    onChange={setViewAs}
                    className="min-h-[36px] max-w-[11rem] cursor-pointer rounded-full px-3 text-sm outline-none"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      border: HAIRLINE,
                      color: "var(--color-on-surface)",
                    }}
                  />
                </>
              )}
              <div
                role="group"
                aria-label="Preview size"
                className="flex rounded-full p-0.5"
                style={{ background: "var(--color-surface-container)" }}
              >
                {([["desktop", Monitor, "Desktop"], ["mobile", Smartphone, "Mobile"]] as const).map(([key, Icon, label]) => {
                  const active = device === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDevice(key)}
                      aria-pressed={active}
                      aria-label={label}
                      title={label}
                      className="flex h-8 w-9 items-center justify-center rounded-full transition-colors duration-150"
                      style={{
                        background: active ? "var(--color-surface-container-lowest)" : "transparent",
                        color: active ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                        boxShadow: active ? "0 1px 2px rgb(47 30 38 / 0.12)" : undefined,
                      }}
                    >
                      <Icon size={15} aria-hidden />
                    </button>
                  );
                })}
              </div>
              <Link
                href={siteHref}
                target="_blank"
                aria-label="Open preview in a new tab"
                title="Open in a new tab"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--color-surface-container)]"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                <ExternalLink size={16} aria-hidden />
              </Link>
            </div>
          </div>

          <LivePreview config={config} guests={guests} groups={groups} inviteCode={canViewAs ? viewAs : ""} device={device} />
        </section>
      </div>
    </div>
  );
}

/** Checkbox-style completion mark on each accordion step. */
function StepMark({ done, locked }: { done: boolean; locked: boolean }) {
  const base = "flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-colors duration-200";
  const shape: CSSProperties = { borderRadius: 5 };
  if (locked) {
    return (
      <span className={base} style={{ ...shape, border: `1px solid ${RING}`, color: "var(--color-on-surface-variant)" }}>
        <Lock size={10} aria-hidden />
        <span className="sr-only">(needs Personalized)</span>
      </span>
    );
  }
  if (done) {
    return (
      <span className={base} style={{ ...shape, background: "var(--color-primary)", color: "#fff" }}>
        <Check size={12} strokeWidth={3} aria-hidden />
        <span className="sr-only">(done)</span>
      </span>
    );
  }
  return <span className={base} style={{ ...shape, border: `1.5px solid ${RING}` }} />;
}

function Swatch({ color, size }: { color: string; size: number }) {
  return (
    <span
      className="block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: "0 0 0 2px var(--color-surface-container-lowest), inset 0 0 0 1px rgb(47 30 38 / 0.12)",
      }}
    />
  );
}

interface ColorFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ id, label, placeholder, value, onChange }: ColorFieldProps) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="flex items-end gap-3">
      <label
        className="relative mb-1 block h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full"
        style={{ background: value || "var(--color-surface-container)", boxShadow: "inset 0 0 0 1px rgb(47 30 38 / 0.12)" }}
      >
        <span className="sr-only">Pick {label.toLowerCase()}</span>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <div className="min-w-0 flex-1">
        <InputField label={label} id={id} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p
      className="flex items-start gap-2.5 px-4 py-3 text-sm leading-relaxed"
      style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-sm)", color: "var(--color-on-surface)" }}
    >
      <Info size={16} aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
      <span>{children}</span>
    </p>
  );
}

interface ReviewStepProps {
  config: WeddingConfig;
  templatePalette?: string;
  guestCount: number;
  groupCount: number;
  done: Record<StepId, boolean>;
  published: boolean;
  onEdit: (step: StepId) => void;
}

function ReviewStep({ config, templatePalette, guestCount, groupCount, done, published, onEdit }: ReviewStepProps) {
  const missing = [
    !done.couple && { step: "couple" as const, label: "Add both names and your wedding date" },
    !done.story && { step: "story" as const, label: "Add a hero photo and your story" },
    !done.rsvp && { step: "rsvp" as const, label: "Set an RSVP reply-by date" },
  ].filter((m) => m !== false);

  const music = (() => {
    const id = config.musicTrackId;
    if (!id || id === NO_MUSIC_ID) return "No music";
    if (id === CUSTOM_TRACK_ID) return config.musicCustomUrl ? "Your own MP3" : null;
    return musicTracks.find((t) => t.id === id)?.name ?? null;
  })();

  const gallery = config.galleryImageUrls?.length ?? 0;
  const rows: { label: string; step: StepId; value: ReactNode }[] = [
    {
      label: "Couple",
      step: "couple",
      value: config.partner1Name && config.partner2Name ? `${config.partner1Name} & ${config.partner2Name}` : null,
    },
    { label: "Wedding date", step: "couple", value: formatDate(config.weddingDate) || null },
    { label: "Venue", step: "couple", value: [config.venueName, config.venueCity].filter(Boolean).join(", ") || null },
    {
      label: "Colors",
      step: "look",
      value: (
        <span className="inline-flex items-center gap-2.5">
          <span className="flex -space-x-1" aria-hidden>
            <Swatch color={config.primaryColor} size={18} />
            <Swatch color={config.accentColor} size={18} />
          </span>
          {templatePalette ?? "Custom colors"}
        </span>
      ),
    },
    {
      label: "Photos & story",
      step: "story",
      value:
        [
          config.heroImageUrl && "Hero photo",
          gallery > 0 && plural(gallery, "gallery photo"),
          config.coupleStory && "Your story",
        ]
          .filter(Boolean)
          .join(" · ") || null,
    },
    { label: "Music", step: "story", value: music },
    {
      label: "RSVPs",
      step: "rsvp",
      value: [
        config.rsvpDeadline ? `Reply by ${formatDate(config.rsvpDeadline, "medium")}` : "No reply-by date",
        config.allowPlusOne ? "Plus-ones allowed" : "No plus-ones",
        config.mealOptions.length ? plural(config.mealOptions.length, "meal option") : "No meal choice",
      ].join(" · "),
    },
    {
      label: "Entourage",
      step: "entourage",
      value: (() => {
        const n = config.weddingParty?.filter((m) => m.name.trim()).length ?? 0;
        return n ? `${n} ${n === 1 ? "person" : "people"}` : "None listed";
      })(),
    },
    {
      label: "Guest list",
      step: "guests",
      value: guestCount
        ? `${plural(guestCount, "guest")}${groupCount ? ` in ${plural(groupCount, "group")}` : ""}`
        : "None yet. Anyone with your link can still RSVP.",
    },
    { label: "Plan", step: "personalize", value: TIER_INFO[configTier(config)].label },
  ];

  return (
    <div className="space-y-8">
      {!published && missing.length > 0 && (
        <div className="p-4" style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-md)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>A few things are still missing</p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            You can publish now and fill them in later, but guests will see gaps until you do.
          </p>
          <ul className="mt-2 flex flex-col">
            {missing.map((m) => (
              <li key={m.step}>
                <button
                  type="button"
                  onClick={() => onEdit(m.step)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 text-left text-sm font-medium underline-offset-4 hover:underline"
                  style={{ color: "var(--color-primary-dim)" }}
                >
                  {m.label}
                  <ArrowRight size={14} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl style={{ borderTop: HAIRLINE }}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 py-3 @md:grid-cols-[8.5rem_minmax(0,1fr)_auto]"
            style={{ borderBottom: HAIRLINE }}
          >
            <dt className="col-start-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{row.label}</dt>
            <dd
              className="col-start-1 row-start-2 min-w-0 text-sm @md:col-start-2 @md:row-start-1"
              style={{ color: row.value ? "var(--color-on-surface)" : "var(--color-on-surface-variant)" }}
            >
              {row.value ?? "Not added yet"}
            </dd>
            <dd className="col-start-2 row-start-1 @md:col-start-3">
              <button
                type="button"
                onClick={() => onEdit(row.step)}
                aria-label={`Edit ${row.label.toLowerCase()}`}
                className="min-h-[32px] text-sm font-medium underline-offset-4 hover:underline"
                style={{ color: "var(--color-primary-dim)" }}
              >
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
        {published
          ? "Guests see your changes as soon as they're saved."
          : "Once it's published you can keep editing, adding guests and sharing invite links."}
      </p>
    </div>
  );
}
