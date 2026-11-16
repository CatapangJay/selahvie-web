import { test, expect, type Locator, type Page } from "@playwright/test";
import { addGuest, buyWebsite, createConfirmedAccount, logIn, publishWebsite, updateWebsite, weddingRow, type TestAccount } from "./support";

// ROOM-01 … ROOM-07 in e2e/TEST_CASES.csv. The planner's room size: a bigger
// workspace than the original 16:10 floor (~15 × 9.5 m).

type Plan = { room?: { w: number; h: number }; tables: { id: string; x: number; y: number }[] };
const plan = async (id: string) => ((await weddingRow(id)).seating_plan ?? {}) as Plan;

const round = (id: string, x: number, y: number) => ({ id, name: `Table ${id.slice(1)}`, shape: "round", seats: 8, x, y });
/** A plan plus one guest (the planner asks for a guest list before it shows the floor). */
async function seed(id: string, extra: Record<string, unknown>) {
  if (!extra.assignments) await addGuest(id, "Martha Jones");
  await updateWebsite(id, { seating_plan: { tables: [], elements: [], assignments: {}, sides: {}, ...extra } });
}

const openSeating = (page: Page, id: string) => page.goto(`/dashboard/manage/${id}?tab=seating`);
/** The toolbar's first tab: "Plan" on wide screens, "Home" on narrower ones. */
async function baseTab(page: Page) {
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: /^(Plan|Home)$/ }).click();
}
const onPlan = (page: Page, name: string): Locator => page.getByRole("button", { name: new RegExp(`^${name}, \\d+ of \\d+ seats taken`) });
const floor = (page: Page) => onPlan(page, "Table 1").locator("xpath=ancestor::div[contains(@style,'aspect-ratio')][1]");

async function openRoomSize(page: Page) {
  await baseTab(page);
  await page.getByRole("button", { name: "Room size", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Room size" });
  await expect(menu).toBeVisible();
  return menu;
}

/** Nudges the focused table with Shift+Arrow (5 units a press). */
async function nudge(page: Page, name: string, key: "ArrowRight" | "ArrowDown", presses: number) {
  await onPlan(page, name).focus();
  for (let i = 0; i < presses; i++) await page.keyboard.press(`Shift+${key}`);
}

test.describe("Seating room size (Premium)", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("room");
    await logIn(page, account.email, account.password);
  });

  test("ROOM-01 the original room stops tables at its walls; a wider room lets them go further", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await seed(id, { tables: [round("t1", 86, 50)] });
    await openSeating(page, id);

    // The reported limit: the table stops at the old edge.
    await nudge(page, "Table 1", "ArrowRight", 6);
    await expect.poll(async () => (await plan(id)).tables[0].x, { timeout: 15_000 }).toBe(96);

    // Widen the room to 30 m (200 units) and keep going.
    const menu = await openRoomSize(page);
    await expect(menu.getByText("15 m")).toBeVisible();
    for (let i = 0; i < 15; i++) await menu.getByRole("button", { name: "Add a metre of width" }).click();
    await expect(menu.getByText("30 m")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await plan(id)).room?.w, { timeout: 15_000 }).toBe(200);
    await expect(floor(page)).toHaveAttribute("style", /aspect-ratio: 200 \/ 62\.5/);

    await nudge(page, "Table 1", "ArrowRight", 10);
    await expect.poll(async () => (await plan(id)).tables[0].x, { timeout: 15_000 }).toBe(146);
    await page.screenshot({ path: "test-results/seating-room/wide-room.png" });
  });

  test("ROOM-02 a longer room lets tables go further down, and keeps their size on screen", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await seed(id, { tables: [round("t1", 50, 90)] });
    await openSeating(page, id);
    const before = await onPlan(page, "Table 1").boundingBox();

    const menu = await openRoomSize(page);
    for (let i = 0; i < 10; i++) await menu.getByRole("button", { name: "Add a metre of length" }).click();
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await plan(id)).room?.h, { timeout: 15_000 }).toBeGreaterThan(62.5);

    const after = await onPlan(page, "Table 1").boundingBox();
    expect(Math.abs(after!.width - before!.width)).toBeLessThan(1);

    await nudge(page, "Table 1", "ArrowDown", 8);
    await expect.poll(async () => (await plan(id)).tables[0].y, { timeout: 15_000 }).toBe(130);
  });

  test("ROOM-03 the room can't be made smaller than what's placed in it", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    // A 30 m room with a table near its right wall (x 180 + chairs ≈ 189 units ≈ 28.5 m).
    await seed(id, { room: { w: 200, h: 62.5 }, tables: [round("t1", 180, 50)] });
    await openSeating(page, id);

    const menu = await openRoomSize(page);
    const shrink = menu.getByRole("button", { name: "Remove a metre of width" });
    await shrink.click();
    await shrink.click();
    await expect(shrink).toBeDisabled();
    await expect(menu.getByText("28.5 m")).toBeVisible();
    await expect(menu.getByRole("button", { name: "Standard size" })).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await plan(id)).room?.w, { timeout: 15_000 }).toBe(190);
    expect((await plan(id)).tables[0].x).toBe(180);
  });

  test("ROOM-04 'Fit to layout' shrinks the room around what's placed; 'Standard size' restores the original", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await seed(id, { room: { w: 300, h: 250 }, tables: [round("t1", 20, 20)] });
    await openSeating(page, id);

    let menu = await openRoomSize(page);
    await menu.getByRole("button", { name: "Fit to layout" }).click();
    await expect(menu.getByText("8 m")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await plan(id)).room, { timeout: 15_000 }).toEqual({ w: 53.3, h: 53.3 });

    menu = await openRoomSize(page);
    await menu.getByRole("button", { name: "Standard size" }).click();
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await plan(id)).room, { timeout: 15_000 }).toBeUndefined();
  });

  test("ROOM-05 'Fit the whole room' zooms out until the whole floor is in view", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await seed(id, { room: { w: 400, h: 250 }, tables: [round("t1", 20, 20), round("t2", 380, 380)] });
    await openSeating(page, id);

    const rail = page.getByRole("toolbar", { name: "Floor plan view" });
    const canvas = rail.locator("xpath=..");
    await expect(onPlan(page, "Table 2")).not.toBeInViewport();
    await rail.getByRole("button", { name: "Fit the whole room" }).click();
    await expect(onPlan(page, "Table 2")).toBeInViewport();
    const box = await floor(page).boundingBox();
    const frame = await canvas.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(frame!.width + 1);
    expect(box!.height).toBeLessThanOrEqual(frame!.height + 1);
    await page.screenshot({ path: "test-results/seating-room/fit-room.png" });
  });

  test("ROOM-06 plans saved before room sizes keep their layout", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await seed(id, { tables: [round("t1", 50, 50)] });
    await openSeating(page, id);

    const t = (await onPlan(page, "Table 1").boundingBox())!;
    const f = (await floor(page).boundingBox())!;
    expect(Math.abs(t.x + t.width / 2 - (f.x + f.width / 2))).toBeLessThan(2);
    expect(Math.abs(t.y + t.height / 2 - (f.y + f.height / 2))).toBeLessThan(2);
    await expect(floor(page)).toHaveAttribute("style", /aspect-ratio: 100 \/ 62\.5/);
    expect((await plan(id)).room).toBeUndefined();
  });

  test("ROOM-07 the guest table finder draws and routes in a big room", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    const g = await addGuest(id, "Rosa Delgado", { status: "attending" });
    await seed(id, {
      room: { w: 240, h: 150 },
      tables: [round("t1", 30, 30), round("t2", 120, 120), round("t3", 210, 200)],
      elements: [{ id: "door", kind: "entrance", label: "Main entrance", shape: "rect", x: 120, y: 236, w: 10, h: 2.5 }],
      assignments: { [g.id]: "t3" },
      guestFinder: true,
    });

    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const guest = await ctx.newPage();
    await guest.goto(`/wedding/${slug}/seat`);
    await guest.getByLabel("Your name").fill("Rosa Delgado");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByRole("heading", { name: "Table 3" })).toBeVisible();
    await expect(guest.getByTestId("seat-map-route")).toHaveCount(1);
    await guest.getByRole("button", { name: "Whole room" }).click();
    await expect(guest.getByTestId("seat-map")).toHaveAttribute("viewBox", "0 0 240 150");
    await guest.waitForTimeout(2_000);
    await guest.getByTestId("seat-map").screenshot({ path: "test-results/seating-room/finder-big-room.png" });
    await ctx.close();
  });
});
