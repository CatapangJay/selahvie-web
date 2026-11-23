import { test, expect, type Browser, type BrowserContextOptions, type Page } from "@playwright/test";
import { addGuest, buyWebsite, createConfirmedAccount, logIn, publishWebsite, updateWebsite, type SeededGuest } from "./support";

// FIND-08 … FIND-22 in e2e/TEST_CASES.csv. The table finder's map: route, animation,
// orientation, view modes and the layouts that make routing hard.
// One published website is shared by the file; each test sets the floor plan it needs.

type Table = Record<string, unknown> & { id: string };
type Element = Record<string, unknown> & { id: string };

const round = (id: string, x: number, y: number, extra: Record<string, unknown> = {}): Table => ({
  id, name: `Table ${id.slice(1)}`, shape: "round", seats: 8, x, y, ...extra,
});

/** A banquet hall: eight rounds, a sweetheart table, stage, dance floor, bar and four doors. */
const HALL_TABLES: Table[] = [
  round("t1", 14, 30), round("t2", 34, 30), round("t3", 66, 30), round("t4", 86, 30),
  round("t5", 14, 62), round("t6", 34, 78), round("t7", 66, 78), round("t8", 86, 62),
  { id: "head", name: "Sweetheart Table", shape: "rect", seats: 2, seatSides: 1, x: 50, y: 18 },
];
const HALL_ELEMENTS: Element[] = [
  { id: "stage", kind: "stage", label: "Stage", shape: "rect", x: 50, y: 7, w: 34, h: 6 },
  { id: "dance", kind: "danceFloor", label: "Dance floor", shape: "rect", x: 50, y: 52, w: 22, h: 12 },
  { id: "bar", kind: "bar", label: "Bar", shape: "rect", x: 90, y: 90, w: 12, h: 4 },
  { id: "south", kind: "entrance", label: "Main entrance", shape: "rect", x: 50, y: 96, w: 10, h: 2.5 },
  { id: "east", kind: "entrance", label: "Garden door", shape: "rect", x: 98, y: 46, w: 8, h: 2.5, rotation: 90 },
  { id: "north", kind: "entrance", label: "Service door", shape: "rect", x: 88, y: 4, w: 8, h: 2.5 },
  { id: "west", kind: "entrance", label: "Terrace door", shape: "rect", x: 2, y: 46, w: 8, h: 2.5, rotation: 90 },
];

let slug = "";
let weddingId = "";
let guest: SeededGuest;
let other: SeededGuest;

async function setPlan(tables: Table[], elements: Element[], seatAt: string) {
  await updateWebsite(weddingId, {
    seating_plan: { tables, elements, assignments: { [guest.id]: seatAt, [other.id]: "t2" }, sides: {}, guestFinder: true },
  });
}

async function phone(browser: Browser, opts: BrowserContextOptions = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts });
  return { ctx, page: await ctx.newPage() };
}

/** Opens the finder, looks the guest up and waits for the result. */
async function lookUp(page: Page, query = "Lena Ortiz", from?: string) {
  await page.goto(`/wedding/${slug}/seat${from ? `?from=${from}` : ""}`);
  await page.getByLabel("Your name").fill(query);
  await page.getByLabel("Your name").press("Enter");
  await expect(page.getByText(/, you're at$/)).toBeVisible();
}

const map = (page: Page) => page.getByTestId("seat-map");
const walker = (page: Page) => page.getByTestId("seat-map-walker");
const walkerAt = (page: Page) => walker(page).evaluate((g) => g.getAttribute("transform") ?? "");
const walkerOpacity = (page: Page) => walker(page).evaluate((g) => Number(getComputedStyle(g).opacity));
/** Share of the route's dots that are showing (they appear one after another from the door). */
const dotsShown = (page: Page) =>
  page.getByTestId("seat-map-route").evaluate((g) => {
    const dots = [...g.querySelectorAll("circle")];
    return dots.filter((c) => Number(getComputedStyle(c).opacity) > 0.5).length / Math.max(1, dots.length);
  });
const viewBox = (page: Page) => map(page).evaluate((svg) => svg.getAttribute("viewBox") ?? "");

test.describe("Find your table: map and animation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    const owner = await browser.newPage();
    const account = await createConfirmedAccount("finder-map");
    await logIn(owner, account.email, account.password);
    weddingId = await buyWebsite(owner, "premium");
    slug = await publishWebsite(weddingId);
    guest = await addGuest(weddingId, "Lena Ortiz", { partySize: 3, status: "attending" });
    other = await addGuest(weddingId, "Marco Villanueva", { status: "attending" });
    await owner.close();
  });

  test("FIND-08 the route draws in from the entrance, then the walker moves along it", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t1");
    const { ctx, page } = await phone(browser);
    await lookUp(page, "Lena Ortiz", "south");

    // While the line is drawing, part of it is still hidden and the walker hasn't set off.
    expect(await dotsShown(page)).toBeLessThan(0.8);
    expect(await walkerOpacity(page)).toBe(0);
    await page.screenshot({ path: "test-results/seat-finder/anim-1-drawing.png" });

    // Fully drawn, then walking: the walker is visible and its position changes.
    await expect.poll(() => dotsShown(page), { timeout: 4_000 }).toBe(1);
    await expect.poll(() => walkerOpacity(page), { timeout: 4_000 }).toBe(1);
    const a = await walkerAt(page);
    await page.waitForTimeout(600);
    const b = await walkerAt(page);
    expect(a).not.toBe("");
    expect(b).not.toBe(a);
    await page.screenshot({ path: "test-results/seat-finder/anim-2-walking.png" });
    await ctx.close();
  });

  test("FIND-09 the table's other guests are listed instead of turn-by-turn directions", async ({ browser }) => {
    // Marco is seated at Table 2; seat Lena there too.
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t2");
    const { ctx, page } = await phone(browser);
    await lookUp(page, "Lena Ortiz", "south");

    await expect(page.getByRole("list", { name: "Directions" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Who's at your table" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Also at your table" })).toContainText("Marco Villanueva");
    await expect(page.getByRole("list", { name: "With you" })).toContainText("2 guests in your party");
    await expect(page.getByText("4 at this table")).toBeVisible();
    // The map still shows the way there.
    await expect(page.getByTestId("seat-map-route")).toHaveCount(1);
    await page.screenshot({ path: "test-results/seat-finder/table-mates.png", fullPage: true });
    await ctx.close();
  });

  test("FIND-10 Replay draws the route again from the start", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t1");
    const { ctx, page } = await phone(browser);
    await lookUp(page, "Lena Ortiz", "south");
    await expect.poll(() => walkerOpacity(page), { timeout: 4_000 }).toBe(1);

    await page.getByRole("button", { name: "Replay" }).click();
    expect(await walkerOpacity(page)).toBe(0);
    expect(await dotsShown(page)).toBeLessThan(0.8);
    await expect.poll(() => walkerOpacity(page), { timeout: 4_000 }).toBe(1);
    await ctx.close();
  });

  test("FIND-11 with reduced motion the route is shown still, with no walker or pulse", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t1");
    const { ctx, page } = await phone(browser, { reducedMotion: "reduce" });
    await lookUp(page, "Lena Ortiz", "south");

    expect(await dotsShown(page)).toBe(1);
    await page.waitForTimeout(2_500);
    expect(await walkerOpacity(page)).toBe(0);
    const animations = await map(page).evaluate((svg) =>
      [...svg.querySelectorAll(".sf-dot, .sf-pulse")].map((el) => getComputedStyle(el).animationName)
    );
    expect(animations.length).toBeGreaterThan(0);
    expect(animations.every((name) => name === "none")).toBe(true);
    await ctx.close();
  });

  test("FIND-12 the map turns so the guest's door is at the bottom", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t4");
    const { ctx, page } = await phone(browser);
    const cases: [string, string, string][] = [
      ["south", "0", "Main entrance"],
      ["east", "90", "Garden door"],
      ["north", "180", "Service door"],
      ["west", "-90", "Terrace door"],
    ];
    await lookUp(page, "Lena Ortiz", "south");
    for (const [from, rotation, label] of cases) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`from=${from}`));
      await expect(page.getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(map(page)).toHaveAttribute("data-rotation", rotation);
      await expect(page.getByText(`Turned so the ${label.toLowerCase()} is behind you.`)).toBeVisible();
      await page.waitForTimeout(2_200);
      await map(page).screenshot({ path: `test-results/seat-finder/rotate-${from}.png` });
    }
    await ctx.close();
  });

  test("FIND-13 the map opens on the whole room; 'My route' crops to the walk", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t8");
    const { ctx, page } = await phone(browser);
    await lookUp(page, "Lena Ortiz", "south");

    // Whole room by default, so guests see where they are in it.
    await expect(page.getByRole("button", { name: "Whole room" })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => viewBox(page)).toBe("0 0 100 62.5");
    await page.waitForTimeout(1_500);
    await map(page).screenshot({ path: "test-results/seat-finder/whole-room.png" });

    await page.getByRole("button", { name: "My route" }).click();
    await expect(page.getByRole("button", { name: "My route" })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => {
      const [, , w, h] = (await viewBox(page)).split(" ").map(Number);
      return w * h < 100 * 62.5;
    }).toBe(true);
    await page.getByRole("button", { name: "Whole room" }).click();
    await expect.poll(() => viewBox(page)).toBe("0 0 100 62.5");
    await ctx.close();
  });

  test("FIND-14 only the guest's table is highlighted, and the map names no other guests", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t7");
    const { ctx, page } = await phone(browser);
    await lookUp(page, "Lena Ortiz", "south");

    const highlighted = map(page).locator("[data-highlighted]");
    await expect(highlighted).toHaveCount(1);
    await expect(highlighted).toHaveAttribute("data-table-id", "t7");
    await expect(page.getByRole("heading", { name: "Table 7" })).toBeVisible();
    await expect(page.getByText("Party of 3")).toBeVisible();
    expect(await page.content()).not.toContain("Marco");
    await ctx.close();
  });

  test("FIND-15 without an entrance on the plan the table is still shown, without a route", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS.filter((e) => e.kind !== "entrance"), "t3");
    const { ctx, page } = await phone(browser);
    await lookUp(page);

    await expect(map(page).locator("[data-highlighted]")).toHaveAttribute("data-table-id", "t3");
    await expect(page.getByTestId("seat-map-route")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Replay" })).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Which entrance did you use?" })).toHaveCount(0);
    await expect(page.getByText("Your table is highlighted on the map.")).toBeVisible();
    await expect(map(page)).toHaveAttribute("data-rotation", "0");
    await ctx.close();
  });

  test("FIND-16 one entrance: no picker; an unknown ?from falls back to it", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS.filter((e) => e.kind !== "entrance" || e.id === "east"), "t5");
    const { ctx, page } = await phone(browser);
    await lookUp(page, "Lena Ortiz", "not-a-door");

    await expect(page.getByRole("group", { name: "Which entrance did you use?" })).toHaveCount(0);
    await expect(page.getByText("Turned so the garden door is behind you.")).toBeVisible();
    await expect(map(page)).toHaveAttribute("data-rotation", "90");
    await ctx.close();
  });

  test("FIND-17 a table walled in by other tables gets the map but no route", async ({ browser }) => {
    const ring = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return round(`r${i}`, 50 + Math.cos(a) * 9.5, 50 + (Math.sin(a) * 9.5) / 0.625);
    });
    await setPlan([round("t9", 50, 50), ...ring], HALL_ELEMENTS.filter((e) => e.id === "south"), "t9");
    const { ctx, page } = await phone(browser);
    await lookUp(page);

    await expect(map(page).locator("[data-highlighted]")).toHaveAttribute("data-table-id", "t9");
    await expect(page.getByText("We couldn't draw a route through the room, but your table is highlighted on the map.")).toBeVisible();
    await expect(page.getByTestId("seat-map-route")).toHaveCount(0);
    await ctx.close();
  });

  test("FIND-18 curved, half-moon and long tables draw and route correctly", async ({ browser }) => {
    const tables: Table[] = [
      { id: "c1", name: "Family Serpentine", shape: "curve", seats: 12, sweep: 90, sBend: true, x: 30, y: 40, rotation: 20 },
      { id: "a1", name: "Half Moon", shape: "arc", seats: 6, x: 72, y: 30 },
      { id: "l1", name: "Long Table", shape: "rect", seats: 12, seatSides: 4, endSeats: 2, x: 70, y: 68, rotation: 90 },
      round("t1", 20, 75),
    ];
    const { ctx, page } = await phone(browser);
    for (const [id, name] of [["c1", "Family Serpentine"], ["a1", "Half Moon"], ["l1", "Long Table"]]) {
      await setPlan(tables, HALL_ELEMENTS.filter((e) => e.id === "south" || e.id === "stage"), id);
      await lookUp(page);
      await expect(page.getByRole("heading", { name })).toBeVisible();
      await expect(map(page).locator("[data-highlighted]")).toHaveAttribute("data-table-id", id);
      await expect(page.getByTestId("seat-map-route")).toHaveCount(1);
      await page.waitForTimeout(2_200);
      await map(page).screenshot({ path: `test-results/seat-finder/shape-${id}.png` });
    }
    await ctx.close();
  });

  test("FIND-19 a packed room (48 tables, chairs touching) routes between the chairs, quickly", async ({ browser }) => {
    const tables: Table[] = [];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) tables.push(round(`t${r * 8 + c + 1}`, 8 + c * 12, 10 + r * 15, { seats: 4 }));
    await setPlan(tables, HALL_ELEMENTS.filter((e) => e.id === "south"), "t1");
    const { ctx, page } = await phone(browser);
    await page.goto(`/wedding/${slug}/seat`);
    await page.getByLabel("Your name").fill("Lena Ortiz");
    const started = Date.now();
    await page.getByRole("button", { name: "Find my table" }).click();
    await expect(page.getByRole("heading", { name: "Table 1" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Who's at your table" })).toBeVisible();
    await expect(page.getByTestId("seat-map-route")).toHaveCount(1);
    expect(Date.now() - started).toBeLessThan(5_000);
    await page.waitForTimeout(2_200);
    await page.getByRole("button", { name: "Whole room" }).click();
    await map(page).screenshot({ path: "test-results/seat-finder/full-room.png" });
    await ctx.close();
  });

  test("FIND-20 an invite code typed in the name box finds the guest", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t2");
    const { ctx, page } = await phone(browser);
    await lookUp(page, `${guest.code.slice(0, 4)}-${guest.code.slice(4)}`.toLowerCase());
    await expect(page.getByRole("heading", { name: "Table 2" })).toBeVisible();
    await ctx.close();
  });

  test("FIND-21 the couple's colour is used as chosen, with readable text on it", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t2");
    const { ctx, page } = await phone(browser);
    await updateWebsite(weddingId, { primary_color: "#F3E3C6" });
    try {
      await page.goto(`/wedding/${slug}/seat`);
      // A pale colour stays the couple's colour; the text on it turns dark instead.
      const button = page.getByRole("button", { name: "Find my table" });
      await expect(button).toHaveCSS("background-color", "rgb(243, 227, 198)");
      await expect(button).toHaveCSS("color", "rgb(23, 18, 26)");
      await updateWebsite(weddingId, { primary_color: "#1F4E5A" });
      await page.reload();
      await expect(page.getByRole("button", { name: "Find my table" })).toHaveCSS("background-color", "rgb(31, 78, 90)");
      await lookUp(page);
      expect(await map(page).locator('[data-highlighted] g[fill="#1F4E5A"]').count()).toBeGreaterThan(0);
    } finally {
      await updateWebsite(weddingId, { primary_color: null });
    }
    await ctx.close();
  });

  test("FIND-22 the page fits small phones and desktops without sideways scrolling", async ({ browser }) => {
    await setPlan(HALL_TABLES, HALL_ELEMENTS, "t1");
    for (const [name, viewport] of [["small", { width: 320, height: 640 }], ["desktop", { width: 1280, height: 900 }]] as const) {
      const ctx = await browser.newContext({ viewport });
      const page = await ctx.newPage();
      await lookUp(page, "Lena Ortiz", "south");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const box = await map(page).boundingBox();
      expect(box!.width).toBeLessThanOrEqual(viewport.width);
      await page.waitForTimeout(2_200);
      await page.screenshot({ path: `test-results/seat-finder/viewport-${name}.png`, fullPage: true });
      await ctx.close();
    }
  });

  test("FIND-23 a website without the seating package doesn't offer the finder", async ({ browser }) => {
    const owner = await browser.newPage();
    const account = await createConfirmedAccount("finder-classic");
    await logIn(owner, account.email, account.password);
    const id = await buyWebsite(owner, "classic");
    const classicSlug = await publishWebsite(id);
    const g = await addGuest(id, "Lena Ortiz");
    await updateWebsite(id, { seating_plan: { tables: HALL_TABLES, elements: HALL_ELEMENTS, assignments: { [g.id]: "t1" }, sides: {}, guestFinder: true } });
    await owner.close();

    const { ctx, page } = await phone(browser);
    await page.goto(`/wedding/${classicSlug}/seat`);
    await expect(page.getByRole("heading", { name: "Table finder opens soon" })).toBeVisible();
    const res = await page.request.post(`/api/sites/${classicSlug}/seat`, { data: { query: "Lena Ortiz" } });
    expect(res.status()).toBe(404);
    await ctx.close();
  });
});
