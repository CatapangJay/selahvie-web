import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer
      className="mt-24"
      style={{ background: "var(--color-surface-container-low)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <p
              className="font-serif text-2xl text-[var(--color-on-surface)]"
              style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}
            >
              {APP_NAME}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
              Beautifully crafted wedding websites for the modern couple. From template to "I do" in minutes.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="label-luxury mb-4 text-[var(--color-on-surface)]">Product</p>
            <ul className="space-y-2 text-sm text-[var(--color-on-surface-variant)]">
              <li><Link href="/templates" className="hover:text-[var(--color-on-surface)] transition-colors">Templates</Link></li>
              <li><Link href="/#pricing" className="hover:text-[var(--color-on-surface)] transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-[var(--color-on-surface)] transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-luxury mb-4 text-[var(--color-on-surface)]">Company</p>
            <ul className="space-y-2 text-sm text-[var(--color-on-surface-variant)]">
              <li><Link href="#" className="hover:text-[var(--color-on-surface)] transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-on-surface)] transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-on-surface)] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-6 flex flex-col items-center justify-between gap-4 text-xs text-[var(--color-on-surface-variant)] sm:flex-row"
          style={{ borderTop: "1px solid rgba(209,197,180,0.3)" }}
        >
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Made with love, for love.</p>
        </div>
      </div>
    </footer>
  );
}
