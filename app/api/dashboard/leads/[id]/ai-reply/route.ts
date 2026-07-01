import { NextResponse } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { AGENT_WORKSPACE_FORBIDDEN_MESSAGE, canAccessAgentWorkspace, loadPortalLeadTimeline, loadPortalUserAccess } from '@/lib/proppd/backend';
import { canAccessLeadRecord } from '@/lib/proppd/dashboard-access';
import { generateLeadReply, parseLeadReplyChannel } from '@/lib/ai/lead-reply';
import { isAiConfigured } from '@/lib/ai/listing-description';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Draft an AI reply for a lead. The client only chooses the channel — the
// lead content is loaded server-side after the same per-record authorisation
// as the lead detail page, so a caller can't generate replies from data they
// don't own (or feed the model spoofed lead content).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.aiLeadReply);
  if (limited) return limited;

  if (!isAiConfigured()) {
    return jsonError('AI reply drafting is not enabled on this deployment.', 503);
  }

  const { id } = await params;
  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) return jsonError(AGENT_WORKSPACE_FORBIDDEN_MESSAGE, 403);

  const timeline = await loadPortalLeadTimeline(id);
  if (!timeline) return jsonError('Lead not found.', 404);

  const lead = timeline.lead;
  if (!canAccessLeadRecord(access, lead)) return jsonError('Lead not found.', 404);

  const body = await request.json().catch(() => null);
  const channel = parseLeadReplyChannel(body);
  if (!channel) return jsonError('Provide a reply channel: "email" or "whatsapp".');

  const result = await generateLeadReply({
    channel,
    leadName: lead.name,
    message: lead.message,
    intent: lead.intent,
    status: lead.status,
    listingTitle: lead.listingTitle,
    agentName: lead.agent,
    agency: lead.agency,
    viewingAt: lead.viewingAt,
  });

  if (!result.ok) {
    return jsonError(result.error, 422);
  }

  return NextResponse.json({ reply: result.reply, channel });
}
