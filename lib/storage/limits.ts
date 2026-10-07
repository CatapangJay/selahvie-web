/** Upload rules shared by the browser (pre-flight checks) and the server (enforcement). */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** MIME types the app accepts. SVG is deliberately excluded (scriptable). */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

/** Value for an <input type="file" accept="..."> attribute. */
export const IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(",");

/** Longest edge, in pixels, photos are scaled down to before upload. */
export const MAX_IMAGE_DIMENSION = 2400;

/** A wedding/folder segment inside an object key. Keeps keys path-safe on every provider. */
export const SCOPE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
