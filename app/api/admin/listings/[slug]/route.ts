import { NextResponse } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadPortalUserAccess, setPortalListingModeration } from '@/lib/proppd/backend';
import { isListingStatus } from '@/lib/proppd/listing-editor';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.adminMutation);
  if (limited) return limited;

  const { slug } = await params;
  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return jsonError('Access profile not found', 403);
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return jsonError('Only admins can moderate listings.', 403);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid JSON body');

  const status = isListingStatus(body.status) ? body.status : undefined;
  const isFeatured = typeof body.isFeatured === 'boolean' ? body.isFeatured : undefined;
  if (status === undefined && isFeatured === undefined) {
    return jsonError('Provide a status or featured change.');
  }

  const result = await setPortalListingModeration(slug, access, { status, isFeatured });
  if (result.source === 'error' || result.items.length === 0) {
    const message = result.error ?? 'Failed to update listing.';
    const forbidden = message.toLowerCase().includes('access');
    return jsonError(message, forbidden ? 403 : 400);
  }

  return NextResponse.json({ listing: result.items[0] });
}
