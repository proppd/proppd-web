import { redirect } from 'next/navigation';
import { isSupabaseBrowserConfigured } from '@/lib/supabase/env';
import { getPortalServerUser } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require sign-in for the admin console. When Supabase isn't configured
  // (e.g. preview/demo), fall through so the showcase still renders.
  if (isSupabaseBrowserConfigured() && !(await getPortalServerUser())) {
    redirect('/login?next=/admin');
  }

  return <>{children}</>;
}
