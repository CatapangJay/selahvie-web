import { test, expect } from "@playwright/test";
import { createConfirmedAccount, logIn, DEMO_EMAIL, DEMO_PASSWORD } from "./support";

// AUTH-01 … AUTH-10 in e2e/TEST_CASES.md

test.describe("Authentication and access control", () => {
  test("AUTH-01 anonymous visitor to /dashboard is sent to login with a redirect back", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
    await expect(page.getByRole("heading", { name: "Log in to Selah Vie" })).toBeVisible();
  });

  test("AUTH-02 valid credentials log in and land on the dashboard", async ({ page }) => {
    const account = await createConfirmedAccount("login");
    await logIn(page, account.email, account.password);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Your dashboard|Welcome back/ })).toBeVisible();
  });

  test("AUTH-03 wrong password shows a friendly error and stays on login", async ({ page }) => {
    const account = await createConfirmedAccount("badpw");
    await page.goto("/login");
    await page.getByLabel("Email address").fill(account.email);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("That email and password don't match an account.");
    await expect(page).toHaveURL(/\/login/);
  });

  test("AUTH-04 empty or malformed login fields are rejected before any request", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("Enter a valid email");

    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("Enter a valid email");

    await page.getByLabel("Email address").fill("x@example.com");
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("Enter your password");
  });

  // Sends a real confirmation email. Supabase rate-limits those (a few per hour), so this one is opt-in.
  test("AUTH-05 sign-up with a new email asks the couple to confirm before login", async ({ page }) => {
    test.skip(!process.env.E2E_SEND_SIGNUP_EMAIL, "Set E2E_SEND_SIGNUP_EMAIL=1 to send a real confirmation email (rate-limited by Supabase).");
    const email = `e2e-signup-${Date.now()}@example.com`;
    await page.goto("/login?mode=signup");
    await page.getByLabel("Full name").fill("New Couple");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill("a-long-password-1");
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page.getByText("Check your inbox")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("AUTH-06 sign-up with an existing email is refused and points to login", async ({ page }) => {
    const account = await createConfirmedAccount("dupe");
    await page.goto("/login?mode=signup");
    await page.getByLabel("Full name").fill("Someone Else");
    await page.getByLabel("Email address").fill(account.email);
    await page.getByLabel("Password").fill("a-long-password-1");
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("An account already exists for this email. Log in instead.");
  });

  test("AUTH-07 sign-up rejects short passwords and a missing name without calling Supabase", async ({ page }) => {
    await page.goto("/login?mode=signup");
    await page.getByLabel("Email address").fill("short@example.com");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("Tell us your name");

    await page.getByLabel("Full name").fill("Short Pass");
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("Use at least 8 characters");
  });

  test("AUTH-08 an invalid or already-used email link lands on login with an explanation", async ({ page }) => {
    await page.goto("/auth/callback?next=%2Fdashboard");
    await expect(page).toHaveURL(/\/login\?error=link/);
    await expect(page.locator("p[role=alert]")).toContainText("That link is invalid or has already been used.");
  });

  test("AUTH-09 post-login redirect cannot leave the site (open-redirect guard)", async ({ page }) => {
    const account = await createConfirmedAccount("redirect");
    await page.goto("/login?redirect=%2F%2Fevil.example.com");
    await page.getByLabel("Email address").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await page.waitForURL(/\/dashboard$/);
    expect(new URL(page.url()).hostname).not.toBe("evil.example.com");
  });

  test("AUTH-10 logging out ends the session and blocks the dashboard again", async ({ page }) => {
    const account = await createConfirmedAccount("logout");
    await logIn(page, account.email, account.password);
    await page.getByRole("button", { name: account.name }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/dashboard"));
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  });

  test("AUTH-11 demo account logs in from the login page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    try {
      await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });
    } catch (cause) {
      const message = (await page.locator("p[role=alert]").textContent()) ?? "(no message shown)";
      throw new Error(
        `Demo login did not reach the dashboard. The page said: "${message}". ` +
          "The demo account needs to exist with a confirmed email in Supabase Auth (Authentication → Users).",
        { cause },
      );
    }
  });
});
