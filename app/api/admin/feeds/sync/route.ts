import { NextResponse, type NextRequest } from 'next/server';
import {
  importPortalListings,
  loadActiveFeedSources,
  loadFeedAuthHeader,
  recordFeedRun,
  systemFeedAccess,
  type FeedSourceRecord,
  type ImportListingItem,
} from '@/lib/proppd/backend';
import { runListingImport } from '@/lib/import/pipeline';
import { fetchFeedContent } from '@/lib/import/fetch';
import { isFeedSourceDue } from '@/lib/import/schedule';
import { isAuthorizedCronRequest } from '@/app/api/saved-searches/run-alerts/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Triggered by a scheduler (Vercel Cron). Guarded by CRON_SECRET via the
// Authorization header so secrets never appear in logged URLs. Pass ?force=1
// to ignore each feed's interval and pull everything now.
export async function GET(request: NextRequest) {
  return runSync(request);
}
export async function POST(request: NextRequest) {
  return runSync(request);
}

async function runSync(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'Feed sync is not configured (set CRON_SECRET).' }, { status: 503 });
  }
  if (!isAuthorizedCronRequest(request.headers, secret)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get('force') === '1';
  const sources = await loadActiveFeedSources();
  if (sources.source === 'error') {
    return NextResponse.json({ ok: false, error: sources.error ?? 'Could not load feed sources.' }, { status: 500 });
  }

  const now = new Date();
  const due = force ? sources.items : sources.items.filter((source) => isFeedSourceDue(toSchedule(source), now));

  const access = systemFeedAccess();
  const results: Array<{ id: string; name: string; status: 'ok' | 'error'; created?: number; updated?: number; failed?: number; invalid?: number; error?: string }> = [];

  for (const source of due) {
    const authHeader = await loadFeedAuthHeader(source.id);
    const outcome = await syncOne(source, access, authHeader);
    results.push({ id: source.id, name: source.name, ...outcome });
    await recordFeedRun(source.id, {
      status: outcome.status,
      message: outcome.error ?? `created ${outcome.created ?? 0}, updated ${outcome.updated ?? 0}`,
      summary: outcome,
    });
  }

  return NextResponse.json({ ok: true, total: sources.items.length, ran: due.length, results });
}

async function syncOne(source: FeedSourceRecord, access: ReturnType<typeof systemFeedAccess>, authorizationHeader?: string | null) {
  const fetched = await fetchFeedContent(source.url, { authorizationHeader: authorizationHeader ?? undefined });
  if (!fetched.ok) {
    return { status: 'error' as const, error: fetched.error };
  }

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

  const imported = await importPortalListings(access, {
    source: source.name,
    targetAgencyId: source.agencyId,
    items,
  });

  if (imported.source === 'error') {
    return { status: 'error' as const, error: imported.error };
  }

  return {
    status: 'ok' as const,
    created: imported.created,
    updated: imported.updated,
    failed: imported.failed,
    invalid: result.summary.invalid,
  };
}

function toSchedule(source: FeedSourceRecord) {
  return { isActive: source.isActive, frequencyMinutes: source.frequencyMinutes, lastRunAt: source.lastRunAt };
}
