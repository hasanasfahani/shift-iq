// This file may only be imported in Server Components, API Routes, and middleware.
// Never import this in client components — it uses next/headers which is server-only.
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Standard server client — uses anon key, respects RLS.
// Use this in Server Components and GET API routes.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies can't be set.
            // The middleware handles session refresh, so this is safe to ignore.
          }
        },
      },
    }
  );
}

// Service role client — bypasses RLS entirely.
// Uses @supabase/supabase-js directly (no cookie handling) so the service role
// key is never overridden by the authenticated user's session JWT.
// Use ONLY in API routes for operations that act on behalf of other users.
export async function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
