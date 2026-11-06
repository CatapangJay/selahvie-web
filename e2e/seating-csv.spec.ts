import { readFileSync } from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import {
  adminClient,
  anonClient,
  buyWebsite,
  createConfirmedAccount,
  logIn,
  openInvitation,
  publishWebsite,
  updateWebsite,
  weddingRow,
} from "./support";

// CSV-01 … CSV-13 in e2e/TEST_CASES.csv. Importing a guest list from a spreadsheet, then
// using those guests (and their RSVPs) in the seating planner.

test.use({ viewport: { width: 1600, height: 1000 } });

const FIXTURE = path.join(__dirname, "fixtures", "guests-60.csv");

// ── What the fixture should import as (Ada & Ben are the partners publishWebsite sets) ──
const SIDE: Record<string, string | null> = { "ada's side": "partner1", "ben's side": "partner2", ada: "partner1", ben: "partner2", "1": "partner1", "2": "partner2", "": null };
interface Row { name: string; email: string; mobile: string; party: number; status: string; side: string | null; groups: string[]; note: string }
const ROWS: Row[] = readFileSync(FIXTURE, "utf8")
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => {
    const [name, email, mobile, party, status, side, groups, note] = line.split(",");
    return {
      name,
      email,
      mobile,
      party: Number(party),
      status: status || "invited",
      side: SIDE[side.toLowerCase()] ?? null,
      groups: groups.split(";").map((g) => g.trim()).filter(Boolean),
      note,
    };
  });
const SEATABLE = ROWS.filter((r) => r.status !== "declined");
const HEADS = SEATABLE.reduce((n, r) => n + r.party, 0);
const GROUPS = new Set(ROWS.flatMap((r) => r.groups));
const headsOn = (side: string) => SEATABLE.filter((r) => r.side === side).reduce((n, r) => n + r.party, 0);

// ── Helpers ──
const csvInput = (page: Page) => page.locator('input[type="file"][accept*="csv"]');
const importText = (page: Page, csv: string, name = "guests.csv") => csvInput(page).setInputFiles({ name, mimeType: "text/csv", buffer: Buffer.from(csv) });
const guestCount = async (weddingId: string) =>
  (await adminClient().from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId)).count ?? 0;
const guestsByName = async (weddingId: string) => {
  const { data } = await adminClient().from("guests").select("id, name, status, side, party_size, phone, note, email").eq("wedding_id", weddingId);
  return new Map((data ?? []).map((g) => [g.name as string, g]));
};
// "N of H guests seated", with the table and seat totals in the same paragraph once tables exist.
const summary = (page: Page) => page.locator("p").filter({ hasText: /of \d+ guests? seated/ }).first();
const railRows = (page: Page) => page.getByRole("list", { name: / guests$/ }).getByRole("button");

/** A signed-in couple with a published Premium site for Ada & Ben. */
async function premiumSite(page: Page) {
  const account = await createConfirmedAccount("csv");
  await logIn(page, account.email, account.password);
  const id = await buyWebsite(page, "premium");
  const slug = await publishWebsite(id, { meal_options: ["Beef", "Fish"] });
  return { id, slug };
}

/** Uploads the 60-guest fixture through the guest list's import control and waits until it is saved. */
async function importFixture(page: Page, weddingId: string) {
  await page.goto(`/dashboard/manage/${weddingId}?tab=guests`);
  await csvInput(page).setInputFiles(FIXTURE);
  await expect(page.getByText(`Imported ${ROWS.length} guests, created ${GROUPS.size} groups.`)).toBeVisible();
  await expect.poll(() => guestCount(weddingId), { timeout: 30_000 }).toBe(ROWS.length);
}

const openSeating = async (page: Page, weddingId: string) => {
  await page.goto(`/dashboard/manage/${weddingId}?tab=seating`);
  await expect(page.getByRole("tablist", { name: "Toolbar" })).toBeVisible();
};

test.describe("Guest CSV import feeding the seat planner", () => {
  test("CSV-01 a realistic 60-guest CSV imports with statuses, sides, party sizes, phones and groups", async ({ page }) => {
    const { id } = await premiumSite(page);
    await importFixture(page, id);

    const saved = await guestsByName(id);
    for (const r of ROWS) {
      const g = saved.get(r.name);
      expect(g, r.name).toBeTruthy();
      expect.soft({ status: g!.status, side: g!.side ?? null, party: g!.party_size, phone: g!.phone, email: g!.email, note: g!.note ?? "" }, r.name).toEqual({
        status: r.status,
        side: r.side,
        party: r.party,
        phone: r.mobile,
        email: r.email,
        note: r.note,
      });
    }

    const { data: members } = await adminClient().from("guest_group_members").select("guest_id, guest_groups(name)").eq("wedding_id", id);
    const groupsOf = new Map<string, string[]>();
    for (const m of members ?? []) {
      const list = groupsOf.get(m.guest_id as string) ?? [];
      list.push((m.guest_groups as unknown as { name: string }).name);
      groupsOf.set(m.guest_id as string, list);
    }
    for (const r of ROWS) expect.soft((groupsOf.get(saved.get(r.name)!.id as string) ?? []).sort(), `${r.name} groups`).toEqual([...r.groups].sort());

    // The guest list shows them all, with a count badge in the sidebar.
    await expect(page.getByRole("button", { name: `Remove ${ROWS[0].name}` })).toBeVisible();
    await expect(page.getByRole("button", { name: `Remove ${ROWS.at(-1)!.name}` })).toBeVisible();
  });

  test("CSV-02 imported guests fill the seat planner with the right head count", async ({ page }) => {
    const { id } = await premiumSite(page);
    await importFixture(page, id);
    await openSeating(page, id);

    await expect(summary(page)).toContainText(new RegExp(`0\\s*of ${HEADS} guests seated`));
    // The side key is its own line: "Ada" followed by the count, in a span.
    await expect(page.locator("span").filter({ hasText: new RegExp(`^Ada\\s*${headsOn("partner1")}$`) }).first()).toBeVisible();
    await expect(page.locator("span").filter({ hasText: new RegExp(`^Ben\\s*${headsOn("partner2")}$`) }).first()).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Guests seated" })).toHaveAttribute("aria-valuemax", String(HEADS));

    await expect(page.getByRole("group", { name: "Show guests" }).getByRole("button", { name: /^Unseated/ })).toContainText(String(SEATABLE.length));
    await expect(railRows(page)).toHaveCount(SEATABLE.length);
    const declined = ROWS.find((r) => r.status === "declined")!;
    await expect(page.getByRole("button", { name: new RegExp(`^${declined.name},`) })).toHaveCount(0);
  });

  test("CSV-03 adding tables with Several closes the seat shortfall", async ({ page }) => {
    const { id } = await premiumSite(page);
    await importFixture(page, id);
    await openSeating(page, id);
    const ribbon = page.getByRole("tabpanel", { name: "Plan", exact: true });

    await ribbon.getByRole("button", { name: "Round table", exact: true }).click();
    await expect(summary(page)).toContainText(`1 table, 8 seats`);
    await expect(summary(page)).toContainText(`${HEADS - 8} more seats needed`);

    // Enough 8-seat round tables for every head.
    const more = Math.ceil(HEADS / 8) - 1;
    await page.getByRole("tab", { name: "Plan", exact: true }).click();
    await ribbon.getByRole("button", { name: "Several" }).click();
    const menu = page.getByRole("dialog", { name: "Several" });
    const addTable = menu.getByRole("button", { name: "Add a table" });
    for (let n = 5; n < more; n++) await addTable.click();
    await menu.getByRole("button", { name: `Add ${more} tables · ${more * 8} seats` }).click();

    const capacity = (more + 1) * 8;
    await expect(summary(page)).toContainText(`${more + 1} tables, ${capacity} seats, ${capacity} open`);
    await expect(summary(page)).not.toContainText("more seats needed");
  });

  test("CSV-04 imported guests are seated and the progress and side counts follow", async ({ page }) => {
    const { id } = await premiumSite(page);
    await importFixture(page, id);
    await updateWebsite(id, {
      seating_plan: {
        tables: [
          { id: "t1", name: "Table 1", shape: "round", seats: 10, x: 25, y: 40 },
          { id: "t2", name: "Table 2", shape: "round", seats: 10, x: 75, y: 70 },
        ],
        elements: [],
        assignments: {},
        sides: {},
      },
    });
    await openSeating(page, id);

    // Two parties through the Table tab's picker, one by drag and drop.
    const [a, b, c] = SEATABLE.filter((r) => r.party > 1).slice(0, 3);
    await page.getByRole("button", { name: /^Table 1, \d+ of 10 seats taken/ }).click();
    for (const r of [a, b]) {
      await page.getByRole("combobox", { name: "Seat a guest at Table 1" }).click();
      await page.getByRole("option", { name: `${r.name} (${r.party})` }).click();
    }
    await page.getByRole("button", { name: new RegExp(`^${c.name}, party of ${c.party}, not seated`) }).dragTo(
      page.getByRole("button", { name: /^Table 2, \d+ of 10 seats taken/ }),
    );

    const seated = a.party + b.party + c.party;
    await expect(summary(page)).toContainText(new RegExp(`${seated}\\s*of ${HEADS} guests seated`));
    await expect(page.getByRole("progressbar", { name: "Guests seated" })).toHaveAttribute("aria-valuenow", String(seated));
    await expect(page.getByRole("button", { name: `Table 1, ${a.party + b.party} of 10 seats taken` })).toBeVisible();

    const ids = await guestsByName(id);
    await expect
      .poll(async () => ((await weddingRow(id)).seating_plan as { assignments: Record<string, string> }).assignments, { timeout: 15_000 })
      .toEqual({ [ids.get(a.name)!.id]: "t1", [ids.get(b.name)!.id]: "t1", [ids.get(c.name)!.id]: "t2" });
  });

  test("CSV-05 RSVPs from imported guests reach the RSVP dashboard and the seat planner", async ({ page, browser }) => {
    const { id, slug } = await premiumSite(page);
    await importFixture(page, id);
    const waiting = ROWS.filter((r) => r.status === "invited" || r.status === "pending");
    const [viaForm, ...rest] = waiting;
    const accepts = rest.slice(0, 5);
    const declines = rest.slice(5, 7);

    // One guest replies through the real form, typing the name from the spreadsheet.
    const guest = await (await browser.newContext()).newPage();
    await guest.goto(`/wedding/${slug}`);
    await openInvitation(guest);
    await guest.getByRole("button", { name: "Reply", exact: true }).click();
    await guest.getByLabel("Full name").fill(viaForm.name);
    await guest.getByLabel("Full name").blur();
    await expect(guest.getByText(/^We found your invitation/)).toBeVisible();
    await guest.getByRole("button", { name: "Attending", exact: true }).click();
    await guest.getByLabel("Email", { exact: true }).fill(viaForm.email);
    await guest.getByRole("button", { name: "Send reply" }).click();
    await expect(guest.getByRole("status").filter({ hasText: "Thank you" })).toBeVisible();
    await guest.context().close();

    // The rest arrive the way other guests' browsers send them on a Premium site: the typed name
    // is matched against the list first (open-invite matching), then sent with the guest's id.
    const anon = anonClient();
    const reply = async (r: Row, attending: boolean) => {
      const { data: match, error } = await anon.rpc("match_open_invite", { p_wedding_id: id, p_name: r.name });
      expect(error).toBeNull();
      const guestId = (match as { status: string; guest_id: string }[])[0]?.guest_id ?? null;
      const insert = await anon.from("rsvps").insert({ wedding_id: id, guest_id: guestId, guest_name: r.name, attending, meal_choice: attending ? "Fish" : null });
      expect(insert.error).toBeNull();
    };
    for (const r of accepts) await reply(r, true);
    for (const r of declines) await reply(r, false);

    // Each RSVP is linked to its imported guest, whose status follows.
    const ids = await guestsByName(id);
    const { data: rsvps } = await adminClient().from("rsvps").select("guest_name, guest_id").eq("wedding_id", id);
    for (const r of rsvps ?? []) expect.soft(r.guest_id, `${r.guest_name} linked`).toBe(ids.get(r.guest_name as string)?.id);
    for (const r of [viaForm, ...accepts]) expect.soft(ids.get(r.name)?.status, r.name).toBe("attending");
    for (const r of declines) expect.soft(ids.get(r.name)?.status, r.name).toBe("declined");

    const attending = 1 + accepts.length;
    await page.goto(`/dashboard/manage/${id}?tab=rsvps`);
    await expect(page.getByText("Responses", { exact: true }).locator("..")).toContainText(String(attending + declines.length));
    await expect(page.getByText("Attending", { exact: true }).first().locator("..")).toContainText(String(attending));
    await expect(page.getByText("Declined", { exact: true }).first().locator("..")).toContainText(String(declines.length));

    // In the planner: more guests are going, and the two who declined no longer need a seat.
    await openSeating(page, id);
    const goingBefore = ROWS.filter((r) => r.status === "attending").length;
    await page.getByRole("group", { name: "Show guests" }).getByRole("button", { name: /^All/ }).click();
    await page.getByRole("group", { name: "RSVP" }).getByRole("button", { name: "Going" }).click();
    await expect(railRows(page)).toHaveCount(goingBefore + attending);
    for (const r of declines) await expect(page.getByRole("button", { name: new RegExp(`^${r.name},`) })).toHaveCount(0);
    const heads = HEADS - declines.reduce((n, r) => n + r.party, 0);
    await expect(summary(page)).toContainText(new RegExp(`0\\s*of ${heads} guests seated`));
  });

  test("CSV-14 with open-invite matching off, the database links typed names to imported guests", async ({ page }) => {
    const { id } = await premiumSite(page);
    await updateWebsite(id, { open_invite_matching: false });
    await importFixture(page, id);
    const [yes, no] = ROWS.filter((r) => r.status === "invited");

    const anon = anonClient();
    // No guest id: an older browser, or a site that turned matching off. The database matches the name.
    expect((await anon.from("rsvps").insert({ wedding_id: id, guest_name: yes.name, attending: true })).error).toBeNull();
    expect((await anon.from("rsvps").insert({ wedding_id: id, guest_name: no.name.toUpperCase(), attending: false })).error).toBeNull();

    const ids = await guestsByName(id);
    expect([ids.get(yes.name)?.status, ids.get(no.name)?.status]).toEqual(["attending", "declined"]);
    const { data } = await adminClient().from("rsvps").select("guest_id").eq("wedding_id", id);
    expect((data ?? []).map((r) => r.guest_id).sort()).toEqual([ids.get(yes.name)!.id, ids.get(no.name)!.id].sort());
  });

  test("CSV-06 side accepts partner names, 'X's side' and 1/2", async ({ page }) => {
    const { id } = await premiumSite(page);
    await page.goto(`/dashboard/manage/${id}?tab=guests`);
    await importText(page, "Name,Side\nS One,Ada\nS Two,Ben's side\nS Three,1\nS Four,2\nS Five,\nS Six,Someone\n");
    await expect(page.getByText("Imported 6 guests.")).toBeVisible();
    await expect.poll(() => guestCount(id)).toBe(6);
    const saved = await guestsByName(id);
    expect(["S One", "S Two", "S Three", "S Four", "S Five", "S Six"].map((n) => saved.get(n)?.side ?? null)).toEqual([
      "partner1",
      "partner2",
      "partner1",
      "partner2",
      null,
      null,
    ]);
  });

  test("CSV-07 a guest can be in several groups (';' or '|')", async ({ page }) => {
    const { id } = await premiumSite(page);
    await page.goto(`/dashboard/manage/${id}?tab=guests`);
    await importText(page, 'Name,Group\nG One,Family; Church\nG Two,Work|Choir\n');
    await expect(page.getByText("Imported 2 guests, created 4 groups.")).toBeVisible();
    await expect
      .poll(async () => {
        const { data } = await adminClient().from("guest_group_members").select("guests(name), guest_groups(name)").eq("wedding_id", id);
        return (data ?? [])
          .map((m) => `${(m.guests as unknown as { name: string }).name}:${(m.guest_groups as unknown as { name: string }).name}`)
          .sort();
      }, { timeout: 15_000 })
      .toEqual(["G One:Church", "G One:Family", "G Two:Choir", "G Two:Work"]);
  });

  test("CSV-08 blank names, bad statuses and odd party sizes are handled", async ({ page }) => {
    const { id } = await premiumSite(page);
    await page.goto(`/dashboard/manage/${id}?tab=guests`);
    await importText(page, "Name,Party size,Status\nZero Party,0,attending\nHuge Party,99,attending\nWord Party,two,pending\nMaybe Status,1,maybe\n,2,attending\n");
    await expect(page.getByText("Imported 4 guests.")).toBeVisible();
    await expect.poll(() => guestCount(id)).toBe(4);
    const saved = await guestsByName(id);
    expect(["Zero Party", "Huge Party", "Word Party", "Maybe Status"].map((n) => [saved.get(n)?.party_size, saved.get(n)?.status])).toEqual([
      [1, "attending"],
      [20, "attending"],
      [1, "pending"],
      [1, "invited"],
    ]);
  });

  test("CSV-09 header aliases are recognised", async ({ page }) => {
    const { id } = await premiumSite(page);
    await page.goto(`/dashboard/manage/${id}?tab=guests`);
    await importText(page, "Guest,Headcount,RSVP,Guest of,Cellphone,Tags\nAlias Person,3,declined,Ben,09170000001,Neighbours\n");
    await expect(page.getByText("Imported 1 guest, created 1 group.")).toBeVisible();
    await expect.poll(() => guestCount(id)).toBe(1);
    const g = (await guestsByName(id)).get("Alias Person");
    expect([g?.party_size, g?.status, g?.side, g?.phone]).toEqual([3, "declined", "partner2", "09170000001"]);
  });

  test("CSV-10 the exported guest list re-imports without duplicates", async ({ page }) => {
    const { id } = await premiumSite(page);
    await importFixture(page, id);

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
    await csvInput(page).setInputFiles((await download.path())!);
    await expect(page.getByText(`Imported 0 guests, skipped ${ROWS.length} already on your list.`)).toBeVisible();
    expect(await guestCount(id)).toBe(ROWS.length);
  });

  test("CSV-11 the seating CSV after import lists every guest who needs a seat", async ({ page }) => {
    const { id } = await premiumSite(page);
    await importFixture(page, id);
    const ids = await guestsByName(id);
    const first = SEATABLE[0];
    await updateWebsite(id, {
      seating_plan: { tables: [{ id: "t1", name: "Table 1", shape: "round", seats: 8, x: 40, y: 40 }], elements: [], assignments: { [ids.get(first.name)!.id]: "t1" }, sides: {} },
    });
    await openSeating(page, id);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("group", { name: "Quick access" }).getByRole("button", { name: "Export seating chart as CSV" }).click(),
    ]);
    const lines = readFileSync((await download.path())!, "utf8").trim().split(/\r?\n/).slice(1);
    expect(lines).toHaveLength(SEATABLE.length);
    expect(lines.filter((l) => l.startsWith("Table 1,"))).toEqual([expect.stringContaining(first.name)]);
    expect(lines.filter((l) => l.startsWith("Not seated,"))).toHaveLength(SEATABLE.length - 1);
    for (const r of ROWS.filter((x) => x.status === "declined")) expect.soft(lines.join("\n")).not.toContain(r.name);
  });

  test("CSV-12 files over 1 MB are refused", async ({ page }) => {
    const { id } = await premiumSite(page);
    await page.goto(`/dashboard/manage/${id}?tab=guests`);
    const big = "Name,Note\n" + Array.from({ length: 12_000 }, (_, i) => `Guest ${i},${"x".repeat(90)}`).join("\n");
    expect(Buffer.byteLength(big)).toBeGreaterThan(1024 * 1024);
    await importText(page, big, "big.csv");
    await expect(page.getByText("That file is over 1 MB. Split it into smaller files and import each one.")).toBeVisible();
    expect(await guestCount(id)).toBe(0);
  });

  test("CSV-13 only the first 2,000 rows are read", async ({ page }) => {
    const { id } = await premiumSite(page);
    await page.goto(`/dashboard/manage/${id}?tab=guests`);
    const csv = "Name\n" + Array.from({ length: 2005 }, (_, i) => `Bulk Guest ${String(i).padStart(4, "0")}`).join("\n");
    await importText(page, csv, "bulk.csv");
    await expect(page.getByText("Imported 2000 guests. Only the first 2000 rows were read.")).toBeVisible();
    await expect.poll(() => guestCount(id), { timeout: 60_000 }).toBe(2000);
  });
});
