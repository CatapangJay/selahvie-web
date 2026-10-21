"use client";

import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import Select, { type SelectOption } from "@/components/ui/Select";
import { InputField } from "@/components/ui/InputField";
import { ENTOURAGE, OTHER_CATEGORY, categoryOf, isPresetRole } from "@/lib/entourage";
import { asSide, sideOptions } from "@/lib/guestSides";
import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  update: (data: Partial<WeddingConfig>) => void;
  /** False when the chosen template has no entourage section. */
  shownOnSite: boolean;
}

const CUSTOM = "__custom";
const MAX_MEMBERS = 120;

let seq = 0;
const newId = () => `wp-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const ROLE_OPTIONS: SelectOption[] = [
  ...ENTOURAGE.flatMap((c) => c.roles.map((r) => ({ value: r.role, label: r.role, group: c.label }))),
  { value: CUSTOM, label: "Another role…", group: OTHER_CATEGORY.label },
];

const CATEGORIES = [
  ...ENTOURAGE,
  { id: OTHER_CATEGORY.id, label: OTHER_CATEGORY.label, roles: [] },
];

/** Canonical spelling of a preset role, or CUSTOM. */
const roleValue = (role: string) =>
  ENTOURAGE.flatMap((c) => c.roles).find((r) => r.role.toLowerCase() === role.trim().toLowerCase())?.role ?? CUSTOM;

export default function EntourageEditor({ config, update, shownOnSite }: Props) {
  const members = config.weddingParty ?? [];
  const sides = sideOptions(config, "Either side");
  const full = members.length >= MAX_MEMBERS;

  const save = (next: WeddingPartyMember[]) => update({ weddingParty: next });
  const patch = (id: string, data: Partial<WeddingPartyMember>) =>
    save(members.map((m) => (m.id === id ? { ...m, ...data } : m)));

  const add = (role: string) => {
    if (full) return;
    const id = newId();
    save([...members, { id, name: "", role }]);
    requestAnimationFrame(() => document.getElementById(`ent-${id}`)?.focus());
  };

  return (
    <div className="space-y-8">
      {!shownOnSite && (
        <p
          className="p-4 text-sm"
          style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-md)", color: "var(--color-on-surface-variant)" }}
        >
          Your current template doesn&rsquo;t have an entourage section yet. You can still list everyone here, and it
          will show on templates that do.
        </p>
      )}

      {CATEGORIES.map((cat) => {
        const list = members.filter((m) => categoryOf(m.role) === cat.id);
        return (
          <CategorySection
            key={cat.id}
            label={cat.label}
            count={list.filter((m) => m.name.trim()).length}
          >
            {list.length > 0 && (
              <ul className="mb-3" style={{ borderTop: "1px solid var(--color-outline)" }}>
                {list.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    sides={sides}
                    onChange={(data) => patch(m.id, data)}
                    onRemove={() => save(members.filter((x) => x.id !== m.id))}
                  />
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-1.5">
              {(cat.roles.length ? cat.roles.map((r) => r.role) : [""]).map((role) => (
                <button
                  key={role || "other"}
                  type="button"
                  onClick={() => add(role)}
                  disabled={full}
                  className="inline-flex min-h-[32px] items-center gap-1 px-2.5 text-xs transition-colors duration-150 hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    border: "1px solid var(--color-outline)",
                    borderRadius: "var(--radius-full)",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  <Plus size={12} aria-hidden />
                  {role || "Someone else"}
                </button>
              ))}
            </div>
          </CategorySection>
        );
      })}

      {full && (
        <p className="text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
          You&rsquo;ve reached {MAX_MEMBERS} people, the most an entourage can list.
        </p>
      )}
    </div>
  );
}

function CategorySection({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
        {label}
        {count > 0 && (
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-xs font-medium tabular-nums"
            style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)", borderRadius: "var(--radius-full)" }}
          >
            {count}
          </span>
        )}
      </h3>
      {children}
    </section>
  );
}

interface RowProps {
  member: WeddingPartyMember;
  sides: SelectOption[];
  onChange: (data: Partial<WeddingPartyMember>) => void;
  onRemove: () => void;
}

function MemberRow({ member, sides, onChange, onRemove }: RowProps) {
  const custom = !isPresetRole(member.role);
  const label = member.name.trim() || member.role || "this person";

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 gap-y-2 py-3 @lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]" style={{ borderBottom: "1px solid var(--color-outline)" }}>
      <div className="min-w-0">
        <InputField
          id={`ent-${member.id}`}
          aria-label={`Name${member.role ? `, ${member.role}` : ""}`}
          placeholder={member.role === "Godfather" ? "e.g. Mr. Jose Reyes" : member.role === "Godmother" ? "e.g. Mrs. Ana Reyes" : "Full name"}
          value={member.name}
          maxLength={120}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        {custom && (
          <div className="mt-1">
            <InputField
              id={`ent-role-${member.id}`}
              aria-label={`Role for ${label}`}
              placeholder="Role, e.g. Officiant"
              value={member.role}
              maxLength={60}
              onChange={(e) => onChange({ role: e.target.value })}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex h-10 w-10 items-center justify-center transition-colors duration-150 hover:bg-[var(--color-surface-container-high)] @lg:order-last"
        style={{ color: "var(--color-on-surface-muted)", borderRadius: "var(--radius-full)" }}
      >
        <Trash2 size={15} aria-hidden />
      </button>

      <div className="col-span-2 flex flex-wrap items-center gap-2 @lg:col-span-1 @lg:contents">
        <Select
          variant="chip"
          aria-label={`Role for ${label}`}
          value={roleValue(member.role)}
          onChange={(v) => onChange({ role: v === CUSTOM ? (custom ? member.role : "") : v })}
          options={ROLE_OPTIONS}
          style={{ fontSize: "0.75rem" }}
        />
        <Select
          variant="chip"
          aria-label={`Side for ${label}`}
          value={member.side ?? ""}
          onChange={(v) => onChange({ side: asSide(v) })}
          options={sides}
          style={{ fontSize: "0.75rem" }}
        />
      </div>
    </li>
  );
}
