import Link from "next/link";
import { Check, MessageCircleHeart, X } from "lucide-react";
import { replyHeads, timeAgo } from "@/lib/weddingOverview";
import type { RSVPEntry } from "@/types/wedding";

interface Props {
  replies: RSVPEntry[];
  /** wedding id → couple label, shown when there's more than one website. */
  labels: Record<string, string>;
  several: boolean;
}

/** The latest RSVPs across every website, newest first. */
export default function RecentReplies({ replies, labels, several }: Props) {
  return (
    <section
      aria-labelledby="recent-replies"
      className="p-5"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-lg)" }}
    >
      <h2 id="recent-replies" className="text-base font-semibold" style={{ color: "var(--color-on-surface)" }}>
        Latest replies
      </h2>
      {replies.length === 0 ? (
        <div className="mt-3 flex items-start gap-2.5 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          <MessageCircleHeart size={18} aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
          <p>When guests answer the RSVP form on your website, their replies land here first, with who they&rsquo;re bringing.</p>
        </div>
      ) : (
        <ul className="mt-2">
          {replies.map((r, i) => {
            const extra = replyHeads(r) - 1;
            return (
              <li key={r.id} style={{ borderTop: i ? "1px solid var(--color-outline)" : undefined }}>
                <Link
                  href={`/dashboard/manage/${r.weddingId}?tab=rsvps`}
                  className="-mx-2 flex items-start gap-3 px-2 py-2.5 transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                  style={{ borderRadius: "var(--radius-sm)" }}
                >
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: r.attending ? "#E6F0E8" : "var(--color-primary-container-strong)",
                      color: r.attending ? "#2F5E3B" : "var(--color-primary-dim)",
                    }}
                  >
                    {r.attending ? <Check size={13} aria-hidden /> : <X size={13} aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm" style={{ color: "var(--color-on-surface)" }}>
                      <span className="font-medium">{r.guestName}</span>{" "}
                      {r.attending ? (extra > 0 ? `is coming, +${extra}` : "is coming") : "can't make it"}
                    </span>
                    <span className="block truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                      {timeAgo(r.submittedAt)}
                      {several && labels[r.weddingId] ? ` · ${labels[r.weddingId]}` : ""}
                      {r.attending && r.mealChoice ? ` · ${r.mealChoice}` : ""}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
