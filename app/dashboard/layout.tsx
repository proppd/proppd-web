import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { canAccessAgentWorkspace, loadPortalUserAccess } from '@/lib/proppd/backend';
import { isSupabaseBrowserConfigured } from '@/lib/supabase/env';
import { getPortalServerUser } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require an approved agent/agency profile for AgentOS/CRM. Owners and normal
  // signed-in users have their own workspace at /my-properties and must not see
  // or access the agent dashboard.
  if (isSupabaseBrowserConfigured()) {
    const user = await getPortalServerUser();
    if (!user) {
      redirect('/login?next=/dashboard');
    }

    const access = await loadPortalUserAccess(user.id, user.email);
    if (!canAccessAgentWorkspace(access)) {
      redirect('/my-properties');
    }
  }

  return (
    <div className="proppd-page overflow-x-hidden">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <DashboardNav />
        <div className="min-w-0">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
