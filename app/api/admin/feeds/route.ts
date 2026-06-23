import { NextResponse, type NextRequest } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import {
  createFeedSource,
  loadFeedSources,
  loadPortalUserAccess,
  type FeedSourceFormat,
} from '@/lib/proppd/backend';
import { isListingStatus, type PortalListingStatus } from '@/lib/proppd/listing-editor';
import { isSafeFeedUrl } from '@/lib/import/fetch';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin() {
  const user = await getPortalServerUser();
  if (!user) return { error: jsonError('Unauthorized', 401) };
  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return { error: jsonError('Access profile not found', 403) };
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { error: jsonError('Only admins can manage feed sources.', 403) };
  }
  return { access };
}

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const result = await loadFeedSources(auth.access);
  if (result.source === 'error') return jsonError(result.error ?? 'Could not load feed sources.', 400);
  return NextResponse.json({ items: result.items });
}

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.adminMutation);
  if (limited) return limited;

  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid JSON body');

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';
  if (name.length < 2) return jsonError('A feed name is required.');
  if (!isSafeFeedUrl(url)) return jsonError('A valid public http(s) feed URL is required.');

  const format = isFeedFormat(body.format) ? body.format : null;
  const recordTag = typeof body.recordTag === 'string' && body.recordTag.trim() ? body.recordTag.trim() : null;
  const defaultStatus: PortalListingStatus = isListingStatus(body.defaultStatus) ? body.defaultStatus : 'pending_review';
  const frequencyMinutes = clampFrequency(body.frequencyMinutes);
  const agencyId = typeof body.agencyId === 'string' ? body.agencyId : '';

  if (auth.access.role === 'super_admin' && !agencyId) {
    return jsonError('Select the agency this feed belongs to.');
  }

  const result = await createFeedSource(auth.access, {
    agencyId,
    name,
    url,
    format,
    recordTag,
    defaultStatus,
    frequencyMinutes,
    isActive: body.isActive !== false,
  });

  if (result.source === 'error' || result.items.length === 0) {
    return jsonError(result.error ?? 'Could not create feed source.', 400);
  }
  return NextResponse.json({ item: result.items[0] }, { status: 201 });
}

function isFeedFormat(value: unknown): value is FeedSourceFormat {
  return value === 'csv' || value === 'xml' || value === 'json';
}

function clampFrequency(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1440;
  return Math.max(15, Math.min(Math.round(numeric), 43_200)); // 15 min .. 30 days
}
