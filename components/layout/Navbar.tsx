"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const { itemCount, openCart } = useCartStore();
  const count = itemCount();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="glass sticky top-0 z-40 w-full"
      style={{ borderBottom: "1px solid var(--color-outline)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif tracking-wide transition-opacity hover:opacity-75"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.375rem",
            fontWeight: 300,
            color: "var(--color-on-surface)",
            letterSpacing: "0.04em",
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
              className="label-luxury transition-colors"
              style={{ color: "var(--color-on-surface-variant)", letterSpacing: "0.12em" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-on-surface-variant)")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <button
            onClick={openCart}
            className="relative flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-on-surface)" }}
            aria-label="Open cart"
          >
            <ShoppingBag size={18} strokeWidth={1.25} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: "var(--color-primary)", color: "var(--color-surface)" }}
              >
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            style={{ color: "var(--color-on-surface)" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
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
        </nav>
      )}
    </header>
  );
}
