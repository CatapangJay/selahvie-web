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

/** A browser-side client with the publishable key, as a guest's browser would have. */
export function anonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** A client signed in as `account`, to check what row-level security lets a couple do directly. */
export async function userClient(account: TestAccount) {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email: account.email, password: account.password });
  if (error) throw new Error(`Could not sign in ${account.email}: ${error.message}`);
  return client;
}

// ─── Seeding ─────────────────────────────────────────────────────────────────
// Setup goes straight to the database so each test only drives the flow it is about.

export type Tier = "essential" | "classic" | "premium";

/** Buys a website through the real checkout route (so it's created the way the app creates it). */
export async function buyWebsite(page: Page, tier: Tier = "premium", templateId = "t13"): Promise<string> {
  const res = await page.request.post("/api/checkout", {
    data: { items: [{ kind: "template", templateId, tier }], method: "gcash", buyerName: "Test Couple" },
  });
  if (res.status() !== 200) throw new Error(`Checkout failed (${res.status()}): ${await res.text()}`);
  const { weddingIds } = await res.json();
  return weddingIds[0] as string;
}

/** Fills in the couple's details and publishes under a unique slug. Returns the slug. */
export async function publishWebsite(weddingId: string, patch: Record<string, unknown> = {}): Promise<string> {
  const slug = `e2e-${randomUUID().slice(0, 10)}`;
  const { error } = await adminClient()
    .from("weddings")
    .update({ partner1_name: "Ada", partner2_name: "Ben", status: "published", slug, ...patch })
    .eq("id", weddingId);
  if (error) throw new Error(`Could not publish: ${error.message}`);
  return slug;
}

export async function updateWebsite(weddingId: string, patch: Record<string, unknown>) {
  const { error } = await adminClient().from("weddings").update(patch).eq("id", weddingId);
  if (error) throw new Error(`Could not update website: ${error.message}`);
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const inviteCode = () => Array.from({ length: 8 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");

export interface SeededGuest {
  id: string;
  name: string;
  code: string;
}

export async function addGuest(
  weddingId: string,
  name: string,
  opts: { partySize?: number; status?: string; email?: string } = {},
): Promise<SeededGuest> {
  const code = inviteCode();
  const { data, error } = await adminClient()
    .from("guests")
    .insert({ wedding_id: weddingId, name, party_size: opts.partySize ?? 1, status: opts.status ?? "invited", email: opts.email ?? null, invite_code: code })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Could not add guest: ${error?.message}`);
  return { id: data.id, name, code };
}

export async function addGroup(weddingId: string, name: string, members: SeededGuest[] = []) {
  const code = inviteCode();
  const admin = adminClient();
  const { data, error } = await admin.from("guest_groups").insert({ wedding_id: weddingId, name, invite_code: code }).select("id").single();
  if (error || !data) throw new Error(`Could not add group: ${error?.message}`);
  if (members.length) {
    const { error: memberError } = await admin
      .from("guest_group_members")
      .insert(members.map((m) => ({ wedding_id: weddingId, group_id: data.id, guest_id: m.id })));
    if (memberError) throw new Error(`Could not add group members: ${memberError.message}`);
  }
  return { id: data.id as string, name, code };
}

export async function weddingRow(weddingId: string) {
  const { data, error } = await adminClient().from("weddings").select("*").eq("id", weddingId).single();
  if (error || !data) throw new Error(`Could not read website: ${error?.message}`);
  return data;
}

export async function guestRow(guestId: string) {
  const { data } = await adminClient().from("guests").select("*").eq("id", guestId).maybeSingle();
  return data;
}

/** Monochrome opens behind a full-screen title card; this opens it the way a guest does. */
export async function openInvitation(page: Page) {
  // Scoped to the title card: the dev server also renders an "Open Next.js Dev Tools" button.
  const card = page.getByRole("dialog", { name: / invitation$/ });
  await card.getByRole("button", { name: /^Open/ }).click();
  await expect(card).toBeHidden();
}

export { expect };
