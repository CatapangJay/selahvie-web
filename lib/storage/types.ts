/**
 * The only surface the app depends on for file storage. To move off Supabase
 * Storage, implement this interface (S3, R2, GCS, local disk...) in a new file
 * next to `supabase.ts` and register it in `./index.ts`; nothing else changes.
 *
 * Providers deal in opaque object keys and public URLs only. Who may write
 * which key, and what bytes are acceptable, is enforced once in the upload
 * route, so every provider gets the same guarantees.
 */
export interface StoredObject {
  /** Provider-relative object key, e.g. `<userId>/<weddingId>/<uuid>.jpg`. */
  key: string;
  /** Publicly readable URL to persist on the wedding config. */
  url: string;
}

export interface StorageProvider {
  /** Identifier used by the STORAGE_PROVIDER env var. */
  readonly name: string;

  /** Store `body` under `key`. Keys are unique per upload, so never overwrite. */
  put(key: string, body: Uint8Array, contentType: string): Promise<StoredObject>;

  /** Delete objects by key. Missing keys are not an error. */
  remove(keys: string[]): Promise<void>;

  /** Public URL for a key. */
  urlFor(key: string): string;

  /** Inverse of `urlFor`: the key behind one of this provider's URLs, or null for foreign URLs. */
  keyFromUrl(url: string): string | null;
}
