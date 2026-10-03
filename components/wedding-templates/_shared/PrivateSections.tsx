"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { useInvitee } from "./InviteeContext";
import { visiblePrivateSections } from "@/lib/invitations";
import type { PrivateSection, WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
  /** Match the template's surface: light templates use dark ink, dark ones light ink. */
  tone?: "light" | "dark";
}

const PALETTE = {
  light: { ink: "#2c1c22", body: "rgba(44,28,34,0.78)", rule: "rgba(44,28,34,0.12)" },
  dark: { ink: "#f5f0e8", body: "rgba(245,240,232,0.78)", rule: "rgba(245,240,232,0.14)" },
} as const;

/** Only http(s) images; anything else (javascript:, data:, relative paths) is dropped. */
function safeImageUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

function formatEventDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/**
 * Personalized Invitations: content blocks only the current guest's audience
 * can see. Renders nothing for public visitors, base-tier sites, or when no
 * block targets this guest, so every template can mount it unconditionally.
 */
export default function PrivateSections({ config, accent, tone = "light" }: Props) {
  const invitee = useInvitee();
  const sections = visiblePrivateSections(config, invitee);
  if (!invitee || sections.length === 0) return null;

  const c = PALETTE[tone];
  const firstName = invitee.kind === "guest" ? invitee.displayName.split(" ")[0] : invitee.displayName;

  return (
    <section id="for-you" aria-labelledby="for-you-heading" style={{ paddingBlock: "clamp(4rem, 10vw, 6.5rem)" }}>
      <div className="mx-auto max-w-2xl px-6">
        <header className="mb-12 text-center">
          <h2
            id="for-you-heading"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              lineHeight: 1.1,
              color: c.ink,
              textWrap: "balance",
            }}
          >
            Just for you, <span style={{ fontStyle: "italic", color: accent }}>{firstName}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed" style={{ color: c.body }}>
            A few details we&apos;re sharing only with the people who received this invitation.
          </p>
        </header>

        <ol className="flex flex-col">
          {sections.map((s, i) => (
            <li
              key={s.id}
              className="py-10"
              style={{ borderTop: i === 0 ? `1px solid ${c.rule}` : undefined, borderBottom: `1px solid ${c.rule}` }}
            >
              <PrivateBlock section={s} accent={accent} palette={c} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PrivateBlock({
  section,
  accent,
  palette,
}: {
  section: PrivateSection;
  accent: string;
  palette: (typeof PALETTE)[keyof typeof PALETTE];
}) {
  const photo = section.kind === "photo" ? safeImageUrl(section.photoUrl) : null;
  const eventDate = formatEventDate(section.eventDate);

  return (
    <article>
      {photo && (
        // User-supplied remote URL; next/image would need every host allow-listed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="mb-7 w-full object-cover"
          style={{ aspectRatio: "3 / 2", borderRadius: 4 }}
        />
      )}

      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: "clamp(1.4rem, 3.4vw, 1.75rem)",
          lineHeight: 1.2,
          color: palette.ink,
          textWrap: "balance",
        }}
      >
        {section.title}
      </h3>

      {section.kind === "event" && (eventDate || section.eventTime || section.eventLocation) && (
        <dl className="mt-5 flex flex-col gap-2.5 text-sm font-light" style={{ color: palette.ink }}>
          {eventDate && (
            <div className="flex items-center gap-3">
              <dt className="sr-only">Date</dt>
              <Calendar size={15} aria-hidden style={{ color: accent }} />
              <dd>{eventDate}</dd>
            </div>
          )}
          {section.eventTime && (
            <div className="flex items-center gap-3">
              <dt className="sr-only">Time</dt>
              <Clock size={15} aria-hidden style={{ color: accent }} />
              <dd>{section.eventTime}</dd>
            </div>
          )}
          {section.eventLocation && (
            <div className="flex items-center gap-3">
              <dt className="sr-only">Location</dt>
              <MapPin size={15} aria-hidden style={{ color: accent }} />
              <dd>{section.eventLocation}</dd>
            </div>
          )}
        </dl>
      )}

      {section.body && (
        <p
          className="mt-4 whitespace-pre-line text-[0.95rem] font-light leading-relaxed"
          style={{ color: palette.body, maxWidth: "65ch", textWrap: "pretty" }}
        >
          {section.body}
        </p>
      )}
    </article>
  );
}
