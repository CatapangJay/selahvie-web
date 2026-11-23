import type { GuestTally } from "@/lib/weddingOverview";

const ATTENDING = "var(--color-success)";
const DECLINED = "var(--color-primary)";

/** One thin bar of who's coming, in people: attending · declined · still to reply. */
export default function GuestBar({ tally, size = "md" }: { tally: GuestTally; size?: "sm" | "md" }) {
  return (
    <div
      aria-hidden
      className={`flex overflow-hidden ${size === "sm" ? "h-1.5" : "h-2"}`}
      style={{ background: "var(--color-surface-container-high)", borderRadius: "var(--radius-full)" }}
    >
      <span className="transition-[flex-grow] duration-300" style={{ flexGrow: tally.attending, background: ATTENDING }} />
      <span className="transition-[flex-grow] duration-300" style={{ flexGrow: tally.declined, background: DECLINED }} />
      <span style={{ flexGrow: tally.waiting }} />
    </div>
  );
}

export function TallyLegend({ tally }: { tally: GuestTally }) {
  const items = [
    { label: "attending", value: tally.attending, dot: ATTENDING },
    { label: "declined", value: tally.declined, dot: DECLINED },
    { label: "to reply", value: tally.waiting, dot: "var(--color-on-surface-muted)" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: i.dot }} />
          <span className="font-semibold tabular-nums" style={{ color: "var(--color-on-surface)" }}>{i.value}</span>
          {i.label}
        </li>
      ))}
    </ul>
  );
}
