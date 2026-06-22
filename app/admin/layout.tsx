import { redirect } from 'next/navigation';
import { isSupabaseBrowserConfigured } from '@/lib/supabase/env';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadPortalUserAccess } from '@/lib/proppd/backend';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lock the admin console to admin roles. When Supabase isn't configured
  // (e.g. preview/demo), fall through so the showcase still renders.
  if (isSupabaseBrowserConfigured()) {
    const user = await getPortalServerUser();
    if (!user) {
      redirect('/login?next=/admin');
    }
    const access = await loadPortalUserAccess(user.id, user.email);
    if (access?.role !== 'super_admin') {
      // Signed in but not an admin — send them back to the public site.
      redirect('/');
    }
  }

  return <>{children}</>;
}
