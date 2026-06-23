import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { NextResponse, type NextRequest } from 'next/server';
import { getPortalDatabaseUrl } from '@/lib/proppd/backend';
import { buildVisitorHash, isWithinDedupeWindow, normaliseViewSource, VIEW_DEDUPE_WINDOW_MS } from '@/lib/listings/view-tracking';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';

export const runtime = 'nodejs';

let viewPool: Pool | undefined;

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = getPortalDatabaseUrl();

  // Analytics are best-effort: if no backend is configured, accept and no-op.
  if ((!supabaseUrl || !serviceRoleKey) && !databaseUrl) {
    return NextResponse.json({ ok: true, counted: false }, { status: 202 });
  }

  const body = (await request.json().catch(() => null)) as { slug?: string; source?: string } | null;
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Missing listing slug.' }, { status: 400 });
  }

  const visitorHash = buildVisitorHash(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(), request.headers.get('user-agent'));
  const source = normaliseViewSource(body?.source);

  try {
    const counted = databaseUrl
      ? await recordViewWithPostgres(databaseUrl, slug, visitorHash, source)
      : await recordViewWithSupabase(
          createClient(supabaseUrl as string, serviceRoleKey as string, { auth: { persistSession: false } }),
          slug,
          visitorHash,
          source,
        );
    return NextResponse.json({ ok: true, counted }, { status: 202 });
  } catch {
    // Never surface analytics failures to the visitor.
    return NextResponse.json({ ok: true, counted: false }, { status: 202 });
  }
}

async function recordViewWithPostgres(databaseUrl: string, slug: string, visitorHash: string, source: string | null): Promise<boolean> {
  const pool = getViewPool(databaseUrl);
  const listing = await pool.query<{ id: string }>('select id from public.listings where slug = $1 limit 1', [slug]);
  const listingId = listing.rows[0]?.id;
  if (!listingId) return false;

  const recent = await pool.query<{ viewed_at: string }>(
    'select viewed_at from public.listing_views where listing_id = $1 and visitor_hash = $2 order by viewed_at desc limit 1',
    [listingId, visitorHash],
  );
  if (isWithinDedupeWindow(recent.rows[0]?.viewed_at)) return false;

  await pool.query(
    'insert into public.listing_views (listing_id, visitor_hash, source) values ($1, $2, $3)',
    [listingId, visitorHash, source],
  );
  return true;
}

async function recordViewWithSupabase(supabase: SupabaseClient, slug: string, visitorHash: string, source: string | null): Promise<boolean> {
  const { data: listing } = await supabase.from('listings').select('id').eq('slug', slug).maybeSingle();
  const listingId = (listing as { id: string } | null)?.id;
  if (!listingId) return false;

  const since = new Date(Date.now() - VIEW_DEDUPE_WINDOW_MS).toISOString();
  const { data: recent } = await supabase
    .from('listing_views')
    .select('id')
    .eq('listing_id', listingId)
    .eq('visitor_hash', visitorHash)
    .gte('viewed_at', since)
    .limit(1);
  if (recent && recent.length > 0) return false;

  const { error } = await supabase.from('listing_views').insert({ listing_id: listingId, visitor_hash: visitorHash, source });
  return !error;
}

function getViewPool(connectionString: string): Pool {
  if (!viewPool) {
    let host: string | null = null;
    try {
      host = new URL(connectionString).hostname;
    } catch {
      host = null;
    }
    viewPool = new Pool({
      connectionString,
      ssl: host && !['localhost', '127.0.0.1'].includes(host) ? { rejectUnauthorized: false } : undefined,
      max: 2,
    });
  }
  return viewPool;
}
