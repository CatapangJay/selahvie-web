"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ShoppingBag, Menu, X, LayoutGrid, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { useHydrated } from "@/lib/useHydrated";
import { BmgWordmark } from "@/components/brand/BmgMark";

export default function Navbar() {
  const { itemCount, openCart } = useCartStore();
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useHydrated();
  const count = hydrated ? itemCount() : 0;
  // The session resolves client-side, so server/first render always show neither state.
  const authed = status === "authenticated";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();

  const handleLogout = async () => {
    setMenuOpen(false);
    // On signed-in-only pages the route guard then sends them to /login.
    await logout();
  };
  // Only the landing page has the dark full-height hero the nav overlays.
  const isHome = pathname === "/";

  // On home, the nav floats transparent over the hero at the very top and turns
  // solid on the first scroll. Elsewhere it is always solid.
  useEffect(() => {
    if (!isHome) return;
    // Solid as soon as the page moves: on phones the hero is taller than the
    // screen, so a transparent bar would sit on top of the hero copy.
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Transparent (light text over hero) only on home, at top, before mobile menu opens.
  const transparent = isHome && !scrolled && !menuOpen;

  // Colors flip between the light-on-dark hero state and the normal solid state.
  const logoColor = transparent ? "#FDF8F7" : "var(--color-on-surface)";
  const linkColor = transparent ? "rgba(253,248,247,0.85)" : "var(--color-on-surface-variant)";
  const linkHover = transparent ? "#FDF8F7" : "var(--color-primary)";
  const iconColor = transparent ? "#FDF8F7" : "var(--color-on-surface)";

  // Colours come from CSS variables on the header, so hover/focus stay correct
  // even when the bar flips between transparent and solid mid-hover.
  // No display class here: callers add inline-flex (or hidden md:inline-flex).
  const linkClass =
    "link-draw min-h-11 items-center text-[0.9375rem] text-[var(--nav-link)] transition-colors duration-200 hover:text-[var(--nav-link-hover)] focus-visible:text-[var(--nav-link-hover)]";

  return (
    <header
      className={`${isHome ? "fixed top-0 w-full" : "sticky top-0 w-full"} ${transparent ? "on-dark" : ""}`}
      style={{
        ["--nav-link" as string]: linkColor,
        ["--nav-link-hover" as string]: linkHover,
        zIndex: "var(--z-sticky)",
        fontFamily: "var(--font-brand)",
        transition: "background 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
        // Solid = frosted surface; transparent = see-through over the bordeaux hero.
        background: transparent ? "transparent" : "rgba(253, 248, 247, 0.88)",
        backdropFilter: transparent ? "none" : "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: transparent ? "none" : "blur(16px) saturate(1.6)",
        borderBottom: `1px solid ${transparent ? "transparent" : "var(--color-outline)"}`,
      }}
    >
      {/* Desktop: wordmark · links · actions. Mobile: menu · wordmark · cart. */}
      <nav
        aria-label="Main"
        className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-3 md:grid-cols-[auto_1fr_auto] md:gap-10 md:py-4"
      >
        {/* Mobile: menu toggle occupies the left cell so the wordmark stays centered */}
        <button
          className="-ml-3 flex h-11 w-11 items-center justify-center justify-self-start md:hidden"
          style={{ color: iconColor }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>

        <Link
          href="/"
          aria-label={`${APP_NAME}, home`}
          className="justify-self-center transition-opacity duration-200 hover:opacity-80 md:justify-self-start"
          style={{ transition: "color 300ms ease" }}
        >
          <BmgWordmark color={logoColor} markColor={transparent ? "var(--gold)" : "var(--color-primary)"} />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`inline-flex ${linkClass}`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right cell: account + cart, flush to the right edge */}
        <div className="flex items-center gap-4 justify-self-end">
          {authed ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/dashboard" className={`inline-flex gap-1.5 ${linkClass}`}>
                <LayoutGrid size={15} strokeWidth={1.5} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: iconColor }}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={17} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            status === "anonymous" && (
              <Link href="/login" className={`${linkClass} hidden md:inline-flex`}>
                Log in
              </Link>
            )
          )}

          <button
            onClick={openCart}
            className="relative -mr-3 flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: iconColor, transition: "color 300ms ease" }}
            aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {count > 0 && (
              <span
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: transparent ? "var(--gold)" : "var(--color-primary)", color: transparent ? "var(--bordeaux)" : "#FDF8F7" }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="flex flex-col px-6 pb-5 md:hidden"
          style={{ borderTop: "1px solid var(--color-outline)", background: "var(--color-surface-container-low)", paddingTop: "0.5rem" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-12 items-center text-base"
              style={{ color: "var(--color-on-surface)" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-1 pt-2" style={{ borderTop: "1px solid var(--color-outline)" }}>
            {authed ? (
              <div className="flex flex-col">
                <Link
                  href="/dashboard"
                  className="flex min-h-12 items-center text-base"
                  style={{ color: "var(--color-on-surface-variant)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex min-h-12 items-center text-left text-base"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex min-h-12 items-center text-base"
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
