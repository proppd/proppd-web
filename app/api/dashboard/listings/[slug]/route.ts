import { NextResponse, type NextRequest } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import {
  loadPortalListingDraftBySlug,
  loadPortalUserAccess,
  updatePortalListingBySlug,
} from '@/lib/proppd/backend';
import { validatePortalListingInput } from '@/lib/proppd/listing-editor';

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) {
    return NextResponse.json({ error: 'Your account is not linked to a Proppd profile yet.' }, { status: 403 });
  }

  const listing = await loadPortalListingDraftBySlug(slug, access);
  if (listing.source === 'error') {
    return NextResponse.json({ error: listing.error ?? 'Could not load listing.' }, { status: 400 });
  }
  if (listing.items.length === 0) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }

  return NextResponse.json({ item: listing.items[0] });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) {
    return NextResponse.json({ error: 'Your account is not linked to a Proppd profile yet.' }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = validatePortalListingInput(payload ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.errors.join(' '), errors: parsed.errors }, { status: 400 });
  }

  const updated = await updatePortalListingBySlug(slug, access, parsed.data);
  if (updated.source === 'error' || updated.items.length === 0) {
    return NextResponse.json({ error: updated.error ?? 'Could not update listing.' }, { status: 400 });
  }

  return NextResponse.json({ item: updated.items[0] });
}
