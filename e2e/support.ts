import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Playwright runs outside Next, so load .env.local the way Next would for the test process.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export const DEMO_EMAIL = "demo@selahvie.com";
export const DEMO_PASSWORD = "demo1234";

/** Service-role client for test setup only. Never reaches the browser. */
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("E2E setup needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

export interface TestAccount {
  email: string;
  password: string;
  name: string;
  id: string;
}

/**
 * Creates a fresh account with its email already confirmed, so the suite never
 * depends on a confirmation email reaching an inbox.
 */
export async function createConfirmedAccount(label = "couple"): Promise<TestAccount> {
  const email = `e2e-${label}-${randomUUID().slice(0, 8)}@example.com`;
  const password = "E2e-test-pass-123";
  const name = "Test Couple";
  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !data.user) throw new Error(`Could not create test account: ${error?.message}`);
  return { email, password, name, id: data.user.id };
}

/** Logs in through the real login form and waits for the dashboard. */
export async function logIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
}

/** Pulls the auth cookies off a page so API-level tests can reuse the signed-in session. */
export async function sessionCookies(page: Page) {
  return page.context().cookies();
}

export { expect };
