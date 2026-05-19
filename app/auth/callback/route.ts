import { NextRequest, NextResponse } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';

function safeNextPath(value: string | null): string {
  if (!value) return '/dashboard/listings';
  if (!value.startsWith('/')) return '/dashboard/listings';
  if (value.startsWith('//')) return '/dashboard/listings';
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const nextPath = safeNextPath(request.nextUrl.searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent('Missing login code.')}`, request.url));
  }

  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent('Login is not configured on this deployment.')}`, request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error.message || 'Could not complete login.')}`, request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
