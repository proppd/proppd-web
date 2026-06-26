import { NextResponse, type NextRequest } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadPortalUserAccess, loadAgentReviewRequests, type AgentReviewStatus } from '@/lib/proppd/backend';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(request: NextRequest) {
  const user = await getPortalServerUser();
  if (!user) return err('Unauthorized', 401);
  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access || access.role !== 'super_admin') return err('Forbidden', 403);

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const status: AgentReviewStatus | undefined =
    statusParam === 'pending' || statusParam === 'approved' || statusParam === 'rejected'
      ? statusParam
      : undefined;

  const result = await loadAgentReviewRequests(access, status);
  if (result.source === 'error') return err(result.error ?? 'Could not load review requests.', 500);
  return NextResponse.json({ items: result.items });
}

// Unused but required to satisfy Next.js dynamic route POST for CORS guard
export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginMutation(request);
  if (rejected) return rejected;
  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;
  return err('Use PATCH /api/admin/agents/review/[id] to update a review.', 405);
}
