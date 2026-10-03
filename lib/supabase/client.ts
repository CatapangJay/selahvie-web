import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

/** Browser Supabase client (singleton per tab; session lives in cookies). */
export function createClient() {
  const { url, key } = supabaseConfig();
  return createBrowserClient(url, key);
}
