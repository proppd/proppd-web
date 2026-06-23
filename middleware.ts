import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseBrowserConfig } from './lib/supabase/env';
import { withSecurityHeaders } from './lib/security/request-guards';

export async function middleware(request: NextRequest) {
  const config = getSupabaseBrowserConfig();
  const response = withSecurityHeaders(NextResponse.next({ request }));

  if (!config) {
    return response;
  }

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

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml).*)'],
};
