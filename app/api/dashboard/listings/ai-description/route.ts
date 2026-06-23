import { NextResponse, type NextRequest } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { AGENT_WORKSPACE_FORBIDDEN_MESSAGE, canAccessAgentWorkspace, loadPortalUserAccess } from '@/lib/proppd/backend';
import { generateListingDescription, isAiConfigured, parseListingFactsFromBody } from '@/lib/ai/listing-description';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.aiDescription);
  if (limited) return limited;

  if (!isAiConfigured()) {
    return jsonError('AI description writer is not enabled on this deployment.', 503);
  }

  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return jsonError('Supabase is not configured.', 503);
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return jsonError('Unauthorized', 401);
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) {
    return jsonError(AGENT_WORKSPACE_FORBIDDEN_MESSAGE, 403);
  }

  const body = await request.json().catch(() => null);
  const facts = parseListingFactsFromBody(body);

  const result = await generateListingDescription(facts);
  if (!result.ok) {
    return jsonError(result.error, 422);
  }

  return NextResponse.json({ description: result.description });
}
