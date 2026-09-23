"use client";

import { useMemo, useState } from "react";
import { useWeddingStore } from "@/store/weddingStore";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import EmptyState from "@/components/ui/EmptyState";
import { toCsv, downloadFile } from "@/lib/utils";
import type { GuestListEntry } from "@/types/wedding";
import { Trash2, Download, Plus, Search } from "lucide-react";

interface Props {
  weddingId: string;
  coupleLabel: string; // used in the export filename
}

const STATUSES: GuestListEntry["status"][] = ["invited", "attending", "declined", "pending"];

const statusStyle: Record<GuestListEntry["status"], { bg: string; color: string }> = {
  invited:   { bg: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" },
  attending: { bg: "var(--color-primary-container-strong)",  color: "var(--color-primary-dim)" },
  declined:  { bg: "var(--color-error-container)",           color: "var(--color-error)" },
  pending:   { bg: "var(--color-surface-container-high)",    color: "var(--color-on-surface-muted)" },
};

export default function GuestListManager({ weddingId, coupleLabel }: Props) {
  const guests = useWeddingStore((s) => s.guests).filter((g) => g.weddingId === weddingId);
  const addGuest = useWeddingStore((s) => s.addGuest);
  const updateGuest = useWeddingStore((s) => s.updateGuest);
  const removeGuest = useWeddingStore((s) => s.removeGuest);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | GuestListEntry["status"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests
      .filter((g) => (filter === "all" ? true : g.status === filter))
      .filter((g) => (q ? g.name.toLowerCase().includes(q) || (g.email ?? "").toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [guests, query, filter]);

  const totalHeads = guests.reduce((sum, g) => sum + (g.partySize || 1), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addGuest({
      weddingId,
      name: name.trim(),
      email: email.trim() || undefined,
      partySize: Math.max(1, parseInt(partySize, 10) || 1),
      status: "invited",
    });
    setName("");
    setEmail("");
    setPartySize("1");
  };

  const handleExport = () => {
    const rows = guests.map((g) => [g.name, g.email ?? "", g.partySize, g.status, g.note ?? ""]);
    const csv = toCsv(["Name", "Email", "Party size", "Status", "Note"], rows);
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
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
          />
        </div>
        <ButtonPrimary type="submit" size="md">
          <Plus size={14} />
          Add guest
        </ButtonPrimary>
      </form>

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
              {filtered.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
                  style={{
                    background: "var(--color-surface-container)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-outline)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                      {g.name}
                      {g.partySize > 1 && (
                        <span className="font-light" style={{ color: "var(--color-on-surface-muted)" }}> · party of {g.partySize}</span>
                      )}
                    </p>
                    {g.email && (
                      <p className="truncate text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>{g.email}</p>
                    )}
                  </div>

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
                    onClick={() => removeGuest(g.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
                    style={{ color: "var(--color-on-surface-muted)" }}
                    aria-label={`Remove ${g.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
