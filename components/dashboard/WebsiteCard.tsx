"use client";

import Link from "next/link";
import Image from "next/image";
import { useWeddingStore } from "@/store/weddingStore";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { Pencil, Users, ExternalLink } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import type { WeddingTemplate } from "@/types/template";

interface Props {
  config: WeddingConfig;
  template: WeddingTemplate;
}

export default function WebsiteCard({ config, template }: Props) {
  const summary = useWeddingStore((s) => s.getRsvpSummary)(config.id);
  const isPublished = config.status === "published";
  const hasRsvps = summary.total > 0;

  // "RSVP active" once published and responses are arriving; else draft/published.
  const badge = hasRsvps
    ? { label: "RSVP active", bg: "var(--color-primary)", color: "#fff", border: "transparent" }
    : isPublished
    ? { label: "Published", bg: "var(--color-success)", color: "#fff", border: "transparent" }
    : { label: "Draft", bg: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)", border: "var(--color-outline)" };

  const coupleLabel =
    config.partner1Name && config.partner2Name
      ? `${config.partner1Name} & ${config.partner2Name}`
      : template.name;

  return (
    <div
      className="group flex flex-col overflow-hidden"
      style={{
        background: "var(--color-surface-container)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-outline)",
      }}
    >
      {/* Preview */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <Image
          src={config.heroImageUrl || template.previewImage}
          alt={coupleLabel}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          style={config.heroImageUrl ? undefined : { opacity: 0.6 }}
        />
        <span
          className="absolute right-3 top-3 label-luxury px-2.5 py-1"
          style={{
            background: badge.bg,
            color: badge.color,
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${badge.border}`,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <p
          className="font-serif"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", fontWeight: 400, color: "var(--color-on-surface)" }}
        >
          {coupleLabel}
        </p>
        {config.weddingDate && (
          <p className="label-luxury mt-1" style={{ color: "var(--color-on-surface-muted)" }}>
            {new Date(config.weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}

        {/* RSVP glance */}
        {hasRsvps && (
          <p className="mt-3 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
            <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>{summary.attending}</span> attending
            {" · "}
            <span style={{ fontWeight: 500 }}>{summary.guestCount}</span> guests
            {summary.declined > 0 && <> · {summary.declined} declined</>}
          </p>
        )}

        <div
          className="mt-auto flex flex-wrap gap-2 pt-4"
          style={{ borderTop: "1px solid var(--color-outline)", marginTop: "1rem" }}
        >
          <Link href={`/dashboard/customize/${config.id}`} className="flex-1">
            <ButtonPrimary size="sm" fullWidth>
              <Pencil size={12} />
              Customize
            </ButtonPrimary>
          </Link>
          <Link href={`/dashboard/manage/${config.id}`} className="flex-1">
            <ButtonSecondary size="sm" fullWidth>
              <Users size={12} />
              Guests
            </ButtonSecondary>
          </Link>
          {isPublished && (
            <Link href={`/wedding/${config.slug || config.id}`} target="_blank" aria-label="Open published website">
              <ButtonSecondary size="sm">
                <ExternalLink size={12} />
              </ButtonSecondary>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
