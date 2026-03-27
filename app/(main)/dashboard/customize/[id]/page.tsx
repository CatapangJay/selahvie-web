"use client";

import { useWeddingStore } from "@/store/weddingStore";
import { templates } from "@/data/templates";
import { notFound, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { InputField, TextareaField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { ArrowLeft, ArrowRight, Check, Play, Pause } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { musicTracks, CUSTOM_TRACK_ID, NO_MUSIC_ID } from "@/data/musicTracks";
import Link from "next/link";

const STEPS = [
  { num: 1, label: "Couple Info" },
  { num: 2, label: "Theme & Colors" },
  { num: 3, label: "Media & Story" },
  { num: 4, label: "RSVP Settings" },
  { num: 5, label: "Review & Publish" },
];

interface Props {
  params: { id: string };
}

export default function CustomizePage({ params }: Props) {
  const { getConfig, updateConfig, publishConfig, configs } = useWeddingStore();
  const router = useRouter();
  const config = getConfig(params.id);

  if (!config) notFound();

  const template = templates.find((t) => t.id === config.templateId);
  const [step, setStep] = useState(1);
  const [mealInput, setMealInput] = useState("");

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

  const update = (data: Partial<typeof config>) => updateConfig(params.id, data);

  const handlePublish = () => {
    const baseSlug = generateSlug(
      config.partner1Name || "partner1",
      config.partner2Name || "partner2",
    );

    // Ensure the slug is unique across all OTHER configs
    const otherSlugs = new Set(
      Object.values(configs)
        .filter((c) => c.id !== params.id)
        .map((c) => c.slug),
    );

    let slug = baseSlug;
    let counter = 2;
    while (otherSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    updateConfig(params.id, { slug });
    publishConfig(params.id);
    // Route by config ID — guaranteed unique, even if slug collides
    router.push(`/wedding/${params.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-6" style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-10 label-luxury transition-opacity hover:opacity-70"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <p className="label-luxury mb-2" style={{ color: "var(--color-tertiary)" }}>Customization Studio</p>
      <h1
        className="headline-md mb-10"
        style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}
      >
        {template?.name ?? "Your Wedding Website"}
      </h1>

      {/* Step indicators */}
      <div className="mb-12 flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => setStep(s.num)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all"
                style={{
                  background: step === s.num ? "var(--color-primary)" : step > s.num ? "var(--color-secondary)" : "var(--color-surface-container-high)",
                  color: step >= s.num ? "white" : "var(--color-on-surface-variant)",
                }}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span
                className="label-luxury text-[10px] hidden sm:block"
                style={{ color: step === s.num ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-2 transition-colors"
                style={{ background: step > s.num ? "var(--color-secondary)" : "var(--color-outline-variant)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div
        className="rounded-2xl p-8"
        style={{ background: "var(--color-surface-container-low)" }}
      >
        {/* Step 1: Couple Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="title-md">Tell us about you two</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField label="Partner 1 Name" id="p1" placeholder="Alexandra" value={config.partner1Name} onChange={(e) => update({ partner1Name: e.target.value })} />
              <InputField label="Partner 2 Name" id="p2" placeholder="James" value={config.partner2Name} onChange={(e) => update({ partner2Name: e.target.value })} />
            </div>
            <InputField label="Wedding Date" id="date" type="date" value={config.weddingDate} onChange={(e) => update({ weddingDate: e.target.value })} />
            <InputField label="Venue Name" id="venue" placeholder="The Grand Ballroom" value={config.venueName} onChange={(e) => update({ venueName: e.target.value })} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField label="Venue Address" id="venueAddr" placeholder="123 Rose Avenue" value={config.venueAddress} onChange={(e) => update({ venueAddress: e.target.value })} />
              <InputField label="City" id="city" placeholder="San Francisco, CA" value={config.venueCity} onChange={(e) => update({ venueCity: e.target.value })} />
            </div>
          </div>
        )}

        {/* Step 2: Theme & Colors */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="title-md">Choose your palette</h2>
            {/* Template presets */}
            {template && (
              <div>
                <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-variant)" }}>Template Presets</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {template.colorPalettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => update({ themePresetId: palette.id, primaryColor: palette.primary, accentColor: palette.accent })}
                      className="flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                      style={{
                        background: config.themePresetId === palette.id ? "var(--color-surface-container)" : "var(--color-surface)",
                        border: `2px solid ${config.themePresetId === palette.id ? "var(--color-primary)" : "transparent"}`,
                      }}
                    >
                      <div className="flex gap-2">
                        {[palette.primary, palette.accent, palette.background].map((c, i) => (
                          <div key={i} className="h-7 w-7 rounded-full border-ghost" style={{ background: c }} />
                        ))}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom colors */}
            <div>
              <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-variant)" }}>Or enter custom colors</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-end gap-3">
                  <InputField label="Primary Color (hex)" id="primaryColor" placeholder="#7c5454" value={config.primaryColor} onChange={(e) => update({ primaryColor: e.target.value })} />
                  <div className="h-10 w-10 rounded-full border-ghost shrink-0" style={{ background: config.primaryColor }} />
                </div>
                <div className="flex items-end gap-3">
                  <InputField label="Accent Color (hex)" id="accentColor" placeholder="#c99999" value={config.accentColor} onChange={(e) => update({ accentColor: e.target.value })} />
                  <div className="h-10 w-10 rounded-full border-ghost shrink-0" style={{ background: config.accentColor }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="title-md">Your photos & story</h2>
            <InputField
              label="Hero Image URL"
              id="heroImg"
              type="url"
              placeholder="https://example.com/your-photo.jpg"
              value={config.heroImageUrl}
              onChange={(e) => update({ heroImageUrl: e.target.value })}
            />
            {config.heroImageUrl && (
              <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "16/9" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-variant)" }}>Gallery Images (up to 8 URLs)</p>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <InputField
                    key={i}
                    id={`gallery-${i}`}
                    placeholder={`Gallery image ${i + 1} URL`}
                    value={config.galleryImageUrls[i] ?? ""}
                    onChange={(e) => {
                      const updated = [...config.galleryImageUrls];
                      updated[i] = e.target.value;
                      update({ galleryImageUrls: updated });
                    }}
                  />
                ))}
              </div>
            </div>

            <TextareaField
              label="Your Love Story"
              id="story"
              placeholder="Tell your guests how you met, your proposal story, or anything that makes your relationship unique…"
              value={config.coupleStory}
              onChange={(e) => update({ coupleStory: e.target.value })}
            />

            {/* ── Background Music ── */}
            <div>
              <p className="label-luxury mb-1" style={{ color: "var(--color-on-surface-variant)" }}>Background Music</p>
              <p className="text-xs mb-4" style={{ color: "var(--color-outline)" }}>
                Plays softly when guests visit your wedding website. Click ▶ to preview a track.
              </p>

              {/* No Music / Custom URL quick chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[{ id: NO_MUSIC_ID, label: "No Music" }, { id: CUSTOM_TRACK_ID, label: "Custom MP3 URL" }].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { stopPreview(); update({ musicTrackId: id }); }}
                    className="rounded-full px-4 py-1.5 text-sm transition-all"
                    style={{
                      background: (config.musicTrackId === id || (!config.musicTrackId && id === NO_MUSIC_ID))
                        ? "var(--color-surface-container)" : "var(--color-surface)",
                      border: `1px solid ${
                        (config.musicTrackId === id || (!config.musicTrackId && id === NO_MUSIC_ID))
                          ? "var(--color-primary)" : "var(--color-outline-variant)"
                      }`,
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Built-in track grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {musicTracks.map((track) => {
                  const isSelected   = config.musicTrackId === track.id;
                  const isPreviewing = previewingId === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => { stopPreview(); update({ musicTrackId: track.id }); }}
                      className="flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-all"
                      style={{
                        background: isSelected ? "var(--color-surface-container)" : "var(--color-surface)",
                        border: `1.5px solid ${isSelected ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                      }}
                    >
                      {/* Preview play/pause */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); togglePreview(track.id, track.src); }}
                        aria-label={isPreviewing ? "Pause preview" : `Preview ${track.name}`}
                        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                        style={{ background: isPreviewing ? "var(--color-primary-container)" : "var(--color-surface-container-high)" }}
                      >
                        {isPreviewing
                          ? <Pause size={13} style={{ color: "var(--color-primary)" }} />
                          : <Play  size={13} style={{ color: "var(--color-on-surface-variant)" }} />
                        }
                      </button>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{track.name}</p>
                          <span
                            className="label-luxury px-1.5 py-0.5 rounded"
                            style={{ fontSize: "0.6rem", background: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" }}
                          >
                            {track.mood}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-on-surface-variant)" }}>
                          {track.description}
                        </p>
                      </div>

                      {/* Selected dot */}
                      {isSelected && (
                        <div className="flex-shrink-0 h-2 w-2 rounded-full" style={{ background: "var(--color-primary)" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom URL input */}
              {config.musicTrackId === CUSTOM_TRACK_ID && (
                <div className="mt-4 space-y-2">
                  <InputField
                    label="Your MP3 URL"
                    id="musicUrl"
                    type="url"
                    placeholder="https://your-host.com/your-track.mp3"
                    value={config.musicCustomUrl ?? ""}
                    onChange={(e) => update({ musicCustomUrl: e.target.value })}
                  />
                  <p className="text-xs" style={{ color: "var(--color-outline)" }}>
                    Paste a publicly accessible MP3 URL. The file must allow cross-origin requests (CORS).
                  </p>
                </div>
              )}

              {/* Attribution note */}
              {config.musicTrackId && config.musicTrackId !== NO_MUSIC_ID && config.musicTrackId !== CUSTOM_TRACK_ID && (
                <p className="mt-3 text-xs" style={{ color: "var(--color-outline)" }}>
                  Music by{" "}
                  <a href="https://www.bensound.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    Bensound.com
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: RSVP Settings */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="title-md">RSVP Configuration</h2>
            <InputField
              label="RSVP Deadline"
              id="rsvpDeadline"
              type="date"
              value={config.rsvpDeadline}
              onChange={(e) => update({ rsvpDeadline: e.target.value })}
            />

            <div>
              <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-variant)" }}>Meal Options</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {config.mealOptions.map((opt) => (
                  <div
                    key={opt}
                    className="flex items-center gap-2 rounded-full px-3 py-1"
                    style={{ background: "var(--color-secondary-container, #b8ccb8)" }}
                  >
                    <span className="text-sm">{opt}</span>
                    <button
                      onClick={() => update({ mealOptions: config.mealOptions.filter((o) => o !== opt) })}
                      className="text-xs opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <InputField
                  id="mealInput"
                  placeholder="Add option (e.g. Vegan)"
                  value={mealInput}
                  onChange={(e) => setMealInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mealInput.trim()) {
                      update({ mealOptions: [...config.mealOptions, mealInput.trim()] });
                      setMealInput("");
                    }
                  }}
                />
                <ButtonSecondary
                  size="sm"
                  onClick={() => {
                    if (mealInput.trim()) {
                      update({ mealOptions: [...config.mealOptions, mealInput.trim()] });
                      setMealInput("");
                    }
                  }}
                >
                  Add
                </ButtonSecondary>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => update({ allowPlusOne: !config.allowPlusOne })}
                className="flex h-6 w-11 items-center rounded-full transition-all"
                style={{
                  background: config.allowPlusOne ? "var(--color-secondary)" : "var(--color-surface-container-highest)",
                  padding: "2px",
                }}
              >
                <div
                  className="h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: config.allowPlusOne ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
              <span className="text-sm" style={{ color: "var(--color-on-surface)" }}>Allow plus-one guests</span>
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="title-md">Review & Publish</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              Your wedding website is ready. Review the details below and publish when you&apos;re ready to share with your guests.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Couple", value: config.partner1Name && config.partner2Name ? `${config.partner1Name} & ${config.partner2Name}` : "—" },
                { label: "Date", value: config.weddingDate ? new Date(config.weddingDate).toLocaleDateString("en-US", { dateStyle: "long" }) : "—" },
                { label: "Venue", value: config.venueName || "—" },
                { label: "City", value: config.venueCity || "—" },
                { label: "RSVP Deadline", value: config.rsvpDeadline ? new Date(config.rsvpDeadline).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—" },
                { label: "Plus One", value: config.allowPlusOne ? "Allowed" : "Not allowed" },
                { label: "Meal Options", value: config.mealOptions.join(", ") || "—" },
                { label: "Template",    value: template?.name ?? "—" },
                { label: "Music",       value: (() => {
                  const tid = config.musicTrackId;
                  if (!tid || tid === NO_MUSIC_ID)     return "No music";
                  if (tid === CUSTOM_TRACK_ID)         return config.musicCustomUrl ? "Custom URL" : "Custom (no URL set)";
                  return musicTracks.find(t => t.id === tid)?.name ?? "—";
                })() },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: "var(--color-surface)" }}>
                  <p className="label-luxury text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full" style={{ background: config.primaryColor }} />
              <div className="h-8 w-8 rounded-full" style={{ background: config.accentColor }} />
              <span className="label-luxury text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>Selected colors</span>
            </div>

            <div className="mt-4">
              <ButtonPrimary size="lg" fullWidth onClick={handlePublish}>
                🌸 Publish My Wedding Website
              </ButtonPrimary>
              <p className="mt-3 text-center text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                You can edit your website after publishing from your dashboard.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <ButtonSecondary
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          size="sm"
        >
          <ArrowLeft size={14} />
          Previous
        </ButtonSecondary>
        {step < 5 && (
          <ButtonPrimary
            onClick={() => setStep((s) => Math.min(5, s + 1))}
            size="sm"
          >
            Next
            <ArrowRight size={14} />
          </ButtonPrimary>
        )}
      </div>
    </div>
  );
}
