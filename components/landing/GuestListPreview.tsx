import { BmgMark } from "@/components/brand/BmgMark";

type Status = "Attending" | "Declined" | "Awaiting";

const GUESTS: { name: string; group: string; party: number; meal: string; status: Status }[] = [
  { name: "Tita Carmen Reyes", group: "Bride’s family", party: 2, meal: "Fish", status: "Attending" },
  { name: "Paolo & Nina Lim", group: "College friends", party: 2, meal: "Beef · 1 vegetarian", status: "Attending" },
  { name: "Ate Joy Santos", group: "Bride’s family", party: 4, meal: "—", status: "Awaiting" },
  { name: "Marco Villanueva", group: "Groom’s office", party: 1, meal: "—", status: "Declined" },
  { name: "Lola Fe Bautista", group: "Groom’s family", party: 1, meal: "Fish · low salt", status: "Attending" },
];

const BADGE: Record<Status, { bg: string; fg: string; border?: string }> = {
  Attending: { bg: "rgba(63,119,77,0.12)", fg: "var(--color-success)" },
  Declined: { bg: "var(--color-primary-container-strong)", fg: "var(--color-primary-dim)" },
  Awaiting: { bg: "transparent", fg: "var(--color-on-surface-variant)", border: "var(--color-outline)" },
};

/**
 * A static, faithful picture of the couple's guest list: the tally,
 * groups, party sizes and meal notes. It's real markup, not a screenshot,
 * so it stays crisp and readable at every width.
 */
export default function GuestListPreview() {
  return (
    <figure
      className="overflow-hidden"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 24px 60px -24px rgba(47,30,38,0.28)",
      }}
    >
      <figcaption className="sr-only">
        Example guest list: 87 attending, 12 declined, 21 awaiting a reply, with each guest&rsquo;s group, party size and meal
        choice.
      </figcaption>

      <div aria-hidden>
        <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--color-outline)" }}>
          <div className="flex items-center gap-3">
            <BmgMark size={30} color="var(--color-primary)" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>Bea &amp; Luis</p>
              <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Guest list · 120 invited</p>
            </div>
          </div>
          <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(63,119,77,0.12)", color: "var(--color-success)" }}>
            Published
          </span>
        </div>

        <div className="grid grid-cols-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-outline)" }}>
          {[
            ["87", "Attending", "var(--color-success)"],
            ["12", "Declined", "var(--color-primary)"],
            ["21", "Awaiting", "var(--color-on-surface-variant)"],
          ].map(([n, label, c]) => (
            <div key={label}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", lineHeight: 1, color: "var(--color-on-surface)" }}>{n}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                {label}
              </p>
            </div>
          ))}
        </div>

        <ul>
          {GUESTS.map((g, i) => (
            <li
              key={g.name}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-5 py-3 sm:grid-cols-[1.4fr_1fr_auto]"
              style={{ borderTop: i ? "1px solid var(--color-outline)" : undefined }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{g.name}</p>
                <p className="truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                  {g.group} · party of {g.party}
                </p>
              </div>
              <p className="hidden truncate text-xs sm:block" style={{ color: "var(--color-on-surface-variant)" }}>{g.meal}</p>
              <span
                className="justify-self-end rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: BADGE[g.status].bg, color: BADGE[g.status].fg, border: `1px solid ${BADGE[g.status].border ?? "transparent"}` }}
              >
                {g.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
