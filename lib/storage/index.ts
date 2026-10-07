import { createSupabaseStorage } from "./supabase";
import type { StorageProvider } from "./types";

export type { StorageProvider, StoredObject } from "./types";

/**
 * Registered storage backends, selected by the STORAGE_PROVIDER env var
 * (server-side only). To add one, implement `StorageProvider` and list it here.
 */
const providers: Record<string, () => Promise<StorageProvider> | StorageProvider> = {
  supabase: createSupabaseStorage,
};

export async function getStorage(): Promise<StorageProvider> {
  const name = process.env.STORAGE_PROVIDER || "supabase";
  const factory = providers[name];
  if (!factory) {
    throw new Error(`Unknown STORAGE_PROVIDER "${name}". Available: ${Object.keys(providers).join(", ")}.`);
  }
  return factory();
}
