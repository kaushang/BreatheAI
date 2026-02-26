/**
 * Supabase Client (Browser)
 *
 * Creates a Supabase client instance for use in client-side components.
 * Uses the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * environment variables. This client is used for authentication,
 * database queries, and real-time subscriptions from the browser.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
