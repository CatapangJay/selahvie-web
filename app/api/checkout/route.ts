import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { templates } from "@/data/templates";
import { TIERS, normalizeTier, resolveTier, tierPrice, tierRank, upgradePrice } from "@/lib/tiers";
import { createAdminClient } from "@/lib/supabase/admin";
import { insertWeddingBundles, requireUser } from "@/lib/db/server";
import { defaultWeddingConfig } from "@/lib/weddingDefaults";
import type { Tier } from "@/types/wedding";

export const runtime = "nodejs";

const METHODS = new Set(["gcash", "maya", "card"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 20;

const isTier = (v: unknown): v is Tier => typeof v === "string" && (TIERS as string[]).includes(v);

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

interface ItemInput {
  kind?: unknown;
  templateId?: unknown;
  tier?: unknown;
  weddingId?: unknown;
}

/**
 * Mock payment: records a paid order, creates the purchased websites and
 * moves owned websites up to the package they were upgraded to. Prices are always recomputed here from the
 * catalogue; the browser only says what's in the cart.
 */
export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return fail("Please log in to complete your purchase.", 401);

  const body = (await request.json().catch(() => null)) as
    | { items?: unknown; method?: unknown; buyerName?: unknown }
    | null;
  const items = Array.isArray(body?.items) ? (body.items as ItemInput[]) : [];
  const method = typeof body?.method === "string" && METHODS.has(body.method) ? body.method : null;
  const buyerName = typeof body?.buyerName === "string" ? body.buyerName.trim().slice(0, 200) : "";
  if (!method || items.length === 0 || items.length > MAX_ITEMS) return fail("Invalid order.", 400);

  const admin = createAdminClient();
  const purchases: { templateId: string; tier: Tier; price: number }[] = [];
  // `stored` is the raw column value, so the write below only lands if nobody changed it meanwhile.
  const upgrades = new Map<string, { templateId: string; stored: string; from: Tier; to: Tier; price: number }>();

  for (const item of items) {
    if (item.kind === "upgrade") {
      if (typeof item.weddingId !== "string" || !UUID.test(item.weddingId) || !isTier(item.tier)) {
        return fail("Invalid order.", 400);
      }
      if (upgrades.has(item.weddingId)) continue;
      const { data: wedding, error } = await admin
        .from("weddings")
        .select("id, template_id, tier")
        .eq("id", item.weddingId)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) return fail("We couldn't process your order. Please try again.", 502);
      if (!wedding) return fail("One of the websites in your cart isn't yours.", 403);
      const from = normalizeTier(wedding.tier);
      const to = item.tier;
      if (tierRank(to) <= tierRank(from)) continue; // already on that package or higher; don't charge twice
      upgrades.set(wedding.id, { templateId: wedding.template_id, stored: wedding.tier, from, to, price: upgradePrice(from, to) });
    } else if (item.kind === "template") {
      const template = templates.find((t) => t.id === item.templateId);
      if (!template) return fail("One of the templates in your cart no longer exists.", 400);
      const tier = resolveTier(template, isTier(item.tier) ? item.tier : "essential");
      purchases.push({ templateId: template.id, tier, price: tierPrice(template.price, tier) });
    } else {
      return fail("Invalid order.", 400);
    }
  }

  if (purchases.length === 0 && upgrades.size === 0) {
    return fail("Everything in your cart is already unlocked.", 409);
  }

  const total = purchases.reduce((sum, p) => sum + p.price, 0) + [...upgrades.values()].reduce((sum, u) => sum + u.price, 0);
  const now = new Date().toISOString();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      account_id: user.id,
      email: user.email,
      buyer_name: buyerName,
      payment_method: method,
      status: "paid",
      currency: "PHP",
      total_cents: total,
      provider_reference: `mock_${randomUUID()}`,
      paid_at: now,
    })
    .select("id")
    .single();
  if (orderError || !order) {
    console.error("[api/checkout] order insert failed:", orderError?.message);
    return fail("We couldn't process your order. Please try again.", 502);
  }

  const bundles = purchases.map((p) => ({
    config: defaultWeddingConfig(randomUUID(), p.templateId, p.tier),
    groups: [],
    guests: [],
    rsvps: [],
    guestbook: [],
  }));

  let created = false;
  let upgraded = false;
  try {
    await insertWeddingBundles(admin, user.id, bundles);
    created = true;

    for (const [weddingId, u] of upgrades) {
      const { data, error } = await admin
        .from("weddings")
        .update({ tier: u.to })
        .eq("id", weddingId)
        .eq("tier", u.stored)
        .select("id");
      if (error) throw new Error(`upgrade: ${error.message}`);
      // Another order changed this website's package first; don't overwrite it.
      if (!data?.length) throw new Error("upgrade: package changed during checkout");
      upgraded = true;
    }

    const { error: itemsError } = await admin.from("order_items").insert([
      ...bundles.map((b, i) => ({
        order_id: order.id,
        kind: "template",
        template_id: b.config.templateId,
        tier: b.config.tier,
        wedding_id: b.config.id,
        unit_price_cents: purchases[i].price,
      })),
      ...[...upgrades].map(([weddingId, u]) => ({
        order_id: order.id,
        kind: "upgrade",
        template_id: u.templateId,
        tier: u.to,
        wedding_id: weddingId,
        unit_price_cents: u.price,
      })),
    ]);
    if (itemsError) throw new Error(`order_items: ${itemsError.message}`);
  } catch (error) {
    console.error("[api/checkout] fulfilment failed:", error);
    // Undo what was granted so a failed order unlocks nothing.
    if (created && bundles.length > 0) await admin.from("weddings").delete().in("id", bundles.map((b) => b.config.id));
    if (upgraded) {
      // Only undo our own write: leave a website alone if another order has moved it since.
      for (const [weddingId, u] of upgrades) {
        await admin.from("weddings").update({ tier: u.stored }).eq("id", weddingId).eq("tier", u.to);
      }
    }
    await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
    return fail("Your order couldn't be completed. You haven't been charged.", 502);
  }

  return NextResponse.json({
    orderId: order.id,
    weddingIds: bundles.map((b) => b.config.id),
    upgrades: upgrades.size,
  });
}
