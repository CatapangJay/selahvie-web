import Link from "next/link";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
  weddingDateFormatted: string;
  show: boolean;
}

export default function TemplateFooter({ config, accent, weddingDateFormatted, show }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const linkClass = "label-luxury underline-offset-4 hover:underline";
  const linkStyle = { color: accent, fontSize: "0.65rem", letterSpacing: "0.18em" };

  return (
    <footer
      className="py-10 text-center relative overflow-hidden"
      style={{ background: "#080706", borderTop: `1px solid ${accent}15` }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${accent}06, transparent)` }}
        aria-hidden
      />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill={accent}
          className="mx-auto mb-4"
          style={{ opacity: 0.6 }}
          aria-hidden
        >
          <polygon points="10,0 20,10 10,20 0,10" />
        </svg>

        <p
          className="label-luxury"
          style={{ color: "rgba(245,240,232,0.55)", fontSize: "0.65rem", letterSpacing: "0.14em" }}
        >
          {config.partner1Name} &amp; {config.partner2Name}
          {weddingDateFormatted ? ` · ${weddingDateFormatted}` : ""}
        </p>

        {hashtag && (
          <p className="mt-4 text-xl" style={{ fontFamily: "var(--font-serif)", color: accent }}>
            {hashtag}
          </p>
        )}

        {contact && (
          <p
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-light"
            style={{ color: "rgba(245,240,232,0.6)" }}
          >
            {contact.name && <span>For questions, contact {contact.name}</span>}
            {contact.emailHref && (
              <a href={contact.emailHref} className={linkClass} style={linkStyle}>
                {contact.email}
              </a>
            )}
            {contact.phoneHref && (
              <a href={contact.phoneHref} className={linkClass} style={linkStyle}>
                {contact.phone}
              </a>
            )}
          </p>
        )}

        {socials.length > 0 && (
          <ul aria-label="Follow along" className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass} style={linkStyle}>
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <InvitationDownloadLink
          config={config}
          className="label-luxury mt-6 inline-block px-6 py-3 transition-colors hover:bg-white/5"
          style={{ ...linkStyle, border: `1px solid ${accent}50`, letterSpacing: "0.2em" }}
        />

        {show && (
          <p
            className="label-luxury mt-4"
            style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.6rem" }}
          >
            Created with{" "}
            <Link
              href="/"
              className="hover:underline underline-offset-2"
              style={{ color: accent }}
            >
              Selah Vie
            </Link>
            {" "}· Obsidian Vow Template
          </p>
        )}
      </div>
    </footer>
  );
}
