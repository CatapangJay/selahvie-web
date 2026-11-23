import Link from "next/link";
import { CalendarDays, Check, ChevronRight, Eye, ImagePlus, MailQuestion, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Step {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  href: string;
}

/** Turns each website's state into the few things worth doing next, most urgent first. */
export function stepsFor(input: {
  id: string;
  label: string;
  published: boolean;
  hasDate: boolean;
  hasPhoto: boolean;
  invitations: number;
  waiting: number;
  several: boolean;
  /** Days until the wedding (null when unset), so a near date makes chasing replies urgent. */
  daysAway: number | null;
  /** Premium: each guest has a personal link worth re-sending. */
  personalized: boolean;
}): (Step & { rank: number })[] {
  const { id, label, published, hasDate, hasPhoto, invitations, waiting, several, daysAway, personalized } = input;
  // After the wedding there's nothing left to chase.
  if (daysAway !== null && daysAway < 0) return [];
  const soon = daysAway !== null && daysAway >= 0 && daysAway <= 21;
  const of = several ? ` for ${label}` : "";
  const steps: (Step & { rank: number })[] = [];
  if (!published)
    steps.push({ id: `${id}-publish`, rank: 0, icon: Eye, title: `Publish your website${of}`, detail: "Guests can't open it until it's live.", href: `/dashboard/customize/${id}?step=publish` });
  if (!hasDate)
    steps.push({ id: `${id}-date`, rank: 1, icon: CalendarDays, title: `Set your wedding date${of}`, detail: "It powers the countdown and your RSVP deadline.", href: `/dashboard/customize/${id}` });
  if (invitations === 0)
    steps.push({ id: `${id}-guests`, rank: 2, icon: UserPlus, title: `Start your guest list${of}`, detail: "Add people one by one or import a spreadsheet.", href: `/dashboard/manage/${id}?tab=guests` });
  if (published && waiting > 0)
    steps.push({
      id: `${id}-waiting`,
      // Close to the day, chasing replies beats everything else.
      rank: soon ? -1 : 3,
      icon: MailQuestion,
      title: `${waiting} ${waiting === 1 ? "person hasn't" : "people haven't"} replied${several ? ` to ${label}` : ""}`,
      detail: soon
        ? `The wedding is ${daysAway === 0 ? "today" : daysAway === 1 ? "tomorrow" : `in ${daysAway} days`}. Filter by Invited and Pending to see who.`
        : personalized
          ? "Share your link again, or copy their personal links."
          : "Share your website link with them again.",
      href: `/dashboard/manage/${id}?tab=guests`,
    });
  if (!hasPhoto)
    steps.push({ id: `${id}-photo`, rank: 4, icon: ImagePlus, title: `Add a photo of the two of you${of}`, detail: "It opens your website and your guests' invitation.", href: `/dashboard/customize/${id}` });
  return steps;
}

export default function NextSteps({ steps }: { steps: Step[] }) {
  return (
    <section
      aria-labelledby="next-steps"
      className="p-5"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-lg)" }}
    >
      <h2 id="next-steps" className="text-base font-semibold" style={{ color: "var(--color-on-surface)" }}>
        Next steps
      </h2>
      {steps.length === 0 ? (
        <p className="mt-3 flex items-start gap-2.5 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "#E6F0E8", color: "#2F5E3B" }}>
            <Check size={12} aria-hidden />
          </span>
          You&rsquo;re all caught up. New replies will show up below as they arrive.
        </p>
      ) : (
        <ul className="-mx-2 mt-2">
          {steps.map((s) => (
            <li key={s.id}>
              <Link
                href={s.href}
                className="group flex items-start gap-3 px-2 py-2.5 transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--color-primary-container-strong)", color: "var(--color-primary-dim)" }}
                >
                  <s.icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{s.title}</span>
                  <span className="block text-xs leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{s.detail}</span>
                </span>
                <ChevronRight size={16} aria-hidden className="mt-2 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: "var(--color-on-surface-variant)" }} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
