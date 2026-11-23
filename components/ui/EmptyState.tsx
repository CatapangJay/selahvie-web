import Link from "next/link";
import type { ReactNode } from "react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";

interface Props {
  /** An icon (e.g. a lucide icon at size 20) shown in a soft circle above the title. */
  icon?: ReactNode;
  /** Legacy: a decorative character. Shown in the same circle when there's no icon. */
  glyph?: ReactNode;
  title: string;
  /** One or two sentences that teach the next action, not "nothing here." */
  body: string;
  /** Optional primary action. */
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  /** Custom actions (e.g. a primary and a secondary button), shown instead of the single action. */
  children?: ReactNode;
}

/**
 * Teach-the-interface empty state (DESIGN.md: "empty states teach, not 'nothing
 * here'"). Used across dashboard, guest list, RSVP, seating and checkout.
 */
export default function EmptyState({ icon, glyph, title, body, actionLabel, actionHref, onAction, children }: Props) {
  const action =
    children ??
    (actionLabel &&
      (actionHref ? (
        <Link href={actionHref}>
          <ButtonPrimary size="lg">{actionLabel}</ButtonPrimary>
        </Link>
      ) : (
        <ButtonPrimary size="lg" onClick={onAction}>
          {actionLabel}
        </ButtonPrimary>
      )));
  const mark = icon ?? glyph;

  return (
    <div
      className="flex flex-col items-start justify-center gap-3 px-6 py-12 sm:px-10 sm:py-16"
      style={{
        background: "var(--color-surface-container-lowest)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--color-outline)",
      }}
    >
      {mark && (
        <div
          aria-hidden
          className="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "var(--color-primary-container-strong)",
            color: "var(--color-primary-dim)",
            fontFamily: "var(--font-display)",
            fontSize: "1.375rem",
            lineHeight: 1,
          }}
        >
          {mark}
        </div>
      )}
      <h2 className="text-lg font-semibold" style={{ color: "var(--color-on-surface)", textWrap: "balance" }}>
        {title}
      </h2>
      <p className="max-w-md text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)", textWrap: "pretty" }}>
        {body}
      </p>
      {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
