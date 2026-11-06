import { readFileSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { addGuest, buyWebsite, createConfirmedAccount, logIn, publishWebsite, updateWebsite, weddingRow, type SeededGuest } from "./support";

// TB-01 … TB-21 in e2e/TEST_CASES.csv. The seating planner's Office-style ribbon
// (components/manage/seating/Toolbar.tsx, SelectionRibbon.tsx) and the floor plan around it.

// Every ribbon group fits one "Plan" tab at 1420px and up; TB-17 checks the narrower layout.
test.use({ viewport: { width: 1600, height: 1000 } });

type Table = { id: string; name: string; shape: string; seats: number; x: number; y: number; tag?: string; rotation?: number; seatSides?: number; endSeats?: number; sweep?: number; sBend?: boolean };
type Element = { id: string; kind: string; label: string; shape: string; x: number; y: number; w: number; h: number; rotation?: number };
type Plan = { tables: Table[]; elements: Element[]; assignments: Record<string, string> };

const table = (id: string, name: string, x: number, y = 50, extra: Partial<Table> = {}): Table => ({ id, name, shape: "round", seats: 8, x, y, ...extra });

async function plan(weddingId: string): Promise<Plan> {
  const raw = ((await weddingRow(weddingId)).seating_plan ?? {}) as Partial<Plan>;
  return { tables: raw.tables ?? [], elements: raw.elements ?? [], assignments: raw.assignments ?? {} };
}
const seed = (weddingId: string, p: Partial<Plan>) =>
  updateWebsite(weddingId, { seating_plan: { tables: [], elements: [], assignments: {}, sides: {}, ...p } });

/** The studio saves ~600 ms after the last change. */
const pollPlan = <T>(weddingId: string, pick: (p: Plan) => T) => expect.poll(async () => pick(await plan(weddingId)), { timeout: 15_000 });

// ── Locators ──
// The floor plan has its own zoom/lock/focus buttons, so ribbon commands are looked up inside the ribbon.
const ribbon = (page: Page, tab = "Plan") => page.getByRole("tabpanel", { name: tab, exact: true });
const quick = (page: Page) => page.getByRole("group", { name: "Quick access" });
const canvasRail = (page: Page) => page.getByRole("toolbar", { name: "Floor plan view" });
const onPlan = (page: Page, name: string): Locator => page.getByRole("button", { name: new RegExp(`^${name}, \\d+ of \\d+ seats taken`) });
const feature = (page: Page, label: string) => page.getByRole("button", { name: `${label}, room feature` });

async function showPlanTab(page: Page) {
  const tab = page.getByRole("tab", { name: "Plan", exact: true });
  if ((await tab.getAttribute("aria-selected")) !== "true") await tab.click();
}

async function openSeating(page: Page, weddingId: string) {
  await page.goto(`/dashboard/manage/${weddingId}?tab=seating`);
  await expect(page.getByRole("tablist", { name: "Toolbar" })).toBeVisible();
}

/** A Premium website with a few guests, signed in and ready to plan. */
async function setup(page: Page, guestNames = ["Amy Pond", "Rory Williams"]) {
  const account = await createConfirmedAccount("toolbar");
  await logIn(page, account.email, account.password);
  const id = await buyWebsite(page, "premium");
  const guests: SeededGuest[] = [];
  for (const name of guestNames) guests.push(await addGuest(id, name));
  return { id, guests };
}

test.describe("Seating toolbar", () => {
  test("TB-01 the ribbon shows every command group, with output commands disabled on an empty plan", async ({ page }) => {
    const { id } = await setup(page);
    await openSeating(page, id);

    await expect(page.getByRole("tab", { name: "Plan", exact: true })).toHaveAttribute("aria-selected", "true");
    for (const group of ["Tables", "Room", "View", "Print or export"]) {
      await expect(ribbon(page).getByRole("group", { name: group, exact: true }), group).toBeVisible();
    }
    for (const name of ["Undo", "Redo", "Print floor plan", "Export seating chart as CSV"]) {
      await expect(quick(page).getByRole("button", { name }), name).toBeDisabled();
    }
    for (const name of ["Print floor plan", "Print table list", "Print guest lookup", "Download seating CSV"]) {
      await expect(ribbon(page).getByRole("button", { name }), name).toBeDisabled();
    }
    await expect(ribbon(page).getByRole("button", { name: "Round table", exact: true })).toBeEnabled();

    // One table switches the output commands on.
    await ribbon(page).getByRole("button", { name: "Round table", exact: true }).click();
    await showPlanTab(page);
    await expect(ribbon(page).getByRole("button", { name: "Print table list" })).toBeEnabled();
    await expect(quick(page).getByRole("button", { name: "Export seating chart as CSV" })).toBeEnabled();
  });

  test("TB-02 each table shape button adds a table with its default seats", async ({ page }) => {
    const { id } = await setup(page);
    await openSeating(page, id);

    for (const name of ["Round table", "Long table", "Half-moon", "S-curve"]) {
      await showPlanTab(page);
      await ribbon(page).getByRole("button", { name, exact: true }).click();
      // Adding a table selects it, which opens the contextual Table tab.
      await expect(page.getByRole("tab", { name: "Table", exact: true })).toHaveAttribute("aria-selected", "true");
    }

    await pollPlan(id, (p) => p.tables.map((t) => [t.name, t.shape, t.seats])).toEqual([
      ["Table 1", "round", 8],
      ["Table 2", "rect", 10],
      ["Table 3", "arc", 6],
      ["Table 4", "curve", 12],
    ]);
    for (const [name, seats] of [["Table 1", 8], ["Table 2", 10], ["Table 3", 6], ["Table 4", 12]] as const) {
      await expect(page.getByRole("button", { name: `${name}, 0 of ${seats} seats taken` })).toBeVisible();
    }
  });

  test("TB-03 'Several' adds a batch of tables in one step", async ({ page }) => {
    const { id } = await setup(page);
    await openSeating(page, id);

    await ribbon(page).getByRole("button", { name: "Several" }).click();
    const menu = page.getByRole("dialog", { name: "Several" });
    await menu.getByRole("button", { name: "Long", exact: true }).click();
    await expect(menu.getByRole("button", { name: "Long", exact: true })).toHaveAttribute("aria-pressed", "true");
    await menu.getByRole("button", { name: "Remove a table" }).click({ clickCount: 2 });
    await menu.getByRole("button", { name: "Add a seat" }).click({ clickCount: 2 });
    await menu.getByRole("button", { name: "Add 3 tables · 36 seats" }).click();
    await expect(menu).toBeHidden();

    await pollPlan(id, (p) => p.tables.map((t) => [t.shape, t.seats])).toEqual([["rect", 12], ["rect", 12], ["rect", 12]]);
    await expect(page.getByText("3 tables, 36 seats")).toBeVisible();
  });

  test("TB-04 undo and redo work from the toolbar and the keyboard", async ({ page }) => {
    const { id } = await setup(page);
    await openSeating(page, id);
    const undo = quick(page).getByRole("button", { name: "Undo" });
    const redo = quick(page).getByRole("button", { name: "Redo" });

    await ribbon(page).getByRole("button", { name: "Round table", exact: true }).click();
    await showPlanTab(page);
    await ribbon(page).getByRole("button", { name: "Long table", exact: true }).click();
    await pollPlan(id, (p) => p.tables.length).toBe(2);

    await undo.click();
    await pollPlan(id, (p) => p.tables.map((t) => t.name)).toEqual(["Table 1"]);
    await expect(redo).toBeEnabled();
    await redo.click();
    await pollPlan(id, (p) => p.tables.length).toBe(2);
    await expect(redo).toBeDisabled();

    await page.locator("body").press("Control+z");
    await pollPlan(id, (p) => p.tables.length).toBe(1);
    await page.locator("body").press("Control+z");
    await pollPlan(id, (p) => p.tables.length).toBe(0);
    await expect(undo).toBeDisabled();

    await page.locator("body").press("Control+Shift+z");
    await pollPlan(id, (p) => p.tables.length).toBe(1);
    await page.locator("body").press("Control+y");
    await pollPlan(id, (p) => p.tables.length).toBe(2);
  });

  test("TB-05 selecting a table opens its Table tab; name and tag edits are saved, a name is one undo step", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 40)] });
    await openSeating(page, id);

    await onPlan(page, "Table 1").click();
    await expect(page.getByRole("tab", { name: "Table", exact: true })).toHaveAttribute("aria-selected", "true");
    const name = ribbon(page, "Table").getByRole("textbox", { name: "Table name" });
    await name.fill("");
    await name.pressSequentially("Family");
    await pollPlan(id, (p) => p.tables[0].name).toBe("Family");

    // Typing a name, key by key, collapses into a single undo step.
    await quick(page).getByRole("button", { name: "Undo" }).click();
    await pollPlan(id, (p) => p.tables[0].name).toBe("Table 1");
    await expect(name).toHaveValue("Table 1");

    await ribbon(page, "Table").getByLabel("Tag", { exact: true }).fill("VIP");
    await ribbon(page, "Table").getByLabel("Tag", { exact: true }).blur();
    await pollPlan(id, (p) => p.tables[0].tag).toBe("VIP");
  });

  test("TB-06 Table tab: shape, chairs-on sides and seat count are saved", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 40)] });
    await openSeating(page, id);
    await onPlan(page, "Table 1").click();
    const r = ribbon(page, "Table");

    await expect(r.getByRole("group", { name: "Chairs on" })).toHaveCount(0);
    await r.getByRole("button", { name: "Long", exact: true }).click();
    await expect(r.getByRole("group", { name: "Chairs on" })).toBeVisible();
    await r.getByRole("button", { name: "All sides" }).click();
    await expect(r.getByRole("button", { name: "All sides" })).toHaveAttribute("aria-pressed", "true");
    await r.getByRole("button", { name: "Add a chair on each long side" }).click();
    await pollPlan(id, (p) => {
      const t = p.tables[0];
      return [t.shape, t.seatSides, t.endSeats, t.seats];
    }).toEqual(["rect", 4, 1, 10]);

    await r.getByRole("button", { name: "Round", exact: true }).click();
    await expect(r.getByRole("group", { name: "Chairs on" })).toHaveCount(0);
    await r.getByRole("button", { name: "Add a seat" }).click();
    await pollPlan(id, (p) => [p.tables[0].shape, p.tables[0].seats]).toEqual(["round", 11]);
  });

  test("TB-07 duplicate, delete and the Delete key work on the selected table; a locked layout protects it", async ({ page }) => {
    const { id, guests } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 30), table("t2", "Table 2", 70)], assignments: { [guests[0].id]: "t1" } });
    await openSeating(page, id);

    // Locked: Delete does nothing and the planner says why.
    await onPlan(page, "Table 1").click();
    await canvasRail(page).getByRole("button", { name: "Lock layout" }).click();
    await expect(page.getByText("Layout locked. Tables and features stay put while you seat guests.")).toBeVisible();
    await onPlan(page, "Table 1").press("Delete");
    await expect(onPlan(page, "Table 1")).toBeVisible();
    await canvasRail(page).getByRole("button", { name: "Unlock layout" }).click();

    // Delete key on the selected table removes it and frees its guest's seat.
    await onPlan(page, "Table 1").press("Delete");
    await expect(onPlan(page, "Table 1")).toHaveCount(0);
    await pollPlan(id, (p) => [p.tables.map((t) => t.id), p.assignments]).toEqual([["t2"], {}]);

    // Duplicate takes the lowest free name; Delete table removes the copy.
    await onPlan(page, "Table 2").click();
    await ribbon(page, "Table").getByRole("button", { name: "Duplicate" }).click();
    await expect(page.getByRole("button", { name: "Table 1, 0 of 8 seats taken" })).toBeVisible();
    await pollPlan(id, (p) => p.tables.map((t) => t.name)).toEqual(["Table 2", "Table 1"]);
    await ribbon(page, "Table").getByRole("button", { name: "Delete table" }).click();
    await pollPlan(id, (p) => p.tables.map((t) => t.name)).toEqual(["Table 2"]);
  });

  test("TB-08 room features are added from the Room group and the Features menu", async ({ page }) => {
    const { id } = await setup(page);
    await openSeating(page, id);

    for (const name of ["Stage", "Dance floor", "Grazing table", "Photo booth", "Custom area", "Custom oval"]) {
      await showPlanTab(page);
      await ribbon(page).getByRole("group", { name: "Room" }).getByRole("button", { name, exact: true }).click();
      await expect(page.getByRole("tab", { name: "Feature", exact: true })).toHaveAttribute("aria-selected", "true");
    }
    await showPlanTab(page);
    await ribbon(page).getByRole("button", { name: "Features" }).click();
    await page.getByRole("dialog", { name: "Features" }).getByRole("button", { name: "Bar", exact: true }).click();

    await pollPlan(id, (p) => p.elements.map((e) => [e.kind, e.shape])).toEqual([
      ["stage", "rect"],
      ["danceFloor", "rect"],
      ["grazing", "rect"],
      ["photobooth", "rect"],
      ["custom", "rect"],
      ["custom", "ellipse"],
      ["bar", "rect"],
    ]);
    await expect(feature(page, "Stage")).toBeVisible();
    await expect(feature(page, "Bar")).toBeVisible();
  });

  test("TB-09 Feature tab: label, shape, size, rotation, duplicate and remove are saved", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, { elements: [{ id: "e1", kind: "stage", label: "Stage", shape: "rect", x: 50, y: 15, w: 34, h: 8 }] });
    await openSeating(page, id);

    await feature(page, "Stage").click();
    const r = ribbon(page, "Feature");
    await r.getByRole("textbox", { name: "Label" }).fill("Main stage");
    await r.getByRole("button", { name: "Oval" }).click();
    await r.getByRole("button", { name: "Add a unit of width" }).click();
    await r.getByRole("button", { name: "Add a unit of depth" }).click();
    await r.getByRole("button", { name: "Rotate 90°" }).click();
    await pollPlan(id, (p) => {
      const e = p.elements[0];
      return [e.label, e.shape, e.w, e.h, e.rotation];
    }).toEqual(["Main stage", "ellipse", 35, 9, 90]);

    await r.getByRole("button", { name: "Duplicate" }).click();
    await pollPlan(id, (p) => p.elements.length).toBe(2);
    await ribbon(page, "Feature").getByRole("button", { name: "Remove", exact: true }).click();
    await pollPlan(id, (p) => p.elements.map((e) => e.id)).toEqual(["e1"]);
  });

  test("TB-10 curved tables: single bend or S-curve and bend angle; rotation for non-round tables only", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, {
      // Far apart, so Table 1's pinned guest card doesn't cover Table 2.
      tables: [table("t1", "Table 1", 15, 25, { shape: "curve", seats: 12, sweep: 90, sBend: true }), table("t2", "Table 2", 88, 85)],
    });
    await openSeating(page, id);

    await onPlan(page, "Table 1").click();
    const r = ribbon(page, "Table");
    await expect(r.getByRole("button", { name: "S-curve" })).toHaveAttribute("aria-pressed", "true");
    await r.getByRole("button", { name: "Single bend" }).click();
    await r.getByRole("button", { name: "Add 15° of bend" }).click();
    await r.getByRole("button", { name: "Rotate 90°" }).click();
    await pollPlan(id, (p) => [p.tables[0].sBend, p.tables[0].sweep, p.tables[0].rotation]).toEqual([false, 105, 90]);
    await r.getByRole("button", { name: "Reset" }).click();
    await pollPlan(id, (p) => p.tables[0].rotation ?? 0).toBe(0);

    await onPlan(page, "Table 2").click();
    await expect(ribbon(page, "Table").getByRole("group", { name: "Rotate" })).toHaveCount(0);
    await expect(ribbon(page, "Table").getByRole("group", { name: "Curve" })).toHaveCount(0);
  });

  test("TB-11 arrow keys nudge the selected table; Shift moves further; a locked layout stays put", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 50, 50)] });
    await openSeating(page, id);

    await onPlan(page, "Table 1").click();
    await onPlan(page, "Table 1").press("ArrowRight");
    await pollPlan(id, (p) => [p.tables[0].x, p.tables[0].y]).toEqual([51, 50]);
    await onPlan(page, "Table 1").press("Shift+ArrowDown");
    await pollPlan(id, (p) => [p.tables[0].x, p.tables[0].y]).toEqual([51, 55]);

    await canvasRail(page).getByRole("button", { name: "Lock layout" }).click();
    await onPlan(page, "Table 1").press("ArrowLeft");
    await page.waitForTimeout(1_500); // longer than the save delay
    expect((await plan(id)).tables[0].x).toBe(51);
  });

  test("TB-12 View group: zoom in, zoom out, reset and list view", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 40)] });
    await openSeating(page, id);
    const level = canvasRail(page).getByLabel("Zoom level");
    const view = ribbon(page).getByRole("group", { name: "View" });

    await expect(level).toHaveText("100%");
    await view.getByRole("button", { name: "Zoom in" }).click();
    await expect(level).toHaveText("125%");
    await view.getByRole("button", { name: "Zoom out" }).click();
    await view.getByRole("button", { name: "Zoom out" }).click();
    await expect(level).toHaveText("80%");
    await view.getByRole("button", { name: "Reset zoom to 100%" }).click();
    await expect(level).toHaveText("100%");
    await expect(view.getByRole("button", { name: "Reset zoom to 100%" })).toBeDisabled();

    await view.getByRole("button", { name: "List", exact: true }).click();
    await expect(view.getByRole("button", { name: "List", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: /Not seated/ })).toBeVisible();
    await expect(page.getByLabel("Table name")).toHaveValue("Table 1");
    await expect(view.getByRole("button", { name: "Zoom in" })).toBeDisabled();

    await view.getByRole("button", { name: "Floor plan", exact: true }).click();
    await expect(onPlan(page, "Table 1")).toBeVisible();
  });

  test("TB-13 focus view opens full-screen and Escape closes it", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 40)] });
    await openSeating(page, id);

    await ribbon(page).getByRole("button", { name: "Focus view" }).click();
    const dialog = page.getByRole("dialog", { name: "Seating plan, focus view" });
    await expect(dialog).toBeVisible();
    await expect(ribbon(page).getByRole("button", { name: "Exit focus" })).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(ribbon(page).getByRole("button", { name: "Focus view" })).toBeVisible();
  });

  test("TB-14 print floor plan, table list and guest lookup open the print sheet with the right content", async ({ page }) => {
    // Record what each print would put on paper instead of opening the print dialog.
    await page.addInitScript(() => {
      const w = window as unknown as { __prints: (string | null)[] };
      w.__prints = [];
      window.print = () => {
        w.__prints.push(document.querySelector("[data-seating-print]")?.textContent ?? null);
        setTimeout(() => window.dispatchEvent(new Event("afterprint")), 0);
      };
    });
    const { id, guests } = await setup(page, ["Amy Pond", "Rory Williams", "Clara Oswald"]);
    await updateWebsite(id, { partner1_name: "Ada", partner2_name: "Ben" });
    await seed(id, {
      tables: [table("t1", "Head table", 30), table("t2", "Garden", 70)],
      assignments: { [guests[0].id]: "t1", [guests[1].id]: "t2" },
    });
    await openSeating(page, id);
    const prints = () => page.evaluate(() => (window as unknown as { __prints: (string | null)[] }).__prints);
    const printGroup = ribbon(page).getByRole("group", { name: "Print or export" });

    await quick(page).getByRole("button", { name: "Print floor plan" }).click();
    await expect.poll(async () => (await prints()).length).toBe(1);
    expect((await prints())[0]).toContain("Floor plan");
    expect((await prints())[0]).toContain("Amy Pond");

    await printGroup.getByRole("checkbox", { name: "Include names" }).uncheck();
    await printGroup.getByRole("button", { name: "Print floor plan" }).click();
    await expect.poll(async () => (await prints()).length).toBe(2);
    expect((await prints())[1]).not.toContain("Amy Pond");

    await printGroup.getByRole("button", { name: "Print table list" }).click();
    await expect.poll(async () => (await prints()).length).toBe(3);
    expect((await prints())[2]).toMatch(/Table list[\s\S]*Head table[\s\S]*Amy Pond/);

    await printGroup.getByRole("button", { name: "Print guest lookup" }).click();
    await expect.poll(async () => (await prints()).length).toBe(4);
    const lookup = (await prints())[3]!;
    expect(lookup).toContain("Find your table");
    expect(lookup).toMatch(/Amy Pond\s*Head table/);
    expect(lookup).toMatch(/Clara Oswald\s*Not seated/);
    expect(lookup).toMatch(/Rory Williams\s*Garden/);
  });

  test("TB-15 the seating CSV from the toolbar includes tags and unseated guests", async ({ page }) => {
    const { id, guests } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 40, 50, { tag: "Family" })], assignments: { [guests[0].id]: "t1" } });
    await openSeating(page, id);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      ribbon(page).getByRole("button", { name: "Download seating CSV" }).click(),
    ]);
    const lines = readFileSync((await download.path())!, "utf8").trim().split(/\r?\n/);
    expect(lines[0]).toBe("Table,Guest,Party size,Side,RSVP,Tag");
    expect(lines).toContain("Table 1,Amy Pond,1,Not set,invited,Family");
    expect(lines).toContain("Not seated,Rory Williams,1,Not set,invited,");
  });

  test("TB-16 collapsing the toolbar hides its commands and is remembered", async ({ page }) => {
    const { id } = await setup(page);
    await openSeating(page, id);

    await page.getByRole("button", { name: "Collapse toolbar" }).click();
    await expect(page.locator("[inert]").getByRole("button", { name: "Round table", exact: true })).toHaveCount(1);
    await page.reload();
    await expect(page.getByRole("button", { name: "Expand toolbar" })).toBeVisible();
    await page.getByRole("button", { name: "Expand toolbar" }).click();
    await expect(page.locator("[inert]").getByRole("button", { name: "Round table", exact: true })).toHaveCount(0);
    await ribbon(page).getByRole("button", { name: "Round table", exact: true }).click();
    await pollPlan(id, (p) => p.tables.length).toBe(1);
  });

  test("TB-17 on narrower screens the ribbon splits into Home, View and Export tabs", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const { id } = await setup(page);
    await openSeating(page, id);

    const tabs = page.getByRole("tablist", { name: "Toolbar" }).getByRole("tab");
    await expect(tabs).toHaveText(["Home", "View", "Export"]);
    for (const g of ["Tables", "Room"]) await expect(ribbon(page, "Home").getByRole("group", { name: g, exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "Home" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "View" })).toBeFocused();
    for (const g of ["Show", "Zoom", "Workspace"]) await expect(ribbon(page, "View").getByRole("group", { name: g, exact: true })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    for (const g of ["Print or save as PDF", "Data"]) await expect(ribbon(page, "Export").getByRole("group", { name: g, exact: true })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Home" })).toBeFocused();
  });

  test("TB-18 guest rail: search, seated filters and RSVP filters", async ({ page }) => {
    const account = await createConfirmedAccount("rail");
    await logIn(page, account.email, account.password);
    const id = await buyWebsite(page, "premium");
    const amy = await addGuest(id, "Amy Pond", { status: "attending" });
    await addGuest(id, "Rory Williams", { status: "pending" });
    await addGuest(id, "Clara Oswald", { status: "invited" });
    await addGuest(id, "Donna Noble", { status: "attending", partySize: 2 });
    await addGuest(id, "River Song", { status: "declined" });
    await seed(id, { tables: [table("t1", "Table 1", 40)], assignments: { [amy.id]: "t1" } });
    await openSeating(page, id);

    const rows = page.getByRole("list", { name: / guests$/ }).getByRole("button");
    const filters = page.getByRole("group", { name: "Show guests" });
    const reply = page.getByRole("group", { name: "RSVP" });

    // Default: unseated, any reply; declined guests never need a seat.
    await expect(rows).toHaveCount(3);
    await expect(filters.getByRole("button", { name: /^Unseated/ })).toContainText("3");
    await expect(page.getByRole("button", { name: /^River Song/ })).toHaveCount(0);

    await filters.getByRole("button", { name: /^Seated/ }).click();
    await expect(rows).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Amy Pond, at Table 1" })).toBeVisible();

    await filters.getByRole("button", { name: /^All/ }).click();
    await expect(rows).toHaveCount(4);
    await reply.getByRole("button", { name: "Going" }).click();
    await expect(rows).toHaveCount(2);
    await reply.getByRole("button", { name: "No reply yet" }).click();
    await expect(rows).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Donna Noble, party of 2, not seated" })).toHaveCount(0);

    await reply.getByRole("button", { name: "Any reply" }).click();
    await page.getByLabel("Find a guest").fill("clara");
    await expect(rows).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Clara Oswald, not seated" })).toBeVisible();
  });

  test("TB-19 guests are seated by drag and drop, by 'Place on plan' and moved with 'Move to…'", async ({ page }) => {
    const { id, guests } = await setup(page, ["Amy Pond", "Rory Williams"]);
    await seed(id, { tables: [table("t1", "Table 1", 25), table("t2", "Table 2", 70)] });
    await openSeating(page, id);
    const [amy, rory] = guests;

    // Drag from the rail onto a table.
    await page.getByRole("button", { name: "Amy Pond, not seated" }).dragTo(onPlan(page, "Table 1"));
    await pollPlan(id, (p) => p.assignments[amy.id]).toBe("t1");
    await expect(page.getByRole("button", { name: "Table 1, 1 of 8 seats taken" })).toBeVisible();

    // Place on plan: pick the guest, then click a table.
    await page.getByRole("button", { name: "Rory Williams, not seated" }).click();
    await page.getByRole("dialog", { name: "Guest details" }).getByRole("button", { name: "Place on plan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Pick a table for Rory Williams" })).toBeVisible();
    await onPlan(page, "Table 2").click();
    await pollPlan(id, (p) => p.assignments[rory.id]).toBe("t2");

    // Move a seated guest to another table, then remove them.
    await page.getByRole("group", { name: "Show guests" }).getByRole("button", { name: /^All/ }).click();
    await page.getByRole("button", { name: "Amy Pond, at Table 1" }).click();
    const details = page.getByRole("dialog", { name: "Guest details" });
    await details.getByRole("button", { name: "Move to…" }).click();
    await details.getByRole("list", { name: "Move to table" }).getByRole("button", { name: /^Table 2/ }).click();
    await pollPlan(id, (p) => p.assignments[amy.id]).toBe("t2");
    await details.getByRole("button", { name: "Remove" }).click();
    await pollPlan(id, (p) => p.assignments[amy.id]).toBeUndefined();
  });

  test("TB-20 finding a table by name or tag fades the others", async ({ page }) => {
    const { id } = await setup(page);
    await seed(id, { tables: [table("t1", "Table 1", 30, 50, { tag: "Family" }), table("t2", "Friends", 70)] });
    await openSeating(page, id);
    const opacity = (name: string) => onPlan(page, name).evaluate((b) => getComputedStyle(b.parentElement!).opacity);

    await page.getByLabel("Find a table by name or tag").fill("fam");
    await expect.poll(() => opacity("Table 1")).toBe("1");
    await expect.poll(() => opacity("Friends")).toBe("0.3");
    await page.getByRole("button", { name: "Clear table search" }).click();
    await expect.poll(() => opacity("Friends")).toBe("1");
  });

  test("TB-21 table and feature buttons disable at the plan's limits", async ({ page }) => {
    const { id } = await setup(page);
    const tables = Array.from({ length: 80 }, (_, i) => table(`t${i}`, `Table ${i + 1}`, 5 + (i % 10) * 10, 5 + Math.floor(i / 10) * 11));
    const elements = Array.from({ length: 40 }, (_, i) => ({ id: `e${i}`, kind: "custom", label: `Area ${i + 1}`, shape: "rect", x: 50, y: 50, w: 4, h: 3 }));
    await seed(id, { tables, elements });
    await openSeating(page, id);

    const r = ribbon(page);
    for (const name of ["Round table", "Long table", "Half-moon", "S-curve", "Several"]) {
      await expect(r.getByRole("button", { name, exact: name !== "Several" }), name).toBeDisabled();
    }
    for (const name of ["Features", "Stage", "Custom oval"]) {
      await expect(r.getByRole("button", { name, exact: name !== "Features" }), name).toBeDisabled();
    }
  });
});

test.describe("Seating toolbar on a lower package", () => {
  test("Essential: the whole ribbon is unusable until upgrade (SEAT-06 companion)", async ({ page }) => {
    const account = await createConfirmedAccount("toolbar-essential");
    await logIn(page, account.email, account.password);
    const id = await buyWebsite(page, "essential");
    await addGuest(id, "Amy Pond");
    await publishWebsite(id);
    await openSeating(page, id);
    await expect(page.locator("[inert]").getByRole("tablist", { name: "Toolbar" })).toHaveCount(1);
  });
});
