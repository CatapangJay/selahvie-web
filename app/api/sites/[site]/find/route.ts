import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGuestList } from "@/lib/db/server";
import { findInvitation, isPersonalized, type FindResult } from "@/lib/invitations";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "no-store" };

/**
 * "Find your invitation" for a published Personalized website (`site` is the
 * wedding id). The guest list stays on the server; only the matched invite code
 * is returned, and ambiguous names ask for the code instead.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const body = (await request.json().catch(() => null)) as { query?: unknown; step?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, 80) : "";
  const step = body?.step === "code" ? "code" : "lookup";
  if (!UUID.test(site) || !query) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const admin = createAdminClient();
  const { data: wedding, error } = await admin
    .from("weddings")
    .select("id, tier, status, invite_lookup_enabled")
    .eq("id", site)
    .maybeSingle<{ id: string; tier: "base" | "personalized"; status: string; invite_lookup_enabled: boolean }>();
  if (error) {
    return NextResponse.json({ error: "Couldn't look that up." }, { status: 502, headers: NO_STORE });
  }
  if (!wedding || wedding.status !== "published" || !isPersonalized(wedding) || !wedding.invite_lookup_enabled) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE });
  }

  try {
    const { guests, groups } = await loadGuestList(admin, wedding.id);
    const result: FindResult = findInvitation(query, step, guests, groups);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (err) {
    console.error("[api/sites/find] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't look that up." }, { status: 502, headers: NO_STORE });
  }
}
