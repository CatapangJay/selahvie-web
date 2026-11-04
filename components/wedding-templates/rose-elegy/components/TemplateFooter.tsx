import Link from "next/link";
import { Heart } from "lucide-react";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  weddingDateFormatted: string;
  show: boolean;
}

export default function TemplateFooter({ config, primary, accent, weddingDateFormatted, show }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const linkClass = "label-luxury underline-offset-4 hover:underline";
  const smallType = { fontSize: "0.65rem" };

  return (
    <footer
      className="py-8 text-center"
      style={{
        background: "var(--color-surface-container-low)",
        borderTop: `1px solid ${accent}20`,
      }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <Heart
          size={14}
          fill={accent}
          stroke="none"
          className="mx-auto mb-3"
          style={{ color: accent }}
          aria-hidden
        />
        <p
          className="label-luxury"
          style={{ color: "var(--color-on-surface-variant)", fontSize: "0.65rem" }}
        >
          {config.partner1Name} &amp; {config.partner2Name} · {weddingDateFormatted}
        </p>

        {hashtag && (
          <p className="headline-sm mt-3" style={{ color: primary }}>
            {hashtag}
          </p>
        )}

        {contact && (
          <p
            className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {contact.name && <span>Questions? Ask {contact.name}</span>}
            {contact.emailHref && (
              <a href={contact.emailHref} className={linkClass} style={{ ...smallType, color: primary }}>
                {contact.email}
              </a>
            )}
            {contact.phoneHref && (
              <a href={contact.phoneHref} className={linkClass} style={{ ...smallType, color: primary }}>
                {contact.phone}
              </a>
            )}
          </p>
        )}

        {socials.length > 0 && (
          <ul aria-label="Follow along" className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {socials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                  style={{ ...smallType, color: primary }}
                >
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <InvitationDownloadLink
          config={config}
          className="label-luxury mt-5 inline-block rounded-full px-5 py-2 transition-opacity hover:opacity-80"
          style={{ ...smallType, color: primary, border: `1px solid ${accent}60` }}
        />

        {show && (
          <p
            className="label-luxury mt-3"
            style={{ color: "var(--color-outline)", fontSize: "0.6rem" }}
          >
            Created with{" "}
            <Link
              href="/"
              className="underline-offset-2 hover:underline"
              style={{ color: primary }}
            >
              Selah Vie
            </Link>{" "}
            · Rosé Elegy Template
          </p>
        )}
      </div>
    </footer>
  );
}
