"use client";

import { useWeddingStore } from "@/store/weddingStore";
import EmptyState from "@/components/ui/EmptyState";
import { Check, X, MessageCircle } from "lucide-react";

interface Props {
  weddingId: string;
}

/** Small labelled stat used in the RSVP summary row. */
function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      className="flex flex-col gap-1 px-5 py-4"
      style={{
        background: "var(--color-surface-container)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-outline)",
      }}
    >
      <span
        className="font-serif"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "2rem",
          fontWeight: 300,
          lineHeight: 1,
          color: accent ? "var(--color-primary)" : "var(--color-on-surface)",
        }}
      >
        {value}
      </span>
      <span className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>
        {label}
      </span>
    </div>
  );
}

export default function RsvpDashboard({ weddingId }: Props) {
  // Subscribe to the raw arrays so the view re-renders on new responses; derive per render.
  const rsvps = useWeddingStore((s) => s.rsvps).filter((r) => r.weddingId === weddingId);
  const summary = useWeddingStore((s) => s.getRsvpSummary)(weddingId);

  if (rsvps.length === 0) {
    return (
      <EmptyState
        glyph="∅"
        title="No responses yet"
        body="When guests submit the RSVP form on your published wedding website, their responses appear here — with meal choices and plus-ones tallied automatically. Share your link to start collecting replies."
      />
    );
  }

  const mealEntries = Object.entries(summary.mealTally);

  return (
    <div className="space-y-8">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Responses" value={summary.total} />
        <Stat label="Attending" value={summary.attending} accent />
        <Stat label="Declined" value={summary.declined} />
        <Stat label="Total guests" value={summary.guestCount} accent />
      </div>

      {/* Meal tally */}
      {mealEntries.length > 0 && (
        <div>
          <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-muted)" }}>
            Meal preferences
          </p>
          <div className="flex flex-wrap gap-2">
            {mealEntries.map(([meal, count]) => (
              <span
                key={meal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-light"
                style={{
                  background: "var(--color-surface-container)",
                  border: "1px solid var(--color-outline)",
                  borderRadius: "var(--radius-full)",
                  color: "var(--color-on-surface-variant)",
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

      {/* Response list */}
      <div>
        <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-muted)" }}>
          All responses
        </p>
        <ul className="flex flex-col gap-3">
          {[...rsvps]
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
            .map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
                style={{
                  background: "var(--color-surface-container)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-outline)",
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: r.attending
                          ? "var(--color-primary-container-strong)"
                          : "var(--color-surface-container-highest)",
                        color: r.attending ? "var(--color-primary-dim)" : "var(--color-on-surface-muted)",
                      }}
                      title={r.attending ? "Attending" : "Declined"}
                    >
                      {r.attending ? <Check size={13} /> : <X size={13} />}
                    </span>
                    <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                      {r.guestName}
                      {r.plusOne && (
                        <span className="font-light" style={{ color: "var(--color-on-surface-muted)" }}>
                          {" "}
                          +1{r.plusOneName ? ` · ${r.plusOneName}` : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  {r.message && (
                    <p
                      className="mt-2 flex items-start gap-2 text-sm font-light leading-relaxed"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      <MessageCircle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--color-on-surface-muted)" }} />
                      <span className="italic">&ldquo;{r.message}&rdquo;</span>
                    </p>
                  )}
                  {r.email && (
                    <p className="mt-1 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
                      {r.email}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                  {r.attending && r.mealChoice && (
                    <span className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>
                      {r.mealChoice}
                    </span>
                  )}
                  <span className="text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
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
