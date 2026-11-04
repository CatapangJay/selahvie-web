/**
 * UniSMS (https://unismsapi.com/docs/sms) — server only. Basic auth with the
 * secret key as the username; `/bulk` sends different content to each
 * recipient in one request, rate-limited to one request per 2 seconds.
 */

const BASE_URL = "https://unismsapi.com/api";
/** Texts per bulk request. UniSMS doesn't publish a cap; this keeps requests modest. */
const BATCH = 100;
const RATE_LIMIT_MS = 2100;

export interface UniSmsMessage {
  recipient: string;
  content: string;
  metadata?: Record<string, string>;
}

export interface UniSmsBatchResult {
  bulkId: string | null;
  /** Index into the messages passed to `sendBulk`, with UniSMS's reason. */
  skipped: { index: number; reason: string }[];
}

export class UniSmsError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function credentials() {
  const key = process.env.UNISMS_SECRET_KEY;
  const senderId = process.env.UNISMS_SENDER_ID;
  return key && senderId ? { auth: `Basic ${Buffer.from(`${key}:`).toString("base64")}`, senderId } : null;
}

/** Both UNISMS_SECRET_KEY and UNISMS_SENDER_ID are set. */
export function isUniSmsConfigured(): boolean {
  return credentials() !== null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function reasonOf(errors: unknown): string {
  if (typeof errors === "string") return errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors as Record<string, unknown>).flat()[0];
    if (typeof first === "string") return first;
  }
  return "UniSMS couldn't send to this number.";
}

/** UniSMS limits each account (not each request) to one call per 2 s, so another send may hold the slot. */
const MAX_RETRIES = 4;

async function postBulk(auth: string, body: unknown, attempt = 0): Promise<Response> {
  const res = await fetch(`${BASE_URL}/bulk`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 429 && attempt < MAX_RETRIES) {
    const after = Number(res.headers.get("x-retry-after-ms")) || RATE_LIMIT_MS;
    await wait(Math.min(after, 10_000) + attempt * 500);
    return postBulk(auth, body, attempt + 1);
  }
  return res;
}

/**
 * Send messages in batches, yielding each batch's result as soon as UniSMS
 * answers so the caller can log what went out even if a later batch fails.
 * A batch UniSMS rejects outright (422: every message skipped) is yielded as
 * skipped; auth and server errors throw.
 */
export async function* sendBulk(messages: UniSmsMessage[]): AsyncGenerator<UniSmsBatchResult & { start: number; size: number }> {
  const creds = credentials();
  if (!creds) throw new UniSmsError("UniSMS isn't configured.", 503);

  for (let start = 0; start < messages.length; start += BATCH) {
    if (start > 0) await wait(RATE_LIMIT_MS);
    const batch = messages.slice(start, start + BATCH);
    const res = await postBulk(creds.auth, {
      messages: batch.map((m) => ({ ...m, sender_id: creds.senderId })),
    });
    const json = (await res.json().catch(() => null)) as {
      bulk_id?: string;
      skipped?: { index: number; errors?: unknown }[];
      errors?: unknown;
    } | null;

    if (res.ok) {
      yield {
        start,
        size: batch.length,
        bulkId: json?.bulk_id ?? null,
        skipped: (json?.skipped ?? []).map((s) => ({ index: start + s.index, reason: reasonOf(s.errors) })),
      };
    } else if (res.status === 422) {
      const reason = reasonOf(json?.errors);
      yield { start, size: batch.length, bulkId: null, skipped: batch.map((_, i) => ({ index: start + i, reason })) };
    } else {
      throw new UniSmsError(
        res.status === 401 ? "UniSMS rejected the API key." : `UniSMS returned ${res.status}: ${reasonOf(json?.errors)}`,
        res.status
      );
    }
  }
}
