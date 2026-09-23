"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useWeddingStore } from "@/store/weddingStore";
import { isDemoConfig } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  /** Set false to hide this section entirely (respects section visibility). */
  enabled?: boolean;
}

/**
 * Public guestbook: guests leave well-wishes that persist to the store and
 * appear inline. On demo/preview renders it stays interactive but doesn't
 * persist. Always renders (it's an interactive prompt, not empty-gated).
 */
export default function GuestbookSection({ config, primary, accent, enabled = true }: Props) {
  const addEntry = useWeddingStore((s) => s.addGuestbookEntry);
  const entries = useWeddingStore((s) => s.guestbook).filter((g) => g.weddingId === config.id);
  const demo = isDemoConfig(config);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  // Local echo so demo/preview still shows the just-submitted wish.
  const [localEcho, setLocalEcho] = useState<{ id: string; name: string; message: string }[]>([]);

  if (!enabled) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (!demo) {
      addEntry({ weddingId: config.id, name: name.trim(), message: message.trim() });
    } else {
      setLocalEcho((prev) => [{ id: `${Date.now()}`, name: name.trim(), message: message.trim() }, ...prev]);
    }
    setName("");
    setMessage("");
  };

  const shown = demo
    ? localEcho
    : [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <section className="py-24" id="guestbook" style={{ background: "var(--color-surface-container-low)" }}>
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-10 text-center">
          <p className="label-luxury mb-3" style={{ color: primary }}>Leave a Note</p>
          <h2 className="headline-md" style={{ color: "var(--color-on-surface)" }}>Guestbook</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-10 flex flex-col gap-4 rounded-2xl p-6 sm:p-8"
          style={{ background: "var(--color-surface-container-lowest)", border: `1px solid ${accent}25` }}
        >
          <input
            type="text"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Your name"
            className="w-full border-0 border-b bg-transparent px-0 py-2.5 text-sm font-light outline-none transition-colors"
            style={{ borderBottomColor: `${accent}40`, color: "var(--color-on-surface)" }}
          />
          <textarea
            required
            rows={3}
            placeholder="Share your wishes for the couple…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="Your message"
            className="w-full resize-none rounded-sm px-4 py-3 text-sm font-light outline-none"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)", border: `1px solid ${accent}25` }}
          />
          <button
            type="submit"
            className="btn-primary label-luxury inline-flex min-h-[44px] items-center justify-center gap-2 self-start px-6"
            style={{ borderRadius: "var(--radius-sm)", color: "#fff" }}
          >
            <Heart size={13} />
            Sign the guestbook
          </button>
        </form>

        {shown.length > 0 && (
          <ul className="flex flex-col gap-3">
            {shown.map((w) => (
              <li
                key={w.id}
                className="rounded-2xl px-6 py-5"
                style={{ background: "var(--color-surface-container-lowest)", border: `1px solid ${accent}20` }}
              >
                <p
                  className="font-serif text-sm"
                  style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: primary }}
                >
                  {w.name}
                </p>
                <p className="mt-1 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  {w.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
