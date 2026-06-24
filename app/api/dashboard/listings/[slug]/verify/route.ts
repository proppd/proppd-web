import { NextResponse, type NextRequest } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import {
  AGENT_WORKSPACE_FORBIDDEN_MESSAGE,
  canAccessAgentWorkspace,
  loadPortalUserAccess,
  toggleListingVerification,
} from '@/lib/proppd/backend';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const { slug } = await params;
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) {
    return NextResponse.json({ error: AGENT_WORKSPACE_FORBIDDEN_MESSAGE }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  if (typeof payload?.verified !== 'boolean') {
    return NextResponse.json({ error: 'Body must include { verified: boolean }.' }, { status: 400 });
  }

  const result = await toggleListingVerification(slug, payload.verified, access);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, verified: payload.verified });
}
