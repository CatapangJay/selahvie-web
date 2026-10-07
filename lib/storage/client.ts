import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_DIMENSION, MAX_UPLOAD_BYTES } from "./limits";

/** Error whose message is safe to show to the person uploading. */
export class UploadError extends Error {}

const isAccepted = (type: string) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);

/**
 * Downscale large photos in the browser before upload: phone photos are often
 * 8-15 MB, far more than a wedding site needs. Falls back to the original file
 * when it's already small or can't be decoded here (e.g. animated GIFs).
 */
export async function prepareImage(file: File): Promise<File> {
  if (!isAccepted(file.type)) throw new UploadError("Please choose a JPG, PNG, WebP or GIF photo.");
  if (file.type === "image/gif") return checkSize(file);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return checkSize(file);
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= MAX_UPLOAD_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return checkSize(file);
    // JPEG has no transparency; a white backing avoids black patches from PNGs.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob) return checkSize(file);
    // Keep the original if re-encoding didn't help.
    if (scale === 1 && blob.size >= file.size) return checkSize(file);

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return checkSize(new File([blob], `${name}.jpg`, { type: "image/jpeg" }));
  } finally {
    bitmap.close();
  }
}

function checkSize(file: File): File {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("That photo is too large. The limit is 5 MB.");
  return file;
}

/** Upload a photo for a wedding and return its public URL. */
export async function uploadPhoto(file: File, scope: string): Promise<string> {
  const prepared = await prepareImage(file);
  const body = new FormData();
  body.set("file", prepared);
  body.set("scope", scope);

  let res: Response;
  try {
    res = await fetch("/api/uploads", { method: "POST", body });
  } catch {
    throw new UploadError("Couldn't reach the server. Check your connection and try again.");
  }

  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !data?.url) throw new UploadError(data?.error ?? "Upload failed. Please try again.");
  return data.url;
}

/** Best-effort cleanup of a replaced or removed photo. Failures are harmless (an orphaned file). */
export function deletePhoto(url: string | undefined): void {
  if (!url) return;
  void fetch("/api/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}
