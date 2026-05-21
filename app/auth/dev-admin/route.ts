import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

const DEV_ADMIN_COOKIE = 'proppd-dev-admin';
const DEV_ADMIN_EMAIL = 'info@proppd.com';

function safeNextPath(value: string | null): string {
  if (!value) return '/dashboard/listings';
  if (!value.startsWith('/')) return '/dashboard/listings';
  if (value.startsWith('//')) return '/dashboard/listings';
  return value;
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1';
}

export async function GET(request: NextRequest) {
  const nextPath = safeNextPath(request.nextUrl.searchParams.get('next'));
  const config = getSupabaseBrowserConfig();

  if (config) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent('Local admin session is only available when Supabase config is missing.')}`, request.url));
  }

  if (!isLocalHost(request.nextUrl.hostname)) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent('Local admin session only works on localhost.')}`, request.url));
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;url=${nextPath}" />
    <title>Opening local admin session | Proppd</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #F5F7FA; color: #050A30; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .card { max-width: 36rem; margin: 1rem; border-radius: 2rem; background: white; padding: 2rem; box-shadow: 0 10px 30px rgba(5,10,48,.08); }
      .badge { display: inline-flex; border-radius: 999px; background: #eefcf9; color: #0f766e; font-weight: 800; font-size: .75rem; letter-spacing: .16em; text-transform: uppercase; padding: .5rem .9rem; }
      h1 { margin: 1rem 0 .75rem; font-size: clamp(2rem, 4vw, 3rem); line-height: .95; letter-spacing: -.06em; }
      p { margin: 0; color: #475569; font-size: 1rem; line-height: 1.7; }
      a { display: inline-flex; margin-top: 1.5rem; border-radius: 999px; background: #050A30; color: white; text-decoration: none; font-weight: 800; padding: .9rem 1.25rem; }
    </style>
    <script>
      window.location.replace(${JSON.stringify(nextPath)});
    </script>
  </head>
  <body>
    <main class="card">
      <div class="badge">Local admin session</div>
      <h1>Opening Proppd admin access.</h1>
      <p>Your temporary info@proppd.com session is ready. If the redirect does not happen automatically, use the button below.</p>
      <a href="${nextPath}">Continue to dashboard</a>
    </main>
  </body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  });

  response.cookies.set(DEV_ADMIN_COOKIE, DEV_ADMIN_EMAIL, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
