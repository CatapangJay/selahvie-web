"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useWeddingStore, type ImportGuestRow } from "@/store/weddingStore";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import EmptyState from "@/components/ui/EmptyState";
import { toCsv, downloadFile, parseCsv, formatPrice } from "@/lib/utils";
import { formatCode, inviteUrl } from "@/lib/invitations";
import { PERSONALIZED_ADDON_CENTS } from "@/lib/tiers";
import type { GuestGroup, GuestListEntry } from "@/types/wedding";
import { Trash2, Download, Plus, Search, Upload, Link2, Lock, ChevronDown, Check, Pencil, X } from "lucide-react";

interface Props {
  weddingId: string;
  coupleLabel: string; // used in the export filename
  /** Personalized tier unlocks per-guest and per-group invite links. */
  personalized: boolean;
  /** Slug (or id) of the public site, for building invite links. */
  siteSlug: string;
  onUpgrade: () => void;
}

const STATUSES: GuestListEntry["status"][] = ["invited", "attending", "declined", "pending"];

const statusStyle: Record<GuestListEntry["status"], { bg: string; color: string }> = {
  invited:   { bg: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" },
  attending: { bg: "var(--color-primary-container-strong)",  color: "var(--color-primary-dim)" },
  declined:  { bg: "var(--color-error-container)",           color: "var(--color-error)" },
  pending:   { bg: "var(--color-surface-container-high)",    color: "var(--color-on-surface-muted)" },
};

const MAX_IMPORT_BYTES = 1024 * 1024;
const MAX_IMPORT_ROWS = 2000;

type Column = "name" | "email" | "party" | "groups" | "note" | "status";

/** Accepted header spellings, compared lowercase with non-letters removed. */
const HEADER_ALIASES: Record<Column, string[]> = {
  name: ["name", "guest", "guestname", "fullname"],
  email: ["email", "emailaddress"],
  party: ["partysize", "party", "size", "headcount", "count", "seats"],
  groups: ["group", "groups", "tag", "tags"],
  note: ["note", "notes"],
  status: ["status", "rsvp"],
};

function rowsFromCsv(text: string): { rows: ImportGuestRow[]; error?: string; truncated: boolean } {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], error: "That file has no guest rows under the header.", truncated: false };

  const header = table[0].map((h) => h.toLowerCase().replace(/[^a-z]/g, ""));
  const col = (c: Column) => header.findIndex((h) => HEADER_ALIASES[c].includes(h));
  const idx: Record<Column, number> = {
    name: col("name"),
    email: col("email"),
    party: col("party"),
    groups: col("groups"),
    note: col("note"),
    status: col("status"),
  };
  if (idx.name < 0) {
    return {
      rows: [],
      error: "Couldn't find a Name column. The first row should be headers such as Name, Email, Party size, Group.",
      truncated: false,
    };
  }

  const rows = table.slice(1, MAX_IMPORT_ROWS + 1).flatMap((cells): ImportGuestRow[] => {
    const get = (i: number) => (i >= 0 ? (cells[i] ?? "").trim() : "");
    const name = get(idx.name).slice(0, 120);
    if (!name) return [];
    const status = get(idx.status).toLowerCase() as GuestListEntry["status"];
    return [
      {
        name,
        email: get(idx.email).slice(0, 200) || undefined,
        partySize: parseInt(get(idx.party), 10) || 1,
        status: STATUSES.includes(status) ? status : undefined,
        note: get(idx.note).slice(0, 500) || undefined,
        groupNames: get(idx.groups)
          .split(/[;|]/)
          .map((g) => g.trim().slice(0, 60))
          .filter(Boolean),
      },
    ];
  });
  return { rows, truncated: table.length - 1 > MAX_IMPORT_ROWS };
}

export default function GuestListManager({ weddingId, coupleLabel, personalized, siteSlug, onUpgrade }: Props) {
  const guests = useWeddingStore((s) => s.guests).filter((g) => g.weddingId === weddingId);
  const groups = useWeddingStore((s) => s.groups).filter((g) => g.weddingId === weddingId);
  const addGuest = useWeddingStore((s) => s.addGuest);
  const updateGuest = useWeddingStore((s) => s.updateGuest);
  const removeGuest = useWeddingStore((s) => s.removeGuest);
  const importGuests = useWeddingStore((s) => s.importGuests);
  const addGroup = useWeddingStore((s) => s.addGroup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [newGuestGroup, setNewGuestGroup] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | GuestListEntry["status"]>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const groupName = (id: string) => groups.find((g) => g.id === id)?.name;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests
      .filter((g) => (filter === "all" ? true : g.status === filter))
      .filter((g) =>
        groupFilter === "all" ? true : groupFilter === "none" ? g.groupIds.length === 0 : g.groupIds.includes(groupFilter)
      )
      .filter((g) => (q ? g.name.toLowerCase().includes(q) || (g.email ?? "").toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [guests, query, filter, groupFilter]);

  const totalHeads = guests.reduce((sum, g) => sum + (g.partySize || 1), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addGuest({
      weddingId,
      name: name.trim(),
      email: email.trim() || undefined,
      partySize: Math.min(20, Math.max(1, parseInt(partySize, 10) || 1)),
      status: "invited",
      groupIds: newGuestGroup ? [newGuestGroup] : [],
    });
    setName("");
    setEmail("");
    setPartySize("1");
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    if (groups.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      setNotice(`You already have a group called “${trimmed}”.`);
      return;
    }
    addGroup(weddingId, trimmed.slice(0, 60));
    setNewGroupName("");
  };

  const toggleGuestGroup = (guest: GuestListEntry, groupId: string) => {
    const next = guest.groupIds.includes(groupId)
      ? guest.groupIds.filter((id) => id !== groupId)
      : [...guest.groupIds, groupId];
    updateGuest(guest.id, { groupIds: next });
  };

  const copyLink = async (id: string, code: string, label: string) => {
    const url = inviteUrl(window.location.origin, siteSlug, code);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setNotice(`Invite link for ${label} copied.`);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } catch {
      setNotice(`Couldn't copy automatically. ${label}'s invite code is ${formatCode(code)}.`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setNotice("That file is over 1 MB. Split it into smaller files and import each one.");
      return;
    }
    const { rows, error, truncated } = rowsFromCsv(await file.text());
    if (error) {
      setNotice(error);
      return;
    }
    const result = importGuests(weddingId, rows);
    const parts = [`Imported ${result.added} ${result.added === 1 ? "guest" : "guests"}`];
    if (result.skipped > 0) parts.push(`skipped ${result.skipped} already on your list`);
    if (result.groupsCreated > 0) parts.push(`created ${result.groupsCreated} ${result.groupsCreated === 1 ? "group" : "groups"}`);
    setNotice(`${parts.join(", ")}.${truncated ? ` Only the first ${MAX_IMPORT_ROWS} rows were read.` : ""}`);
  };

  const handleExport = () => {
    const header = ["Name", "Email", "Party size", "Status", "Groups", "Note"];
    if (personalized) header.push("Invite code", "Invite link");
    const origin = window.location.origin;
    const rows = guests.map((g) => {
      const row: (string | number)[] = [
        g.name,
        g.email ?? "",
        g.partySize,
        g.status,
        g.groupIds.map(groupName).filter(Boolean).join("; "),
        g.note ?? "",
      ];
      if (personalized) row.push(formatCode(g.inviteCode), inviteUrl(origin, siteSlug, g.inviteCode));
      return row;
    });
    const csv = toCsv(header, rows);
    const safe = coupleLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "wedding";
    downloadFile(`${safe}-guest-list.csv`, csv);
  };

  return (
    <div className="space-y-8">
      {/* Add-guest form */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end"
        style={{
          background: "var(--color-surface-container)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-outline)",
        }}
      >
        <div className="flex-1">
          <InputField
            label="Guest name"
            id="guest-name"
            placeholder="e.g. Sarah Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <InputField
            label="Email (optional)"
            id="guest-email"
            type="email"
            inputMode="email"
            placeholder="sarah@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-24">
          <InputField
            label="Party size"
            id="guest-party"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
          />
        </div>
        {groups.length > 0 && (
          <div className="w-full sm:w-40">
            <label htmlFor="guest-group" className="label-luxury mb-2 block" style={{ color: "var(--color-on-surface-muted)" }}>
              Group
            </label>
            <select
              id="guest-group"
              value={newGuestGroup}
              onChange={(e) => setNewGuestGroup(e.target.value)}
              className="min-h-[44px] w-full cursor-pointer px-3 text-sm font-light outline-none"
              style={{
                background: "var(--color-surface-container-lowest)",
                color: "var(--color-on-surface)",
                border: "1px solid var(--color-outline)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <option value="">No group</option>
              {groups.map((gr) => (
                <option key={gr.id} value={gr.id}>{gr.name}</option>
              ))}
            </select>
          </div>
        )}
        <ButtonPrimary type="submit" size="md">
          <Plus size={14} />
          Add guest
        </ButtonPrimary>
      </form>

      {/* Import */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)", maxWidth: "60ch" }}>
          Have a spreadsheet? Import a CSV with a <strong style={{ fontWeight: 500 }}>Name</strong> column, plus optional Email,
          Party size, Group (separate several with ;), Status and Note.
        </p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} onChange={handleImport} aria-hidden />
        <ButtonSecondary size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={13} />
          Import CSV
        </ButtonSecondary>
      </div>

      <p role="status" aria-live="polite" className="text-sm font-light empty:hidden" style={{ color: "var(--color-on-surface)" }}>
        {notice}
      </p>

      <GroupsPanel
        groups={groups}
        guests={guests}
        personalized={personalized}
        copiedId={copiedId}
        onCopy={copyLink}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        onAddGroup={handleAddGroup}
      />

      {!personalized && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
            <Lock size={14} className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
            Personal invite links for each guest and group come with Personalized Invitations.
          </p>
          <ButtonSecondary size="sm" onClick={onUpgrade}>
            Unlock for {formatPrice(PERSONALIZED_ADDON_CENTS)}
          </ButtonSecondary>
        </div>
      )}

      {guests.length === 0 ? (
        <EmptyState
          glyph="∅"
          title="No guests yet"
          body="Add the people you're inviting above. As RSVPs come in, you can mark each guest attending or declined and keep a running head count — then export the whole list to CSV for your venue or caterer."
        />
      ) : (
        <>
          {/* Toolbar: count, search, filter, export */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
              <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>{guests.length}</span> guests
              {" · "}
              <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>{totalHeads}</span> total heads
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-on-surface-muted)" }}
                />
                <input
                  type="search"
                  placeholder="Search guests"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search guests"
                  className="min-h-[36px] py-2 pl-9 pr-3 text-sm font-light outline-none"
                  style={{
                    background: "var(--color-surface-container)",
                    border: "1px solid var(--color-outline)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--color-on-surface)",
                  }}
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                aria-label="Filter by status"
                className="label-luxury min-h-[36px] cursor-pointer px-4 py-2 outline-none"
                style={{
                  background: "var(--color-surface-container)",
                  color: "var(--color-on-surface-variant)",
                  border: "1px solid var(--color-outline)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <option value="all">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {groups.length > 0 && (
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  aria-label="Filter by group"
                  className="label-luxury min-h-[36px] cursor-pointer px-4 py-2 outline-none"
                  style={{
                    background: "var(--color-surface-container)",
                    color: "var(--color-on-surface-variant)",
                    border: "1px solid var(--color-outline)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <option value="all">All groups</option>
                  <option value="none">No group</option>
                  {groups.map((gr) => (
                    <option key={gr.id} value={gr.id}>{gr.name}</option>
                  ))}
                </select>
              )}
              <ButtonSecondary size="sm" onClick={handleExport}>
                <Download size={13} />
                Export CSV
              </ButtonSecondary>
            </div>
          </div>

          {/* Guest rows */}
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
              No guests match that search or filter.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((g) => {
                const expanded = expandedId === g.id;
                const panelId = `guest-${g.id}-details`;
                const groupLabels = g.groupIds.map(groupName).filter(Boolean);
                return (
                <li
                  key={g.id}
                  className="p-4"
                  style={{
                    background: "var(--color-surface-container)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-outline)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                      {g.name}
                      {g.partySize > 1 && (
                        <span className="font-light" style={{ color: "var(--color-on-surface-muted)" }}> · party of {g.partySize}</span>
                      )}
                    </p>
                    {(g.email || groupLabels.length > 0) && (
                      <p className="truncate text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
                        {[g.email, groupLabels.join(", ")].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>

                  {personalized && (
                    <button
                      type="button"
                      onClick={() => copyLink(g.id, g.inviteCode, g.name)}
                      className="flex min-h-[36px] items-center gap-1.5 px-3 text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: "var(--color-primary)" }}
                      aria-label={`Copy invite link for ${g.name}`}
                    >
                      {copiedId === g.id ? <Check size={13} /> : <Link2 size={13} />}
                      {copiedId === g.id ? "Copied" : "Copy link"}
                    </button>
                  )}

                  <select
                    value={g.status}
                    onChange={(e) => updateGuest(g.id, { status: e.target.value as GuestListEntry["status"] })}
                    aria-label={`Status for ${g.name}`}
                    className="min-h-[36px] cursor-pointer px-3 py-1.5 text-xs font-medium outline-none"
                    style={{
                      background: statusStyle[g.status].bg,
                      color: statusStyle[g.status].color,
                      border: "1px solid var(--color-outline)",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : g.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
                    style={{ color: "var(--color-on-surface-variant)" }}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    aria-label={`${expanded ? "Hide" : "Show"} groups and invite for ${g.name}`}
                  >
                    <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : undefined, transition: "transform 0.2s ease-out" }} />
                  </button>

                  <button
                    onClick={() => removeGuest(g.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
                    style={{ color: "var(--color-on-surface-muted)" }}
                    aria-label={`Remove ${g.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                  </div>

                  {expanded && (
                    <div id={panelId} className="mt-4 flex flex-col gap-4 pt-4 sm:flex-row sm:justify-between" style={{ borderTop: "1px solid var(--color-outline)" }}>
                      <fieldset>
                        <legend className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>Groups</legend>
                        {groups.length === 0 ? (
                          <p className="text-xs font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                            Create a group above, like Family or Entourage, to sort guests.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-x-5 gap-y-1">
                            {groups.map((gr) => (
                              <label key={gr.id} className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm font-light" style={{ color: "var(--color-on-surface)" }}>
                                <input
                                  type="checkbox"
                                  checked={g.groupIds.includes(gr.id)}
                                  onChange={() => toggleGuestGroup(g, gr.id)}
                                  style={{ accentColor: "var(--color-primary)" }}
                                />
                                {gr.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </fieldset>
                      <PartySizeField
                        key={`${g.id}-${g.partySize}`}
                        guest={g}
                        personalized={personalized}
                        onCommit={(n) => updateGuest(g.id, { partySize: n })}
                      />
                      {personalized ? (
                        <div className="shrink-0">
                          <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>Invite code</p>
                          <p className="font-mono text-sm tracking-wider" style={{ color: "var(--color-on-surface)" }}>{formatCode(g.inviteCode)}</p>
                        </div>
                      ) : (
                        <p className="flex items-center gap-2 self-start text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
                          <Lock size={12} aria-hidden />
                          Invite link locked on Base
                        </p>
                      )}
                    </div>
                  )}
                </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

interface PartySizeFieldProps {
  guest: GuestListEntry;
  personalized: boolean;
  onCommit: (partySize: number) => void;
}

/** Seats for one invitation. On Personalized sites, seats beyond the guest are plus-ones they can name on their RSVP. */
function PartySizeField({ guest, personalized, onCommit }: PartySizeFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(String(guest.partySize));
  const extras = guest.partySize - 1;

  const commit = () => {
    const next = Math.min(20, Math.max(1, parseInt(draft, 10) || 1));
    setDraft(String(next));
    if (next !== guest.partySize) onCommit(next);
  };

  const hint = !personalized
    ? "Counts toward your head count. Letting chosen guests bring several people comes with Personalized Invitations."
    : extras > 0
      ? `${guest.name} can name up to ${extras} additional ${extras === 1 ? "guest" : "guests"} when they RSVP.`
      : "Just this guest. Raise it to let them bring friends or family.";

  return (
    <div className="sm:max-w-[15rem]">
      <label htmlFor={id} className="label-luxury mb-2 block" style={{ color: "var(--color-on-surface-muted)" }}>
        Party size
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={20}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        className="min-h-[44px] w-24 px-3 text-sm font-light"
        style={{
          background: "var(--color-surface-container-lowest)",
          color: "var(--color-on-surface)",
          border: "1px solid var(--color-outline)",
          borderRadius: "var(--radius-sm)",
        }}
      />
      <p className="mt-1.5 text-xs font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
        {hint}
      </p>
    </div>
  );
}

interface GroupsPanelProps {
  groups: GuestGroup[];
  guests: GuestListEntry[];
  personalized: boolean;
  copiedId: string | null;
  onCopy: (id: string, code: string, label: string) => void;
  newGroupName: string;
  setNewGroupName: (v: string) => void;
  onAddGroup: (e: React.FormEvent) => void;
}

function GroupsPanel({ groups, guests, personalized, copiedId, onCopy, newGroupName, setNewGroupName, onAddGroup }: GroupsPanelProps) {
  const renameGroup = useWeddingStore((s) => s.renameGroup);
  const removeGroup = useWeddingStore((s) => s.removeGroup);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const saveRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (draft.trim()) renameGroup(id, draft.trim().slice(0, 60));
    setEditingId(null);
  };

  return (
    <section aria-labelledby="groups-heading">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="groups-heading" className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Groups</h3>
          <p className="mt-0.5 text-xs font-light" style={{ color: "var(--color-on-surface-variant)" }}>
            {personalized
              ? "Sort guests into groups, then share one link per group or target private sections to them."
              : "Sort guests into groups like Family or Entourage."}
          </p>
        </div>
        <form onSubmit={onAddGroup} className="flex items-center gap-2">
          <label htmlFor="new-group" className="sr-only">New group name</label>
          <input
            id="new-group"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group"
            maxLength={60}
            className="min-h-[36px] w-40 px-3 text-sm font-light outline-none"
            style={{
              background: "var(--color-surface-container)",
              border: "1px solid var(--color-outline)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-on-surface)",
            }}
          />
          <ButtonSecondary size="sm" type="submit" disabled={!newGroupName.trim()}>
            <Plus size={13} />
            Add
          </ButtonSecondary>
        </form>
      </div>

      {groups.length > 0 && (
        <ul style={{ borderTop: "1px solid var(--color-outline)" }}>
          {groups.map((gr) => {
            const count = guests.filter((g) => g.groupIds.includes(gr.id)).length;
            const editing = editingId === gr.id;
            const confirming = confirmDeleteId === gr.id;
            return (
              <li
                key={gr.id}
                className="flex flex-wrap items-center gap-2 py-2"
                style={{ borderBottom: "1px solid var(--color-outline)" }}
              >
                {editing ? (
                  <form onSubmit={(e) => saveRename(e, gr.id)} className="flex flex-1 items-center gap-2">
                    <label htmlFor={`rename-${gr.id}`} className="sr-only">Rename {gr.name}</label>
                    <input
                      id={`rename-${gr.id}`}
                      autoFocus
                      value={draft}
                      maxLength={60}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                      className="min-h-[36px] flex-1 px-3 text-sm outline-none"
                      style={{
                        background: "var(--color-surface-container-lowest)",
                        border: "1px solid var(--color-primary)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-on-surface)",
                      }}
                    />
                    <ButtonSecondary size="sm" type="submit">Save</ButtonSecondary>
                  </form>
                ) : (
                  <p className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--color-on-surface)" }}>
                    {gr.name}
                    <span className="font-light" style={{ color: "var(--color-on-surface-muted)" }}>
                      {" "}· {count} {count === 1 ? "guest" : "guests"}
                    </span>
                  </p>
                )}

                {!editing && confirming && (
                  <>
                    <span className="text-xs font-light" style={{ color: "var(--color-error)" }}>
                      Delete group? Guests stay on your list.
                    </span>
                    <button
                      type="button"
                      onClick={() => { removeGroup(gr.id); setConfirmDeleteId(null); }}
                      className="min-h-[36px] px-2 text-xs font-medium"
                      style={{ color: "var(--color-error)" }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="min-h-[36px] px-2 text-xs"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {!editing && !confirming && (
                  <>
                    {personalized && (
                      <button
                        type="button"
                        onClick={() => onCopy(gr.id, gr.inviteCode, gr.name)}
                        className="flex min-h-[36px] items-center gap-1.5 px-2 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{ color: "var(--color-primary)" }}
                        aria-label={`Copy group invite link for ${gr.name}`}
                      >
                        {copiedId === gr.id ? <Check size={13} /> : <Link2 size={13} />}
                        {copiedId === gr.id ? "Copied" : "Group link"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setEditingId(gr.id); setDraft(gr.name); }}
                      className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
                      style={{ color: "var(--color-on-surface-variant)" }}
                      aria-label={`Rename ${gr.name}`}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(gr.id)}
                      className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
                      style={{ color: "var(--color-on-surface-muted)" }}
                      aria-label={`Delete ${gr.name}`}
                    >
                      <X size={15} />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
