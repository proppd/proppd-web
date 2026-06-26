import { NextResponse } from 'next/server';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { canAccessAgentWorkspace, loadPortalUserAccess } from '@/lib/proppd/backend';

export const dynamic = 'force-dynamic';

// Lightweight "who am I" probe for the public header. It only reveals whether
// the signed-in user belongs in the agent workspace (Dashboard) or is a
// consumer (My enquiries) — never another user's data. Signed-out callers get
// a benign false rather than a 401 so the header can render without errors.
export async function GET() {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ signedIn: false, canAccessWorkspace: false });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ signedIn: false, canAccessWorkspace: false });
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  return NextResponse.json({
    signedIn: true,
    canAccessWorkspace: canAccessAgentWorkspace(access),
  });
}
