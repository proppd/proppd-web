import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { savedSearchFromRow, savedSearchRowFromPayload, type SavedSearch } from '@/lib/search/saved';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AuthResult =
  | { kind: 'ok'; supabase: SupabaseClient; userId: string; email: string | null }
  | { kind: 'unconfigured' }
  | { kind: 'unauthed' };

async function authenticate(): Promise<AuthResult> {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) return { kind: 'unconfigured' };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { kind: 'unauthed' };
  return { kind: 'ok', supabase, userId: data.user.id, email: data.user.email ?? null };
}

function authError(kind: 'unconfigured' | 'unauthed') {
  if (kind === 'unconfigured') {
    return NextResponse.json({ ok: false, error: 'Accounts are not enabled on this deployment.' }, { status: 503 });
  }
  return NextResponse.json({ ok: false, error: 'Please sign in to save searches.' }, { status: 401 });
}

async function listFor(supabase: SupabaseClient, userId: string): Promise<SavedSearch[]> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(savedSearchFromRow);
}

function serverError() {
  return NextResponse.json({ ok: false, error: 'Something went wrong with your saved searches.' }, { status: 500 });
}

export async function GET() {
  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);
  try {
    return NextResponse.json({ ok: true, searches: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);

  const body = await request.json().catch(() => null);
  const row = savedSearchRowFromPayload(body);
  if (!row) {
    return NextResponse.json({ ok: false, error: 'Could not save this search.' }, { status: 400 });
  }

  try {
    const { error } = await auth.supabase.from('saved_searches').insert({ ...row, user_id: auth.userId, email: auth.email });
    if (error) throw error;
    return NextResponse.json({ ok: true, searches: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}

export async function DELETE(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing saved search id.' }, { status: 400 });
  }

  try {
    const { error } = await auth.supabase.from('saved_searches').delete().eq('id', id).eq('user_id', auth.userId);
    if (error) throw error;
    return NextResponse.json({ ok: true, searches: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}
