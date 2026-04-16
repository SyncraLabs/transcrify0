import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Admin client bypasses RLS - use only on the server for operations
// that need elevated privileges (usage tracking, webhook updates, etc.)
// Lazy initialization to avoid build errors when env vars are not set
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Keep backward-compatible export
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
