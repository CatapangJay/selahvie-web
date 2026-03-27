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
      style={{ borderBottom: "1px solid rgba(209,197,180,0.2)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl font-normal tracking-wide text-[var(--color-on-surface)]" style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}>
          {APP_NAME}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label-luxury text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            className="relative flex items-center gap-1 text-[var(--color-on-surface)] transition-opacity hover:opacity-70"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--color-primary)" }}
              >
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-[var(--color-on-surface)]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav
          className="flex flex-col px-6 pb-4 gap-4 md:hidden"
          style={{ background: "var(--color-surface-container-low)" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label-luxury text-[var(--color-on-surface-variant)]"
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
