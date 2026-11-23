"use client";

import { useWeddingStore } from "@/store/weddingStore";
import EmptyState from "@/components/ui/EmptyState";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { downloadFile, toCsv } from "@/lib/utils";
import type { RSVPEntry } from "@/types/wedding";
import { Check, Download, X, MessageCircle, Phone, Utensils, MailCheck } from "lucide-react";

interface Props {
  weddingId: string;
}

/** One figure in the RSVP summary panel. Numbers use the UI face (data, not display). */
function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <dt className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{label}</dt>
      <dd className="text-[1.75rem] font-semibold leading-none tabular-nums" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
        {value}
      </dd>
      {hint && <dd className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{hint}</dd>}
    </div>
  );
}

/** Section heading inside the RSVP tab. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{children}</h3>;
}

const guestsOf = (r: RSVPEntry) =>
  r.additionalGuestNames?.length ? r.additionalGuestNames : r.plusOneName ? [r.plusOneName] : [];

/** Every response as a spreadsheet, e.g. to share dietary needs with the caterer. */
function exportCsv(rsvps: RSVPEntry[]) {
  const rows = rsvps.map((r) => [
    r.guestName,
    r.attending ? "Attending" : "Declined",
    r.attending ? 1 + (r.additionalGuests ?? (r.plusOne ? 1 : 0)) : 0,
    guestsOf(r).join("; "),
    r.mealChoice ?? "",
    r.dietaryRestrictions ?? "",
    r.email ?? "",
    r.phone ?? "",
    r.message ?? "",
    r.submittedAt.slice(0, 10),
  ]);
  const csv = toCsv(
    ["Name", "Response", "Guests", "Additional guests", "Meal", "Dietary needs", "Email", "Phone", "Message", "Replied on"],
    rows
  );
  downloadFile("rsvps.csv", csv);
}

export default function RsvpDashboard({ weddingId }: Props) {
  // Subscribe to the raw arrays so the view re-renders on new responses; derive per render.
  const rsvps = useWeddingStore((s) => s.rsvps).filter((r) => r.weddingId === weddingId);
  const summary = useWeddingStore((s) => s.getRsvpSummary)(weddingId);

  if (rsvps.length === 0) {
    return (
      <EmptyState
        icon={<MailCheck size={20} strokeWidth={1.75} />}
        title="No replies yet"
        body="When guests send the RSVP form on your published website, each reply lands here, with meal choices and plus-ones already counted. Share your link from the Share tab to start collecting them."
      />
    );
  }

  const mealEntries = Object.entries(summary.mealTally);
  const sorted = [...rsvps].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const dietary = sorted.filter((r) => r.attending && r.dietaryRestrictions?.trim());

  return (
    <div className="space-y-8">
      {/* Summary row */}
      <dl
        className="grid grid-cols-2 overflow-hidden sm:grid-cols-4 [&>div+div]:border-l [&>div]:border-[var(--color-outline)]! max-sm:[&>div:nth-child(3)]:border-l-0 max-sm:[&>div:nth-child(n+3)]:border-t"
        style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
      >
        <Stat label="Responses" value={summary.total} />
        <Stat label="Attending" value={summary.attending} hint={summary.total ? `${Math.round((summary.attending / summary.total) * 100)}% of replies` : undefined} />
        <Stat label="Declined" value={summary.declined} />
        <Stat label="People coming" value={summary.guestCount} hint="Plus-ones included" />
      </dl>

      {/* Meal tally */}
      {mealEntries.length > 0 && (
        <div>
          <SectionTitle>Meal preferences</SectionTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {mealEntries.map(([meal, count]) => (
              <span
                key={meal}
                className="inline-flex min-h-[36px] items-center gap-2 px-3.5 text-sm"
                style={{
                  background: "var(--color-surface-container-lowest)",
                  border: "1px solid var(--color-outline)",
                  borderRadius: "var(--radius-full)",
                  color: "var(--color-on-surface)",
                }}
              >
                {meal}
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center px-1 text-xs font-medium"
                  style={{
                    background: "var(--color-primary-container-strong)",
                    color: "var(--color-primary-dim)",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dietary needs, for the caterer */}
      {dietary.length > 0 && (
        <div>
          <SectionTitle>Dietary needs</SectionTitle>
          <p className="mb-3 mt-0.5 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            {dietary.length} attending {dietary.length === 1 ? "guest has" : "guests have"} a dietary note.
          </p>
          <ul className="text-sm" style={{ borderTop: "1px solid var(--color-outline)" }}>
            {dietary.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4"
                style={{ borderBottom: "1px solid var(--color-outline)" }}
              >
                <span className="shrink-0 font-medium sm:w-48" style={{ color: "var(--color-on-surface)" }}>{r.guestName}</span>
                <span style={{ color: "var(--color-on-surface-variant)" }}>{r.dietaryRestrictions}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Response list */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <SectionTitle>All responses</SectionTitle>
          <ButtonSecondary size="sm" onClick={() => exportCsv(sorted)}>
            <Download size={13} aria-hidden />
            Download CSV
          </ButtonSecondary>
        </div>
        <ul
          className="overflow-hidden"
          style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
        >
          {sorted.map((r, i) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between"
              style={{ borderTop: i ? "1px solid var(--color-outline)" : undefined }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: r.attending ? "#E6F0E8" : "var(--color-primary-container-strong)",
                      color: r.attending ? "#2F5E3B" : "var(--color-primary-dim)",
                    }}
                    title={r.attending ? "Attending" : "Declined"}
                  >
                    {r.attending ? <Check size={13} aria-hidden /> : <X size={13} aria-hidden />}
                    <span className="sr-only">{r.attending ? "Attending" : "Declined"}</span>
                  </span>
                  <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                    {r.guestName}
                    {r.plusOne && (() => {
                      const names = guestsOf(r);
                      const extra = r.additionalGuests ?? 1;
                      return (
                        <span className="font-normal" style={{ color: "var(--color-on-surface-variant)" }}>
                          {" "}
                          +{extra}{names.length > 0 ? ` · ${names.join(", ")}` : ""}
                        </span>
                      );
                    })()}
                  </p>
                </div>
                {r.message && (
                  <p
                    className="mt-2 flex items-start gap-2 text-sm leading-relaxed"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    <MessageCircle size={13} aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--color-on-surface-variant)" }} />
                    <span className="italic">&ldquo;{r.message}&rdquo;</span>
                  </p>
                )}
                {r.attending && r.dietaryRestrictions?.trim() && (
                  <p className="mt-2 flex items-start gap-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                    <Utensils size={13} aria-hidden className="mt-1 shrink-0" />
                    <span>
                      <span className="sr-only">Dietary needs: </span>
                      {r.dietaryRestrictions}
                    </span>
                  </p>
                )}
                {(r.email || r.phone) && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                    {r.email && <a href={`mailto:${r.email}`} className="underline-offset-2 hover:underline">{r.email}</a>}
                    {r.phone && (
                      <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                        <Phone size={11} aria-hidden />
                        {r.phone}
                      </a>
                    )}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                {r.attending && r.mealChoice && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium"
                    style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-sm)", color: "var(--color-on-surface)" }}
                  >
                    <Utensils size={11} aria-hidden />
                    {r.mealChoice}
                  </span>
                )}
                <span className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                  {new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
