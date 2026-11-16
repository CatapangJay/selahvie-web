"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { fromGuestbookRow, type GuestbookRow } from "@/lib/db/mappers";
import { isDemoConfig } from "@/components/wedding-templates/_shared/useRsvpSubmit";
import type { GuestbookEntry, WeddingConfig } from "@/types/wedding";

/**
 * Guestbook state shared by every template's guestbook: loads well-wishes from
 * Supabase (newest first) and saves new ones. On demo/preview renders it stays
 * interactive but keeps notes in memory only. Templates own the markup.
 */
export function useGuestbook(config: WeddingConfig, enabled = true) {
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

  const submit = async (e: FormEvent) => {
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

  return { entries, name, setName, message, setMessage, sending, error, submit };
}
