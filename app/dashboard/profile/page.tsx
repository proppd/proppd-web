import type { Metadata } from 'next';
import { AgentProfileEditor } from '@/components/agent/agent-profile-editor';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { absolute: 'Profile | Proppd' },
  description: 'Edit your agent profile.',
  alternates: { canonical: '/dashboard/profile' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireAgentWorkspaceAccess('/dashboard/profile');

  return (
    <main className="proppd-page">
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
