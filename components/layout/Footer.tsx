import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BmgMark } from "@/components/brand/BmgMark";
import { APP_NAME, APP_TAGLINE, CONTACT_EMAIL } from "@/lib/constants";

const LINK_COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/templates", label: "Templates" },
      { href: "/about", label: "About Us" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: `mailto:${CONTACT_EMAIL}`, label: "Email us" },
      { href: "/#contact", label: "Send a message" },
    ],
  },
];

const LEGAL_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms & Conditions" },
];

const linkClass =
  "inline-flex min-h-11 items-center text-[0.9375rem] text-[var(--color-on-surface-variant)] transition-colors duration-200 hover:text-[var(--color-primary)]";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--color-surface)", color: "var(--color-on-surface)", fontFamily: "var(--font-brand)" }}>
      {/* Curved edge: the footer domes up into a tinted band (the landing page's
          contact section shares this tint, so the two read as one surface). */}
      <div
        className="relative"
        style={{ background: "var(--color-surface-container-low)", paddingTop: "3rem" }}
        aria-hidden
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="block w-full"
          style={{ height: "clamp(56px, 8vw, 120px)" }}
        >
          <path d="M0,120 L0,70 C360,4 1080,4 1440,70 L1440,120 Z" fill="var(--color-surface)" />
        </svg>

        {/* The BMG seal sits on the crest of the curve, like a stamp on an envelope */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "1.5rem" }}>
          <span className="flex rounded-full p-1.5" style={{ background: "var(--color-surface)" }}>
            <BmgMark size={60} color="var(--color-primary)" />
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10" style={{ paddingTop: "clamp(2.5rem, 5vw, 4rem)" }}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand statement */}
          <div className="lg:col-span-6">
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--bordeaux)",
              }}
            >
              {APP_NAME}
            </p>
            <p className="mt-4" style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", lineHeight: 1.25, color: "var(--color-primary-dim)" }}>
              {APP_TAGLINE}
            </p>
            <Link
              href="/templates"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium"
              style={{ color: "var(--color-primary-dim)" }}
            >
              <span className="underline decoration-[var(--color-outline-variant)] underline-offset-[6px] transition-colors group-hover:decoration-[var(--color-primary)]">
                Find your template
              </span>
              <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:pt-2">
            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>
                  {col.title}
                </p>
                <ul className="flex flex-col">
                  {col.links.map(({ href, label }) => (
                    <li key={label}>
                      {href.startsWith("mailto:") ? (
                        <a href={href} className={linkClass}>
                          {label}
                        </a>
                      ) : (
                        <Link href={href} className={linkClass}>
                          {label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 flex flex-col items-start justify-between gap-3 pt-6 sm:flex-row sm:items-center"
          style={{ borderTop: "1px solid var(--color-outline)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            {LEGAL_LINKS.map(({ href, label }, i) => (
              <span key={label} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden>|</span>}
                <Link href={href} className="inline-flex min-h-11 items-center transition-colors hover:text-[var(--color-primary)]">
                  {label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
