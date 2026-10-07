"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWeddingStore } from "@/store/weddingStore";
import { InputField, TextareaField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import PhotoField from "@/components/media/PhotoField";
import { audienceSectionsFor } from "@/components/wedding-templates";
import { DEFAULT_GREETING, emptyAudience, isAudienceEmpty } from "@/lib/invitations";
import { PERSONALIZED_ADDON_CENTS, TIER_INFO } from "@/lib/tiers";
import { formatPrice } from "@/lib/utils";
import type {
  Audience,
  AudienceSectionKey,
  GuestGroup,
  GuestListEntry,
  PrivateSection,
  PrivateSectionKind,
  WeddingConfig,
} from "@/types/wedding";
import { Calendar, ChevronDown, Eye, FileText, Image as ImageIcon, Lock, Plus, Search, Trash2, X } from "lucide-react";

interface Props {
  config: WeddingConfig;
  onUpgrade: () => void;
  /** Jump to the Guest list tab (for when there's nobody to target yet). */
  onOpenGuests: () => void;
}

const KIND_META: Record<PrivateSectionKind, { label: string; icon: typeof FileText; hint: string }> = {
  text: { label: "Note", icon: FileText, hint: "A message, like dress code for the entourage" },
  photo: { label: "Photo + message", icon: ImageIcon, hint: "A photo with a few words" },
  event: { label: "Extra event", icon: Calendar, hint: "Rehearsal dinner, after-party, send-off" },
};

const newId = () => `ps-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function PersonalizationEditor({ config, onUpgrade, onOpenGuests }: Props) {
  const personalized = config.tier === "personalized";
  const updateConfig = useWeddingStore((s) => s.updateConfig);
  const guests = useWeddingStore((s) => s.guests).filter((g) => g.weddingId === config.id);
  const groups = useWeddingStore((s) => s.groups).filter((g) => g.weddingId === config.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sections = config.privateSections ?? [];
  const greeting = config.inviteGreeting ?? { enabled: true, message: DEFAULT_GREETING };
  const restrictable = audienceSectionsFor(config.templateId);
  const hasAudience = guests.length > 0 || groups.length > 0;
  const privileged = guests.filter((g) => g.partySize > 1).sort((a, b) => a.name.localeCompare(b.name));

  const saveSections = (next: PrivateSection[]) => updateConfig(config.id, { privateSections: next });
  const patchSection = (id: string, data: Partial<PrivateSection>) =>
    saveSections(sections.map((s) => (s.id === id ? { ...s, ...data } : s)));

  const addSection = (kind: PrivateSectionKind) => {
    const id = newId();
    saveSections([
      ...sections,
      { id, kind, title: kind === "event" ? "Rehearsal dinner" : "", body: "", audience: emptyAudience() },
    ]);
    setExpandedId(id);
  };

  const setSectionAudience = (key: AudienceSectionKey, audience: Audience | null) => {
    const next = { ...(config.sectionAudiences ?? {}) };
    if (audience) next[key] = audience;
    else delete next[key];
    updateConfig(config.id, { sectionAudiences: next });
  };

  return (
    <div className="space-y-12">
      {!personalized && (
        <div
          className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          style={{ background: "var(--color-primary-container)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
        >
          <div>
            <p className="flex items-center gap-2 label-luxury" style={{ color: "var(--color-primary)" }}>
              <Lock size={12} aria-hidden />
              Personalized Invitations
            </p>
            <h2 className="headline-sm mt-2" style={{ fontSize: "1.35rem" }}>{TIER_INFO.personalized.summary}</h2>
            <ul className="mt-3 space-y-1 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
              {TIER_INFO.personalized.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="shrink-0">
            <ButtonPrimary size="lg" onClick={onUpgrade}>
              Unlock for {formatPrice(PERSONALIZED_ADDON_CENTS)}
            </ButtonPrimary>
            <p className="mt-2 text-center text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
              One-time add-on for this website
            </p>
          </div>
        </div>
      )}

      {personalized && !hasAudience && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
            Add guests or groups first. Everything below is shown to the people you pick.
          </p>
          <ButtonSecondary size="sm" onClick={onOpenGuests}>Go to guest list</ButtonSecondary>
        </div>
      )}

      {/* Locked features stay visible so Base couples can see what they'd get. */}
      <div inert={!personalized} className="space-y-12" style={{ opacity: personalized ? 1 : 0.5 }}>
        {/* Greeting */}
        <section aria-labelledby="greeting-heading">
          <SectionHeading id="greeting-heading" title="Personal greeting" body="Guests who open their invite link are greeted by name at the top of your site." />
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm" style={{ color: "var(--color-on-surface)" }}>
            <input
              type="checkbox"
              checked={greeting.enabled}
              onChange={(e) => updateConfig(config.id, { inviteGreeting: { ...greeting, enabled: e.target.checked } })}
              style={{ accentColor: "var(--color-primary)" }}
              className="h-4 w-4"
            />
            Greet guests by name
          </label>
          {greeting.enabled && (
            <div className="mt-3 max-w-xl">
              <InputField
                label="Message under their name"
                id="greeting-message"
                maxLength={140}
                placeholder={DEFAULT_GREETING}
                value={greeting.message}
                onChange={(e) => updateConfig(config.id, { inviteGreeting: { ...greeting, message: e.target.value } })}
              />
            </div>
          )}
          <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3 text-sm" style={{ color: "var(--color-on-surface)" }}>
            <input
              type="checkbox"
              checked={config.inviteLookupEnabled !== false}
              onChange={(e) => updateConfig(config.id, { inviteLookupEnabled: e.target.checked })}
              style={{ accentColor: "var(--color-primary)" }}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              Let guests find their invitation by name or code
              <span className="block text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
                For guests who lost their link. If two guests share a name, they&apos;ll be asked for their code.
              </span>
            </span>
          </label>
        </section>

        {/* Extra seats */}
        <section aria-labelledby="seats-heading">
          <SectionHeading
            id="seats-heading"
            title="Extra guests"
            body="Give chosen guests room to bring friends or family. They name their additional guests when they RSVP from their own link. Everyone else follows your plus-one setting."
          />
          {privileged.length === 0 ? (
            <p className="text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
              No one has extra seats yet. Raise a guest&apos;s party size on the guest list to allow more.
            </p>
          ) : (
            <ul style={{ borderTop: "1px solid var(--color-outline)" }}>
              {privileged.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                  style={{ borderBottom: "1px solid var(--color-outline)", color: "var(--color-on-surface)" }}
                >
                  <span className="min-w-0 truncate">{g.name}</span>
                  <span className="shrink-0 font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                    +{g.partySize - 1} {g.partySize - 1 === 1 ? "guest" : "guests"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <ButtonSecondary size="sm" onClick={onOpenGuests}>Set party sizes on the guest list</ButtonSecondary>
          </div>
        </section>

        {/* Private sections */}
        <section aria-labelledby="private-heading">
          <SectionHeading
            id="private-heading"
            title="Private sections"
            body="Extra content only the guests or groups you choose will see. Nobody else knows it's there."
          />
          {sections.length > 0 && (
            <ul className="mb-5 flex flex-col gap-2">
              {sections.map((s) => {
                const Icon = KIND_META[s.kind].icon;
                const open = expandedId === s.id;
                const panelId = `private-${s.id}`;
                return (
                  <li
                    key={s.id}
                    style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(open ? null : s.id)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left"
                    >
                      <Icon size={16} className="shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                          {s.title.trim() || `Untitled ${KIND_META[s.kind].label.toLowerCase()}`}
                        </span>
                        <span className="block truncate text-xs font-light" style={{ color: isAudienceEmpty(s.audience) ? "var(--color-error)" : "var(--color-on-surface-muted)" }}>
                          {isAudienceEmpty(s.audience) ? "Not shown to anyone yet" : `Visible to ${describeAudience(s.audience, groups, guests)}`}
                        </span>
                      </span>
                      <ChevronDown size={16} style={{ color: "var(--color-on-surface-variant)", transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.2s ease-out" }} />
                    </button>
                    {open && (
                      <div id={panelId} className="space-y-5 px-4 pb-5 pt-1">
                        <InputField
                          label="Title"
                          id={`${panelId}-title`}
                          maxLength={100}
                          value={s.title}
                          onChange={(e) => patchSection(s.id, { title: e.target.value })}
                        />
                        {s.kind === "photo" && (
                          <PhotoField
                            label="Photo"
                            scope={config.id}
                            aspect="4/3"
                            value={s.photoUrl}
                            onChange={(url) => patchSection(s.id, { photoUrl: url || undefined })}
                          />
                        )}
                        {s.kind === "event" && (
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <InputField
                              label="Date"
                              id={`${panelId}-date`}
                              type="date"
                              value={s.eventDate ?? ""}
                              onChange={(e) => patchSection(s.id, { eventDate: e.target.value || undefined })}
                            />
                            <InputField
                              label="Time"
                              id={`${panelId}-time`}
                              placeholder="6:00 PM"
                              maxLength={40}
                              value={s.eventTime ?? ""}
                              onChange={(e) => patchSection(s.id, { eventTime: e.target.value || undefined })}
                            />
                            <InputField
                              label="Location"
                              id={`${panelId}-location`}
                              maxLength={160}
                              value={s.eventLocation ?? ""}
                              onChange={(e) => patchSection(s.id, { eventLocation: e.target.value || undefined })}
                            />
                          </div>
                        )}
                        <TextareaField
                          label={s.kind === "event" ? "Details" : "Message"}
                          id={`${panelId}-body`}
                          maxLength={2000}
                          value={s.body}
                          onChange={(e) => patchSection(s.id, { body: e.target.value })}
                        />
                        <AudiencePicker
                          idPrefix={panelId}
                          label="Who can see this"
                          audience={s.audience}
                          onChange={(audience) => patchSection(s.id, { audience })}
                          groups={groups}
                          guests={guests}
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => saveSections(sections.filter((x) => x.id !== s.id))}
                            className="flex min-h-[44px] items-center gap-2 px-2 text-xs transition-opacity hover:opacity-70"
                            style={{ color: "var(--color-error)" }}
                          >
                            <Trash2 size={13} />
                            Delete section
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(KIND_META) as PrivateSectionKind[]).map((kind) => (
              <ButtonSecondary key={kind} size="sm" onClick={() => addSection(kind)} title={KIND_META[kind].hint}>
                <Plus size={13} />
                {KIND_META[kind].label}
              </ButtonSecondary>
            ))}
          </div>
        </section>

        {/* Existing sections */}
        <section aria-labelledby="audience-heading">
          <SectionHeading
            id="audience-heading"
            title="Who sees each section"
            body="Everyone sees every section by default. Restrict one to hide it from anyone outside the guests or groups you pick."
          />
          <ul style={{ borderTop: "1px solid var(--color-outline)" }}>
            {restrictable.map(({ key, label }) => (
              <SectionAudienceRow
                key={key}
                sectionKey={key}
                label={label}
                audience={config.sectionAudiences?.[key]}
                onChange={(a) => setSectionAudience(key, a)}
                groups={groups}
                guests={guests}
              />
            ))}
          </ul>
          <p className="mt-3 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
            Sections this template doesn&apos;t include aren&apos;t listed. Hidden content is left out of what guests see, but
            it isn&apos;t encrypted, so keep truly private details like door codes off your site.
          </p>
        </section>

        <div>
          <Link href={`/wedding/${config.slug || config.id}`} target="_blank">
            <ButtonSecondary size="md">
              <Eye size={14} />
              Preview as a guest
            </ButtonSecondary>
          </Link>
          <p className="mt-2 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
            Opens your site with a &ldquo;View as&rdquo; picker, visible only to you.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <div className="mb-5">
      <h2 id={id} className="text-base font-medium" style={{ color: "var(--color-on-surface)" }}>{title}</h2>
      <p className="mt-1 text-sm font-light" style={{ color: "var(--color-on-surface-variant)", maxWidth: "60ch" }}>{body}</p>
    </div>
  );
}

function describeAudience(a: Audience, groups: GuestGroup[], guests: GuestListEntry[]): string {
  const names = [
    ...a.groupIds.map((id) => groups.find((g) => g.id === id)?.name),
    ...a.guestIds.map((id) => guests.find((g) => g.id === id)?.name),
  ].filter(Boolean) as string[];
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
}

function SectionAudienceRow({
  sectionKey,
  label,
  audience,
  onChange,
  groups,
  guests,
}: {
  sectionKey: AudienceSectionKey;
  label: string;
  audience: Audience | undefined;
  onChange: (a: Audience | null) => void;
  groups: GuestGroup[];
  guests: GuestListEntry[];
}) {
  const restricted = Boolean(audience);
  const idPrefix = `aud-${sectionKey}`;
  return (
    <li className="py-3" style={{ borderBottom: "1px solid var(--color-outline)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm" style={{ color: "var(--color-on-surface)" }}>{label}</p>
          <p className="text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
            {!audience
              ? "Everyone"
              : isAudienceEmpty(audience)
              ? "Pick who can see it below. Until then, everyone can."
              : `Only ${describeAudience(audience, groups, guests)}`}
          </p>
        </div>
        <div className="flex gap-1" role="radiogroup" aria-label={`Who sees ${label}`}>
          {[
            { value: false, text: "Everyone" },
            { value: true, text: "Only some" },
          ].map((opt) => {
            const active = restricted === opt.value;
            return (
              <button
                key={opt.text}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(opt.value ? audience ?? emptyAudience() : null)}
                className="min-h-[36px] px-3 text-xs transition-colors"
                style={{
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${active ? "var(--color-primary)" : "var(--color-outline)"}`,
                  background: active ? "var(--color-primary-container)" : "transparent",
                  color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
      {audience && (
        <div className="mt-3">
          <AudiencePicker idPrefix={idPrefix} label={`Who can see ${label}`} audience={audience} onChange={onChange} groups={groups} guests={guests} />
        </div>
      )}
    </li>
  );
}

function AudiencePicker({
  idPrefix,
  label,
  audience,
  onChange,
  groups,
  guests,
}: {
  idPrefix: string;
  label: string;
  audience: Audience;
  onChange: (a: Audience) => void;
  groups: GuestGroup[];
  guests: GuestListEntry[];
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return guests
      .filter((g) => !audience.guestIds.includes(g.id) && g.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, guests, audience.guestIds]);

  const toggleGroup = (id: string) =>
    onChange({
      ...audience,
      groupIds: audience.groupIds.includes(id) ? audience.groupIds.filter((g) => g !== id) : [...audience.groupIds, id],
    });

  const selectedGuests = audience.guestIds
    .map((id) => guests.find((g) => g.id === id))
    .filter((g): g is GuestListEntry => Boolean(g));

  return (
    <fieldset>
      <legend className="label-luxury mb-2" style={{ color: "var(--color-on-surface-variant)" }}>{label}</legend>

      {groups.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {groups.map((g) => {
            const on = audience.groupIds.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGroup(g.id)}
                className="min-h-[32px] px-3 text-xs transition-colors"
                style={{
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${on ? "var(--color-primary)" : "var(--color-outline)"}`,
                  background: on ? "var(--color-primary)" : "transparent",
                  color: on ? "#fff" : "var(--color-on-surface-variant)",
                }}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      )}

      {selectedGuests.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-1.5">
          {selectedGuests.map((g) => (
            <li
              key={g.id}
              className="flex min-h-[32px] items-center gap-1 pl-3 pr-1 text-xs"
              style={{ borderRadius: "var(--radius-full)", background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
            >
              {g.name}
              <button
                type="button"
                onClick={() => onChange({ ...audience, guestIds: audience.guestIds.filter((id) => id !== g.id) })}
                className="flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-60"
                aria-label={`Remove ${g.name}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {guests.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-on-surface-muted)" }} />
          <input
            id={`${idPrefix}-guest-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add a guest by name"
            aria-label="Add a guest by name"
            autoComplete="off"
            className="min-h-[36px] w-full py-2 pl-8 pr-3 text-sm font-light outline-none"
            style={{
              background: "var(--color-surface-container-lowest)",
              border: "1px solid var(--color-outline)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-on-surface)",
            }}
          />
          {matches.length > 0 && (
            <ul
              className="absolute inset-x-0 top-full mt-1 overflow-hidden py-1"
              style={{
                zIndex: "var(--z-dropdown)",
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "0 8px 24px rgba(28,27,25,0.08)",
              }}
            >
              {matches.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...audience, guestIds: [...audience.guestIds, g.id] });
                      setQuery("");
                    }}
                    className="w-full min-h-[36px] px-3 text-left text-sm font-light transition-colors hover:bg-[var(--color-surface-container)]"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {groups.length === 0 && guests.length === 0 && (
        <p className="text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
          Add guests or groups on the Guest list tab to choose who sees this.
        </p>
      )}
    </fieldset>
  );
}
