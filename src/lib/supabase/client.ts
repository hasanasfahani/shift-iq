import { createBrowserClient } from '@supabase/ssr';

// Browser-side Supabase client. Uses anon key — respects RLS.
// Singleton pattern: safe to call multiple times (SSR/client boundary).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
