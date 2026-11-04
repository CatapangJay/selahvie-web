import { test, expect, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import { adminClient, createConfirmedAccount, logIn, type TestAccount } from "./support";

// API-01 … API-14 in e2e/TEST_CASES.md. These hit the route handlers directly to check the
// server-side rules (auth, ownership, pricing, status gates) that the UI relies on.

// Monochrome (t13) is sold at its own price on every package. Jewel Tones (t12) is personalizedOnly,
// so it is always Premium and is only used where that is the point.
const MONOCHROME_PRICE = 9900; // PHP cents
const JEWEL_TONES_PRICE = 12900; // PHP cents
const PREMIUM_ADDON = 80000; // lib/tiers.ts TIER_ADDON_CENTS.premium
const UUID_NOT_IN_DB = "00000000-0000-4000-8000-000000000000";

async function signedInPage(browser: Browser, account: TestAccount): Promise<{ page: Page; api: APIRequestContext }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await logIn(page, account.email, account.password);
  return { page, api: page.request };
}

async function placeOrder(api: APIRequestContext, items: unknown[], method = "gcash") {
  return api.post("/api/checkout", { data: { items, method, buyerName: "Test Couple" } });
}

test.describe("Server-side rules behind the app", () => {
  test("API-01 checkout refuses anonymous callers", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { items: [{ kind: "template", templateId: "t12", tier: "essential" }], method: "gcash" },
    });
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: "Please log in to complete your purchase." });
  });

  test("API-02 checkout rejects an unknown payment method, empty cart and oversized carts", async ({ browser }) => {
    const account = await createConfirmedAccount("order-validation");
    const { page, api } = await signedInPage(browser, account);

    expect((await placeOrder(api, [{ kind: "template", templateId: "t12", tier: "essential" }], "bitcoin")).status()).toBe(400);
    expect((await placeOrder(api, [])).status()).toBe(400);
    const tooMany = Array.from({ length: 21 }, () => ({ kind: "template", templateId: "t12", tier: "essential" }));
    expect((await placeOrder(api, tooMany)).status()).toBe(400);
    await page.context().close();
  });

  test("API-03 checkout refuses a template that no longer exists", async ({ browser }) => {
    const account = await createConfirmedAccount("ghost-template");
    const { page, api } = await signedInPage(browser, account);
    const res = await placeOrder(api, [{ kind: "template", templateId: "does-not-exist", tier: "essential" }]);
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("One of the templates in your cart no longer exists.");
    await page.context().close();
  });

  test("API-04 the server recomputes the price; a client-sent amount is ignored", async ({ browser }) => {
    const account = await createConfirmedAccount("price-tamper");
    const { page, api } = await signedInPage(browser, account);

    const res = await placeOrder(api, [{ kind: "template", templateId: "t13", tier: "essential", price: 1, unit_price_cents: 1 }]);
    expect(res.status()).toBe(200);
    const { orderId } = await res.json();

    const { data: order } = await adminClient().from("orders").select("total_cents, status").eq("id", orderId).single();
    expect(order?.total_cents).toBe(MONOCHROME_PRICE);
    expect(order?.status).toBe("paid");
    await page.context().close();
  });

  test("API-05 a Premium template purchase is priced with the Premium add-on", async ({ browser }) => {
    const account = await createConfirmedAccount("premium-price");
    const { page, api } = await signedInPage(browser, account);

    const res = await placeOrder(api, [{ kind: "template", templateId: "t12", tier: "premium" }]);
    expect(res.status()).toBe(200);
    const { orderId, weddingIds } = await res.json();

    const { data: order } = await adminClient().from("orders").select("total_cents").eq("id", orderId).single();
    expect(order?.total_cents).toBe(JEWEL_TONES_PRICE + PREMIUM_ADDON);

    const { data: wedding } = await adminClient().from("weddings").select("tier, owner_id").eq("id", weddingIds[0]).single();
    expect(wedding?.tier).toBe("premium");
    expect(wedding?.owner_id).toBe(account.id);
    await page.context().close();
  });

  test("API-06 an upgrade cannot be bought for a website owned by someone else", async ({ browser }) => {
    const owner = await createConfirmedAccount("owner");
    const attacker = await createConfirmedAccount("attacker");

    const owned = await signedInPage(browser, owner);
    const bought = await (await placeOrder(owned.api, [{ kind: "template", templateId: "t13", tier: "essential" }])).json();
    await owned.page.context().close();

    const other = await signedInPage(browser, attacker);
    const res = await placeOrder(other.api, [{ kind: "upgrade", weddingId: bought.weddingIds[0], tier: "premium" }]);
    expect(res.status()).toBe(403);
    expect((await res.json()).error).toBe("One of the websites in your cart isn't yours.");

    const { data: wedding } = await adminClient().from("weddings").select("tier").eq("id", bought.weddingIds[0]).single();
    expect(wedding?.tier).toBe("essential");
    await other.page.context().close();
  });

  test("API-07 upgrading a website to a package it already has is refused without charging", async ({ browser }) => {
    const account = await createConfirmedAccount("no-double-charge");
    const { page, api } = await signedInPage(browser, account);
    const bought = await (await placeOrder(api, [{ kind: "template", templateId: "t12", tier: "premium" }])).json();

    const res = await placeOrder(api, [{ kind: "upgrade", weddingId: bought.weddingIds[0], tier: "premium" }]);
    expect(res.status()).toBe(409);
    expect((await res.json()).error).toBe("Everything in your cart is already unlocked.");
    await page.context().close();
  });

  test("API-08 a draft website is invisible to visitors and fully visible to its owner", async ({ browser, request }) => {
    const account = await createConfirmedAccount("draft-visibility");
    const { page, api } = await signedInPage(browser, account);
    const bought = await (await placeOrder(api, [{ kind: "template", templateId: "t12", tier: "premium" }])).json();
    const weddingId = bought.weddingIds[0];

    // Anonymous visitor (no cookies) gets a 404, not the draft.
    const visitor = await request.get(`/api/sites/${weddingId}`);
    expect(visitor.status()).toBe(404);

    // Owner sees the draft with the guest list.
    const owner = await api.get(`/api/sites/${weddingId}`);
    expect(owner.status()).toBe(200);
    const body = await owner.json();
    expect(body.isOwner).toBe(true);
    expect(Array.isArray(body.guests)).toBe(true);
    await page.context().close();
  });

  test("API-09 an unknown website id returns 404 rather than an error", async ({ request }) => {
    const res = await request.get(`/api/sites/${UUID_NOT_IN_DB}`);
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe("Not found.");
  });

  test("API-10 only the demo account can seed demo websites", async ({ browser }) => {
    const account = await createConfirmedAccount("not-demo");
    const { page, api } = await signedInPage(browser, account);
    const res = await api.post("/api/demo/seed");
    expect(res.status()).toBe(403);
    expect(await res.json()).toEqual({ error: "Not allowed." });
    await page.context().close();
  });

  test("API-11 photo uploads require a signed-in couple", async ({ request }) => {
    const res = await request.post("/api/uploads", {
      multipart: { file: { name: "a.png", mimeType: "image/png", buffer: Buffer.from("x") }, scope: "abc" },
    });
    expect(res.status()).toBe(401);
  });

  test("API-12 uploads reject non-images and oversize files, and only into your own website", async ({ browser }) => {
    const account = await createConfirmedAccount("uploads");
    const { page, api } = await signedInPage(browser, account);
    const bought = await (await placeOrder(api, [{ kind: "template", templateId: "t13", tier: "essential" }])).json();
    const scope = bought.weddingIds[0];

    const notAnImage = await api.post("/api/uploads", {
      multipart: { file: { name: "evil.html", mimeType: "text/html", buffer: Buffer.from("<script>x</script>") }, scope },
    });
    expect(notAnImage.status()).toBe(415);

    const tooBig = await api.post("/api/uploads", {
      multipart: { file: { name: "big.png", mimeType: "image/png", buffer: Buffer.alloc(6 * 1024 * 1024) }, scope },
    });
    expect(tooBig.status()).toBe(413);

    const notMine = await api.post("/api/uploads", {
      multipart: { file: { name: "a.png", mimeType: "image/png", buffer: Buffer.from("x") }, scope: "someone-elses" },
    });
    expect([400, 403]).toContain(notMine.status());
    await page.context().close();
  });

  test("API-13 text invitations are a Premium feature and refused on lower packages", async ({ browser }) => {
    const account = await createConfirmedAccount("sms-gate");
    const { page, api } = await signedInPage(browser, account);
    const bought = await (await placeOrder(api, [{ kind: "template", templateId: "t13", tier: "classic" }])).json();

    const res = await api.get(`/api/sms/invitations?weddingId=${bought.weddingIds[0]}`);
    expect(res.status()).toBe(403);
    expect((await res.json()).error).toBe("Text invitations come with the Premium plan.");
    await page.context().close();
  });

  test("API-15 a Premium owner can open text invitations (needs the sms_invitations migration)", async ({ browser }) => {
    const account = await createConfirmedAccount("sms-premium");
    const { page, api } = await signedInPage(browser, account);
    const bought = await (await placeOrder(api, [{ kind: "template", templateId: "t12", tier: "premium" }])).json();

    const res = await api.get(`/api/sms/invitations?weddingId=${bought.weddingIds[0]}`);
    expect(res.status(), await res.text()).toBe(200);
    await page.context().close();
  });

  test("API-14 text invitations need a signed-in owner", async ({ request }) => {
    const res = await request.get(`/api/sms/invitations?weddingId=${UUID_NOT_IN_DB}`);
    expect(res.status()).toBe(401);
  });
});
