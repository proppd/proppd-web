import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { isSupabaseBrowserConfigured } from '@/lib/supabase/env';
import { getPortalServerUser } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require sign-in for the agent workspace. When Supabase isn't configured
  // (e.g. preview/demo), fall through so the showcase still renders.
  if (isSupabaseBrowserConfigured() && !(await getPortalServerUser())) {
    redirect('/login?next=/dashboard');
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
