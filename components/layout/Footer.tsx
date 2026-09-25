import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const PRODUCT_LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/#pricing", label: "Pricing" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Privacy policy" },
  { href: "#", label: "Terms of service" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--bordeaux)", color: "#FDF8F7" }}>
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-10">
        {/* Top: brand statement + link columns */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 400,
                letterSpacing: "0.02em",
                color: "#FDF8F7",
              }}
            >
              {APP_NAME}
            </p>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "rgba(253,248,247,0.66)", maxWidth: 320 }}
            >
              Beautifully crafted wedding websites for the modern couple — invitations, your
              love story, and stress-free RSVPs, all in one place.
            </p>
            <Link
              href="/templates"
              className="mt-7 inline-flex items-center gap-2 label-luxury transition-opacity hover:opacity-70"
              style={{ color: "var(--gold)", borderBottom: "1px solid rgba(198,157,99,0.5)", paddingBottom: "0.35rem" }}
            >
              Find your template
            </Link>
          </div>

          {/* Product */}
          <div>
            <p className="label-luxury mb-5" style={{ color: "rgba(253,248,247,0.5)" }}>Product</p>
            <ul className="space-y-3 text-sm">
              {PRODUCT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors duration-200"
                    style={{ color: "rgba(253,248,247,0.8)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="label-luxury mb-5" style={{ color: "rgba(253,248,247,0.5)" }}>Company</p>
            <ul className="space-y-3 text-sm">
              {COMPANY_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="transition-colors duration-200"
                    style={{ color: "rgba(253,248,247,0.8)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 flex flex-col items-start justify-between gap-3 pt-7 sm:flex-row sm:items-center"
          style={{ borderTop: "1px solid rgba(253,248,247,0.14)" }}
        >
          <p className="label-luxury" style={{ color: "rgba(253,248,247,0.5)" }}>
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "0.9375rem",
              color: "rgba(253,248,247,0.66)",
            }}
          >
            Made with love, for love.
          </p>
        </div>
      </div>
    </footer>
  );
}
