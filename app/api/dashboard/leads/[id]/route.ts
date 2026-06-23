import { NextResponse } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import { addPortalLeadNote, loadPortalUserAccess, updatePortalLeadWorkflow } from '@/lib/proppd/backend';
import { isLeadStatus } from '@/lib/leads/pipeline';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';

export const runtime = 'nodejs';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const { id } = await params;
  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return jsonError('Set up your agent profile first.', 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid JSON body');

  const note = typeof body.note === 'string' ? body.note : undefined;
  const statusWasProvided = Object.prototype.hasOwnProperty.call(body, 'status');
  const status = isLeadStatus(body.status) ? body.status : undefined;

  if (statusWasProvided && !status) return jsonError('Provide a valid lead status.');

  if (status) {
    const statusResult = await updatePortalLeadWorkflow(id, access, { status });
    if (statusResult.source === 'error' || statusResult.items.length === 0) {
      return respondToError(statusResult.error);
    }

    if (note !== undefined && note.trim().length > 0) {
      const noteResult = await addPortalLeadNote(id, access, note);
      if (noteResult.source === 'error' || noteResult.items.length === 0) {
        return respondToError(noteResult.error);
      }
      return NextResponse.json({ lead: noteResult.items[0] });
    }

    return NextResponse.json({ lead: statusResult.items[0] });
  }

  if (note !== undefined) {
    const result = await addPortalLeadNote(id, access, note);
    if (result.source === 'error' || result.items.length === 0) {
      return respondToError(result.error);
    }
    return NextResponse.json({ lead: result.items[0] });
  }

  return jsonError('Provide a valid lead status or a note.');
}

function respondToError(error?: string) {
  const message = error ?? 'Failed to update lead.';
  const lower = message.toLowerCase();
  const status = lower.includes('access denied') ? 403 : lower.includes('not found') ? 404 : 400;
  return jsonError(message, status);
}
