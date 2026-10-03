import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FloralSprig from "@/components/ui/FloralSprig";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/constants";

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
  "text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] transition-colors duration-200 hover:text-[var(--color-primary)]";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}>
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

        {/* Floral spray straddling the crest of the curve */}
        <div className="absolute left-1/2 flex h-28 w-56 -translate-x-1/2 items-end justify-center" style={{ top: "1.25rem" }}>
          <FloralSprig size={30} className="origin-bottom -rotate-[64deg] translate-x-10 opacity-80" />
          <FloralSprig size={42} className="origin-bottom -rotate-[30deg] translate-x-5" />
          <FloralSprig size={56} className="relative z-10" />
          <FloralSprig size={42} className="origin-bottom rotate-[30deg] -translate-x-5" />
          <FloralSprig size={30} className="origin-bottom rotate-[64deg] -translate-x-10 opacity-80" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10" style={{ paddingTop: "clamp(2.5rem, 5vw, 4rem)" }}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand statement */}
          <div className="lg:col-span-6">
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)",
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--bordeaux)",
                textWrap: "balance",
              }}
            >
              Let us be <strong style={{ fontWeight: 600 }}>the one</strong> who brings{" "}
              <strong style={{ fontWeight: 600 }}>your love story</strong> to every{" "}
              <strong style={{ fontWeight: 600 }}>guest.</strong>
            </p>
            <Link
              href="/templates"
              className="label-luxury mt-8 inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--color-primary)", borderBottom: "1px solid var(--color-outline-variant)", paddingBottom: "0.35rem" }}
            >
              Find your template <ArrowRight size={13} />
            </Link>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:pt-2">
            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="label-luxury mb-5" style={{ color: "var(--color-on-surface)", fontWeight: 600 }}>
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3.5">
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
                <Link href={href} className="transition-colors hover:text-[var(--color-primary)]">
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
