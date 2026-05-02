import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_BUSINESS_ROUTES = ['/business'];
const PROTECTED_PRO_ROUTES = ['/pro'];
const PROTECTED_SHARED_ROUTES = ['/settings'];

// Routes that logged-in users should not see
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the session token on every request.
  // Do not use getSession() here — it does not refresh the token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated user hitting a protected route → send to login
  if (!user) {
    const isProtected =
      PROTECTED_BUSINESS_ROUTES.some((r) => pathname.startsWith(r)) ||
      PROTECTED_PRO_ROUTES.some((r) => pathname.startsWith(r)) ||
      PROTECTED_SHARED_ROUTES.some((r) => pathname.startsWith(r));

    if (isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  // Authenticated user — fetch their role from public.users
  // We need the role to enforce cross-role access prevention
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role as 'business' | 'pro' | null;

  // Business user hitting a pro route → redirect to their dashboard
  if (role === 'business' && PROTECTED_PRO_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/business/dashboard', request.url));
  }

  // Pro user hitting a business route → redirect to their dashboard
  if (role === 'pro' && PROTECTED_BUSINESS_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/pro/dashboard', request.url));
  }

  // Authenticated user hitting an auth page (login/signup) → redirect to their dashboard
  // Only redirect if role is known — if role is null, let them reach login to re-authenticate
  if (role && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const destination =
      role === 'business' ? '/business/dashboard' : '/pro/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (locales, images)
     */
    '/((?!_next/static|_next/image|favicon.ico|locales|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
