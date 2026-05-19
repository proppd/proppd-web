import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ListingEditorForm } from '@/components/listings/listing-editor-form';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalUserAccess } from '@/lib/proppd/backend';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: {
    absolute: 'Create listing | Proppd',
  },
  description: 'Create a new listing draft in the Proppd backend.',
  alternates: { canonical: '/dashboard/listings/new' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    redirect('/login?next=%2Fdashboard%2Flistings%2Fnew');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=%2Fdashboard%2Flistings%2Fnew');
  }

  const access = await loadPortalUserAccess(user.id);
  if (!access) {
    redirect('/login?next=%2Fdashboard%2Flistings%2Fnew');
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] bg-[#050A30] p-8 text-white shadow-sm sm:p-10">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">New listing</p>
            <h1 className="mt-4 text-5xl font-black tracking-[-.07em]">Create the next property listing.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
              Add the core details once and store them in the database as a real draft that can be edited and published later.
            </p>
          </div>

          <div className="mt-8">
            <ListingEditorForm mode="create" submitUrl="/api/dashboard/listings" submitLabel="Create listing" />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
