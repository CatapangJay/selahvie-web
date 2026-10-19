"use client";

import { InputField, TextareaField } from "@/components/ui/InputField";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { fontPresets } from "@/data/fontPresets";
import { OPTIONAL_SECTIONS } from "@/components/wedding-templates/_shared/sections";
import type {
  WeddingConfig,
  RegistryLink,
  FaqItem,
  WeddingPartyMember,
  ScheduleEvent,
  OptionalSectionKey,
} from "@/types/wedding";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  config: WeddingConfig;
  update: (data: Partial<WeddingConfig>) => void;
}

let localSeq = 0;
const rid = (p: string) => `${p}-${Date.now().toString(36)}-${(localSeq++).toString(36)}`;

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
      {children}
    </h3>
  );
}

export default function SectionsEditor({ config, update }: Props) {
  const registry = config.registryLinks ?? [];
  const faq = config.faq ?? [];
  const party = config.weddingParty ?? [];
  const schedule = config.schedule ?? [];
  const travel = config.travel ?? { accommodations: "", directions: "", notes: "" };
  const visibility = config.sectionVisibility ?? {};

  const toggleSection = (key: OptionalSectionKey) =>
    update({ sectionVisibility: { ...visibility, [key]: visibility[key] === false } });

  return (
    <div className="space-y-10">
      {/* Font preset */}
      <div className="space-y-3">
        <Subhead>Typography</Subhead>
        <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
          {fontPresets.map((f) => {
            const active = (config.fontPresetId ?? "default") === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => update({ fontPresetId: f.id })}
                aria-pressed={active}
                className="p-4 text-left transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                style={{
                  background: active ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                  border: `1px solid ${active ? "var(--color-primary)" : "var(--color-outline)"}`,
                  boxShadow: active ? "inset 0 0 0 1px var(--color-primary)" : undefined,
                  borderRadius: "var(--radius-md)",
                }}
              >
                <span className="block text-sm font-medium" style={{ color: "var(--color-on-surface)", fontFamily: f.serif }}>
                  {f.name}
                </span>
                <span className="mt-1 block text-xs" style={{ color: "var(--color-on-surface-variant)", fontFamily: f.sans }}>
                  The quick brown fox
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visibility toggles */}
      <div className="space-y-3">
        <Subhead>Show or hide sections</Subhead>
        <div className="flex flex-wrap gap-2">
          {OPTIONAL_SECTIONS.map(({ key, label }) => {
            const shown = visibility[key] !== false;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSection(key)}
                aria-pressed={shown}
                className="min-h-[36px] rounded-full px-4 text-sm transition-colors duration-150"
                style={{
                  background: shown ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                  color: shown ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                  border: `1px solid ${shown ? "var(--color-primary)" : "var(--color-outline)"}`,
                }}
              >
                {shown ? "✓ " : ""}{label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule / order of events */}
      <RepeatingGroup
        title="Order of events"
        items={schedule}
        onAdd={() => update({ schedule: [...schedule, { id: rid("ev"), time: "", title: "", description: "" }] })}
        onRemove={(id) => update({ schedule: schedule.filter((e) => e.id !== id) })}
        addLabel="Add event"
        render={(ev: ScheduleEvent) => (
          <div className="grid grid-cols-1 gap-3 @lg:grid-cols-[8rem_1fr]">
            <InputField id={`t-${ev.id}`} label="Time" placeholder="4:00 PM" value={ev.time}
              onChange={(e) => update({ schedule: schedule.map((x) => x.id === ev.id ? { ...x, time: e.target.value } : x) })} />
            <InputField id={`ti-${ev.id}`} label="Title" placeholder="Ceremony" value={ev.title}
              onChange={(e) => update({ schedule: schedule.map((x) => x.id === ev.id ? { ...x, title: e.target.value } : x) })} />
          </div>
        )}
      />

      {/* Wedding party */}
      <RepeatingGroup
        title="Wedding party"
        items={party}
        onAdd={() => update({ weddingParty: [...party, { id: rid("wp"), name: "", role: "" }] })}
        onRemove={(id) => update({ weddingParty: party.filter((m) => m.id !== id) })}
        addLabel="Add member"
        render={(m: WeddingPartyMember) => (
          <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
            <InputField id={`n-${m.id}`} label="Name" placeholder="Jane Doe" value={m.name}
              onChange={(e) => update({ weddingParty: party.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x) })} />
            <InputField id={`r-${m.id}`} label="Role" placeholder="Maid of Honor" value={m.role}
              onChange={(e) => update({ weddingParty: party.map((x) => x.id === m.id ? { ...x, role: e.target.value } : x) })} />
          </div>
        )}
      />

      {/* Travel */}
      <div className="space-y-4">
        <Subhead>Travel and stay</Subhead>
        <TextareaField id="accommodations" label="Where to stay" placeholder="Hotel blocks, nearby options…"
          value={travel.accommodations}
          onChange={(e) => update({ travel: { ...travel, accommodations: e.target.value } })} />
        <TextareaField id="directions" label="Getting there" placeholder="Parking, transit, shuttle info…"
          value={travel.directions}
          onChange={(e) => update({ travel: { ...travel, directions: e.target.value } })} />
        <TextareaField id="travel-notes" label="Good to know" placeholder="Dress code, weather, anything else…"
          value={travel.notes}
          onChange={(e) => update({ travel: { ...travel, notes: e.target.value } })} />
      </div>

      {/* Registry */}
      <RepeatingGroup
        title="Registry links"
        items={registry}
        onAdd={() => update({ registryLinks: [...registry, { id: rid("rg"), label: "", url: "" }] })}
        onRemove={(id) => update({ registryLinks: registry.filter((l) => l.id !== id) })}
        addLabel="Add link"
        render={(l: RegistryLink) => (
          <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
            <InputField id={`l-${l.id}`} label="Label" placeholder="Amazon Registry" value={l.label}
              onChange={(e) => update({ registryLinks: registry.map((x) => x.id === l.id ? { ...x, label: e.target.value } : x) })} />
            <InputField id={`u-${l.id}`} label="URL" type="url" placeholder="https://…" value={l.url}
              onChange={(e) => update({ registryLinks: registry.map((x) => x.id === l.id ? { ...x, url: e.target.value } : x) })} />
          </div>
        )}
      />

      {/* FAQ */}
      <RepeatingGroup
        title="FAQ"
        items={faq}
        onAdd={() => update({ faq: [...faq, { id: rid("fq"), question: "", answer: "" }] })}
        onRemove={(id) => update({ faq: faq.filter((f) => f.id !== id) })}
        addLabel="Add question"
        render={(item: FaqItem) => (
          <div className="space-y-3">
            <InputField id={`q-${item.id}`} label="Question" placeholder="Can I bring my kids?" value={item.question}
              onChange={(e) => update({ faq: faq.map((x) => x.id === item.id ? { ...x, question: e.target.value } : x) })} />
            <TextareaField id={`a-${item.id}`} label="Answer" placeholder="We love your little ones, but…" value={item.answer}
              onChange={(e) => update({ faq: faq.map((x) => x.id === item.id ? { ...x, answer: e.target.value } : x) })} />
          </div>
        )}
      />
    </div>
  );
}

/** Generic add/remove list group used for schedule, party, registry, and faq. */
function RepeatingGroup<T extends { id: string }>({
  title, items, onAdd, onRemove, addLabel, render,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  addLabel: string;
  render: (item: T) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Subhead>{title}</Subhead>
      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative p-4 pr-12"
              style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
            >
              {render(item)}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Remove from ${title.toLowerCase()}`}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
      <ButtonSecondary size="sm" onClick={onAdd}>
        <Plus size={13} />
        {addLabel}
      </ButtonSecondary>
    </div>
  );
}
