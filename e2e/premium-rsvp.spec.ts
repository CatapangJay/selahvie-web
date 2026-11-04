import { readFileSync } from "node:fs";
import { test, expect, type Browser, type Page } from "@playwright/test";
import {
  addGuest,
  adminClient,
  anonClient,
  buyWebsite,
  createConfirmedAccount,
  guestRow,
  logIn,
  openInvitation,
  publishWebsite,
  updateWebsite,
  userClient,
  type TestAccount,
} from "./support";

// RSVP-01 … RSVP-12 in e2e/TEST_CASES.csv. Guests replying on a published Premium site
// (Monochrome, t13, whose form requires an email), and the rules the database enforces on what they send.

const MEALS = { meal_options: ["Beef", "Fish"] };

/** A separate browser with no session: exactly what a guest has. */
async function guestPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  return context.newPage();
}

async function openRsvpForm(page: Page) {
  await page.getByRole("button", { name: "Reply", exact: true }).click();
  await expect(page.getByRole("form", { name: "RSVP" })).toBeVisible();
}

async function latestRsvp(weddingId: string) {
  const { data } = await adminClient()
    .from("rsvps")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

test.describe("Guest RSVPs and the couple's RSVP dashboard", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("rsvp");
    await logIn(page, account.email, account.password);
  });

  test("RSVP-01 a guest RSVPs from their personal link and the couple sees it", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id, MEALS);
    const guest = await addGuest(id, "Clara Oswald");

    const g = await guestPage(browser);
    await g.goto(`/wedding/${slug}?invite=${guest.code}`);
    await expect(g.getByText("Reserved for")).toBeVisible();
    await expect(g.getByText("Clara Oswald").first()).toBeVisible();
    await openInvitation(g);

    await openRsvpForm(g);
    await expect(g.getByLabel("Full name")).toHaveValue("Clara Oswald");
    await g.getByRole("button", { name: "Attending", exact: true }).click();
    await g.getByRole("button", { name: "Fish", exact: true }).click();
    await g.getByLabel("Email", { exact: true }).fill("clara@example.com");
    await g.getByLabel("Dietary restrictions (optional)").fill("No shellfish");
    await g.getByRole("button", { name: "Send reply" }).click();
    await expect(g.getByRole("status").filter({ hasText: "Thank you, Clara" })).toBeVisible();
    await g.context().close();

    const rsvp = await latestRsvp(id);
    expect(rsvp).toMatchObject({ guest_id: guest.id, attending: true, meal_choice: "Fish", dietary_restrictions: "No shellfish" });
    expect((await guestRow(guest.id))?.status).toBe("attending");

    await page.goto(`/dashboard/manage/${id}?tab=rsvps`);
    await expect(page.getByText("Responses", { exact: true }).locator("..")).toContainText("1");
    await expect(page.getByText("Attending", { exact: true }).first().locator("..")).toContainText("1");
    await expect(page.getByText("1 attending guest has a dietary note.")).toBeVisible();
    await expect(page.getByText("No shellfish").first()).toBeVisible();
    await expect(page.getByText(/^Fish/).first()).toBeVisible();
  });

  test("RSVP-02 a guest who declines is marked declined", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id, MEALS);
    const guest = await addGuest(id, "Danny Pink");

    const g = await guestPage(browser);
    await g.goto(`/wedding/${slug}?invite=${guest.code}`);
    await openInvitation(g);
    await openRsvpForm(g);
    await g.getByRole("button", { name: "Decline", exact: true }).click();
    await g.getByLabel("Email", { exact: true }).fill("danny@example.com");
    await g.getByRole("button", { name: "Send reply" }).click();
    await expect(g.getByText("We'll miss you, and we're grateful you let us know.")).toBeVisible();
    await g.context().close();

    await expect.poll(async () => (await guestRow(guest.id))?.status).toBe("declined");
    await page.goto(`/dashboard/manage/${id}?tab=rsvps`);
    await expect(page.getByText("Declined", { exact: true }).first().locator("..")).toContainText("1");
  });

  test("RSVP-03 open invitation: a matched guest with a party of 3 can name 2 extra guests", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id, MEALS);
    const guest = await addGuest(id, "Rose Tyler", { partySize: 3 });

    const g = await guestPage(browser);
    await g.goto(`/wedding/${slug}`);
    await openInvitation(g);
    await openRsvpForm(g);
    await g.getByLabel("Full name").fill("Rose Tyler");
    await g.getByLabel("Full name").blur();
    await expect(g.getByText("We found your invitation. You're welcome to bring up to 2 guests.")).toBeVisible();

    await g.getByRole("button", { name: "Attending", exact: true }).click();
    await g.getByRole("button", { name: "Add a guest" }).click();
    await g.getByLabel("Additional guest 1 full name").fill("Jackie Tyler");
    await g.getByRole("button", { name: "Add another guest" }).click();
    await g.getByLabel("Additional guest 2 full name").fill("Mickey Smith");
    await g.getByLabel("Email", { exact: true }).fill("rose@example.com");
    await g.getByRole("button", { name: "Send reply" }).click();
    await expect(g.getByRole("status").filter({ hasText: "Thank you, Rose" })).toBeVisible();
    await g.context().close();

    const rsvp = await latestRsvp(id);
    expect(rsvp).toMatchObject({ guest_id: guest.id, additional_guests: 2, additional_guest_names: ["Jackie Tyler", "Mickey Smith"] });
  });

  test("RSVP-04 the database caps extra guests at what the couple allowed", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id);
    const guest = await addGuest(id, "Bill Potts", { partySize: 2 });

    // Straight to the database, the way a tampered browser would.
    const { error } = await anonClient().from("rsvps").insert({
      wedding_id: id,
      guest_id: guest.id,
      guest_name: "Bill Potts",
      attending: true,
      plus_one: true,
      additional_guests: 5,
      additional_guest_names: ["A One", "B Two", "C Three", "D Four", "E Five"],
    });
    expect(error).toBeNull();
    const rsvp = await latestRsvp(id);
    expect(rsvp?.additional_guests).toBe(1);
    expect(rsvp?.additional_guest_names).toEqual(["A One"]);
  });

  test("RSVP-05 RSVPs to a draft website are rejected", async ({ page }) => {
    const id = await buyWebsite(page, "premium"); // never published
    const { error } = await anonClient().from("rsvps").insert({ wedding_id: id, guest_name: "Sneaky", attending: true });
    expect(error, "insert into a draft should be refused").not.toBeNull();
    expect(await latestRsvp(id)).toBeNull();
  });

  test("RSVP-06 visitors and other couples cannot read RSVPs or guest lists", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id);
    await addGuest(id, "Private Person", { email: "private@example.com" });
    await adminClient().from("rsvps").insert({ wedding_id: id, guest_name: "Private Person", attending: true });

    const anon = anonClient();
    expect((await anon.from("rsvps").select("id").eq("wedding_id", id)).data ?? []).toEqual([]);
    expect((await anon.from("guests").select("id").eq("wedding_id", id)).data ?? []).toEqual([]);

    const other = await userClient(await createConfirmedAccount("snoop"));
    expect((await other.from("rsvps").select("id").eq("wedding_id", id)).data ?? []).toEqual([]);
    expect((await other.from("guests").select("id").eq("wedding_id", id)).data ?? []).toEqual([]);

    // Sanity: the owner can read them, so the empty results above are the policy at work.
    const owner = await userClient(account);
    expect(((await owner.from("guests").select("id").eq("wedding_id", id)).data ?? []).length).toBe(1);
  });

  test("RSVP-07 'Find your invitation' by name opens the guest's personal invitation", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    const guest = await addGuest(id, "Nardole Smith");

    const g = await guestPage(browser);
    await g.goto(`/wedding/${slug}`);
    await openInvitation(g);
    await g.getByRole("button", { name: "Find your invitation" }).click();
    await g.getByLabel("Name or invite code").fill("Nardole Smith");
    await g.getByRole("button", { name: "Find my invitation" }).click();

    await expect(g).toHaveURL(new RegExp(`invite=${guest.code}`));
    await expect(g.getByLabel("Invitation for Nardole Smith").or(g.getByText("Reserved for")).first()).toBeVisible();
    await g.context().close();
  });

  test("RSVP-08 two guests with the same name are asked for their code", async ({ page, request }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id);
    await addGuest(id, "John Smith");
    const second = await addGuest(id, "John Smith");

    const byName = await request.post(`/api/sites/${id}/find`, { data: { query: "John Smith", step: "lookup" } });
    expect(await byName.json()).toEqual({ status: "needs-code" });

    const byCode = await request.post(`/api/sites/${id}/find`, { data: { query: second.code, step: "code" } });
    expect(await byCode.json()).toEqual({ status: "found", code: second.code });
  });

  test("RSVP-09 a wrong invite code opens the finder with an explanation", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    await addGuest(id, "Missy Master");

    const g = await guestPage(browser);
    await g.goto(`/wedding/${slug}?invite=WRONGCODE`);
    await expect(g.getByText("That invitation link didn't work. Try your name or the code on your invitation.")).toBeVisible();
    await expect(g.getByText("Reserved for")).toHaveCount(0);
    await g.context().close();
  });

  test("RSVP-10 turning off name lookup disables 'Find your invitation'", async ({ page, request, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id, { invite_lookup_enabled: false });
    await addGuest(id, "Yasmin Khan");

    const res = await request.post(`/api/sites/${id}/find`, { data: { query: "Yasmin Khan", step: "lookup" } });
    expect(res.status()).toBe(404);

    const g = await guestPage(browser);
    await g.goto(`/wedding/${slug}`);
    await openInvitation(g);
    await expect(g.getByRole("button", { name: "Kindly Reply" }).or(g.getByRole("button", { name: "Reply", exact: true }))).toBeVisible();
    await expect(g.getByRole("button", { name: "Find your invitation" })).toHaveCount(0);
    await g.context().close();
  });

  test("RSVP-11 RSVP responses export to CSV", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id, MEALS);
    await adminClient().from("rsvps").insert({ wedding_id: id, guest_name: "Graham O'Brien", attending: true, meal_choice: "Beef" });

    await page.goto(`/dashboard/manage/${id}?tab=rsvps`);
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download CSV" }).click()]);
    expect(download.suggestedFilename()).toBe("rsvps.csv");
    const csv = readFileSync((await download.path())!, "utf8");
    expect(csv).toContain("Graham O'Brien");
    expect(csv).toContain("Attending");
    expect(csv).toContain("Beef");
  });

  test("RSVP-12 without plus-ones, an unmatched guest's extra person is dropped", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id, { allow_plus_one: false });
    await updateWebsite(id, { open_invite_matching: true });

    const { error } = await anonClient().from("rsvps").insert({
      wedding_id: id,
      guest_name: "Totally Unknown Visitor",
      attending: true,
      plus_one: true,
      plus_one_name: "Their Friend",
      additional_guests: 1,
    });
    expect(error).toBeNull();
    const rsvp = await latestRsvp(id);
    expect(rsvp).toMatchObject({ additional_guests: 0, plus_one: false });
  });
});
