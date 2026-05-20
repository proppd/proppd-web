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

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
            <ListingEditorForm mode="create" submitUrl="/api/dashboard/listings" submitLabel="Create listing" />

            <aside className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Draft checklist</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Have these ready before you save.</h2>
              <div className="mt-5 space-y-3">
                <SupportStep title="Listing basics" text="Title, suburb, city, price, and property type are the minimum useful inputs." />
                <SupportStep title="Live stock context" text="Mark whether the listing is draft, pending review, available, or already under offer." />
                <SupportStep title="Trust signals" text="Add bedrooms, bathrooms, parking, and a clear description so the portal card reads properly." />
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-[#F5F7FA] p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#050A30]">After you save</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Proppd saves the draft first, then routes you to the edit view so the listing can be refined before it is exposed more widely.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function SupportStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-[#F5F7FA] p-4">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[#3B49FF]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
