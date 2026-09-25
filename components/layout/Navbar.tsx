"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ShoppingBag, Menu, X, LayoutGrid, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { useHydrated } from "@/lib/useHydrated";

export default function Navbar() {
  const { itemCount, openCart } = useCartStore();
  const sessionEmail = useAuthStore((s) => s.sessionEmail);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useHydrated();
  const count = hydrated ? itemCount() : 0;
  // Only reflect auth after hydration so server/first render match.
  const authed = hydrated && Boolean(sessionEmail);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  // Only the landing page has the dark full-height hero the nav overlays.
  const isHome = pathname === "/";

  // On home, the nav floats transparent over the hero and turns solid once the
  // hero has mostly scrolled past. Elsewhere it's always solid.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Transparent (light text over hero) only on home, at top, before mobile menu opens.
  const transparent = isHome && !scrolled && !menuOpen;

  // Colors flip between the light-on-dark hero state and the normal solid state.
  const logoColor = transparent ? "#FDF8F7" : "var(--color-on-surface)";
  const linkColor = transparent ? "rgba(253,248,247,0.85)" : "var(--color-on-surface-variant)";
  const linkHover = transparent ? "#FDF8F7" : "var(--color-primary)";
  const iconColor = transparent ? "#FDF8F7" : "var(--color-on-surface)";

  return (
    <header
      className={isHome ? "fixed top-0 w-full" : "sticky top-0 w-full"}
      style={{
        zIndex: "var(--z-sticky)",
        transition: "background 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
        // Solid = glass token look; transparent = fully see-through, no border.
        background: transparent ? "transparent" : "rgba(253, 248, 247, 0.85)",
        backdropFilter: transparent ? "none" : "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: transparent ? "none" : "blur(16px) saturate(1.6)",
        borderBottom: `1px solid ${transparent ? "transparent" : "var(--color-outline)"}`,
        boxShadow: transparent ? "none" : "inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif tracking-wide transition-opacity hover:opacity-75"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.375rem",
            fontWeight: 400,
            color: logoColor,
            letterSpacing: "0.04em",
            transition: "color 300ms ease",
          }}
        >
          {APP_NAME}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label-luxury"
              style={{ color: linkColor, letterSpacing: "0.12em", transition: "color 200ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = linkHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {/* Auth control (desktop) */}
          {authed ? (
            <div className="hidden items-center gap-4 md:flex">
              <Link
                href="/dashboard"
                className="label-luxury inline-flex items-center gap-1.5"
                style={{ color: linkColor, letterSpacing: "0.12em", transition: "color 200ms ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                <LayoutGrid size={13} />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: iconColor }}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            hydrated && (
              <Link
                href="/login"
                className="label-luxury hidden md:inline-flex"
                style={{ color: linkColor, letterSpacing: "0.12em", transition: "color 200ms ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                Log in
              </Link>
            )
          )}

          <button
            onClick={openCart}
            className="relative flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: iconColor, transition: "color 300ms ease" }}
            aria-label="Open cart"
          >
            <ShoppingBag size={18} strokeWidth={1.25} />
            {count > 0 && (
              <span
                className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: "var(--color-primary)", color: "#FDF8F7" }}
              >
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="flex h-11 w-11 items-center justify-center md:hidden"
            style={{ color: iconColor }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav
          className="flex flex-col px-6 pb-6 gap-5 md:hidden"
          style={{ borderTop: "1px solid var(--color-outline)", background: "var(--color-surface-container-low)", paddingTop: "1.25rem" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label-luxury"
              style={{ color: "var(--color-on-surface-variant)" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-1 pt-4" style={{ borderTop: "1px solid var(--color-outline)" }}>
            {authed ? (
              <div className="flex flex-col gap-5">
                <Link
                  href="/dashboard"
                  className="label-luxury"
                  style={{ color: "var(--color-on-surface-variant)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="label-luxury text-left"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="label-luxury"
                style={{ color: "var(--color-on-surface-variant)" }}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
