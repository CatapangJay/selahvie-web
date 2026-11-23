"use client";

import { useId, useRef, useState } from "react";
import { useWeddingStore, type ImportGuestRow } from "@/store/weddingStore";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import { toCsv, downloadFile, parseCsv, formatPrice } from "@/lib/utils";
import { formatCode, inviteUrl, normalizeName } from "@/lib/invitations";
import { SIDE_COLOR, asSide, parseSide, sideLabel, sideOptions } from "@/lib/guestSides";
import type { GuestGroup, GuestListEntry, WeddingConfig } from "@/types/wedding";
import { Trash2, Download, Plus, Search, Upload, Link2, Lock, ChevronDown, Check, Pencil, X, Settings2, Users, Copy, StickyNote, TriangleAlert } from "lucide-react";

interface Props {
  weddingId: string;
  coupleLabel: string; // used in the export filename
  /** Premium unlocks per-guest and per-group invite links. */
  personalized: boolean;
  /** What moving this website to Premium costs, in cents. */
  upgradeCents: number;
  /** Slug (or id) of the public site, for building invite links. */
  siteSlug: string;
  onUpgrade: () => void;
}

const STATUSES: GuestListEntry["status"][] = ["invited", "attending", "declined", "pending"];
const statusLabel = (s: string) => s[0].toUpperCase() + s.slice(1);

/** Status chips and dots: green for yes, rose for no, gold while undecided, outline while waiting. */
const statusStyle: Record<GuestListEntry["status"], { bg: string; color: string; border: string; dot: string }> = {
  invited:   { bg: "var(--color-surface-container-lowest)", color: "var(--color-on-surface-variant)", border: "var(--color-outline)", dot: "var(--color-on-surface-muted)" },
  attending: { bg: "#E6F0E8",                                color: "#2F5E3B",            border: "transparent",          dot: "var(--color-success)" },
  declined:  { bg: "var(--color-primary-container-strong)",  color: "var(--color-primary-dim)",         border: "transparent",          dot: "var(--color-primary)" },
  pending:   { bg: "rgba(192, 138, 62, 0.14)",               color: "#7A541C",                         border: "transparent",          dot: "var(--color-warning)" },
};

const MAX_IMPORT_BYTES = 1024 * 1024;
const MAX_IMPORT_ROWS = 2000;

type Column = "name" | "email" | "phone" | "party" | "groups" | "note" | "status" | "side";

/** Accepted header spellings, compared lowercase with non-letters removed. */
const HEADER_ALIASES: Record<Column, string[]> = {
  name: ["name", "guest", "guestname", "fullname"],
  email: ["email", "emailaddress"],
  phone: ["phone", "mobile", "mobilenumber", "phonenumber", "cellphone", "cell", "contactnumber", "number"],
  party: ["partysize", "party", "size", "headcount", "count", "seats"],
  groups: ["group", "groups", "tag", "tags"],
  note: ["note", "notes"],
  status: ["status", "rsvp"],
  side: ["side", "guestof", "guestside"],
};

function rowsFromCsv(text: string, config: WeddingConfig | undefined): { rows: ImportGuestRow[]; error?: string; truncated: boolean } {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], error: "That file has no guest rows under the header.", truncated: false };

  const header = table[0].map((h) => h.toLowerCase().replace(/[^a-z]/g, ""));
  const col = (c: Column) => header.findIndex((h) => HEADER_ALIASES[c].includes(h));
  const idx: Record<Column, number> = {
    name: col("name"),
    email: col("email"),
    phone: col("phone"),
    party: col("party"),
    groups: col("groups"),
    note: col("note"),
    status: col("status"),
    side: col("side"),
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
        phone: get(idx.phone).slice(0, 40) || undefined,
        partySize: parseInt(get(idx.party), 10) || 1,
        status: STATUSES.includes(status) ? status : undefined,
        side: parseSide(get(idx.side), config),
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

export default function GuestListManager({ weddingId, coupleLabel, personalized, upgradeCents, siteSlug, onUpgrade }: Props) {
  const guests = useWeddingStore((s) => s.guests).filter((g) => g.weddingId === weddingId);
  const groups = useWeddingStore((s) => s.groups).filter((g) => g.weddingId === weddingId);
  const addGuest = useWeddingStore((s) => s.addGuest);
  const updateGuest = useWeddingStore((s) => s.updateGuest);
  const removeGuest = useWeddingStore((s) => s.removeGuest);
  const removeGuests = useWeddingStore((s) => s.removeGuests);
  const updateGuests = useWeddingStore((s) => s.updateGuests);
  const setGroupMembership = useWeddingStore((s) => s.setGroupMembership);
  const importGuests = useWeddingStore((s) => s.importGuests);
  const addGroup = useWeddingStore((s) => s.addGroup);
  const config = useWeddingStore((s) => s.configs[weddingId]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [newGuestSide, setNewGuestSide] = useState("");
  const [newGuestGroup, setNewGuestGroup] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | GuestListEntry["status"]>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [sideFilter, setSideFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [managingGroups, setManagingGroups] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  // Bulk selection (kept across filters; ids that leave the list simply stop counting).
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirmBulkRemove, setConfirmBulkRemove] = useState(false);
  const [sort, setSort] = useState<SortKey>("name");
  const [check, setCheck] = useState<"duplicates" | "noContact" | null>(null);
  // Each row's trash button, so focus can return to it (or to the next row) after the confirm.
  const trashRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Takes a lookup, not an element: the target button only exists again after React re-renders.
  const focusLater = (find: () => HTMLElement | null | undefined) => window.requestAnimationFrame(() => find()?.focus());
  const fileRef = useRef<HTMLInputElement>(null);

  const groupName = (id: string) => groups.find((g) => g.id === id)?.name;
  // If the filtered group is deleted (or "No group" empties), quietly show everyone.
  const activeGroup =
    groupFilter === "all" ||
    (groupFilter === "none" ? guests.some((g) => g.groupIds.length === 0) : groups.some((gr) => gr.id === groupFilter))
      ? groupFilter
      : "all";

  // Possible duplicates: same name (ignoring case/accents/spacing), same email, or same mobile digits.
  const dupIds = findDuplicates(guests);
  const noContact = guests.filter((g) => !g.email?.trim() && !g.phone?.trim());
  const activeCheck = check === "duplicates" ? (dupIds.size > 0 ? check : null) : check === "noContact" ? (noContact.length > 0 ? check : null) : null;

  // Plain derivation: the React Compiler memoizes it.
  const q = query.trim().toLowerCase();
  const filtered = guests
      .filter((g) => (activeCheck === "duplicates" ? dupIds.has(g.id) : activeCheck === "noContact" ? !g.email?.trim() && !g.phone?.trim() : true))
      .filter((g) => (filter === "all" ? true : g.status === filter))
      .filter((g) =>
        activeGroup === "all" ? true : activeGroup === "none" ? g.groupIds.length === 0 : g.groupIds.includes(activeGroup)
      )
      .filter((g) => (sideFilter === "all" ? true : (g.side ?? "none") === sideFilter))
      .filter((g) =>
        q
          ? g.name.toLowerCase().includes(q) ||
            (g.email ?? "").toLowerCase().includes(q) ||
            (g.phone ?? "").includes(q) ||
            (g.note ?? "").toLowerCase().includes(q)
          : true
      )
      .sort(SORTERS[sort]);
  // Duplicates read best side by side.
  if (activeCheck === "duplicates") filtered.sort((a, b) => normalizeName(a.name).localeCompare(normalizeName(b.name)));

  const selectedGuests = guests.filter((g) => selected.has(g.id));
  const selectedIds = selectedGuests.map((g) => g.id);
  // Selection survives filters; say so when some of it is off screen.
  const shownIds = new Set(filtered.map((g) => g.id));
  const hiddenSelected = selectedGuests.filter((g) => !shownIds.has(g.id)).length;
  const allShownSelected = filtered.length > 0 && filtered.every((g) => selected.has(g.id));
  const someShownSelected = filtered.some((g) => selected.has(g.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllShown = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allShownSelected) filtered.forEach((g) => next.delete(g.id));
      else filtered.forEach((g) => next.add(g.id));
      return next;
    });
  const clearSelection = () => {
    setSelected(new Set());
    setConfirmBulkRemove(false);
    // The bar unmounts; keep the keyboard where the selection started.
    focusLater(() => document.getElementById("select-all-guests"));
  };

  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const bulkStatus = (value: string) => {
    if (!value) return;
    updateGuests(selectedIds, { status: value as GuestListEntry["status"] });
    setNotice(`Marked ${plural(selectedGuests.length, "guest")} as ${statusLabel(value).toLowerCase()}.`);
  };
  const bulkSide = (value: string) => {
    if (!value) return;
    const side = value === "clear" ? undefined : asSide(value);
    updateGuests(selectedIds, { side });
    setNotice(side ? `Moved ${plural(selectedGuests.length, "guest")} to ${sideLabel(config, side)}.` : `Cleared the side for ${plural(selectedGuests.length, "guest")}.`);
  };
  const bulkGroup = (value: string) => {
    const [action, groupId] = value.split(":");
    const name = groupId && groupName(groupId);
    if (!name) return;
    setGroupMembership(selectedIds, groupId, action === "add");
    setNotice(action === "add" ? `Added ${plural(selectedGuests.length, "guest")} to ${name}.` : `Took ${plural(selectedGuests.length, "guest")} out of ${name}.`);
  };
  const bulkRemove = () => {
    const n = selectedGuests.length;
    removeGuests(selectedIds);
    setSelected(new Set());
    setConfirmBulkRemove(false);
    setNotice(`Removed ${plural(n, "guest")} from the list.`);
    // If that emptied the list, the empty state's first action takes focus.
    focusLater(() => document.getElementById("guest-list-count") ?? document.getElementById("empty-add-guest"));
  };
  const copySelectedLinks = async () => {
    const origin = window.location.origin;
    const text = selectedGuests.map((g) => `${g.name}: ${inviteUrl(origin, siteSlug, g.inviteCode)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`Copied ${plural(selectedGuests.length, "invite link")}, one per line with each guest's name.`);
    } catch {
      setNotice("Couldn't copy automatically. Export the selection to CSV to get every link.");
    }
  };

  const totalHeads = guests.reduce((sum, g) => sum + (g.partySize || 1), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addGuest({
      weddingId,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      partySize: Math.min(20, Math.max(1, parseInt(partySize, 10) || 1)),
      status: "invited",
      side: asSide(newGuestSide),
      groupIds: newGuestGroup ? [newGuestGroup] : [],
    });
    setName("");
    setEmail("");
    setPhone("");
    setPartySize("1");
    setNotice(`Added ${name.trim()}.`);
    // Ready for the next name without reaching for the mouse.
    document.getElementById("guest-name")?.focus();
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
    const { rows, error, truncated } = rowsFromCsv(await file.text(), config);
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

  const handleExport = (list: GuestListEntry[] = guests, suffix = "guest-list") => {
    const header = ["Name", "Email", "Mobile", "Party size", "Status", "Side", "Groups", "Note"];
    if (personalized) header.push("Invite code", "Invite link");
    const origin = window.location.origin;
    const rows = list.map((g) => {
      const row: (string | number)[] = [
        g.name,
        g.email ?? "",
        g.phone ?? "",
        g.partySize,
        g.status,
        sideLabel(config, g.side, ""),
        g.groupIds.map(groupName).filter(Boolean).join("; "),
        g.note ?? "",
      ];
      if (personalized) row.push(formatCode(g.inviteCode), inviteUrl(origin, siteSlug, g.inviteCode));
      return row;
    });
    const csv = toCsv(header, rows);
    const safe = coupleLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "wedding";
    downloadFile(`${safe}-${suffix}.csv`, csv);
  };

  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: guests.filter((g) => g.status === s).length }),
    {} as Record<GuestListEntry["status"], number>
  );
  const ungrouped = guests.filter((g) => g.groupIds.length === 0).length;
  const filtersOn = filter !== "all" || activeGroup !== "all" || sideFilter !== "all" || query.trim() !== "" || activeCheck !== null;
  const clearFilters = () => {
    setFilter("all");
    setGroupFilter("all");
    setSideFilter("all");
    setQuery("");
    setCheck(null);
  };

  return (
    // @container: breakpoints follow the space this list gets (Manage page or studio panel).
    <div className="@container space-y-6">
      {guests.length > 0 && <GuestSummary guests={guests} />}

      <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} onChange={handleImport} aria-hidden />

      {/* Toolbar: search on the left, list actions on the right (once there's a list to act on) */}
      {guests.length > 0 && (
      <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
        <div className="relative w-full @lg:max-w-xs">
          <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: INK_VARIANT }} />
          <input
            type="search"
            placeholder="Search by name, email or mobile"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search guests"
            className="min-h-[40px] w-full py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]!"
            style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-sm)", color: INK }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonSecondary size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={14} aria-hidden />
            Import CSV
          </ButtonSecondary>
          <ButtonSecondary size="sm" onClick={() => handleExport()} disabled={guests.length === 0}>
            <Download size={14} aria-hidden />
            Export CSV
          </ButtonSecondary>
          <ButtonPrimary size="sm" onClick={() => setAdding((v) => !v)} aria-expanded={adding} aria-controls={adding ? "add-guest-form" : undefined}>
            {adding ? <X size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
            {adding ? "Close" : "Add guest"}
          </ButtonPrimary>
        </div>
      </div>
      )}

      {/* Add-guest form: opens inline under the toolbar and stays open for quick entry */}
      {adding && (
        <form
          id="add-guest-form"
          onSubmit={handleAdd}
          className="space-y-4 p-5"
          style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
        >
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 @lg:grid-cols-2 @4xl:grid-cols-[2fr_2fr_1.5fr_5rem]">
            <InputField label="Guest name" id="guest-name" autoFocus placeholder="e.g. Sarah Johnson" value={name} onChange={(e) => setName(e.target.value)} />
            <InputField label="Email (optional)" id="guest-email" type="email" inputMode="email" placeholder="sarah@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <InputField label="Mobile (optional)" id="guest-phone" type="tel" inputMode="tel" autoComplete="off" placeholder="0917 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <InputField label="Party size" id="guest-party" type="number" inputMode="numeric" min={1} max={20} value={partySize} onChange={(e) => setPartySize(e.target.value)} />
          </div>
          <div className="flex flex-col gap-4 @lg:flex-row @lg:items-end">
            <div className="w-full @lg:w-52">
              <Select id="guest-side" label="Side" value={newGuestSide} onChange={setNewGuestSide} options={sideOptions(config, "Not set")} />
            </div>
            {groups.length > 0 && (
              <div className="w-full @lg:w-52">
                <Select
                  id="guest-group"
                  label="Group"
                  value={newGuestGroup}
                  onChange={setNewGuestGroup}
                  options={[{ value: "", label: "No group" }, ...groups.map((gr) => ({ value: gr.id, label: gr.name }))]}
                />
              </div>
            )}
            <div className="hidden flex-1 @lg:block" />
            <ButtonSecondary type="button" size="md" onClick={() => setAdding(false)}>
              Done
            </ButtonSecondary>
            <ButtonPrimary type="submit" size="md">
              <Plus size={14} aria-hidden />
              Add to list
            </ButtonPrimary>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: INK_VARIANT, maxWidth: "75ch" }}>
            Adding a lot of people? Import a CSV with a <strong className="font-semibold">Name</strong> column, plus optional
            Email, Mobile, Party size, Side (a partner&rsquo;s first name), Group (separate several with ;), Status and Note.
          </p>
        </form>
      )}

      <p role="status" aria-live="polite" className="text-sm empty:hidden" style={{ color: INK }}>
        {notice}
      </p>

      {!personalized && (
        <div
          className="flex flex-col gap-3 px-4 py-3 @lg:flex-row @lg:items-center @lg:justify-between"
          style={{ background: "var(--color-primary-container)", borderRadius: "var(--radius-md)" }}
        >
          <p className="flex items-start gap-2.5 text-sm" style={{ color: INK }}>
            <Lock size={15} className="mt-0.5 shrink-0" style={{ color: "var(--color-primary-dim)" }} aria-hidden />
            Personal invite links for each guest and group come with Premium.
          </p>
          <ButtonSecondary size="sm" onClick={onUpgrade}>
            Upgrade for {formatPrice(upgradeCents)}
          </ButtonSecondary>
        </div>
      )}

      {guests.length === 0 ? (
        <>
        {!adding && (
          <EmptyState
            icon={<Users size={20} strokeWidth={1.75} />}
            title="Start your guest list"
            body="Add the people you're inviting one by one, or bring in a spreadsheet you already have. As replies come in, each guest's status updates here, with a running head count you can export for your venue or caterer."
          >
            <ButtonPrimary id="empty-add-guest" size="md" onClick={() => setAdding(true)}>
              <Plus size={14} aria-hidden />
              Add a guest
            </ButtonPrimary>
            <ButtonSecondary size="md" onClick={() => fileRef.current?.click()}>
              <Upload size={14} aria-hidden />
              Import a CSV
            </ButtonSecondary>
            {!managingGroups && groups.length === 0 && (
              <button
                type="button"
                onClick={() => setManagingGroups(true)}
                className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium underline underline-offset-4"
                style={{ color: "var(--color-primary-dim)" }}
              >
                Set up groups first
              </button>
            )}
          </EmptyState>
        )}
        {/* Groups can be set up (or tidied) before anyone is on the list. */}
        {(managingGroups || groups.length > 0) && (
          <div className="p-4 @lg:p-5" style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}>
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
          </div>
        )}
        </>
      ) : (
        <>
          {/* Filters: status with counts, side, then groups (which double as the group manager's entry point) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((value) => {
                  const on = filter === value;
                  const n = value === "all" ? guests.length : counts[value];
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFilter(on && value !== "all" ? "all" : value)}
                      className="inline-flex min-h-[40px] items-center gap-2 px-3 text-sm transition-colors @lg:min-h-[36px] duration-150 hover:border-[var(--color-on-surface-variant)]!"
                      style={{
                        borderRadius: "var(--radius-full)",
                        border: `1px solid ${on ? "var(--color-on-surface)" : "var(--color-outline)"}`,
                        background: on ? "var(--color-on-surface)" : "var(--color-surface-container-lowest)",
                        color: on ? "var(--color-surface)" : INK,
                      }}
                    >
                      {value !== "all" && <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: statusStyle[value].dot }} />}
                      {value === "all" ? "All" : statusLabel(value)}
                      <span className="tabular-nums" style={{ color: on ? "rgba(253,248,247,0.78)" : INK_VARIANT }}>{n}</span>
                    </button>
                  );
                })}
              </div>
              <span aria-hidden className="mx-1 hidden h-5 w-px @lg:block" style={{ background: "var(--color-outline)" }} />
              <Select
                variant="chip"
                aria-label="Filter by side"
                value={sideFilter}
                onChange={setSideFilter}
                options={[{ value: "all", label: "Both sides" }, ...sideOptions(config).filter((o) => o.value), { value: "none", label: "Side not set" }]}
              />
              <Select
                variant="chip"
                aria-label="Sort guests"
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                options={SORT_OPTIONS}
              />
              {filtersOn && (
                <button type="button" onClick={clearFilters} className="min-h-[36px] px-2 text-sm font-medium underline underline-offset-4" style={{ color: "var(--color-primary-dim)" }}>
                  Clear filters
                </button>
              )}
            </div>

            {(dupIds.size > 0 || noContact.length > 0) && (
              <div role="group" aria-label="Quick checks" className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-sm" style={{ color: INK_VARIANT }}>Check</span>
                {dupIds.size > 0 && (
                  <CheckChip on={activeCheck === "duplicates"} onClick={() => setCheck(activeCheck === "duplicates" ? null : "duplicates")} icon={<TriangleAlert size={13} aria-hidden />}>
                    Possible duplicates <span className="tabular-nums">{dupIds.size}</span>
                  </CheckChip>
                )}
                {noContact.length > 0 && (
                  <CheckChip on={activeCheck === "noContact"} onClick={() => setCheck(activeCheck === "noContact" ? null : "noContact")}>
                    Missing email and mobile <span className="tabular-nums">{noContact.length}</span>
                  </CheckChip>
                )}
              </div>
            )}

            <div role="group" aria-labelledby="group-filter-label" className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm" style={{ color: INK_VARIANT }} id="group-filter-label">Groups</span>
              <div className="contents">
                {groups.map((gr) => {
                  const on = activeGroup === gr.id;
                  const n = guests.filter((g) => g.groupIds.includes(gr.id)).length;
                  return (
                    <button
                      key={gr.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setGroupFilter(on ? "all" : gr.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 px-2.5 text-[0.8125rem] @lg:min-h-[32px] transition-colors duration-150 hover:border-[var(--color-primary)]!"
                      style={{
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${on ? "var(--color-primary)" : "var(--color-outline)"}`,
                        background: on ? "var(--color-primary-container-strong)" : "transparent",
                        color: on ? "var(--color-primary-dim)" : INK,
                      }}
                    >
                      {gr.name}
                      <span className="tabular-nums" style={{ color: on ? "var(--color-primary-dim)" : INK_VARIANT }}>{n}</span>
                    </button>
                  );
                })}
                {groups.length > 0 && ungrouped > 0 && (
                  <button
                    type="button"
                    aria-pressed={activeGroup === "none"}
                    onClick={() => setGroupFilter(activeGroup === "none" ? "all" : "none")}
                    className="inline-flex min-h-[40px] items-center gap-1.5 px-2.5 text-[0.8125rem] @lg:min-h-[32px] transition-colors duration-150"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      border: `1px dashed ${activeGroup === "none" ? "var(--color-primary)" : "var(--color-outline)"}`,
                      background: activeGroup === "none" ? "var(--color-primary-container-strong)" : "transparent",
                      color: activeGroup === "none" ? "var(--color-primary-dim)" : INK_VARIANT,
                    }}
                  >
                    No group <span className="tabular-nums">{ungrouped}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setManagingGroups((v) => !v)}
                aria-expanded={managingGroups}
                aria-controls={managingGroups ? "groups-panel" : undefined}
                className="inline-flex min-h-[40px] items-center gap-1 px-2 text-[0.8125rem] font-medium @lg:min-h-[32px] transition-colors hover:text-[var(--color-primary)]"
                style={{ color: "var(--color-primary-dim)" }}
              >
                {groups.length === 0 ? <Plus size={13} aria-hidden /> : <Settings2 size={13} aria-hidden />}
                {managingGroups ? "Done" : groups.length === 0 ? "Create a group" : "Manage groups"}
              </button>
            </div>

            {managingGroups && (
              <div id="groups-panel" className="p-4 @lg:p-5" style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}>
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
              </div>
            )}
          </div>

          {/* The list */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {filtered.length > 0 && (
              <label className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm" style={{ color: INK }}>
                <SelectBox
                  id="select-all-guests"
                  checked={allShownSelected}
                  indeterminate={!allShownSelected && someShownSelected}
                  onChange={toggleAllShown}
                  label={filtersOn ? `Select all ${filtered.length} shown` : `Select all ${filtered.length} guests`}
                />
                <span aria-hidden>{filtersOn ? `Select all ${filtered.length} shown` : "Select all"}</span>
              </label>
            )}
            {selectedGuests.length > 0 && (
              // The bar sits after the list; this lets keyboard users jump straight to it.
              <button
                type="button"
                onClick={() => document.getElementById("bulk-bar")?.focus()}
                className="sr-only min-h-[36px] px-2 text-sm font-medium underline focus:not-sr-only"
                style={{ color: "var(--color-primary-dim)" }}
              >
                Go to actions for {selectedGuests.length} selected
              </button>
            )}
            <p id="guest-list-count" tabIndex={-1} className="text-sm outline-none" style={{ color: INK_VARIANT }}>
              {filtersOn ? (
                <>
                  Showing <span className="font-semibold" style={{ color: INK }}>{filtered.length}</span> of {guests.length} invitations
                </>
              ) : (
                <>
                  <span className="font-semibold" style={{ color: INK }}>{guests.length}</span> invitations ·{" "}
                  <span className="font-semibold" style={{ color: INK }}>{totalHeads}</span> people
                </>
              )}
            </p>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center" style={{ border: "1px dashed var(--color-outline)", borderRadius: "var(--radius-md)" }}>
                <p className="text-sm" style={{ color: INK_VARIANT }}>No guests match these filters.</p>
                <ButtonSecondary size="sm" onClick={clearFilters}>Clear filters</ButtonSecondary>
              </div>
            ) : (
              <div className="overflow-hidden" style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}>
                {/* Column heads (wide screens). Every control in a row carries its own accessible label. */}
                <div
                  aria-hidden
                  className={`hidden items-center gap-4 px-4 py-2.5 text-xs font-medium @4xl:grid ${ROW_GRID}`}
                  style={{ color: INK_VARIANT, background: "var(--color-surface-container-low)", borderBottom: "1px solid var(--color-outline)" }}
                >
                  <span />
                  <span>Guest</span>
                  <span>Groups</span>
                  <span className="text-right">Party</span>
                  <span>Side</span>
                  <span>Status</span>
                  <span />
                </div>
                <ul>
                  {filtered.map((g, i) => {
                    const expanded = expandedId === g.id;
                    const confirming = confirmRemoveId === g.id;
                    const panelId = `guest-${g.id}-details`;
                    const groupLabels = g.groupIds.map(groupName).filter((x): x is string => Boolean(x));
                    const contact = [g.email, g.phone].filter(Boolean).join(" · ");
                    const isSelected = selected.has(g.id);
                    return (
                      <li
                        key={g.id}
                        style={{
                          borderTop: i ? "1px solid var(--color-outline)" : undefined,
                          background: isSelected ? "var(--color-primary-container)" : expanded ? "var(--color-surface-container-low)" : undefined,
                        }}
                      >
                        <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 @4xl:grid @4xl:gap-4 ${ROW_GRID}`}>
                          {/* A 40px label around the box makes the whole cell the hit area. */}
                          <label className="-m-2.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center">
                            <SelectBox checked={isSelected} onChange={() => toggleOne(g.id)} label={`Select ${g.name}`} />
                          </label>
                          {/* Guest */}
                          <div className="flex min-w-0 flex-1 basis-0 items-center gap-3">
                            <span
                              aria-hidden
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold"
                              style={{ background: "var(--color-surface-container)", color: INK, boxShadow: `inset 0 0 0 2px ${SIDE_COLOR[g.side ?? "none"]}` }}
                              title={sideLabel(config, g.side)}
                            >
                              {initials(g.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium" style={{ color: INK }}>
                                <span className="truncate">{g.name}</span>
                                {dupIds.has(g.id) && (
                                  <span title="Possible duplicate: same name, email or mobile as another guest" className="inline-flex shrink-0 items-center" style={{ color: "#7A541C" }}>
                                    <TriangleAlert size={13} aria-hidden />
                                    <span className="sr-only">(possible duplicate)</span>
                                  </span>
                                )}
                                {g.note?.trim() && (
                                  <span title={g.note} className="inline-flex shrink-0 items-center" style={{ color: INK_VARIANT }}>
                                    <StickyNote size={13} aria-hidden />
                                    <span className="sr-only">(has a note)</span>
                                  </span>
                                )}
                                {g.partySize > 1 && <span className="hidden font-normal @lg:inline @4xl:hidden" style={{ color: INK_VARIANT }}> · party of {g.partySize}</span>}
                              </p>
                              {(contact || groupLabels.length > 0) && (
                                <p className="truncate text-xs" style={{ color: INK_VARIANT }}>
                                  {contact}
                                  {contact && groupLabels.length > 0 && <span className="@4xl:hidden"> · </span>}
                                  <span className="@4xl:hidden">{groupLabels.join(", ")}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Groups (wide) */}
                          <div className="hidden min-w-0 flex-wrap gap-1 @4xl:flex">
                            <span className="sr-only">Groups: </span>
                            {groupLabels.length === 0 ? (
                              <span className="text-xs" style={{ color: INK_VARIANT }}>
                                <span aria-hidden>—</span>
                                <span className="sr-only">none</span>
                              </span>
                            ) : (
                              groupLabels.map((label) => (
                                <span key={label} className="max-w-full truncate px-1.5 py-0.5 text-xs" style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-sm)", color: INK }}>
                                  {label}
                                </span>
                              ))
                            )}
                          </div>

                          {/* Party (wide) */}
                          <span className="hidden text-right text-sm tabular-nums @4xl:block" style={{ color: INK }}>
                            <span className="sr-only">Party of </span>
                            {g.partySize}
                          </span>

                          {/* Side and status: their own line on phones, columns on wide screens */}
                          <div className="order-last flex w-full flex-wrap items-center gap-2 pl-[4.75rem] @lg:order-none @lg:w-auto @lg:pl-0 @4xl:contents">
                            <Select
                              variant="chip"
                              aria-label={`Side for ${g.name}`}
                              value={g.side ?? ""}
                              onChange={(v) => updateGuest(g.id, { side: asSide(v) })}
                              options={sideOptions(config, "No side")}
                              className="justify-between @lg:w-[9.5rem]"
                              style={{ fontSize: "0.8125rem", minHeight: 36, maxWidth: "100%" }}
                            />
                            <Select
                              variant="chip"
                              aria-label={`Status for ${g.name}`}
                              value={g.status}
                              onChange={(v) => updateGuest(g.id, { status: v as GuestListEntry["status"] })}
                              options={STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
                              className="justify-between font-medium @lg:w-[7.75rem]"
                              style={{
                                background: statusStyle[g.status].bg,
                                color: statusStyle[g.status].color,
                                borderColor: statusStyle[g.status].border,
                                fontSize: "0.8125rem",
                                minHeight: 36,
                                maxWidth: "100%",
                              }}
                            />
                            {g.partySize > 1 && (
                              <span className="text-xs @lg:hidden" style={{ color: INK_VARIANT }}>
                                Party of {g.partySize}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center justify-end gap-0.5">
                            {confirming ? (
                              <span
                                className="flex items-center gap-1 text-xs"
                                role="group"
                                aria-label={`Remove ${g.name}?`}
                                onKeyDown={(e) => {
                                  if (e.key !== "Escape") return;
                                  setConfirmRemoveId(null);
                                  focusLater(() => trashRefs.current[g.id]);
                                }}
                              >
                                <button
                                  type="button"
                                  title={`Remove ${g.name} from the list`}
                                  onClick={() => {
                                    const next = filtered[i + 1] ?? filtered[i - 1];
                                    removeGuest(g.id);
                                    setConfirmRemoveId(null);
                                    setNotice(`Removed ${g.name} from the list.`);
                                    focusLater(() => (next ? trashRefs.current[next.id] : document.getElementById("guest-list-count")));
                                  }}
                                  className="min-h-[36px] px-2 font-semibold hover:bg-[var(--color-error-container)]"
                                  style={{ color: "var(--color-error)", borderRadius: "var(--radius-sm)" }}
                                >
                                  Remove
                                </button>
                                <button
                                  type="button"
                                  autoFocus
                                  onClick={() => {
                                    setConfirmRemoveId(null);
                                    focusLater(() => trashRefs.current[g.id]);
                                  }}
                                  className="min-h-[36px] px-2 hover:bg-[var(--color-surface-container)]"
                                  style={{ color: INK_VARIANT, borderRadius: "var(--radius-sm)" }}
                                >
                                  Keep
                                </button>
                              </span>
                            ) : (
                              <>
                                {personalized && (
                                  <IconButton
                                    label={copiedId === g.id ? `Invite link for ${g.name} copied` : `Copy invite link for ${g.name}`}
                                    onClick={() => copyLink(g.id, g.inviteCode, g.name)}
                                    tone={copiedId === g.id ? "success" : "accent"}
                                  >
                                    {copiedId === g.id ? <Check size={16} /> : <Link2 size={16} />}
                                  </IconButton>
                                )}
                                <IconButton
                                  label={`${expanded ? "Hide" : "Show"} details for ${g.name}`}
                                  onClick={() => setExpandedId(expanded ? null : g.id)}
                                  expanded={expanded}
                                  controls={panelId}
                                >
                                  <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : undefined, transition: "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)" }} />
                                </IconButton>
                                <IconButton
                                  label={`Remove ${g.name}`}
                                  onClick={() => setConfirmRemoveId(g.id)}
                                  tone="danger"
                                  buttonRef={(el) => {
                                    trashRefs.current[g.id] = el;
                                  }}
                                >
                                  <Trash2 size={15} />
                                </IconButton>
                              </>
                            )}
                          </div>
                        </div>

                        {expanded && (
                          <div id={panelId} className="grid grid-cols-1 gap-5 px-4 pb-5 pt-1 @lg:grid-cols-2 @4xl:grid-cols-[2fr_1fr_1.2fr_1fr] @4xl:pl-[5.75rem]">
                            <fieldset>
                              <legend className="mb-2 text-xs font-medium" style={{ color: INK_VARIANT }}>Groups</legend>
                              {groups.length === 0 ? (
                                <p className="text-xs" style={{ color: INK_VARIANT }}>
                                  Create a group, like Family or Entourage, to sort guests.
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-x-5 gap-y-0.5">
                                  {groups.map((gr) => (
                                    <label key={gr.id} className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm" style={{ color: INK }}>
                                      <input type="checkbox" checked={g.groupIds.includes(gr.id)} onChange={() => toggleGuestGroup(g, gr.id)} style={{ accentColor: "var(--color-primary)" }} />
                                      {gr.name}
                                    </label>
                                  ))}
                                </div>
                              )}
                            </fieldset>
                            <ContactField key={`${g.id}-${g.phone ?? ""}`} guest={g} onCommit={(value) => updateGuest(g.id, { phone: value || undefined })} />
                            <NoteField key={`${g.id}-note-${g.note ?? ""}`} guest={g} onCommit={(value) => updateGuest(g.id, { note: value || undefined })} />
                            <PartySizeField key={`${g.id}-${g.partySize}`} guest={g} personalized={personalized} onCommit={(n) => updateGuest(g.id, { partySize: n })} />
                            {personalized ? (
                              <div>
                                <p className="mb-2 text-xs font-medium" style={{ color: INK_VARIANT }}>Invite code</p>
                                <p className="font-mono text-sm tracking-wider" style={{ color: INK }}>{formatCode(g.inviteCode)}</p>
                              </div>
                            ) : (
                              <p className="flex items-center gap-2 self-start text-xs" style={{ color: INK_VARIANT }}>
                                <Lock size={12} aria-hidden />
                                Personal invite links come with Premium
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {selectedGuests.length > 0 && (
              <BulkBar
                count={selectedGuests.length}
                hidden={hiddenSelected}
                heads={selectedGuests.reduce((n, g) => n + (g.partySize || 1), 0)}
                confirming={confirmBulkRemove}
                onAskRemove={() => setConfirmBulkRemove(true)}
                onCancelRemove={() => setConfirmBulkRemove(false)}
                onRemove={bulkRemove}
                onClear={clearSelection}
                onStatus={bulkStatus}
                onSide={bulkSide}
                onGroup={bulkGroup}
                onExport={() => handleExport(selectedGuests, "selected-guests")}
                onCopyLinks={personalized ? copySelectedLinks : undefined}
                sideChoices={[...sideOptions(config).filter((o) => o.value), { value: "clear", label: "Clear side" }]}
                groupChoices={groups.flatMap((gr) => [
                  { value: `add:${gr.id}`, label: gr.name, group: "Add to group" },
                ]).concat(groups.map((gr) => ({ value: `remove:${gr.id}`, label: gr.name, group: "Take out of group" })))}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

type SortKey = "name" | "recent" | "party" | "status";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name, A to Z" },
  { value: "recent", label: "Recently added" },
  { value: "party", label: "Largest party first" },
  { value: "status", label: "By status" },
];
const STATUS_ORDER: Record<GuestListEntry["status"], number> = { attending: 0, pending: 1, invited: 2, declined: 3 };
const byName = (a: GuestListEntry, b: GuestListEntry) => a.name.localeCompare(b.name);
const SORTERS: Record<SortKey, (a: GuestListEntry, b: GuestListEntry) => number> = {
  name: byName,
  recent: (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || byName(a, b),
  party: (a, b) => (b.partySize || 1) - (a.partySize || 1) || byName(a, b),
  status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || byName(a, b),
};

/** Guests sharing a normalized name, an email, or a mobile number with someone else on the list. */
function findDuplicates(guests: GuestListEntry[]): Set<string> {
  const buckets = new Map<string, string[]>();
  const add = (key: string, id: string) => {
    const list = buckets.get(key);
    if (list) list.push(id);
    else buckets.set(key, [id]);
  };
  for (const g of guests) {
    const name = normalizeName(g.name);
    if (name) add(`n:${name}`, g.id);
    const email = g.email?.trim().toLowerCase();
    if (email) add(`e:${email}`, g.id);
    const digits = g.phone?.replace(/\D/g, "");
    if (digits && digits.length >= 7) add(`p:${digits.slice(-10)}`, g.id);
  }
  const out = new Set<string>();
  for (const ids of buckets.values()) if (ids.length > 1) ids.forEach((id) => out.add(id));
  return out;
}

/** A native checkbox (keyboard + screen readers for free) with the indeterminate state wired up. */
function SelectBox({
  checked,
  indeterminate = false,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={onChange}
      className="h-[18px] w-[18px] cursor-pointer"
      style={{ accentColor: "var(--color-primary)" }}
    />
  );
}

function CheckChip({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="inline-flex min-h-[40px] items-center gap-1.5 px-2.5 text-[0.8125rem] transition-colors duration-150 @lg:min-h-[32px]"
      style={{
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${on ? "#7A541C" : "rgba(192, 138, 62, 0.45)"}`,
        background: on ? "rgba(192, 138, 62, 0.18)" : "rgba(192, 138, 62, 0.08)",
        color: "#6B4A18",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

interface BulkBarProps {
  count: number;
  /** Selected guests the current filters hide; they're still acted on. */
  hidden: number;
  heads: number;
  confirming: boolean;
  onAskRemove: () => void;
  onCancelRemove: () => void;
  onRemove: () => void;
  onClear: () => void;
  onStatus: (v: string) => void;
  onSide: (v: string) => void;
  onGroup: (v: string) => void;
  onExport: () => void;
  onCopyLinks?: () => void;
  sideChoices: { value: string; label: string }[];
  groupChoices: { value: string; label: string; group?: string }[];
}

/**
 * Actions for the selected guests. It sticks to the bottom of the window while
 * the selection exists, so it's reachable from anywhere in a long list.
 */
function BulkBar(props: BulkBarProps) {
  const { count, heads, confirming, hidden } = props;
  const removeRef = useRef<HTMLButtonElement>(null);
  const cancelRemove = () => {
    props.onCancelRemove();
    // Back to the button that opened the question.
    window.requestAnimationFrame(() => removeRef.current?.focus());
  };
  const who = `${count} ${count === 1 ? "guest" : "guests"}`;
  const pick = (label: string, options: { value: string; label: string; group?: string }[], on: (v: string) => void) => (
    <Select
      variant="chip"
      aria-label={`${label} for ${who}`}
      value=""
      onChange={on}
      options={[{ value: "", label }, ...options]}
      style={{ fontSize: "0.8125rem", minHeight: 36, background: "transparent", color: "#FDF8F7", borderColor: "rgba(253,248,247,0.35)" }}
    />
  );

  return (
    <div
      id="bulk-bar"
      tabIndex={-1}
      role="region"
      aria-label="Selected guests"
      className="on-dark sticky bottom-3 mt-4 flex flex-wrap items-center gap-2 px-3 py-2.5 outline-none @lg:px-4"
      style={{
        zIndex: "var(--z-sticky)",
        background: "var(--color-on-surface)",
        color: "#FDF8F7",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 18px 40px -16px rgba(30, 14, 20, 0.55)",
      }}
      onKeyDown={(e) => {
        // A dropdown that handled Escape (closing itself) marks it; leave the selection alone then.
        if (e.key !== "Escape" || e.defaultPrevented) return;
        if (confirming) cancelRemove();
        else props.onClear();
      }}
    >
      {confirming ? (
        <>
          <p role="alert" className="mr-auto text-sm">
            Remove {who} ({heads} {heads === 1 ? "seat" : "seats"})?
            {hidden > 0 && <strong className="font-semibold"> {hidden} of them {hidden === 1 ? "isn't" : "aren't"} shown by your filters.</strong>}{" "}
            Their table seats are freed. This can&rsquo;t be undone.
          </p>
          <button
            type="button"
            onClick={cancelRemove}
            autoFocus
            className="min-h-[40px] px-3 text-sm font-medium hover:bg-[rgba(253,248,247,0.1)]"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            Keep them
          </button>
          <button
            type="button"
            onClick={props.onRemove}
            className="min-h-[40px] px-3.5 text-sm font-semibold"
            style={{ background: "#E5847A", color: "#2A0F0B", borderRadius: "var(--radius-sm)" }}
          >
            Remove {who}
          </button>
        </>
      ) : (
        <>
          <div className="flex w-full items-center gap-2 @lg:w-auto">
            <p className="text-sm font-semibold" aria-live="polite">
              {count} selected
              <span className="ml-1.5 font-normal" style={{ color: "rgba(253,248,247,0.75)" }}>
                · {heads} {heads === 1 ? "seat" : "seats"}
                {hidden > 0 && ` · ${hidden} not shown`}
              </span>
            </p>
            <ClearButton onClick={props.onClear} className="ml-auto @lg:hidden" />
          </div>
          {/* Actions wrap on narrow screens so Remove is never hidden off the edge. */}
          <div className="flex w-full flex-wrap items-center gap-2 @lg:w-auto @lg:flex-1 @lg:flex-nowrap [&>*]:shrink-0">
            <span aria-hidden className="mx-1 hidden h-5 w-px @lg:block" style={{ background: "rgba(253,248,247,0.25)" }} />
            {pick("Set status", STATUSES.map((s) => ({ value: s, label: statusLabel(s) })), props.onStatus)}
            {pick("Set side", props.sideChoices, props.onSide)}
            {props.groupChoices.length > 0 && pick("Groups", props.groupChoices, props.onGroup)}
            <span className="hidden flex-1 @lg:block" />
            {props.onCopyLinks && (
              <BarButton onClick={props.onCopyLinks} label="Copy links">
                <Copy size={15} aria-hidden />
              </BarButton>
            )}
            <BarButton onClick={props.onExport} label="Export">
              <Download size={15} aria-hidden />
            </BarButton>
            <BarButton onClick={props.onAskRemove} label="Remove" danger buttonRef={removeRef}>
              <Trash2 size={15} aria-hidden />
            </BarButton>
            <ClearButton onClick={props.onClear} className="hidden @lg:flex" />
          </div>
        </>
      )}
    </div>
  );
}

function ClearButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Clear selection"
      title="Clear selection (Esc)"
      className={`flex h-10 w-10 shrink-0 items-center justify-center hover:bg-[rgba(253,248,247,0.1)] ${className ?? ""}`}
      style={{ borderRadius: "var(--radius-sm)" }}
    >
      <X size={16} aria-hidden />
    </button>
  );
}

function BarButton({
  onClick,
  label,
  danger,
  children,
  buttonRef,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[40px] items-center gap-1.5 px-3 text-sm font-medium hover:bg-[rgba(253,248,247,0.1)]"
      style={{ borderRadius: "var(--radius-sm)", color: danger ? "#F2A69D" : "#FDF8F7" }}
    >
      {children}
      {label}
    </button>
  );
}

const STATUS_FILTERS = ["all", "attending", "invited", "pending", "declined"] as const;

/** Wide-screen columns: guest · groups · party · side · status · actions. */
const ROW_GRID = "@4xl:grid-cols-[1.25rem_minmax(0,2.2fr)_minmax(0,1.4fr)_3rem_10rem_8.5rem_8rem]";

const INK = "var(--color-on-surface)";
const INK_VARIANT = "var(--color-on-surface-variant)";

/** "Ana Maria Cruz" → "AC"; a single name gives its first two letters. */
function initials(name: string) {
  const words = name.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.slice(0, 2) ?? "?")).toUpperCase();
}

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "accent" | "danger" | "success";
  expanded?: boolean;
  controls?: string;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

/** A 40px icon action; its label is both the tooltip and the accessible name. */
function IconButton({ label, onClick, children, tone = "default", expanded, controls, buttonRef }: IconButtonProps) {
  const color = tone === "accent" ? "var(--color-primary-dim)" : tone === "success" ? "var(--color-success)" : INK_VARIANT;
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-expanded={expanded}
      aria-controls={controls}
      className={`flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-150 hover:bg-[var(--color-surface-container)] ${tone === "danger" ? "hover:text-[var(--color-error)]!" : ""}`}
      style={{ color, borderRadius: "var(--radius-sm)" }}
    >
      {children}
    </button>
  );
}

/**
 * Who's coming, counted in people (party sizes included): attending, declined
 * and still to reply, over one bar. Rows are invitations; these are seats.
 */
function GuestSummary({ guests }: { guests: GuestListEntry[] }) {
  const heads = (pred: (g: GuestListEntry) => boolean) => guests.filter(pred).reduce((n, g) => n + (g.partySize || 1), 0);
  const total = heads(() => true);
  const attending = heads((g) => g.status === "attending");
  const declined = heads((g) => g.status === "declined");
  const waiting = total - attending - declined;
  const replied = guests.filter((g) => g.status === "attending" || g.status === "declined").length;

  const cells = [
    { label: "Attending", value: attending, dot: statusStyle.attending.dot },
    { label: "Declined", value: declined, dot: statusStyle.declined.dot },
    { label: "Still to reply", value: waiting, dot: "var(--color-on-surface-muted)" },
  ];

  return (
    <section
      aria-label="Guest list summary"
      className="grid grid-cols-1 gap-5 p-5 @lg:grid-cols-[auto_1fr] @lg:items-center @lg:gap-10"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
    >
      <div>
        <p className="text-sm" style={{ color: INK_VARIANT }}>People invited</p>
        <p className="mt-1 text-[2rem] font-semibold leading-none tabular-nums" style={{ color: INK, letterSpacing: "-0.02em" }}>{total}</p>
        <p className="mt-1.5 text-xs" style={{ color: INK_VARIANT }}>
          {guests.length} {guests.length === 1 ? "invitation" : "invitations"} · {replied} replied
        </p>
      </div>
      <div className="min-w-0">
        <div aria-hidden className="flex h-2 overflow-hidden" style={{ background: "var(--color-surface-container-high)", borderRadius: "var(--radius-full)" }}>
          <span className="transition-[flex-grow] duration-300" style={{ flexGrow: attending, background: statusStyle.attending.dot }} />
          <span className="transition-[flex-grow] duration-300" style={{ flexGrow: declined, background: statusStyle.declined.dot }} />
          <span style={{ flexGrow: waiting }} />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-4">
          {cells.map((c) => (
            <div key={c.label}>
              <dt className="flex items-center gap-1.5 text-xs @lg:text-sm" style={{ color: INK_VARIANT }}>
                <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.dot }} />
                {c.label}
              </dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums" style={{ color: INK }}>
                {c.value}
                {total > 0 && <span className="ml-1.5 text-xs font-normal" style={{ color: INK_VARIANT }}>{Math.round((c.value / total) * 100)}%</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** The guest's mobile number, saved when the field loses focus. Used for text invitations. */
function ContactField({ guest, onCommit }: { guest: GuestListEntry; onCommit: (value: string) => void }) {
  const [value, setValue] = useState(guest.phone ?? "");
  const id = `guest-${guest.id}-phone`;
  const commit = () => {
    const next = value.trim().slice(0, 40);
    if (next !== (guest.phone ?? "")) onCommit(next);
  };
  return (
    <div className="w-full @lg:w-48">
      <InputField
        label="Mobile"
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="0917 123 4567"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
      />
    </div>
  );
}

/** A private note about the guest (allergies, who they're with, a reminder). Saved on blur; never shown to guests. */
function NoteField({ guest, onCommit }: { guest: GuestListEntry; onCommit: (value: string) => void }) {
  const [value, setValue] = useState(guest.note ?? "");
  const id = `guest-${guest.id}-note`;
  const commit = () => {
    const next = value.trim().slice(0, 500);
    if (next !== (guest.note ?? "")) onCommit(next);
  };
  return (
    <div className="@lg:col-span-2 @4xl:col-span-4">
      <label htmlFor={id} className="mb-2 block text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
        Private note <span className="font-normal">(only you see this)</span>
      </label>
      <textarea
        id={id}
        rows={2}
        maxLength={500}
        placeholder="e.g. Vegetarian, sitting with the Cruz family, needs a ride"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        className="w-full resize-y px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]!"
        style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-sm)", color: "var(--color-on-surface)" }}
      />
    </div>
  );
}

interface PartySizeFieldProps {
  guest: GuestListEntry;
  personalized: boolean;
  onCommit: (partySize: number) => void;
}

/** Seats for one invitation. On Premium sites, seats beyond the guest are plus-ones they can name on their RSVP. */
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
    ? "Counts toward your head count. Letting chosen guests bring several people comes with the Premium plan."
    : extras > 0
      ? `${guest.name} can name up to ${extras} additional ${extras === 1 ? "guest" : "guests"} when they RSVP.`
      : "Just this guest. Raise it to let them bring friends or family.";

  return (
    <div className="@lg:max-w-[15rem]">
      <label htmlFor={id} className="mb-2 block text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
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
        className="min-h-[40px] w-24 px-3 text-sm"
        style={{
          background: "var(--color-surface-container-lowest)",
          color: "var(--color-on-surface)",
          border: "1px solid var(--color-outline)",
          borderRadius: "var(--radius-sm)",
        }}
      />
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
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
      <div className="mb-3 flex flex-col gap-3 @lg:flex-row @lg:items-end @lg:justify-between">
        <div>
          <h3 id="groups-heading" className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Groups</h3>
          <p className="mt-0.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
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
            className="min-h-[36px] w-40 px-3 text-sm outline-none focus:border-[var(--color-primary)]!"
            style={{
              background: "var(--color-surface-container-lowest)",
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
                    <span style={{ color: "var(--color-on-surface-muted)" }}>
                      {" "}· {count} {count === 1 ? "guest" : "guests"}
                    </span>
                  </p>
                )}

                {!editing && confirming && (
                  <>
                    <span className="text-xs" style={{ color: "var(--color-error)" }}>
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
