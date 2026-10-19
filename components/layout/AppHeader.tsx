"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Home, LogOut, ShoppingBag } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Header for the signed-in app (dashboard, studio, guest management). Unlike
 * the marketing Navbar it carries no site links; the wordmark and the account
 * menu are the only ways back to the public homepage.
 */
export default function AppHeader() {
  const account = useAuthStore((s) => s.account);
  const logout = useAuthStore((s) => s.logout);
  const { itemCount, openCart } = useCartStore();
  const hydrated = useHydrated();
  const count = hydrated ? itemCount() : 0;
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = account?.name || account?.email.split("@")[0] || "";
  const words = displayName.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
  const initials = (
    words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.[0] ?? "")
  ).toUpperCase();

  const onOverview = pathname === "/dashboard";

  const handleLogout = async () => {
    setOpen(false);
    // RequireAuth then sends them to /login.
    await logout();
  };

  return (
    <header
      className="sticky top-0 w-full"
      style={{
        zIndex: "var(--z-sticky)",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-outline)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            title="Go to the Selah Vie homepage"
            className="shrink-0 transition-opacity duration-200 hover:opacity-70"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.125rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-on-surface)",
            }}
          >
            {APP_NAME}
          </Link>
          <span aria-hidden className="h-5 w-px shrink-0" style={{ background: "var(--color-outline)" }} />
          <Link
            href="/dashboard"
            aria-current={onOverview ? "page" : undefined}
            className="truncate text-sm font-medium transition-colors duration-200 hover:text-[var(--color-primary)]"
            style={{ color: onOverview ? "var(--color-on-surface)" : "var(--color-on-surface-variant)" }}
          >
            Dashboard
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {count > 0 && (
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--color-surface-container-low)]"
              style={{ color: "var(--color-on-surface)" }}
              aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                style={{ background: "var(--color-primary)", color: "#fff" }}
              >
                {count}
              </span>
            </button>
          )}

          <div ref={wrapRef} className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={menuId}
              className="flex h-10 items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-[var(--color-surface-container-low)] sm:pr-3"
              style={{ background: open ? "var(--color-surface-container-low)" : undefined }}
            >
              <span className="sr-only sm:hidden">Account menu</span>
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: "var(--color-primary-container-strong)", color: "var(--color-primary-dim)" }}
              >
                {initials}
              </span>
              <span
                className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline"
                style={{ color: "var(--color-on-surface)" }}
              >
                {displayName}
              </span>
              <ChevronDown
                size={14}
                aria-hidden
                className="transition-transform duration-200"
                style={{ color: "var(--color-on-surface-variant)", transform: open ? "rotate(180deg)" : undefined }}
              />
            </button>

            <div
              id={menuId}
              className="absolute right-0 top-full mt-2 w-64 overflow-hidden shadow-lift"
              style={{
                zIndex: "var(--z-dropdown)",
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline)",
                borderRadius: "var(--radius-md)",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(-4px)",
                visibility: open ? "visible" : "hidden",
                // Becomes visible instantly on open; on close, hides after the fade.
                transition: `opacity 160ms cubic-bezier(0.16, 1, 0.3, 1), transform 160ms cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear ${open ? "0s" : "160ms"}`,
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-outline)" }}>
                <p className="truncate text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                  {displayName}
                </p>
                {account?.email && (
                  <p className="truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                    {account.email}
                  </p>
                )}
              </div>
              <ul className="p-1.5">
                <li>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex min-h-10 items-center gap-3 rounded-[var(--radius-sm)] px-2.5 text-sm transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    <Home size={15} strokeWidth={1.5} aria-hidden style={{ color: "var(--color-on-surface-variant)" }} />
                    Back to homepage
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-10 w-full items-center gap-3 rounded-[var(--radius-sm)] px-2.5 text-left text-sm transition-colors duration-150 hover:bg-[var(--color-surface-container-low)]"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    <LogOut size={15} strokeWidth={1.5} aria-hidden style={{ color: "var(--color-on-surface-variant)" }} />
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
