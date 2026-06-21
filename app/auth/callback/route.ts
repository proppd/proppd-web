import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { safeAuthRedirectPath } from '@/lib/auth/redirects';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const nextPath = safeAuthRedirectPath(request.nextUrl.searchParams.get('next'), '/dashboard/listings');

  if (!code) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent('Missing login code.')}`, request.url));
  }

  const config = getSupabaseBrowserConfig();
  if (!config) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent('Login is not configured on this deployment.')}`, request.url));
  }

  // Bind cookie writes to the redirect response itself, so the session cookies
  // set during the exchange are actually delivered to the browser. (Writing to
  // next/headers cookies() and returning a separate redirect can drop them.)
  const response = NextResponse.redirect(new URL(nextPath, request.url));

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error.message || 'Could not complete login.')}`, request.url));
  }

  return response;
}
