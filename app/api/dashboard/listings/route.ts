import { NextResponse, type NextRequest } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import {
  createPortalListing,
  loadMyPortalListings,
  loadPortalUserAccess,
} from '@/lib/proppd/backend';
import { validatePortalListingInput } from '@/lib/proppd/listing-editor';

export async function GET() {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await loadPortalUserAccess(user.id);
  if (!access) {
    return NextResponse.json({ error: 'Your account is not linked to a Proppd profile yet.' }, { status: 403 });
  }

  const listings = await loadMyPortalListings(access);
  return NextResponse.json({ source: listings.source, items: listings.items, error: listings.error ?? null });
}

export async function POST(request: NextRequest) {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await loadPortalUserAccess(user.id);
  if (!access) {
    return NextResponse.json({ error: 'Your account is not linked to a Proppd profile yet.' }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = validatePortalListingInput(payload ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.errors.join(' '), errors: parsed.errors }, { status: 400 });
  }

  const created = await createPortalListing(access, parsed.data);
  if (created.source === 'error' || created.items.length === 0) {
    return NextResponse.json({ error: created.error ?? 'Could not create listing.' }, { status: 400 });
  }

  return NextResponse.json({ item: created.items[0] }, { status: 201 });
}
