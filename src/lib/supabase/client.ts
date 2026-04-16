import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Returns a real Supabase client when env vars are present, otherwise a
// proxy that throws only on actual use. This lets client components run
// `const supabase = createClient()` at the top of the body without blowing
// up during SSR/prerender when NEXT_PUBLIC_SUPABASE_* may not be injected
// (e.g. the first Vercel build before env vars are saved).
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    return createBrowserClient(url, key);
  }

  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(
        "Supabase client unavailable: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
      );
    },
  });
}
