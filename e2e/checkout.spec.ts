import { test, expect, type Page } from "@playwright/test";
import { adminClient, createConfirmedAccount, logIn, type TestAccount } from "./support";

// CHK-01 … CHK-07 in e2e/TEST_CASES.md. Buying a website through the storefront.

// Monochrome (t13): a regular, non-personalized template, sold at 9,900 PHP base.
const TEMPLATE_PATH = "/templates/t13";
const TEMPLATE_NAME = "Monochrome";

async function addTemplateToCart(page: Page) {
  await page.goto(TEMPLATE_PATH);
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await expect(page.getByRole("button", { name: "View in cart", exact: true })).toBeVisible();
  // Adding to cart opens the drawer over the page; close it so the page underneath is usable.
  await page.getByRole("button", { name: "Close cart" }).click();
}

async function payWithGcash(page: Page, mobile = "09171234567") {
  await page.getByLabel(/mobile/i).fill(mobile);
  await page.getByRole("button", { name: /^Pay / }).click();
  await page.waitForURL(/\/checkout\/success/);
}

test.describe("Storefront checkout", () => {
  let account: TestAccount;

  test.beforeEach(async () => {
    account = await createConfirmedAccount("checkout");
  });

  test("CHK-01 a couple buys a template, pays with GCash and sees it on the dashboard", async ({ page }) => {
    await logIn(page, account.email, account.password);
    await addTemplateToCart(page);

    await page.goto("/checkout");
    await payWithGcash(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByText(TEMPLATE_NAME).first()).toBeVisible();
    await expect(page.getByText("1 website")).toBeVisible();
  });

  test("CHK-02 card payment with an invalid card number is blocked before any charge", async ({ page }) => {
    await logIn(page, account.email, account.password);
    await addTemplateToCart(page);
    await page.goto("/checkout");

    await page.getByRole("radio", { name: "Card", exact: true }).click();
    await page.getByLabel("Card number").fill("4242 4242");
    await page.getByLabel("Expiry date").fill("12/30");
    await page.getByLabel("CVC").fill("123");
    await page.getByRole("button", { name: /^Pay / }).click();

    await expect(page.getByText("Enter a valid 16-digit card number")).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test("CHK-03 checkout requires a full name", async ({ page }) => {
    await logIn(page, account.email, account.password);
    await addTemplateToCart(page);
    await page.goto("/checkout");

    await page.getByLabel("Full name").fill("");
    await page.getByLabel(/mobile/i).fill("09171234567");
    await page.getByRole("button", { name: /^Pay / }).click();
    await expect(page.getByText("Full name is required")).toBeVisible();
  });

  test("CHK-04 an empty cart explains itself and offers the templates", async ({ page }) => {
    await logIn(page, account.email, account.password);
    await page.goto("/checkout");
    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse templates" }).first()).toBeVisible();
  });

  test("CHK-05 the cart survives a page reload", async ({ page }) => {
    await logIn(page, account.email, account.password);
    await addTemplateToCart(page);
    await page.reload();
    await expect(page.getByRole("button", { name: "View in cart", exact: true })).toBeVisible();
  });

  test("CHK-06 an Essential website can be upgraded to Premium for the difference only", async ({ page }) => {
    await logIn(page, account.email, account.password);
    // Set up an Essential website directly (the storefront defaults new carts to Premium).
    const setup = await page.request.post("/api/checkout", {
      data: { items: [{ kind: "template", templateId: "t13", tier: "essential" }], method: "gcash", buyerName: account.name },
    });
    expect(setup.status()).toBe(200);
    const { weddingIds } = await setup.json();
    const data = { id: weddingIds[0] as string };

    // Premium-only features show an upgrade prompt with the price of the difference (₱800).
    await page.goto(`/dashboard/manage/${data.id}?tab=share`);
    await page.getByRole("button", { name: /Upgrade for ₱800/ }).first().click();

    await page.goto("/checkout");
    await expect(page.getByText("Premium upgrade")).toBeVisible();
    await expect(page.getByText("₱800.00").first()).toBeVisible();
    await payWithGcash(page);
    await expect(page.getByText(/upgrade is unlocked/)).toBeVisible();

    const { data: after } = await adminClient().from("weddings").select("tier").eq("id", data.id).single();
    expect(after?.tier).toBe("premium");
  });

  test("CHK-07 a payment that fails on the server shows the error and charges nothing", async ({ page }) => {
    // The server rejects an unknown template even if the browser cart is stale. Simulate a
    // stale cart by injecting a template id that no longer exists.
    await logIn(page, account.email, account.password);
    await page.evaluate(() => {
      const state = { state: { items: [{ kind: "template", templateId: "retired-template", tier: "essential", template: { id: "retired-template", name: "Retired" } }] }, version: 0 };
      localStorage.setItem("selahvie-cart", JSON.stringify(state));
    });
    await page.goto("/checkout");
    await page.getByLabel(/mobile/i).fill("09171234567");
    await page.getByRole("button", { name: /^Pay / }).click();
    await expect(page.getByText("One of the templates in your cart no longer exists.")).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });
});
