import { test, expect, type APIRequestContext } from "@playwright/test";
import { buyWebsite, createConfirmedAccount, logIn, publishWebsite, updateWebsite, weddingRow, type TestAccount } from "./support";

// STU-01 … STU-10 in e2e/TEST_CASES.csv. A signed-in couple customizing the website they bought.

const STEPS = [
  "Couple & venue",
  "Colors",
  "Photos, story & music",
  "RSVP settings",
  "Entourage",
  "Extra sections",
  "Guest list",
  "Personal touches",
  "Review & publish",
];

/** The studio saves ~600 ms after the last change; poll the row until it lands. */
const pollRow = (weddingId: string, pick: (row: Record<string, unknown>) => unknown) =>
  expect.poll(async () => pick(await weddingRow(weddingId)), { timeout: 20_000 });

// The `request` fixture carries no cookies, so this is what a guest's browser receives.
const visitorConfig = async (request: APIRequestContext, slug: string) => {
  const res = await request.get(`/api/sites/${slug}`);
  expect(res.status()).toBe(200);
  return (await res.json()).config;
};

test.describe("Studio: customizing a bought website", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("studio");
    await logIn(page, account.email, account.password);
  });

  test("STU-01 the studio lists every step for a Premium website", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await page.goto(`/dashboard/customize/${id}`);
    for (const step of STEPS) {
      await expect(page.getByText(step, { exact: true }).first(), step).toBeVisible();
    }
  });

  test("STU-02 another couple's website cannot be opened in the studio or manage pages", async ({ page, browser }) => {
    const theirs = await buyWebsite(page, "premium");
    await updateWebsite(theirs, { partner1_name: "Secretname" });

    const intruder = await createConfirmedAccount("intruder");
    const context = await browser.newContext();
    const other = await context.newPage();
    await logIn(other, intruder.email, intruder.password);

    for (const path of [`/dashboard/customize/${theirs}`, `/dashboard/manage/${theirs}`]) {
      await other.goto(path);
      await expect(other.getByText(/404|could not be found|not found/i).first(), path).toBeVisible();
      await expect(other.getByText("Secretname")).toHaveCount(0);
    }
    await context.close();
  });

  test("STU-03 RSVP settings: meal options, reply-by and plus-ones are saved", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await page.goto(`/dashboard/customize/${id}?step=rsvp`);

    await page.getByRole("textbox", { name: "New meal option" }).fill("Vegan");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByRole("button", { name: "Remove Vegan" })).toBeVisible();

    await page.getByRole("button", { name: /Reply by/ }).click();
    await page.getByRole("button", { name: "Today", exact: true }).click();

    const plusOnes = page.getByRole("switch", { name: "Allow plus-ones" });
    if ((await plusOnes.getAttribute("aria-checked")) !== "true") await plusOnes.click();

    await pollRow(id, (r) => (r.meal_options as string[]).includes("Vegan")).toBe(true);
    await pollRow(id, (r) => r.allow_plus_one).toBe(true);
    await pollRow(id, (r) => Boolean(r.rsvp_deadline)).toBe(true);

    await page.reload();
    await expect(page.getByRole("button", { name: "Remove Vegan" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Allow plus-ones" })).toHaveAttribute("aria-checked", "true");
  });

  test("STU-04 changing the primary color is saved", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await page.goto(`/dashboard/customize/${id}?step=look`);
    await page.locator("#primaryColor").fill("#335577");
    await pollRow(id, (r) => r.primary_color).toBe("#335577");
  });

  test("STU-05 edits to a published website reach visitors without publishing again", async ({ page, request }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);
    await page.goto(`/dashboard/customize/${id}?step=couple`);
    await page.getByLabel("Venue name").fill("The Glasshouse");
    await pollRow(id, (r) => r.venue_name).toBe("The Glasshouse");
    expect((await visitorConfig(request, slug)).venueName).toBe("The Glasshouse");
  });

  test("STU-06 Classic: an entourage member is saved and shown to visitors", async ({ page, request }) => {
    const id = await buyWebsite(page, "classic");
    const slug = await publishWebsite(id);
    await page.goto(`/dashboard/customize/${id}?step=entourage`);
    await page.getByRole("button", { name: "Godmother", exact: true }).click();
    await page.getByRole("textbox", { name: "Name, Godmother" }).fill("Maria Santos");

    await pollRow(id, (r) => ((r.sections as { weddingParty?: { name: string }[] }).weddingParty ?? []).map((m) => m.name)).toContain(
      "Maria Santos",
    );
    const party = (await visitorConfig(request, slug)).weddingParty as { name: string }[];
    expect(party.map((m) => m.name)).toContain("Maria Santos");
  });

  test("STU-07 Classic: an FAQ question is saved and shown to visitors", async ({ page, request }) => {
    const id = await buyWebsite(page, "classic");
    const slug = await publishWebsite(id);
    await page.goto(`/dashboard/customize/${id}?step=sections`);
    await page.getByRole("button", { name: "Add question" }).click();
    await page.getByLabel("Question").last().fill("Is there parking?");
    await page.getByLabel("Answer").last().fill("Yes, behind the chapel.");

    await pollRow(id, (r) => ((r.sections as { faq?: { question: string }[] }).faq ?? []).map((f) => f.question)).toContain(
      "Is there parking?",
    );
    const faq = (await visitorConfig(request, slug)).faq as { question: string }[];
    expect(faq.map((f) => f.question)).toContain("Is there parking?");
  });

  test("STU-08 Essential: entourage and FAQ editors are locked with the Classic price", async ({ page }) => {
    const id = await buyWebsite(page, "essential");

    await page.goto(`/dashboard/customize/${id}?step=entourage`);
    await expect(page.getByText("Entourage comes with Classic.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade for ₱300" }).first()).toBeVisible();
    // The editor stays visible so couples see what they'd get, but it is inert.
    await expect(page.locator("[inert]").getByRole("button", { name: "Godmother", exact: true })).toHaveCount(1);

    await page.goto(`/dashboard/customize/${id}?step=sections`);
    await expect(page.getByText("FAQ comes with Classic.")).toBeVisible();
    await expect(page.locator("[inert]").getByRole("button", { name: "Add question" })).toHaveCount(1);
  });

  test("STU-09 Essential: content from higher packages is never sent to visitors", async ({ page, request }) => {
    const id = await buyWebsite(page, "essential");
    const row = await weddingRow(id);
    const slug = await publishWebsite(id, {
      sections: {
        ...(row.sections as object),
        faq: [{ id: "f1", question: "Locked question?", answer: "Locked answer" }],
        weddingParty: [{ id: "m1", name: "Locked Sponsor", role: "Godmother" }],
      },
      private_sections: [{ id: "p1", kind: "text", title: "Locked note", body: "x", audience: { groupIds: [], guestIds: [] } }],
    });

    const config = await visitorConfig(request, slug);
    expect(config.faq).toEqual([]);
    expect(config.weddingParty).toEqual([]);
    expect(config.privateSections).toEqual([]);
  });

  test("STU-10 Premium: the Personal touches step is unlocked", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await page.goto(`/dashboard/customize/${id}?step=personalize`);
    const greet = page.getByRole("checkbox", { name: "Greet guests by name" });
    await expect(greet).toBeVisible();
    await expect(page.locator("[inert]").getByRole("checkbox", { name: "Greet guests by name" })).toHaveCount(0);
    // The greeting is on by default; switching it off proves the control works and is saved.
    await expect(greet).toBeChecked();
    await greet.uncheck();
    await pollRow(id, (r) => (r.invite_greeting as { enabled?: boolean } | null)?.enabled).toBe(false);
  });
});
