import { test, expect, type Browser } from "@playwright/test";
import { addGroup, addGuest, adminClient, buyWebsite, createConfirmedAccount, logIn, publishWebsite, updateWebsite, type TestAccount } from "./support";

// FIND-01 … FIND-07 in e2e/TEST_CASES.csv. The day-of "Find your table" page.

const tables = [
  { id: "t1", name: "Table 1", shape: "round", seats: 8, x: 16, y: 34 },
  { id: "t2", name: "Table 2", shape: "round", seats: 8, x: 38, y: 34 },
  { id: "t3", name: "Table 3", shape: "round", seats: 8, x: 62, y: 34 },
  { id: "t4", name: "Table 4", shape: "round", seats: 8, x: 84, y: 34 },
  { id: "t5", name: "Table 5", shape: "round", seats: 8, x: 16, y: 70 },
  { id: "t6", name: "Table 6", shape: "rect", seats: 10, x: 84, y: 70, rotation: 90 },
  { id: "head", name: "Sweetheart Table", shape: "rect", seats: 2, seatSides: 1, x: 50, y: 18 },
];
const elements = [
  { id: "stage", kind: "stage", label: "Stage", shape: "rect", x: 50, y: 7, w: 34, h: 6 },
  { id: "dance", kind: "danceFloor", label: "Dance floor", shape: "rect", x: 50, y: 66, w: 22, h: 14 },
  { id: "bar", kind: "bar", label: "Bar", shape: "rect", x: 10, y: 92, w: 14, h: 4 },
  { id: "main", kind: "entrance", label: "Main entrance", shape: "rect", x: 56, y: 96, w: 10, h: 2.5 },
  { id: "garden", kind: "entrance", label: "Garden door", shape: "rect", x: 98, y: 52, w: 9, h: 2.5, rotation: 90 },
];

async function seedRoom(weddingId: string, opts: { finder?: boolean } = {}) {
  const maria = await addGuest(weddingId, "Maria Clara Santos", { partySize: 2, status: "attending" });
  const jose = await addGuest(weddingId, "José Reyes", { status: "attending" });
  const ana = await addGuest(weddingId, "Ana Cruz");
  const twinA = await addGuest(weddingId, "Sam Lee");
  const twinB = await addGuest(weddingId, "Sam Lee");
  await updateWebsite(weddingId, {
    seating_plan: {
      tables,
      elements,
      assignments: { [maria.id]: "t6", [jose.id]: "t1", [twinA.id]: "t2", [twinB.id]: "t3" },
      sides: {},
      guestFinder: opts.finder ?? true,
    },
  });
  const { error } = await adminClient()
    .from("rsvps")
    .insert({ wedding_id: weddingId, guest_id: maria.id, guest_name: maria.name, attending: true, plus_one: true, plus_one_name: "Paolo Santos" });
  if (error) throw new Error(`Could not add RSVP: ${error.message}`);
  return { maria, jose, ana, twinA, twinB };
}

/** A signed-out phone, the way a guest scans the code. */
const guestPhone = (browser: Browser) => browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.describe("Find your table (Premium)", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("finder");
    await logIn(page, account.email, account.password);
  });

  test("FIND-01 a guest finds their table, sees the route and the directions", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    await seedRoom(id);

    const phone = await guestPhone(browser);
    const guest = await phone.newPage();
    await guest.goto(`/wedding/${slug}/seat?from=main`);
    await expect(guest.getByText("Ada & Ben")).toBeVisible();
    await guest.screenshot({ path: "test-results/seat-finder/lookup.png" });
    await guest.getByLabel("Your name").fill("maria santos");
    await guest.getByRole("button", { name: "Find my table" }).click();

    await expect(guest.getByRole("heading", { name: "Table 6" })).toBeVisible();
    await expect(guest.getByText("Party of 2")).toBeVisible();
    await expect(guest.getByRole("img", { name: /Table 6 highlighted and the way there/ })).toBeVisible();
    // No turn-by-turn list: who's at the table instead. Maria's plus-one (from her RSVP) sits with her.
    await expect(guest.getByRole("list", { name: "Directions" })).toHaveCount(0);
    await expect(guest.getByRole("heading", { name: "Who's at your table" })).toBeVisible();
    await expect(guest.getByRole("list", { name: "With you" })).toContainText("Paolo Santos");
    await expect(guest.getByText("Turned so the main entrance is behind you.")).toBeVisible();
    await guest.waitForTimeout(2500);
    await guest.screenshot({ path: "test-results/seat-finder/found-main.png", fullPage: true });

    // Switching entrance reroutes from the other door.
    await guest.getByRole("button", { name: "Garden door" }).click();
    await expect(guest).toHaveURL(/from=garden/);
    await expect(guest.getByText("Turned so the garden door is behind you.")).toBeVisible();
    await guest.waitForTimeout(2500);
    await guest.screenshot({ path: "test-results/seat-finder/found-garden.png", fullPage: true });
    await phone.close();
  });

  test("FIND-02 a plus-one's name (from the RSVP) finds the party's table", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    await seedRoom(id);

    const phone = await guestPhone(browser);
    const guest = await phone.newPage();
    await guest.goto(`/wedding/${slug}/seat`);
    await guest.getByLabel("Your name").fill("Paolo Santos");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByRole("heading", { name: "Table 6" })).toBeVisible();
    await phone.close();
  });

  test("FIND-03 guests without a table, unknown names and shared names get the right message", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    const { twinB } = await seedRoom(id);

    const phone = await guestPhone(browser);
    const guest = await phone.newPage();
    await guest.goto(`/wedding/${slug}/seat`);
    await guest.getByLabel("Your name").fill("Ana Cruz");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByRole("heading", { name: "Welcome, Ana" })).toBeVisible();
    await expect(guest.getByText("Your table isn't on the chart yet")).toBeVisible();

    await guest.getByRole("button", { name: "Look up someone else" }).click();
    await guest.getByLabel("Your name").fill("Nobody Here");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByText("We couldn't find that name")).toBeVisible();

    // A partial name is not a name on the list ("Ana Cru" must not find Ana Cruz).
    await guest.getByLabel("Your name").fill("Ana Cru");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByText("We couldn't find that name")).toBeVisible();
    await expect(guest.getByRole("heading", { name: "Welcome, Ana" })).toHaveCount(0);

    // Two "Sam Lee"s: ask for the code instead of guessing.
    await guest.getByLabel("Your name").fill("Sam Lee");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByText(/More than one guest has a name like that/)).toBeVisible();
    await guest.getByLabel("Invitation code").fill(twinB.code);
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByRole("heading", { name: "Table 3" })).toBeVisible();
    await phone.close();
  });

  test("FIND-04 the lookup reveals only the guest's own table, not who sits elsewhere", async ({ page, request }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    const { jose } = await seedRoom(id);

    const res = await request.post(`/api/sites/${slug}/seat`, { data: { query: "Maria Santos" } });
    expect(res.ok()).toBe(true);
    const text = await res.text();
    const body = JSON.parse(text);
    expect(body.status).toBe("found");
    expect(body.tableId).toBe("t6");
    expect(text).not.toContain(jose.id);
    expect(text).not.toContain("José");
    expect(text).not.toContain("assignments");
    expect(text).not.toContain(jose.code);
  });

  test("FIND-24 seatmates: the guest's group first, then the rest of the table; no one from other tables", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    const lena = await addGuest(id, "Lena Ortiz", { status: "attending" });
    const rico = await addGuest(id, "Rico Ortiz", { status: "attending", partySize: 3 });
    const zoe = await addGuest(id, "Zoe Alvarez", { status: "attending" });
    const declined = await addGuest(id, "Dana Declined", { status: "declined" });
    const elsewhere = await addGuest(id, "Elias Elsewhere", { status: "attending" });
    await addGroup(id, "Ortiz Family", [lena, rico, elsewhere]);
    await updateWebsite(id, {
      seating_plan: {
        tables: [{ id: "t1", name: "Table 1", shape: "round", seats: 10, x: 30, y: 40 }, { id: "t2", name: "Table 2", shape: "round", seats: 8, x: 70, y: 40 }],
        elements: [],
        assignments: { [lena.id]: "t1", [rico.id]: "t1", [zoe.id]: "t1", [declined.id]: "t1", [elsewhere.id]: "t2" },
        sides: {},
        guestFinder: true,
      },
    });

    const phone = await guestPhone(browser);
    const guest = await phone.newPage();
    await guest.goto(`/wedding/${slug}/seat`);
    await guest.getByLabel("Your name").fill("Lena Ortiz");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByRole("heading", { name: "Who's at your table" })).toBeVisible();

    const family = guest.getByRole("list", { name: "Ortiz Family" });
    await expect(family).toContainText("Rico Ortiz");
    await expect(family).toContainText("+2 guests");
    await expect(guest.getByRole("list", { name: "Also at your table" })).toContainText("Zoe Alvarez");
    // The family comes before everyone else.
    const order = await guest.getByRole("list").evaluateAll((lists) => lists.map((l) => l.getAttribute("aria-label")));
    expect(order.indexOf("Ortiz Family")).toBeLessThan(order.indexOf("Also at your table"));
    // Declined guests and other tables stay off the list (even a family member at another table).
    await expect(guest.getByText("Dana Declined")).toHaveCount(0);
    await expect(guest.getByText("Elias Elsewhere")).toHaveCount(0);
    await guest.screenshot({ path: "test-results/seat-finder/seatmates.png", fullPage: true });
    await phone.close();
  });

  test("FIND-05 the finder is open to guests on a published Premium website, with no switch to flip", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    // A plan saved while the finder still had an on/off switch, left off.
    await seedRoom(id, { finder: false });

    const phone = await guestPhone(browser);
    const guest = await phone.newPage();
    await guest.goto(`/wedding/${slug}/seat`);
    await guest.getByLabel("Your name").fill("Maria Santos");
    await guest.getByRole("button", { name: "Find my table" }).click();
    await expect(guest.getByRole("heading", { name: "Table 6" })).toBeVisible();
    await phone.close();
  });

  test("FIND-06 a draft website's finder isn't available to guests", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    await updateWebsite(id, { slug: `e2e-draft-${id.slice(0, 8)}` });
    await seedRoom(id);

    const phone = await guestPhone(browser);
    const guest = await phone.newPage();
    await guest.goto(`/wedding/e2e-draft-${id.slice(0, 8)}/seat`);
    await expect(guest.getByRole("heading", { name: "This page isn't available" })).toBeVisible();
    await phone.close();
  });

  test("FIND-07 the Share tab's QR codes include a table finder code per entrance", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id);
    await seedRoom(id);

    await page.goto(`/dashboard/manage/${id}?tab=share`);
    await expect(page.getByRole("tab", { name: /QR codes/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: "RSVP" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Find your table: Main entrance" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Find your table: Garden door" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Find your table: Garden door link" })).toHaveValue(/\/seat\?from=garden$/);
    await expect(page.getByRole("switch")).toHaveCount(0);
    await page.screenshot({ path: "test-results/seat-finder/share-tab.png", fullPage: true });
  });
});
