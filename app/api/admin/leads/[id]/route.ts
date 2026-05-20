import { NextResponse } from 'next/server';
import { getPortalServerUser } from '../../../../../lib/supabase/server';
import { loadPortalLeadById, loadPortalUserAccess, updatePortalLeadWorkflow } from '../../../../../lib/proppd/backend';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return jsonError('Access profile not found', 403);

  const result = await loadPortalLeadById(id);
  if (result.source === 'error') return jsonError(result.error ?? 'Failed to load lead', 500);
  if (!result.items[0]) return jsonError('Lead not found', 404);

  return NextResponse.json({ lead: result.items[0], source: result.source });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return jsonError('Access profile not found', 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid JSON body');

  const status = typeof body.status === 'string' ? body.status : undefined;
  const quality = typeof body.quality === 'string' ? body.quality : undefined;
  if (!status && !quality) return jsonError('Provide a status or quality change');

  const result = await updatePortalLeadWorkflow(id, access, {
    status: status === 'new' || status === 'contacted' || status === 'qualified' || status === 'archived' ? status : undefined,
    quality: quality === 'clean' || quality === 'duplicate' || quality === 'flagged' ? quality : undefined,
  });

  if (result.source === 'error') {
    const isForbidden = (result.error ?? '').toLowerCase().includes('access denied');
    const isNotFound = (result.error ?? '').toLowerCase().includes('not found');
    return jsonError(result.error ?? 'Failed to update lead', isForbidden ? 403 : isNotFound ? 404 : 400);
  }

  return NextResponse.json({ lead: result.items[0], source: result.source });
}
