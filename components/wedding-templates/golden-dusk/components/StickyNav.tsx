"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Props {
  partner1Name: string;
  partner2Name: string;
  accent: string;
}

const LINKS = [
  { label: "Home",           href: "#hero" },
  { label: "Our Story",      href: "#story" },
  { label: "Bride & Groom",  href: "#couple" },
  { label: "Event Details",  href: "#events" },
  { label: "Gallery",        href: "#gallery" },
  { label: "FAQ",            href: "#faq" },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function StickyNav({ partner1Name, partner2Name, accent }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logoText = partner1Name && partner2Name
    ? `${partner1Name} & ${partner2Name}`
    : "Wedding";

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(0,0,0,0.25)",
          backdropFilter: "blur(12px)",
          boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => scrollTo("#hero")}
          className="text-sm font-medium tracking-wide"
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: scrolled ? "#2c1810" : "#ffffff",
            fontSize: "1.05rem",
          }}
        >
          {logoText}
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-xs uppercase tracking-[0.12em] transition-colors duration-200 hover:opacity-80"
              style={{
                fontFamily: "var(--font-sans)",
                color: scrolled ? "#2c1810" : "rgba(255,255,255,0.85)",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setOpen(v => !v)}
          style={{ color: scrolled ? "#2c1810" : "#ffffff" }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="fixed top-12 inset-x-0 z-40 flex flex-col py-4"
            style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(12px)" }}
          >
            {LINKS.map(l => (
              <button
                key={l.href}
                onClick={() => { scrollTo(l.href); setOpen(false); }}
                className="text-sm uppercase tracking-widest py-3 px-6 text-left transition-colors hover:opacity-70"
                style={{ color: "#2c1810", fontFamily: "var(--font-sans)" }}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
