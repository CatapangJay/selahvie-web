import { test, expect, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import {
  addGroup,
  addGuest,
  anonClient,
  buyWebsite,
  createConfirmedAccount,
  logIn,
  openInvitation,
  publishWebsite,
  userClient,
  weddingRow,
  type TestAccount,
} from "./support";

// PER-01 … PER-07, GB-01, GB-02 in e2e/TEST_CASES.csv. Personalized invitations (Premium).

const REHEARSAL = (groupId: string) => ({
  id: "p1",
  kind: "event",
  title: "Rehearsal dinner",
  body: "Just us and family, the night before.",
  eventDate: "2027-02-13",
  eventTime: "7:00 PM",
  eventLocation: "Casa Roces",
  audience: { groupIds: [groupId], guestIds: [] },
});

/** What /api/sites returns to a visitor, optionally arriving with an invite code. */
async function visitorView(request: APIRequestContext, slug: string, code?: string) {
  const res = await request.get(`/api/sites/${slug}${code ? `?invite=${code}` : ""}`);
  expect(res.status()).toBe(200);
  return res.json();
}

async function guestPage(browser: Browser, url: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(url);
  return page;
}

test.describe("Personalized invitations (Premium)", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("personal");
    await logIn(page, account.email, account.password);
  });

  test("PER-01 a private section reaches only its chosen group", async ({ page, request, browser }) => {
    const id = await buyWebsite(page, "premium");
    const amy = await addGuest(id, "Amy Pond");
    const rory = await addGuest(id, "Rory Williams");
    const family = await addGroup(id, "Family", [amy]);
    const slug = await publishWebsite(id, { private_sections: [REHEARSAL(family.id)] });

    expect((await visitorView(request, slug)).config.privateSections).toEqual([]);
    expect((await visitorView(request, slug, rory.code)).config.privateSections).toEqual([]);
    const forAmy = (await visitorView(request, slug, amy.code)).config.privateSections as { title: string }[];
    expect(forAmy.map((s) => s.title)).toEqual(["Rehearsal dinner"]);

    const amyPage = await guestPage(browser, `/wedding/${slug}?invite=${amy.code}`);
    await openInvitation(amyPage);
    await expect(amyPage.getByText("Rehearsal dinner")).toBeVisible();
    await amyPage.context().close();

    const roryPage = await guestPage(browser, `/wedding/${slug}?invite=${rory.code}`);
    await openInvitation(roryPage);
    await expect(roryPage.getByRole("form", { name: "RSVP" }).or(roryPage.getByRole("button", { name: "Reply", exact: true }))).toBeVisible();
    await expect(roryPage.getByText("Rehearsal dinner")).toHaveCount(0);
    await roryPage.context().close();
  });

  test("PER-02 a couple cannot upgrade their own package by writing to the database", async ({ page }) => {
    const id = await buyWebsite(page, "essential");
    const owner = await userClient(account);

    const { error } = await owner.from("weddings").update({ tier: "premium" }).eq("id", id);
    expect(error?.message).toContain("tier and owner_id can only be changed by the server");
    expect((await weddingRow(id)).tier).toBe("essential");
  });

  test("PER-03 the custom greeting shows to a guest from their link", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const clara = await addGuest(id, "Clara Oswald");
    const slug = await publishWebsite(id, { invite_greeting: { enabled: true, message: "So glad you can make it, Clara." } });

    const g = await guestPage(browser, `/wedding/${slug}?invite=${clara.code}`);
    await openInvitation(g);
    const greeting = g.getByLabel("Invitation for Clara Oswald");
    await expect(greeting).toContainText("Dear");
    await expect(greeting).toContainText("So glad you can make it, Clara.");
    await g.context().close();
  });

  test("PER-04 a section restricted to a group is emptied for everyone else", async ({ page, request }) => {
    const id = await buyWebsite(page, "premium");
    const amy = await addGuest(id, "Amy Pond");
    const family = await addGroup(id, "Family", [amy]);
    const row = await weddingRow(id);
    const slug = await publishWebsite(id, {
      sections: { ...(row.sections as object), faq: [{ id: "f1", question: "Family photos?", answer: "Right after the ceremony." }] },
      section_audiences: { faq: { groupIds: [family.id], guestIds: [] } },
    });

    expect((await visitorView(request, slug)).config.faq).toEqual([]);
    const amyFaq = (await visitorView(request, slug, amy.code)).config.faq as { question: string }[];
    expect(amyFaq.map((f) => f.question)).toEqual(["Family photos?"]);
  });

  test("PER-05 Classic sites ignore invite codes and private sections", async ({ page, request, browser }) => {
    const id = await buyWebsite(page, "classic");
    const guest = await addGuest(id, "Clara Oswald");
    const slug = await publishWebsite(id, {
      private_sections: [{ ...REHEARSAL("x"), audience: { groupIds: [], guestIds: [guest.id] } }],
      invite_greeting: { enabled: true, message: "Hello!" },
    });

    const view = await visitorView(request, slug, guest.code);
    expect(view.invitee).toBeNull();
    expect(view.config.privateSections).toEqual([]);

    const g = await guestPage(browser, `/wedding/${slug}?invite=${guest.code}`);
    await expect(g.getByText("You are invited")).toBeVisible();
    await expect(g.getByText("Reserved for")).toHaveCount(0);
    await g.context().close();
  });

  test("PER-06 the owner can preview the live site as a specific guest", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const clara = await addGuest(id, "Clara Oswald");
    const slug = await publishWebsite(id);

    await page.goto(`/wedding/${slug}`);
    await openInvitation(page);
    await page.getByRole("combobox", { name: "View as" }).click();
    await page.getByRole("option", { name: "Clara Oswald" }).click();

    await expect(page).toHaveURL(new RegExp(`invite=${clara.code}`));
    await expect(page.getByLabel("Invitation for Clara Oswald").or(page.getByText("Reserved for")).first()).toBeVisible();
  });

  test("PER-07 turning the greeting off removes it", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const clara = await addGuest(id, "Clara Oswald");
    const slug = await publishWebsite(id, { invite_greeting: { enabled: false, message: "" } });

    const g = await guestPage(browser, `/wedding/${slug}?invite=${clara.code}`);
    await expect(g.getByText("You are invited")).toBeVisible();
    await openInvitation(g);
    await expect(g.getByLabel("Invitation for Clara Oswald")).toHaveCount(0);
    await g.context().close();
  });
});

test.describe("Guestbook (Premium)", () => {
  // Templates on sale in data/templates.ts.
  const SOLD = ["t12", "t13", "t14", "t15", "t16", "t17"];

  test("GB-01 Premium websites show a guestbook on every template that is for sale", async ({ page, browser }) => {
    const account = await createConfirmedAccount("guestbook-ui");
    await logIn(page, account.email, account.password);

    for (const templateId of SOLD) {
      const id = await buyWebsite(page, "premium", templateId);
      const slug = await publishWebsite(id);
      const g = await guestPage(browser, `/wedding/${slug}`);
      // Every template opens differently; try the title card if there is one, then look for the guestbook anywhere.
      const open = g.getByRole("dialog").getByRole("button").first();
      if (await open.isVisible({ timeout: 3_000 }).catch(() => false)) await open.click().catch(() => {});
      await g.waitForTimeout(1_500);
      const guestbook = g.getByText(/guestbook|well wishes|leave a (note|wish)/i);
      expect.soft(await guestbook.count(), `${templateId} should show a guestbook`).toBeGreaterThan(0);
      await g.context().close();
    }
  });

  test("GB-02 guestbook entries are accepted on Premium and refused on Classic", async ({ page }) => {
    const account = await createConfirmedAccount("guestbook-db");
    await logIn(page, account.email, account.password);
    const premium = await buyWebsite(page, "premium");
    const classic = await buyWebsite(page, "classic");
    await publishWebsite(premium);
    await publishWebsite(classic);

    const anon = anonClient();
    const ok = await anon.from("guestbook_entries").insert({ wedding_id: premium, name: "A Guest", message: "Congratulations!" });
    expect(ok.error).toBeNull();
    const refused = await anon.from("guestbook_entries").insert({ wedding_id: classic, name: "A Guest", message: "Congratulations!" });
    expect(refused.error, "Classic sites have no guestbook").not.toBeNull();
  });
});
