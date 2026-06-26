import { NextResponse, type NextRequest } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import {
  deleteFeedSource,
  loadPortalUserAccess,
  updateFeedSource,
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

async function requireFeedAdmin() {
  const user = await getPortalServerUser();
  if (!user) return { error: err('Unauthorized', 401) };
  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return { error: err('Access profile not found', 403) };
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { error: err('Only agency admins can manage feed sources.', 403) };
  }
  return { access };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const auth = await requireFeedAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return err('Invalid request body.');

  const patch: Parameters<typeof updateFeedSource>[2] = {};

  if ('name' in body) {
    const n = typeof body.name === 'string' ? body.name.trim() : '';
    if (n.length < 2) return err('Feed name must be at least 2 characters.');
    patch.name = n;
  }
  if ('url' in body) {
    const u = typeof body.url === 'string' ? body.url.trim() : '';
    if (!isSafeFeedUrl(u)) return err('A valid public https feed URL is required.');
    patch.url = u;
  }
  if ('format' in body) patch.format = isFeedFormat(body.format) ? body.format : null;
  if ('recordTag' in body) patch.recordTag = typeof body.recordTag === 'string' && body.recordTag.trim() ? body.recordTag.trim() : null;
  if ('defaultStatus' in body) patch.defaultStatus = isListingStatus(body.defaultStatus) ? body.defaultStatus : undefined;
  if ('frequencyMinutes' in body) patch.frequencyMinutes = clampFrequency(body.frequencyMinutes);
  if ('isActive' in body) patch.isActive = body.isActive === true || body.isActive === false ? body.isActive : undefined;

  const result = await updateFeedSource(id, auth.access, patch);
  if (result.source === 'error') return err(result.error ?? 'Could not update feed source.', result.error?.includes('not found') ? 404 : 400);
  return NextResponse.json({ item: result.items[0] });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const auth = await requireFeedAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const result = await deleteFeedSource(id, auth.access);
  if (result.source === 'error') return err(result.error ?? 'Could not delete feed source.', result.error?.includes('not found') ? 404 : 400);
  return NextResponse.json({ ok: true });
}

function isFeedFormat(v: unknown): v is FeedSourceFormat {
  return v === 'csv' || v === 'xml' || v === 'json';
}

function clampFrequency(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1440;
  return Math.max(15, Math.min(Math.round(n), 43_200));
}
