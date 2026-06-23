import { NextResponse, type NextRequest } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { buildProfilePrefill, validateAgentProfileInput } from '@/lib/agents/profile';
import { AGENT_WORKSPACE_FORBIDDEN_MESSAGE, canAccessAgentWorkspace, getPortalBackendMode, loadPortalAgentProfile, loadPortalUserAccess, upsertPortalAgentProfile } from '@/lib/proppd/backend';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export async function GET() {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) {
    return NextResponse.json({ error: AGENT_WORKSPACE_FORBIDDEN_MESSAGE }, { status: 403 });
  }

  const profile = await loadPortalAgentProfile(user.id);
  if (profile.source === 'error') {
    return NextResponse.json({ error: profile.error ?? 'Could not load your profile.' }, { status: 500 });
  }

  return NextResponse.json({
    backendMode: getPortalBackendMode(),
    profile: profile.items[0] ?? null,
    prefill: buildProfilePrefill(user.user_metadata, user.email),
  });
}

export async function PUT(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.dashboardMutation);
  if (limited) return limited;

  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) {
    return NextResponse.json({ error: AGENT_WORKSPACE_FORBIDDEN_MESSAGE }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = validateAgentProfileInput(payload ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.errors.join(' '), errors: parsed.errors }, { status: 400 });
  }

  const saved = await upsertPortalAgentProfile(user.id, parsed.data);
  if (saved.source === 'error' || saved.items.length === 0) {
    return NextResponse.json({ error: saved.error ?? 'Could not save your profile.' }, { status: 400 });
  }

  return NextResponse.json({ profile: saved.items[0] });
}
