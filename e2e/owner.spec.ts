import { test, expect, type Page } from "@playwright/test";
import { adminClient, createConfirmedAccount, logIn, type TestAccount } from "./support";

// OWN-01 … OWN-05 in e2e/TEST_CASES.md. The couple's side: publish, edit and manage a website.

async function buyWebsite(page: Page, tier: "essential" | "premium" = "premium"): Promise<string> {
  // Monochrome (t13) is a regular template. Buying directly keeps these tests off the storefront.
  const res = await page.request.post("/api/checkout", {
    data: { items: [{ kind: "template", templateId: "t13", tier }], method: "gcash", buyerName: "Test Couple" },
  });
  expect(res.status()).toBe(200);
  const { weddingIds } = await res.json();
  return weddingIds[0] as string;
}

test.describe("Owner: website and guest management", () => {
  let account: TestAccount;

  test.beforeEach(async () => {
    account = await createConfirmedAccount("owner-ui");
  });

  test("OWN-01 publishing makes the site public; it is hidden from visitors until then", async ({ page, request }) => {
    await logIn(page, account.email, account.password);
    const weddingId = await buyWebsite(page);

    // A draft is not visible to a visitor.
    // The request fixture carries no cookies, so it behaves like an anonymous visitor.
    expect((await request.get(`/api/sites/${weddingId}`)).status()).toBe(404);

    await page.goto(`/dashboard/customize/${weddingId}?step=publish`);
    await page.getByRole("button", { name: "Publish website" }).click();
    await page.waitForURL(/\/wedding\/[^/]+$/);
    const slug = decodeURIComponent(new URL(page.url()).pathname.split("/").pop() ?? "");
    expect(slug).toBeTruthy();

    // Now the same anonymous visitor can open it by slug.
    const res = await request.get(`/api/sites/${slug}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).isOwner).toBe(false);

    const { data } = await adminClient().from("weddings").select("status, slug").eq("id", weddingId).single();
    expect(data).toEqual({ status: "published", slug });
  });

  test("OWN-02 a change to the couple's names is saved and survives a reload", async ({ page }) => {
    await logIn(page, account.email, account.password);
    const weddingId = await buyWebsite(page);

    await page.goto(`/dashboard/customize/${weddingId}?step=couple`);
    await page.getByLabel("Partner 1 name").fill("Ada Lovelace");

    await expect
      .poll(async () => (await adminClient().from("weddings").select("partner1_name").eq("id", weddingId).single()).data?.partner1_name, {
        timeout: 20_000,
      })
      .toBe("Ada Lovelace");

    await page.reload();
    await expect(page.getByLabel("Partner 1 name")).toHaveValue("Ada Lovelace");
  });

  test("OWN-03 an Essential website shows Premium features as locked with the price of the difference", async ({ page }) => {
    await logIn(page, account.email, account.password);
    const weddingId = await buyWebsite(page, "essential");

    await page.goto(`/dashboard/manage/${weddingId}?tab=share`);
    await expect(page.getByRole("button", { name: /Upgrade for ₱800/ }).first()).toBeVisible();
  });

  test("OWN-04 a guest added on the guest list is counted and kept", async ({ page }) => {
    await logIn(page, account.email, account.password);
    const weddingId = await buyWebsite(page);

    await page.goto(`/dashboard/manage/${weddingId}?tab=guests`);
    const form = page.locator("form").filter({ has: page.getByLabel("Guest name") });
    await form.getByLabel("Guest name").fill("Sarah Johnson");
    await form.getByLabel("Email (optional)").fill("sarah@example.com");
    await form.getByRole("button", { name: "Add guest" }).click();

    await expect(page.getByText("Sarah Johnson").first()).toBeVisible();
    await expect
      .poll(async () => {
        const { data } = await adminClient().from("guests").select("name").eq("wedding_id", weddingId);
        return data?.map((g) => g.name) ?? [];
      })
      .toContain("Sarah Johnson");
  });

  test("OWN-05 a CSV guest import with a Name column adds every row", async ({ page }) => {
    await logIn(page, account.email, account.password);
    const weddingId = await buyWebsite(page);

    await page.goto(`/dashboard/manage/${weddingId}?tab=guests`);
    await page.locator('input[type="file"][accept*="csv"]').setInputFiles({
      name: "guests.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("Name,Email\nLinus Torvalds,linus@example.com\nGrace Hopper,grace@example.com\n"),
    });
    await expect(page.getByText(/Imported 2 guests/)).toBeVisible();
    await expect
      .poll(async () => {
        const { count } = await adminClient().from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId);
        return count;
      })
      .toBe(2);
  });
});
