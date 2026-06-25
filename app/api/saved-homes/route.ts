import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { normaliseSavedHomeSlug, savedHomeSlugsFromRows } from '@/lib/listings/saved-home';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AuthResult =
  | { kind: 'ok'; supabase: SupabaseClient; userId: string }
  | { kind: 'unconfigured' }
  | { kind: 'unauthed' };

async function authenticate(): Promise<AuthResult> {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) return { kind: 'unconfigured' };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { kind: 'unauthed' };
  return { kind: 'ok', supabase, userId: data.user.id };
}

function authError(kind: 'unconfigured' | 'unauthed') {
  if (kind === 'unconfigured') {
    return NextResponse.json({ ok: false, error: 'Accounts are not enabled on this deployment.' }, { status: 503 });
  }
  return NextResponse.json({ ok: false, error: 'Please sign in to sync saved homes.' }, { status: 401 });
}

async function listFor(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_homes')
    .select('slug')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return savedHomeSlugsFromRows(data);
}

function serverError() {
  return NextResponse.json({ ok: false, error: 'Something went wrong with your saved homes.' }, { status: 500 });
}

export async function GET() {
  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);
  try {
    return NextResponse.json({ ok: true, slugs: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.savedHome);
  if (limited) return limited;

  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);

  const body = await request.json().catch(() => null);
  const slug = normaliseSavedHomeSlug((body as { slug?: unknown } | null)?.slug);
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Could not save this home.' }, { status: 400 });
  }

  try {
    // Idempotent: the unique (user_id, slug) constraint means re-saving is a no-op.
    const { error } = await auth.supabase
      .from('saved_homes')
      .upsert({ user_id: auth.userId, slug }, { onConflict: 'user_id,slug', ignoreDuplicates: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, slugs: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}

export async function DELETE(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.savedHome);
  if (limited) return limited;

  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);

  const slug = normaliseSavedHomeSlug(request.nextUrl.searchParams.get('slug'));
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Missing saved home slug.' }, { status: 400 });
  }

  try {
    const { error } = await auth.supabase.from('saved_homes').delete().eq('user_id', auth.userId).eq('slug', slug);
    if (error) throw error;
    return NextResponse.json({ ok: true, slugs: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}
