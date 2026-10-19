import { NextResponse } from "next/server";
import { DEMO_ACCOUNT } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { insertWeddingBundles, requireUser } from "@/lib/db/server";
import { demoBundles } from "@/lib/db/demoSeed";

export const runtime = "nodejs";

/** Gives the demo account its sample websites the first time it has none. */
export async function POST() {
  const user = await requireUser();
  if (!user || user.email !== DEMO_ACCOUNT.email) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { count, error } = await admin
    .from("weddings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);
  if (error) return NextResponse.json({ error: "Couldn't load the demo." }, { status: 502 });
  if ((count ?? 0) > 0) return NextResponse.json({ seeded: false });

  try {
    await insertWeddingBundles(admin, user.id, demoBundles());
  } catch (e) {
    console.error("[api/demo/seed] failed:", e);
    return NextResponse.json({ error: "Couldn't set up the demo." }, { status: 502 });
  }
  return NextResponse.json({ seeded: true });
}
