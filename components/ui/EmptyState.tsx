import Link from "next/link";
import type { ReactNode } from "react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";

interface Props {
  /** Decorative glyph or icon (rendered large, muted). */
  glyph?: ReactNode;
  title: string;
  /** One or two sentences that teach the next action, not "nothing here." */
  body: string;
  /** Optional primary action. */
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

/**
 * Teach-the-interface empty state (DESIGN.md: "empty states teach, not 'nothing
 * here'"). Used across dashboard, guest list, and RSVP views.
 */
export default function EmptyState({ glyph, title, body, actionLabel, actionHref, onAction }: Props) {
  const action = actionLabel && (
    actionHref ? (
      <Link href={actionHref}>
        <ButtonPrimary size="lg">{actionLabel}</ButtonPrimary>
      </Link>
    ) : (
      <ButtonPrimary size="lg" onClick={onAction}>{actionLabel}</ButtonPrimary>
    )
  );

  return (
    <div
      className="flex flex-col items-start justify-center gap-4 px-8 py-16 sm:px-12 sm:py-20"
      style={{
        background: "var(--color-surface-container)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-outline)",
      }}
    >
      {glyph && (
        <div
          className="font-serif"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "3rem",
            fontWeight: 300,
            lineHeight: 1,
            color: "var(--color-outline)",
            fontStyle: "italic",
          }}
          aria-hidden
        >
          {glyph}
        </div>
      )}
      <h2 className="headline-sm" style={{ fontWeight: 300 }}>{title}</h2>
      <p
        className="max-w-md text-sm font-light leading-relaxed"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        {body}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
