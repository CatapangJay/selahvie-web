import { createClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import type { StorageProvider } from "./types";

export const DEFAULT_BUCKET = "wedding-photos";

/**
 * Supabase Storage provider. Uses the signed-in user's session, so the storage
 * policies in db/adapters/supabase/0002_storage.sql apply as a second line of
 * defence behind the checks in the upload route.
 */
export async function createSupabaseStorage(): Promise<StorageProvider> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
  const supabase = await createClient();
  const files = supabase.storage.from(bucket);
  const publicPrefix = `${supabaseConfig().url.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/`;

  const urlFor = (key: string) => files.getPublicUrl(key).data.publicUrl;

  return {
    name: "supabase",
    urlFor,

    async put(key, body, contentType) {
      const { error } = await files.upload(key, body, {
        contentType,
        // Keys are unique per upload, so the object never changes: cache hard.
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
      return { key, url: urlFor(key) };
    },

    async remove(keys) {
      if (keys.length === 0) return;
      const { error } = await files.remove(keys);
      if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
    },

    keyFromUrl(url) {
      if (!url.startsWith(publicPrefix)) return null;
      try {
        return decodeURIComponent(url.slice(publicPrefix.length).split("?")[0]) || null;
      } catch {
        return null;
      }
    },
  };
}
