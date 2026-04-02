import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-surface-container-low)",
        borderTop: "1px solid var(--color-outline)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Top row */}
        <div className="grid grid-cols-1 gap-14 md:grid-cols-[1fr_auto_auto]">
          {/* Brand */}
          <div className="max-w-xs">
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.375rem",
                fontWeight: 500,
                fontStyle: "italic",
                letterSpacing: "0.01em",
                color: "var(--color-on-surface)",
              }}
            >
              {APP_NAME}
            </p>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--color-on-surface-variant)", maxWidth: 260 }}
            >
              Beautifully crafted wedding websites for the modern couple.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="label-luxury mb-5">Product</p>
            <ul className="space-y-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              {[
                { href: "/templates", label: "Templates" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/dashboard", label: "Dashboard" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors duration-200 hover:text-[var(--color-primary)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="label-luxury mb-5">Company</p>
            <ul className="space-y-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              {[
                { href: "#", label: "About" },
                { href: "#", label: "Contact" },
                { href: "#", label: "Privacy policy" },
                { href: "#", label: "Terms of service" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="transition-colors duration-200 hover:text-[var(--color-primary)]"
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
          className="mt-16 pt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
          style={{ borderTop: "1px solid var(--color-outline)" }}
        >
          <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "0.9375rem",
              color: "var(--color-on-surface-muted)",
            }}
          >
            Made with love, for love.
          </p>
        </div>
      </div>
    </footer>
  );
}
