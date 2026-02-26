/**
 * Supabase Client (Server)
 *
 * Creates a typed Supabase client instance for use in server-side contexts:
 *   - Server Components
 *   - Route Handlers (app/api/)
 *   - Server Actions
 *
 * Uses cookie-based auth session management via @supabase/ssr.
 * The Database generic provides full TypeScript autocompletion.
 *
 * Usage:
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("aqi_history").select("*");
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method may be called from a Server Component.
            // This can be ignored if middleware handles session refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // The `delete` method may be called from a Server Component.
            // This can be ignored if middleware handles session refresh.
          }
        },
      },
    }
  );
}
