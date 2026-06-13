import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ListingEditorForm } from '@/components/listings/listing-editor-form';
import { loadPortalUserAccess } from '@/lib/proppd/backend';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: { absolute: 'New listing | Proppd' },
  description: 'Create a new property listing on Proppd.',
  alternates: { canonical: '/dashboard/listings/new' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) redirect('/login?next=%2Fdashboard%2Flistings%2Fnew');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=%2Fdashboard%2Flistings%2Fnew');

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) redirect('/dashboard/profile');

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">New listing</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">Create a property listing</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Follow the steps to add a new property to Proppd.</p>
          </div>
          <ListingEditorForm mode="create" submitUrl="/api/dashboard/listings" submitLabel="Create listing" />
        </div>
      </section>
    </main>
  );
}
