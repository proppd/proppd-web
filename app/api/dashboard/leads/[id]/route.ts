import { NextResponse } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { addPortalLeadNote, loadPortalUserAccess, updatePortalLeadWorkflow } from '@/lib/proppd/backend';
import { isLeadStatus } from '@/lib/leads/pipeline';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return jsonError('Set up your agent profile first.', 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid JSON body');

  const note = typeof body.note === 'string' ? body.note : undefined;
  if (note !== undefined) {
    const result = await addPortalLeadNote(id, access, note);
    if (result.source === 'error' || result.items.length === 0) {
      return respondToError(result.error);
    }
    return NextResponse.json({ lead: result.items[0] });
  }

  const status = isLeadStatus(body.status) ? body.status : undefined;
  if (!status) return jsonError('Provide a valid lead status or a note.');

  const result = await updatePortalLeadWorkflow(id, access, { status });
  if (result.source === 'error' || result.items.length === 0) {
    return respondToError(result.error);
  }
  return NextResponse.json({ lead: result.items[0] });
}

function respondToError(error?: string) {
  const message = error ?? 'Failed to update lead.';
  const lower = message.toLowerCase();
  const status = lower.includes('access denied') ? 403 : lower.includes('not found') ? 404 : 400;
  return jsonError(message, status);
}
