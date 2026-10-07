import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStorage } from "@/lib/storage";
import { sniffImage } from "@/lib/storage/image";
import { MAX_UPLOAD_BYTES, SCOPE_PATTERN } from "@/lib/storage/limits";

export const runtime = "nodejs";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Upload a photo. Multipart form: `file` (image) and `scope` (the wedding id).
 * Objects are stored under `<userId>/<scope>/<uuid>.<ext>` so a user can only
 * ever write inside their own folder, whichever storage provider is active.
 */
export async function POST(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return fail("Please log in to upload photos.", 401);

  // Cheap early rejection before the body is buffered (multipart adds some overhead).
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES + 64 * 1024) {
    return fail("That photo is too large. The limit is 5 MB.", 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Invalid upload.", 400);
  }

  const file = form.get("file");
  const scope = form.get("scope");
  if (!(file instanceof File) || typeof scope !== "string" || !SCOPE_PATTERN.test(scope)) {
    return fail("Invalid upload.", 400);
  }
  if (file.size === 0) return fail("That file is empty.", 400);
  if (file.size > MAX_UPLOAD_BYTES) return fail("That photo is too large. The limit is 5 MB.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = sniffImage(bytes);
  if (!image) return fail("Only JPG, PNG, WebP and GIF photos are supported.", 415);

  try {
    const storage = await getStorage();
    const stored = await storage.put(`${userId}/${scope}/${randomUUID()}.${image.ext}`, bytes, image.mime);
    return NextResponse.json({ url: stored.url, key: stored.key }, { status: 201 });
  } catch (error) {
    console.error("[api/uploads] upload failed:", error);
    return fail("We couldn't save that photo. Please try again.", 502);
  }
}

/**
 * Delete a previously uploaded photo by URL. URLs that don't belong to the
 * active storage provider (pasted links, sample photos) are ignored.
 */
export async function DELETE(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return fail("Please log in.", 401);

  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  if (!body || typeof body.url !== "string") return fail("Invalid request.", 400);

  try {
    const storage = await getStorage();
    const key = storage.keyFromUrl(body.url);
    if (!key) return new NextResponse(null, { status: 204 });
    if (!key.startsWith(`${userId}/`) || key.includes("..")) return fail("Not allowed.", 403);
    await storage.remove([key]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/uploads] delete failed:", error);
    return fail("We couldn't remove that photo.", 502);
  }
}
