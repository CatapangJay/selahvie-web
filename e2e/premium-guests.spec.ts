import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import {
  addGuest,
  adminClient,
  buyWebsite,
  createConfirmedAccount,
  guestRow,
  logIn,
  publishWebsite,
  updateWebsite,
  weddingRow,
  type TestAccount,
} from "./support";

// GST-01 … GST-09 in e2e/TEST_CASES.csv. The couple managing their guest list.

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const openGuests = (page: Page, weddingId: string) => page.goto(`/dashboard/manage/${weddingId}?tab=guests`);

async function pick(page: Page, combobox: string, option: string) {
  await page.getByRole("combobox", { name: combobox }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

const importCsv = (page: Page, csv: string) =>
  page.locator('input[type="file"][accept*="csv"]').setInputFiles({ name: "guests.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });

test.describe("Guest list management", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("guests");
    await logIn(page, account.email, account.password);
  });

  test("GST-01 Premium: each guest has a personal invite link", async ({ page, baseURL }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    const guest = await addGuest(id, "Clara Oswald");

    await openGuests(page, id);
    await page.getByRole("button", { name: "Copy invite link for Clara Oswald" }).click();
    await expect(page.getByText("Invite link for Clara Oswald copied.")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(`${baseURL}/wedding/${slug}?invite=${guest.code}`);
  });

  test("GST-02 Essential: personal invite links are locked behind Premium", async ({ page }) => {
    const id = await buyWebsite(page, "essential");
    await addGuest(id, "Rory Williams");

    await openGuests(page, id);
    await expect(page.getByText("Rory Williams").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade for ₱800.00" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy invite link for Rory Williams" })).toHaveCount(0);
  });

  test("GST-03 a group is created and a guest is added to it", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const guest = await addGuest(id, "Amy Pond");

    await openGuests(page, id);
    await page.getByLabel("New group name").fill("Family");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByRole("button", { name: "Copy group invite link for Family" })).toBeVisible();

    await page.getByRole("button", { name: "Show details for Amy Pond" }).click();
    await page.getByRole("checkbox", { name: "Family" }).check();

    await expect
      .poll(async () => {
        const { data } = await adminClient().from("guest_group_members").select("guest_id, guest_groups(name)").eq("guest_id", guest.id);
        return (data ?? []).map((m) => (m.guest_groups as unknown as { name: string }).name);
      }, { timeout: 15_000 })
      .toEqual(["Family"]);
  });

  test("GST-04 changing a guest's status is saved", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const guest = await addGuest(id, "Donna Noble");

    await openGuests(page, id);
    await pick(page, "Status for Donna Noble", "Pending");
    await expect.poll(async () => (await guestRow(guest.id))?.status, { timeout: 15_000 }).toBe("pending");
  });

  test("GST-05 removing a seated guest deletes them and frees their seat", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const guest = await addGuest(id, "Martha Jones", { partySize: 2 });
    await updateWebsite(id, {
      seating_plan: { tables: [{ id: "t1", name: "Table 1", shape: "round", seats: 8, x: 50, y: 50 }], assignments: { [guest.id]: "t1" }, sides: {} },
    });

    await openGuests(page, id);
    await page.getByRole("button", { name: "Remove Martha Jones" }).click();
    await expect(page.getByText("Martha Jones")).toHaveCount(0);

    await expect.poll(async () => await guestRow(guest.id), { timeout: 15_000 }).toBeNull();
    await expect
      .poll(async () => ((await weddingRow(id)).seating_plan as { assignments: Record<string, string> }).assignments, { timeout: 15_000 })
      .not.toHaveProperty(guest.id);
  });

  test("GST-06 CSV import creates groups and skips guests already on the list", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const csv = "Name,Email,Group\nSarah Jane Smith,sarah@example.com,School friends\nK Nine,k9@example.com,School friends\n";

    await openGuests(page, id);
    await importCsv(page, csv);
    await expect(page.getByText("Imported 2 guests, created 1 group.")).toBeVisible();

    await importCsv(page, csv);
    await expect(page.getByText("Imported 0 guests, skipped 2 already on your list.")).toBeVisible();

    await expect
      .poll(async () => (await adminClient().from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", id)).count, { timeout: 15_000 })
      .toBe(2);
    const { data: groups } = await adminClient().from("guest_groups").select("name").eq("wedding_id", id);
    expect(groups?.map((g) => g.name)).toEqual(["School friends"]);
  });

  test("GST-07 a CSV without a Name column is rejected with guidance", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await openGuests(page, id);
    await importCsv(page, "Email,Party size\nx@example.com,2\n");
    await expect(page.getByText(/Couldn't find a Name column/)).toBeVisible();
    const { count } = await adminClient().from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", id);
    expect(count).toBe(0);
  });

  test("GST-08 Premium export includes each guest's invite code and link", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id);
    const guest = await addGuest(id, "Wilfred Mott");

    await openGuests(page, id);
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
    const csv = readFileSync((await download.path())!, "utf8");
    const [header] = csv.split(/\r?\n/);
    expect(header).toContain("Invite code");
    expect(header).toContain("Invite link");
    expect(csv).toContain("Wilfred Mott");
    expect(csv).toContain(`?invite=${guest.code}`);
  });

  test("GST-09 filtering by status shows only matching guests", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await addGuest(id, "Jack Harkness", { status: "attending" });
    await addGuest(id, "River Song", { status: "declined" });

    await openGuests(page, id);
    await pick(page, "Filter by status", "Declined");
    await expect(page.getByRole("button", { name: "Remove River Song" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove Jack Harkness" })).toHaveCount(0);
  });
});
