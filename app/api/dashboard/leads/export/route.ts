import { NextResponse } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { AGENT_WORKSPACE_FORBIDDEN_MESSAGE, canAccessAgentWorkspace, leadQueueScopeForAccess, loadPortalLeadQueue, loadPortalUserAccess } from '@/lib/proppd/backend';
import { buildLeadsCsv, buildLeadsCsvFilename } from '@/lib/leads/export';
import { filterLeads, isLeadStatus, type LeadFilters, type LeadQuality } from '@/lib/leads/pipeline';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// CSV download of the caller's lead queue, honouring the same scope rules as
// the leads page (agents: own leads; agency admins: agency; super admins:
// all) and the same q/status/quality filters so "export what I'm looking at"
// works from the filtered list.
export async function GET(request: Request) {
  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardExport);
  if (limited) return limited;

  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) return jsonError(AGENT_WORKSPACE_FORBIDDEN_MESSAGE, 403);

  const payload = await loadPortalLeadQueue(leadQueueScopeForAccess(access));
  const url = new URL(request.url);
  const leads = filterLeads(payload.items, parseExportFilters(url.searchParams));

  return new Response(buildLeadsCsv(leads), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${buildLeadsCsvFilename()}"`,
      'cache-control': 'no-store',
    },
  });
}

function parseExportFilters(params: URLSearchParams): LeadFilters {
  const status = params.get('status');
  const quality = params.get('quality');
  return {
    query: params.get('q')?.trim() || undefined,
    status: isLeadStatus(status) ? status : 'all',
    quality: quality === 'clean' || quality === 'duplicate' || quality === 'flagged' ? (quality as LeadQuality) : 'all',
  };
}
