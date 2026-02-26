/**
 * Supabase Client (Browser)
 *
 * Creates a typed Supabase client instance for use in Client Components.
 * Uses @supabase/ssr's createBrowserClient with our Database type
 * for full TypeScript autocompletion on all table queries.
 *
 * Usage:
 *   "use client";
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data } = await supabase.from("profiles").select("*");
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
