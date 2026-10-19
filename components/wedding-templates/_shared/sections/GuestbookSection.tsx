"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fromGuestbookRow, type GuestbookRow } from "@/lib/db/mappers";
import { isDemoConfig } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import type { GuestbookEntry, WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  /** Set false to hide this section entirely (respects section visibility). */
  enabled?: boolean;
}

/**
 * Public guestbook: guests leave well-wishes that are saved to Supabase and
 * appear inline, newest first. On demo/preview renders it stays interactive but
 * doesn't save. Always renders (it's an interactive prompt, not empty-gated).
 */
export default function GuestbookSection({ config, primary, accent, enabled = true }: Props) {
  const demo = isDemoConfig(config);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo || !enabled) return;
    let cancelled = false;
    createClient()
      .from("guestbook_entries")
      .select("*")
      .eq("wedding_id", config.id)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (!cancelled && data) setEntries((data as GuestbookRow[]).map(fromGuestbookRow));
      });
    return () => {
      cancelled = true;
    };
  }, [config.id, demo, enabled]);

  if (!enabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wish = { name: name.trim().slice(0, 200), message: message.trim().slice(0, 2000) };
    if (!wish.name || !wish.message || sending) return;
    setError("");

    if (demo) {
      setEntries((prev) => [{ id: `${Date.now()}`, weddingId: config.id, createdAt: new Date().toISOString(), ...wish }, ...prev]);
    } else {
      setSending(true);
      const { data, error: insertError } = await createClient()
        .from("guestbook_entries")
        .insert({ wedding_id: config.id, ...wish })
        .select()
        .single();
      setSending(false);
      if (insertError || !data) {
        setError("We couldn't add your note. Please try again.");
        return;
      }
      setEntries((prev) => [fromGuestbookRow(data as GuestbookRow), ...prev]);
    }
    setName("");
    setMessage("");
  };

  const shown = entries;

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
            disabled={sending}
            aria-busy={sending}
            className="btn-primary label-luxury inline-flex min-h-[44px] items-center justify-center gap-2 self-start px-6 disabled:opacity-60"
            style={{ borderRadius: "var(--radius-sm)", color: "#fff" }}
          >
            <Heart size={13} />
            {sending ? "Signing…" : "Sign the guestbook"}
          </button>
          {error && (
            <p role="alert" className="text-sm" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
          )}
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
