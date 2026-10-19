import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

/**
 * Service-role Supabase client for trusted server code (route handlers only).
 * Bypasses row-level security, so callers must check who the user is and what
 * they own before every write. Never import this from client components.
 */
export function createAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must only run on the server.");
  }
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. Add the secret key from Supabase → Project Settings → API Keys to .env.local (see .env.example)."
    );
  }
  return createSupabaseClient(supabaseConfig().url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
