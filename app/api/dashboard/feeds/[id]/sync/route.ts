import { NextResponse, type NextRequest } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import {
  importPortalListings,
  loadPortalUserAccess,
  loadFeedSources,
  recordFeedRun,
  systemFeedAccess,
  type FeedSourceRecord,
  type ImportListingItem,
} from '@/lib/proppd/backend';
import { fetchFeedContent } from '@/lib/import/fetch';
import { runListingImport } from '@/lib/import/pipeline';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const user = await getPortalServerUser();
  if (!user) return err('Unauthorized', 401);
  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return err('Access profile not found', 403);
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return err('Only agency admins can trigger feed syncs.', 403);
  }

  const { id } = await params;

  // Load the feed scoped to this user — prevents syncing another agency's feed.
  const feeds = await loadFeedSources(access);
  if (feeds.source === 'error') return err(feeds.error ?? 'Could not load feed sources.', 500);
  const source = feeds.items.find((f) => f.id === id);
  if (!source) return err('Feed source not found.', 404);

  const outcome = await syncOne(source);
  await recordFeedRun(id, {
    status: outcome.status,
    message: outcome.error ?? `created ${outcome.created ?? 0}, updated ${outcome.updated ?? 0}`,
    summary: outcome,
  });

  if (outcome.status === 'error') {
    return NextResponse.json({ ok: false, ...outcome }, { status: 502 });
  }
  return NextResponse.json({ ok: true, ...outcome });
}

async function syncOne(source: FeedSourceRecord) {
  const fetched = await fetchFeedContent(source.url);
  if (!fetched.ok) return { status: 'error' as const, error: fetched.error };

  const result = runListingImport(fetched.content, {
    format: source.format ?? undefined,
    recordTag: source.recordTag ?? undefined,
    defaultStatus: source.defaultStatus,
  });

  const items: ImportListingItem[] = result.rows
    .filter((row) => row.status === 'valid' && row.data)
    .map((row) => ({ externalRef: row.externalRef, listing: row.data! }));

  if (items.length === 0) {
    return { status: 'ok' as const, created: 0, updated: 0, failed: 0, invalid: result.summary.invalid };
  }

  const imported = await importPortalListings(systemFeedAccess(), {
    source: source.name,
    targetAgencyId: source.agencyId,
    items,
  });

  if (imported.source === 'error') return { status: 'error' as const, error: imported.error };

  return {
    status: 'ok' as const,
    created: imported.created,
    updated: imported.updated,
    failed: imported.failed,
    invalid: result.summary.invalid,
  };
}
