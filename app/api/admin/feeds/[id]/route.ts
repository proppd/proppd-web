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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.adminMutation);
  if (limited) return limited;

  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid JSON body');

  if (typeof body.url === 'string' && !isSafeFeedUrl(body.url.trim())) {
    return jsonError('A valid public http(s) feed URL is required.');
  }

  const result = await updateFeedSource(id, auth.access, {
    name: typeof body.name === 'string' ? body.name.trim() : undefined,
    url: typeof body.url === 'string' ? body.url.trim() : undefined,
    format: isFeedFormat(body.format) ? body.format : undefined,
    recordTag: typeof body.recordTag === 'string' ? body.recordTag.trim() : undefined,
    defaultStatus: isListingStatus(body.defaultStatus) ? body.defaultStatus : undefined,
    frequencyMinutes: body.frequencyMinutes === undefined ? undefined : clampFrequency(body.frequencyMinutes),
    isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
  });

  if (result.source === 'error' || result.items.length === 0) {
    const message = result.error ?? 'Could not update feed source.';
    return jsonError(message, message.includes('not found') ? 404 : 400);
  }
  return NextResponse.json({ item: result.items[0] });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;
  const limited = rateLimitRequest(request, rateLimitPolicies.adminMutation);
  if (limited) return limited;

  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const result = await deleteFeedSource(id, auth.access);
  if (result.source === 'error') {
    const message = result.error ?? 'Could not delete feed source.';
    return jsonError(message, message.includes('not found') ? 404 : 400);
  }
  return NextResponse.json({ ok: true, id });
}

function isFeedFormat(value: unknown): value is FeedSourceFormat {
  return value === 'csv' || value === 'xml' || value === 'json';
}

function clampFrequency(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1440;
  return Math.max(15, Math.min(Math.round(numeric), 43_200));
}
