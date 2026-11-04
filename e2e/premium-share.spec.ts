import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { buyWebsite, createConfirmedAccount, logIn, publishWebsite, weddingRow, type TestAccount } from "./support";

// QR-01 … QR-05, INV-01, INV-02, SMS-01 … SMS-03 in e2e/TEST_CASES.csv.
// The Share tab (QR codes, text invitations) and the printable invitation.

// support.ts loads .env.local, so this reflects how the dev server is configured.
const SMS_CONFIGURED = Boolean(process.env.UNISMS_SECRET_KEY && process.env.UNISMS_SENDER_ID);

const openShare = (page: Page, weddingId: string) => page.goto(`/dashboard/manage/${weddingId}?tab=share`);
const qrLink = (page: Page, label: string) => page.getByRole("textbox", { name: `${label} link`, exact: true });

test.describe("Share kit, invitation download and text invitations", () => {
  let account: TestAccount;

  test.beforeEach(async ({ page }) => {
    account = await createConfirmedAccount("share");
    await logIn(page, account.email, account.password);
  });

  test("QR-01 Premium share tab shows RSVP and invitation QR codes that point at the site", async ({ page, baseURL }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);

    await openShare(page, id);
    await expect(page.getByRole("img", { name: "QR code for RSVP" })).toBeVisible();
    await expect(page.getByRole("img", { name: "QR code for Digital invitation" })).toBeVisible();
    await expect(qrLink(page, "RSVP")).toHaveValue(`${baseURL}/wedding/${slug}#rsvp`);
    await expect(qrLink(page, "Digital invitation")).toHaveValue(`${baseURL}/wedding/${slug}/invitation`);
  });

  test("QR-02 a Location QR appears once a map link is set", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const row = await weddingRow(id);
    await publishWebsite(id, { sections: { ...(row.sections as object), venueMapUrl: "https://maps.google.com/?q=Manila+Cathedral" } });

    await openShare(page, id);
    await expect(page.getByRole("img", { name: "QR code for Location" })).toBeVisible();
    await expect(qrLink(page, "Location")).toHaveValue("https://maps.google.com/?q=Manila+Cathedral");
  });

  test("QR-03 QR codes download as PNG and SVG", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id); // names become Ada & Ben

    await openShare(page, id);
    const [png] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download RSVP QR code as PNG" }).click(),
    ]);
    expect(png.suggestedFilename()).toBe("ada-ben-rsvp-qr.png");
    // PNG files start with the 8-byte signature 89 50 4E 47 0D 0A 1A 0A.
    expect(readFileSync((await png.path())!).subarray(0, 4).toString("hex")).toBe("89504e47");

    const [svg] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download RSVP QR code as SVG" }).click(),
    ]);
    expect(svg.suggestedFilename()).toBe("ada-ben-rsvp-qr.svg");
    expect(readFileSync((await svg.path())!, "utf8")).toContain("<svg");
  });

  test("QR-04 draft sites are told QR codes work after publishing", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await openShare(page, id);
    await expect(page.getByText(/Your website is still a draft\. The codes are ready to download/)).toBeVisible();
  });

  test("QR-05 Essential: QR codes are locked behind Premium", async ({ page }) => {
    const id = await buyWebsite(page, "essential");
    await openShare(page, id);
    await expect(page.getByRole("heading", { name: "QR codes for everything you print" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade for ₱800.00" })).toBeVisible();
    await expect(page.locator("[inert]").getByRole("button", { name: "Download RSVP QR code as PNG" })).toHaveCount(1);
  });

  test("INV-01 guests can download the printable invitation on Premium", async ({ page, browser }) => {
    const id = await buyWebsite(page, "premium");
    const slug = await publishWebsite(id);

    const guest = await (await browser.newContext()).newPage();
    await guest.goto(`/wedding/${slug}/invitation`);
    await expect(guest.getByRole("heading", { name: "Your invitation" })).toBeVisible();
    const [download] = await Promise.all([
      guest.waitForEvent("download", { timeout: 30_000 }),
      guest.getByRole("button", { name: "Download image" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.(png|jpe?g)$/);
    await guest.context().close();
  });

  test("INV-02 Classic: the printable invitation is not available", async ({ page, browser }) => {
    const id = await buyWebsite(page, "classic");
    const slug = await publishWebsite(id);

    const guest = await (await browser.newContext()).newPage();
    await guest.goto(`/wedding/${slug}/invitation`);
    await expect(guest.getByText("This invitation isn’t available to download")).toBeVisible();
    await expect(guest.getByRole("link", { name: "Go to the website" })).toHaveAttribute("href", `/wedding/${slug}`);
    await guest.context().close();
  });

  test("SMS-01 the text invitations panel explains why it can't send yet", async ({ page }) => {
    const id = await buyWebsite(page, "premium"); // draft
    await openShare(page, id);
    await expect(page.getByText(/Publish your website first\. The links in your texts open your website/)).toBeVisible();
    const notOn = page.getByText(/Texting isn.t switched on for this account yet/);
    if (SMS_CONFIGURED) await expect(notOn).toHaveCount(0);
    else await expect(notOn).toBeVisible();
  });

  test("SMS-02 sending texts from a draft site is refused", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    const res = await page.request.post("/api/sms/invitations", {
      data: { weddingId: id, template: "We'd love to see you there!", manual: [{ name: "Test", phone: "09171234567" }] },
    });
    expect(res.status()).toBe(409);
    expect((await res.json()).error).toBe("Publish your website first, so the links in your texts open.");
  });

  test("SMS-03 sending is refused cleanly without UniSMS, and links in the message are refused with it", async ({ page }) => {
    const id = await buyWebsite(page, "premium");
    await publishWebsite(id);
    const res = await page.request.post("/api/sms/invitations", {
      data: { weddingId: id, template: "RSVP at https://example.com please", manual: [{ name: "Test", phone: "09171234567" }] },
    });
    const body = await res.json();
    if (SMS_CONFIGURED) {
      expect(res.status()).toBe(400);
      expect(body.error).toMatch(/^Leave web addresses out of your message/);
    } else {
      expect(res.status()).toBe(503);
      expect(body.error).toBe("Texting isn't set up yet. Please try again later.");
    }
  });
});
