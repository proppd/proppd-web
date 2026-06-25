import { redirect } from 'next/navigation';
import { canAccessAgentWorkspace, loadPortalUserAccess, type PortalUserAccess } from '@/lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';

/**
 * Server-side guard for every /dashboard/* page.
 *
 * The dashboard is the agent CRM, so it requires BOTH authentication and
 * authorisation. Checking only `if (!user)` is not enough: a self-signed-up
 * account (role 'user' — e.g. a buyer who registered for saved homes) is
 * authenticated but must not reach the CRM. Without this guard such an account
 * falls through to another agent's workspace data, because the dashboard data
 * helpers default to the global lead queue / first agent when no agent identity
 * is present.
 *
 * Returns the resolved access (narrowed to a real agent/agency/admin) on
 * success; otherwise redirects and never returns. Fails closed.
 */
export async function requireAgentWorkspaceAccess(nextPath: string): Promise<PortalUserAccess> {
  const user = await getPortalServerUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!canAccessAgentWorkspace(access)) redirect('/my-properties');

  return access;
}
