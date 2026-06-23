import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import {
  ownerPropertyFromRow,
  ownerRowChangesFromPayload,
  ownerRowInputFromPayload,
  type OwnerProperty,
} from '@/lib/owner/properties';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';

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
  return NextResponse.json({ ok: false, error: 'Please sign in to sync your properties.' }, { status: 401 });
}

async function listFor(supabase: SupabaseClient, userId: string): Promise<OwnerProperty[]> {
  const { data, error } = await supabase
    .from('owner_properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(ownerPropertyFromRow);
}

function serverError() {
  return NextResponse.json({ ok: false, error: 'Something went wrong syncing your properties.' }, { status: 500 });
}

export async function GET() {
  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);
  try {
    return NextResponse.json({ ok: true, properties: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);

  const body = (await request.json().catch(() => null)) as { property?: unknown } | null;
  const input = ownerRowInputFromPayload(body?.property);
  if (!input) {
    return NextResponse.json({ ok: false, error: 'Add a suburb, city, and property type.' }, { status: 400 });
  }

  try {
    const { error } = await auth.supabase.from('owner_properties').insert({ ...input, user_id: auth.userId });
    if (error) throw error;
    return NextResponse.json({ ok: true, properties: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}

// Bulk import — migrates a device (localStorage) workspace into the account.
export async function PUT(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);

  const body = (await request.json().catch(() => null)) as { properties?: unknown } | null;
  const list = Array.isArray(body?.properties) ? body!.properties : [];
  const rows = list
    .map((entry) => ownerRowInputFromPayload(entry))
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .map((row) => ({ ...row, user_id: auth.userId }));

  try {
    if (rows.length) {
      const { error } = await auth.supabase.from('owner_properties').insert(rows);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, properties: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const auth = await authenticate();
  if (auth.kind !== 'ok') return authError(auth.kind);

  const body = (await request.json().catch(() => null)) as { id?: string; changes?: unknown } | null;
  if (!body?.id) {
    return NextResponse.json({ ok: false, error: 'Missing property id.' }, { status: 400 });
  }
  const updates = ownerRowChangesFromPayload(body.changes);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: 'No valid changes.' }, { status: 400 });
  }

  try {
    const { error } = await auth.supabase
      .from('owner_properties')
      .update(updates)
      .eq('id', body.id)
      .eq('user_id', auth.userId);
    if (error) throw error;
    return NextResponse.json({ ok: true, properties: await listFor(auth.supabase, auth.userId) });
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
    return NextResponse.json({ ok: false, error: 'Missing property id.' }, { status: 400 });
  }

  try {
    const { error } = await auth.supabase
      .from('owner_properties')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);
    if (error) throw error;
    return NextResponse.json({ ok: true, properties: await listFor(auth.supabase, auth.userId) });
  } catch {
    return serverError();
  }
}
