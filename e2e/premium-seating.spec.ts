import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { addGuest, buyWebsite, createConfirmedAccount, logIn, publishWebsite, updateWebsite, weddingRow, type TestAccount } from "./support";

// SEAT-01 … SEAT-08 in e2e/TEST_CASES.csv. The Premium seating chart.

const TABLE = { id: "t1", name: "Table 1", shape: "round", seats: 8, x: 50, y: 50 };

type Plan = { tables: { name: string; seats: number }[]; assignments: Record<string, string> };
// A new website's seating_plan column is `{}` until the first save.
const plan = async (weddingId: string): Promise<Plan> => {
  const raw = ((await weddingRow(weddingId)).seating_plan ?? {}) as Partial<Plan>;
  return { tables: raw.tables ?? [], assignments: raw.assignments ?? {} };
};

const openSeating = (page: Page, weddingId: string) => page.goto(`/dashboard/manage/${weddingId}?tab=seating`);
const tableButton = (page: Page, name = "Table 1") => page.getByRole("button", { name: new RegExp(`^${name}, \\d+ of \\d+ seats taken`) });

async function seatAt(page: Page, option: RegExp) {
  await page.getByRole("combobox", { name: "Seat a guest at Table 1" }).click();
  await page.getByRole("option", { name: option }).click();
}

test.describe("Seating chart (Premium)", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("seating");
    await logIn(page, account.email, account.password);
  });

  test("SEAT-01 adding a round table creates 'Table 1' with 8 seats", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await addGuest(id, "Martha Jones");

    await openSeating(page, id);
    await page.getByRole("button", { name: "Round table", exact: true }).click();
    await expect(page.getByRole("button", { name: "Table 1, 0 of 8 seats taken" })).toBeVisible();
    await expect.poll(async () => (await plan(id)).tables.map((t) => [t.name, t.seats]), { timeout: 15_000 }).toEqual([["Table 1", 8]]);
  });

  test("SEAT-02 seating a guest counts their whole party", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const guest = await addGuest(id, "Martha Jones", { partySize: 2 });
    await updateWebsite(id, { seating_plan: { tables: [TABLE], assignments: {}, sides: {} } });

    await openSeating(page, id);
    await tableButton(page).click();
    await seatAt(page, /^Martha Jones \(2\)$/);
    await expect(page.getByText("2 of 8 seats taken, 6 free")).toBeVisible();
    await expect(page.getByRole("button", { name: "Table 1, 2 of 8 seats taken" })).toBeVisible();
    await expect.poll(async () => (await plan(id)).assignments[guest.id], { timeout: 15_000 }).toBe("t1");
  });

  test("SEAT-03 an over-full table is flagged", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await addGuest(id, "Big Family", { partySize: 9 });
    await updateWebsite(id, { seating_plan: { tables: [TABLE], assignments: {}, sides: {} } });

    await openSeating(page, id);
    await tableButton(page).click();
    await seatAt(page, /^Big Family \(9\)$/);
    await expect(page.getByText("1 over capacity: 9 guests for 8 seats")).toBeVisible();
    await expect(page.getByRole("button", { name: "Table 1, 9 of 8 seats taken, over capacity" })).toBeVisible();
  });

  test("SEAT-04 deleting a table sends its guests back to unseated", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const guest = await addGuest(id, "Martha Jones");
    await updateWebsite(id, { seating_plan: { tables: [TABLE], assignments: { [guest.id]: "t1" }, sides: {} } });

    await openSeating(page, id);
    await tableButton(page).click();
    await page.getByRole("button", { name: "Delete table" }).click();
    await expect(tableButton(page)).toHaveCount(0);
    await expect.poll(async () => plan(id), { timeout: 15_000 }).toMatchObject({ tables: [], assignments: {} });
  });

  test("SEAT-05 the seating chart is never sent to visitors", async ({ page, request }) => {
    const id = await buyWebsite(page, "premium");
    const guest = await addGuest(id, "Martha Jones");
    const slug = await publishWebsite(id, { seating_plan: { tables: [TABLE], assignments: { [guest.id]: "t1" }, sides: {} } });

    const res = await request.get(`/api/sites/${slug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.config.seatingPlan).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain(guest.id);
  });

  test("SEAT-06 Essential: the seating chart is locked behind Premium", async ({ page }) => {
    const id = await buyWebsite(page, "essential");
    await addGuest(id, "Martha Jones");

    await openSeating(page, id);
    await expect(page.getByRole("heading", { name: "Plan your reception seating" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade for ₱800.00" })).toBeVisible();
    await expect(page.locator("[inert]").getByRole("button", { name: "Round table", exact: true })).toHaveCount(1);
  });

  test("SEAT-07 the seating chart exports to CSV", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const guest = await addGuest(id, "Martha Jones");
    await updateWebsite(id, { seating_plan: { tables: [TABLE], assignments: { [guest.id]: "t1" }, sides: {} } });

    await openSeating(page, id);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export seating chart as CSV" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/-seating\.csv$/);
    const csv = readFileSync((await download.path())!, "utf8");
    expect(csv).toMatch(/Table 1,Martha Jones/);
  });

  test("SEAT-08 declined guests are not offered a seat", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await addGuest(id, "Coming Guest");
    await addGuest(id, "Declined Guest", { status: "declined" });
    await updateWebsite(id, { seating_plan: { tables: [TABLE], assignments: {}, sides: {} } });

    await openSeating(page, id);
    await tableButton(page).click();
    await page.getByRole("combobox", { name: "Seat a guest at Table 1" }).click();
    await expect(page.getByRole("option", { name: "Coming Guest" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Declined Guest" })).toHaveCount(0);
  });
});
