import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ListingEditorForm } from '@/components/listings/listing-editor-form';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalListingDraftBySlug, loadPortalUserAccess } from '@/lib/proppd/backend';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: {
    absolute: 'Edit listing | Proppd',
  },
  description: 'Edit an existing Proppd listing draft.',
  alternates: { canonical: '/dashboard/listings/[slug]/edit' },
};

export const dynamic = 'force-dynamic';

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) {
    redirect('/login?next=%2Fdashboard%2Flistings');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=%2Fdashboard%2Flistings');
  }

  const access = await loadPortalUserAccess(user.id);
  if (!access) {
    redirect('/login?next=%2Fdashboard%2Flistings');
  }

  const listing = await loadPortalListingDraftBySlug(slug, access);
  if (listing.items.length === 0 || listing.source === 'error') {
    redirect('/dashboard/listings');
  }

  const current = listing.items[0];

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] bg-[#050A30] p-8 text-white shadow-sm sm:p-10">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Edit listing</p>
            <h1 className="mt-4 text-5xl font-black tracking-[-.07em]">Update the live listing record.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
              Changes are saved straight into the database and tied to your authenticated account.
            </p>
          </div>

          <div className="mt-8">
            <ListingEditorForm mode="edit" initialListing={current} submitUrl={`/api/dashboard/listings/${slug}`} submitLabel="Save changes" />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
