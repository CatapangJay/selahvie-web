import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";

/**
 * Server Supabase client for Server Components, Server Actions and Route
 * Handlers. Create one per request — never share it across requests.
 */
export async function createClient() {
  const { url, key } = supabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe to
          // ignore: the proxy refreshes the session cookies on every request.
        }
      },
    },
  });
}
