import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { OwnerCrm } from '@/components/owner/owner-crm';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: { absolute: 'My properties | Proppd' },
  description: 'A simple workspace for South African sellers and landlords: track the homes you plan to sell or rent out, get an instant market range, and move each one forward.',
  alternates: { canonical: '/my-properties' },
};

export default function Page() {
  const config = getSupabaseBrowserConfig();
  return (
    <main className="proppd-page">
      <SiteHeader />
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <OwnerCrm supabaseUrl={config?.url} supabaseKey={config?.publishableKey} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
