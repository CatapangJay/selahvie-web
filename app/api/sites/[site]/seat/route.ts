import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGuestList, requireUser } from "@/lib/db/server";
import { fetchAllRows } from "@/lib/db/paging";
import { fromWeddingRow, type WeddingRow } from "@/lib/db/mappers";
import { hasModule } from "@/lib/tiers";
import { planOf } from "@/lib/seating";
import { receptionVenue } from "@/lib/weddingDetails";
import { entrancesOf, findSeat, type FinderResult, type FinderSite } from "@/lib/seatFinder";
import type { WeddingConfig } from "@/types/wedding";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "no-store" };

type Access = { config: WeddingConfig; isOwner: boolean; open: boolean } | { error: string; status: number };

/**
 * The wedding by slug or id, and whether this visitor may use the table finder:
 * guests once the site is published, on a package with seating, with the finder
 * switched on; the owner always (to try it before the day).
 */
/** The service-role client, or null (logged) when the server isn't configured for it. */
function adminOrNull() {
  try {
    return createAdminClient();
  } catch (err) {
    console.error("[api/sites/seat] server misconfigured:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function access(site: string): Promise<Access> {
  const admin = adminOrNull();
  if (!admin) return { error: "This page isn't available right now.", status: 503 };
  const query = admin.from("weddings").select("*");
  const { data: row, error } = await (UUID.test(site) ? query.eq("id", site) : query.eq("slug", site.toLowerCase())).maybeSingle<WeddingRow>();
  if (error) {
    console.error("[api/sites/seat] lookup failed:", error.message);
    return { error: "Couldn't load this page.", status: 502 };
  }
  if (!row) return { error: "Not found.", status: 404 };
  const user = await requireUser();
  const isOwner = Boolean(user && user.id === row.owner_id);
  const config = fromWeddingRow(row);
  const open = row.status === "published" && hasModule(config, "seating") && Boolean(config.seatingPlan?.guestFinder);
  if (!isOwner && row.status !== "published") return { error: "Not found.", status: 404 };
  return { config, isOwner, open };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const a = await access(site);
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status, headers: NO_STORE });
  const { config, isOwner, open } = a;
  const enabled = open || isOwner;
  const body: FinderSite = {
    enabled,
    isOwner,
    partner1Name: config.partner1Name,
    partner2Name: config.partner2Name,
    weddingDate: config.weddingDate || undefined,
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
    venueName: (receptionVenue(config)?.name || config.venueName)?.trim() || undefined,
    // Entrance names only matter (and are only sent) when the finder is on.
    entrances: enabled ? entrancesOf(planOf(config)) : [],
  };
  return NextResponse.json(body, { headers: NO_STORE });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const body = (await request.json().catch(() => null)) as { query?: unknown; step?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, 80) : "";
  const step = body?.step === "code" ? "code" : "lookup";
  if (!query) return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: NO_STORE });

  const a = await access(site);
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status, headers: NO_STORE });
  if (!a.open && !a.isOwner) return NextResponse.json({ error: "Not found." }, { status: 404, headers: NO_STORE });

  const admin = adminOrNull();
  if (!admin) return NextResponse.json({ error: "Couldn't look that up." }, { status: 503, headers: NO_STORE });
  try {
    const [{ guests, groups }, rsvps] = await Promise.all([
      loadGuestList(admin, a.config.id),
      fetchAllRows<{ guest_id: string | null; plus_one_name: string | null; additional_guest_names: string[] | null }>((from, to) =>
        admin
          .from("rsvps")
          .select("guest_id, plus_one_name, additional_guest_names")
          .eq("wedding_id", a.config.id)
          .not("guest_id", "is", null)
          .order("submitted_at")
          .order("id")
          .range(from, to)
      ),
    ]);
    const result: FinderResult = findSeat(
      query,
      step,
      planOf(a.config),
      guests,
      groups,
      rsvps.map((r) => ({
        guestId: r.guest_id ?? undefined,
        plusOneName: r.plus_one_name ?? undefined,
        additionalGuestNames: r.additional_guest_names ?? undefined,
      }))
    );
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (err) {
    console.error("[api/sites/seat] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't look that up." }, { status: 502, headers: NO_STORE });
  }
}
