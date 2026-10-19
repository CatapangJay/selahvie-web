import { createClient } from "@/lib/supabase/client";
import type { GuestMatcher, OpenInviteMatch } from "@/lib/invitations";

type MatchRow = { status: string; guest_id: string | null; allowance: number | null };

function toMatch(rows: unknown): OpenInviteMatch {
  const row = (rows as MatchRow[] | null)?.[0];
  if (row?.status === "match" && row.guest_id) return { status: "match", guestId: row.guest_id, allowance: row.allowance ?? 0 };
  if (row?.status === "needs-code") return { status: "needs-code" };
  return { status: "none" };
}

/**
 * Open-invitation matcher for live sites, backed by `public.match_open_invite`
 * and `public.match_open_invite_code` (db/migrations/0008). The guest list
 * never leaves the database.
 */
export function supabaseGuestMatcher(weddingId: string): GuestMatcher {
  return {
    byName: async (name) => {
      const { data, error } = await createClient().rpc("match_open_invite", { p_wedding_id: weddingId, p_name: name });
      if (error) throw new Error(error.message);
      return toMatch(data);
    },
    byCode: async (code) => {
      const { data, error } = await createClient().rpc("match_open_invite_code", { p_wedding_id: weddingId, p_code: code });
      if (error) throw new Error(error.message);
      return toMatch(data);
    },
  };
}
