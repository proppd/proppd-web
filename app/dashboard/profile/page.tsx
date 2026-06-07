import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AgentProfileEditor } from '@/components/agent/agent-profile-editor';
import { getPortalServerUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: { absolute: 'Profile | Proppd' },
  description: 'Edit your agent profile.',
  alternates: { canonical: '/dashboard/profile' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getPortalServerUser();
  if (!user) {
    redirect('/login?next=%2Fdashboard%2Fprofile');
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Profile</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">Edit your profile</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Update your information that buyers and tenants see.</p>
          </div>
          <AgentProfileEditor />
        </div>
      </section>
    </main>
  );
}
