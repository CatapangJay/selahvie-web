import type { ACCEPTED_IMAGE_TYPES } from "./limits";

export type ImageMime = (typeof ACCEPTED_IMAGE_TYPES)[number];

const EXTENSIONS: Record<ImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte);

/**
 * Identify an image from its leading bytes. The browser-supplied MIME type and
 * file name are user-controlled, so the server only trusts the content itself.
 */
export function sniffImage(bytes: Uint8Array): { mime: ImageMime; ext: string } | null {
  let mime: ImageMime | null = null;

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) mime = "image/jpeg";
  else if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) mime = "image/png";
  else if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38]) && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) {
    mime = "image/gif"; // "GIF87a" / "GIF89a"
  } else if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    mime = "image/webp"; // "RIFF" .... "WEBP"
  }

  return mime ? { mime, ext: EXTENSIONS[mime] } : null;
}
