import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGuestList, requireUser } from "@/lib/db/server";
import { fromWeddingRow, type WeddingRow } from "@/lib/db/mappers";
import { redactForViewer, type SiteResponse } from "@/lib/db/site";
import { findInviteeByCode, INVITE_PARAM, isPersonalized } from "@/lib/invitations";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "no-store" };

/**
 * A wedding website by slug or id, shaped for whoever is asking. Visitors get
 * published sites only, with private content limited to their invite code.
 * The owner also gets drafts and the guest list (for "View as").
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const admin = createAdminClient();
  const query = admin.from("weddings").select("*");
  const { data: row, error } = await (UUID.test(site) ? query.eq("id", site) : query.eq("slug", site.toLowerCase())).maybeSingle<WeddingRow>();
  if (error) {
    console.error("[api/sites] lookup failed:", error.message);
    return NextResponse.json({ error: "Couldn't load this website." }, { status: 502, headers: NO_STORE });
  }

  const user = row ? await requireUser() : null;
  const isOwner = Boolean(row && user && user.id === row.owner_id);
  if (!row || (!isOwner && row.status !== "published")) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE });
  }

  let list: Awaited<ReturnType<typeof loadGuestList>>;
  try {
    list = await loadGuestList(admin, row.id);
  } catch (err) {
    console.error("[api/sites] guest list failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't load this website." }, { status: 502, headers: NO_STORE });
  }

  const { guests, groups } = list;
  const config = fromWeddingRow(row, isOwner ? user?.email : undefined);
  const code = request.nextUrl.searchParams.get(INVITE_PARAM) ?? "";
  const invitee = isPersonalized(config) && code ? findInviteeByCode(code, guests, groups) : null;
  const hasInvitees = guests.length + groups.length > 0;

  const body: SiteResponse = isOwner
    ? { config, invitee, hasInvitees, isOwner, guests, groups }
    : { config: redactForViewer(config, invitee), invitee, hasInvitees, isOwner };
  return NextResponse.json(body, { headers: NO_STORE });
}
