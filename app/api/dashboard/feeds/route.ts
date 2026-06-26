import { NextResponse, type NextRequest } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import {
  createFeedSource,
  loadFeedSources,
  loadPortalUserAccess,
  type FeedSourceFormat,
} from '@/lib/proppd/backend';
import { isListingStatus } from '@/lib/proppd/listing-editor';
import { isSafeFeedUrl } from '@/lib/import/fetch';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

async function requireFeedAdmin(request?: NextRequest) {
  const user = await getPortalServerUser();
  if (!user) return { error: err('Unauthorized', 401) };
  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return { error: err('Access profile not found', 403) };
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { error: err('Only agency admins can manage feed sources.', 403) };
  }
  return { access };
}

export async function GET() {
  const auth = await requireFeedAdmin();
  if ('error' in auth) return auth.error;

  const result = await loadFeedSources(auth.access);
  if (result.source === 'error') return err(result.error ?? 'Could not load feed sources.', 500);
  return NextResponse.json({ items: result.items });
}

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const auth = await requireFeedAdmin(request);
  if ('error' in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return err('Invalid request body.');

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';
  if (name.length < 2) return err('A feed name of at least 2 characters is required.');
  if (!isSafeFeedUrl(url)) return err('A valid public https feed URL is required.');

  const format = isFeedFormat(body.format) ? body.format : null;
  const recordTag = typeof body.recordTag === 'string' && body.recordTag.trim() ? body.recordTag.trim() : null;
  const defaultStatus = isListingStatus(body.defaultStatus) ? body.defaultStatus : 'pending_review';
  const frequencyMinutes = clampFrequency(body.frequencyMinutes);

  const result = await createFeedSource(auth.access, {
    agencyId: auth.access.agencyId ?? '',
    name,
    url,
    format,
    recordTag,
    defaultStatus,
    frequencyMinutes,
    isActive: body.isActive !== false,
  });

  if (result.source === 'error' || result.items.length === 0) {
    return err(result.error ?? 'Could not create feed source.', 400);
  }
  return NextResponse.json({ item: result.items[0] }, { status: 201 });
}

function isFeedFormat(v: unknown): v is FeedSourceFormat {
  return v === 'csv' || v === 'xml' || v === 'json';
}

function clampFrequency(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1440;
  return Math.max(15, Math.min(Math.round(n), 43_200));
}
