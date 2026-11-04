import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGuestList, requireUser } from "@/lib/db/server";
import { fromWeddingRow, type WeddingRow } from "@/lib/db/mappers";
import { hasModule } from "@/lib/tiers";
import { buildSmsRecipients, type ManualRecipient, type SmsRejected } from "@/lib/smsRecipients";
import { containsLink, SMS_ALLOWANCE_CREDITS, SMS_MAX_LENGTH, SMS_PER_NUMBER } from "@/lib/smsMessage";
import { isUniSmsConfigured, sendBulk, UniSmsError } from "@/lib/unisms";

export const runtime = "nodejs";
// Three 100-text batches with UniSMS's 2-second spacing, plus retries.
export const maxDuration = 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Matches the allowance: more recipients than credits can never be sent at once. */
const MAX_RECIPIENTS = SMS_ALLOWANCE_CREDITS;
const NO_STORE = { "Cache-Control": "no-store" };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: NO_STORE });

/** One row of the dashboard's "sent" history. */
export interface SmsLogEntry {
  id: string;
  guestId: string | null;
  guestName: string;
  recipient: string;
  linkKind: "personal" | "site";
  status: "pending" | "queued" | "skipped";
  error: string | null;
  createdAt: string;
}

export interface SmsStatusResponse {
  configured: boolean;
  used: number;
  allowance: number;
  log: SmsLogEntry[];
}

export interface SmsSendResponse {
  queued: number;
  creditsUsed: number;
  /** Not sent: no valid number, too long, or skipped by UniSMS. */
  rejected: SmsRejected[];
}

/**
 * Links in texts point at the public site. In production that must be configured,
 * so a preview deployment or a forwarded Host header can never end up in a guest's text.
 */
function siteOrigin(request: NextRequest): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  return process.env.NODE_ENV === "production" ? null : request.nextUrl.origin;
}

/** The signed-in owner's website, or an error response. */
async function ownedWedding(weddingId: unknown) {
  const user = await requireUser();
  if (!user) return { error: fail("Please log in again.", 401) };
  if (typeof weddingId !== "string" || !UUID.test(weddingId)) return { error: fail("Invalid request.", 400) };
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .eq("owner_id", user.id)
    .maybeSingle<WeddingRow>();
  if (error) return { error: fail("We couldn't load this website. Please try again.", 502) };
  if (!row) return { error: fail("Not found.", 404) };
  return { admin, config: fromWeddingRow(row) };
}

async function creditsUsed(admin: ReturnType<typeof createAdminClient>, weddingId: string): Promise<number> {
  // Pending rows are reserved (or from a send that crashed) and stay counted.
  const { data, error } = await admin
    .from("sms_messages")
    .select("credits")
    .eq("wedding_id", weddingId)
    .in("status", ["pending", "queued"])
    .limit(SMS_ALLOWANCE_CREDITS + 1);
  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, r: { credits: number }) => sum + r.credits, 0);
}

/** GET ?weddingId= : allowance, credits used and the latest texts sent. */
export async function GET(request: NextRequest) {
  const owned = await ownedWedding(request.nextUrl.searchParams.get("weddingId"));
  if ("error" in owned) return owned.error;
  const { admin, config } = owned;
  if (!hasModule(config, "sms")) return fail("Text invitations come with the Premium plan.", 403);

  const [{ data, error }, used] = await Promise.all([
    admin
      .from("sms_messages")
      .select("id, guest_id, guest_name, recipient, link_kind, status, error, created_at")
      .eq("wedding_id", config.id)
      .order("created_at", { ascending: false })
      .limit(500),
    creditsUsed(admin, config.id).catch(() => null),
  ]);
  if (error || used === null) return fail("We couldn't load your texts. Please try again.", 502);

  const body: SmsStatusResponse = {
    configured: isUniSmsConfigured(),
    used,
    allowance: SMS_ALLOWANCE_CREDITS,
    log: (data ?? []).map((r) => ({
      id: r.id,
      guestId: r.guest_id,
      guestName: r.guest_name,
      recipient: r.recipient,
      linkKind: r.link_kind,
      status: r.status,
      error: r.error,
      createdAt: r.created_at,
    })),
  };
  return NextResponse.json(body, { headers: NO_STORE });
}

/**
 * POST { weddingId, guestIds, manual: [{ name, phone }], template }: text each
 * recipient their invitation. Links and allowances are decided here, never by
 * the browser.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { weddingId?: unknown; guestIds?: unknown; manual?: unknown; template?: unknown }
    | null;
  const owned = await ownedWedding(body?.weddingId);
  if ("error" in owned) return owned.error;
  const { admin, config } = owned;

  if (!hasModule(config, "sms")) return fail("Text invitations come with the Premium plan.", 403);
  if (config.status !== "published") return fail("Publish your website first, so the links in your texts open.", 409);
  if (!isUniSmsConfigured()) return fail("Texting isn't set up yet. Please try again later.", 503);
  const origin = siteOrigin(request);
  if (!origin) {
    console.error("[api/sms] NEXT_PUBLIC_SITE_URL is not set; refusing to send links to an unknown address.");
    return fail("Texting isn't set up yet. Please try again later.", 503);
  }

  const template = typeof body?.template === "string" ? body.template : "";
  if (!template.trim()) return fail("Write a message first.", 400);
  if (template.length > SMS_MAX_LENGTH) return fail(`Keep your message under ${SMS_MAX_LENGTH} characters.`, 400);
  if (containsLink(template)) return fail("Leave web addresses out of your message. Each guest's invitation link is added for you.", 400);
  const guestIds = Array.isArray(body?.guestIds) ? body.guestIds.filter((id): id is string => typeof id === "string") : [];
  const manual: ManualRecipient[] = Array.isArray(body?.manual)
    ? body.manual.flatMap((m) =>
        m && typeof m === "object" && typeof m.name === "string" && typeof m.phone === "string"
          ? [{ name: m.name.slice(0, 120), phone: m.phone.slice(0, 40) }]
          : []
      )
    : [];
  if (guestIds.length + manual.length === 0) return fail("Choose who to text.", 400);
  if (guestIds.length + manual.length > MAX_RECIPIENTS) return fail(`Send to at most ${MAX_RECIPIENTS} people at a time.`, 400);

  let guests;
  try {
    ({ guests } = await loadGuestList(admin, config.id));
  } catch (err) {
    console.error("[api/sms] load failed:", err instanceof Error ? err.message : err);
    return fail("We couldn't load your guest list. Please try again.", 502);
  }

  const { recipients, rejected } = buildSmsRecipients({
    config,
    origin,
    guests,
    guestIds,
    manual,
    template,
  });
  if (recipients.length === 0) return NextResponse.json({ queued: 0, creditsUsed: 0, rejected } satisfies SmsSendResponse);

  // Reserve every text as a 'pending' row before anything is sent. The database
  // locks the website while it checks the allowance and the per-number cap, so
  // concurrent sends can't overspend and no text goes out without its row.
  const { data: reservation, error: reserveError } = await admin.rpc("reserve_sms", {
    p_wedding_id: config.id,
    p_allowance: SMS_ALLOWANCE_CREDITS,
    p_per_number: SMS_PER_NUMBER,
    p_rows: recipients.map((r) => ({
      guest_id: r.guestId ?? "",
      recipient: r.recipient,
      guest_name: r.name.slice(0, 200),
      link_kind: r.linkKind,
      content: r.content,
      credits: r.credits,
    })),
  });
  if (reserveError) {
    if (reserveError.message.includes("sms_allowance")) {
      const used = await creditsUsed(admin, config.id).catch(() => null);
      const left = used === null ? null : Math.max(0, SMS_ALLOWANCE_CREDITS - used);
      return fail(
        `That's more texts than this website has left${left === null ? "" : ` (${left} credits)`}. Choose fewer guests or shorten the message.`,
        402
      );
    }
    console.error("[api/sms] reserve failed:", reserveError.message);
    return fail("We couldn't send your texts. Please try again.", 502);
  }

  const slots = (reservation ?? []) as { row_index: number; message_id: string | null; reserved: boolean }[];
  const toSend: { recipient: (typeof recipients)[number]; id: string }[] = [];
  for (const slot of slots) {
    const r = recipients[slot.row_index];
    if (!r) continue;
    if (slot.reserved && slot.message_id) toSend.push({ recipient: r, id: slot.message_id });
    else rejected.push({ name: r.name, phone: r.recipient, reason: `Already texted ${SMS_PER_NUMBER} times` });
  }

  let queued = 0;
  let spent = 0;
  try {
    for await (const batch of sendBulk(
      toSend.map(({ recipient: r }) => ({ recipient: r.recipient, content: r.content, metadata: { wedding_id: config.id } }))
    )) {
      const skipped = new Map(batch.skipped.map((s) => [s.index, s.reason]));
      const sentIds: string[] = [];
      for (let i = batch.start; i < batch.start + batch.size; i++) {
        const { recipient: r, id } = toSend[i];
        if (skipped.has(i)) {
          const reason = skipped.get(i) || "UniSMS couldn't send to this number.";
          rejected.push({ name: r.name, phone: r.recipient, reason });
          // Skipped texts cost nothing, so their reservation is released.
          await admin.from("sms_messages").update({ status: "skipped", error: reason }).eq("id", id);
        } else {
          queued += 1;
          spent += r.credits;
          sentIds.push(id);
        }
      }
      if (sentIds.length > 0) {
        const { error } = await admin.from("sms_messages").update({ status: "queued", bulk_id: batch.bulkId }).in("id", sentIds);
        // The rows stay 'pending' (still counted), so a failed update can't hand out free texts.
        if (error) console.error("[api/sms] status update failed:", error.message);
      }
    }
  } catch (err) {
    // Unsent rows stay 'pending' and counted: UniSMS may have accepted the batch before the error.
    console.error("[api/sms] send failed:", err instanceof Error ? err.message : err);
    const status = err instanceof UniSmsError && err.status === 503 ? 503 : 502;
    const sentNote = queued > 0 ? ` ${queued} ${queued === 1 ? "text was" : "texts were"} sent before it stopped.` : "";
    return fail(`We couldn't finish sending your texts.${sentNote} Check the list before trying again.`, status);
  }

  return NextResponse.json({ queued, creditsUsed: spent, rejected } satisfies SmsSendResponse, { headers: NO_STORE });
}
