import type { Metadata } from 'next';
import { UserCheck, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadPortalUserAccess, loadAgentReviewRequests } from '@/lib/proppd/backend';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { AgentReviewQueue } from '@/components/admin/agent-review-queue';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Agent review queue',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getPortalServerUser();
  if (!user) redirect('/login?next=/admin/agents');
  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access || access.role !== 'super_admin') redirect('/');

  const [pending, resolved] = await Promise.all([
    loadAgentReviewRequests(access, 'pending'),
    loadAgentReviewRequests(access),
  ]);

  const allItems = resolved.source === 'database' ? resolved.items : [];
  const pendingItems = pending.source === 'database' ? pending.items : [];
  const approvedCount = allItems.filter((r) => r.reviewStatus === 'approved').length;
  const rejectedCount = allItems.filter((r) => r.reviewStatus === 'rejected').length;

  return (
    <main className="proppd-page">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="overflow-hidden rounded-xl proppd-panel shadow-sm">
            <div className="p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Agent operations</p>
              <h1 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Agent review queue</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                Applications that could not be auto-verified against the PPRA register are held here for manual review.
                Approving sends the agent a sign-in link immediately.
              </p>
              <div className="mt-6">
                <a href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
                  ← Back to operations
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <StatCard icon={<Clock3 size={20} />} label="Pending review" value={pendingItems.length} tone="default" />
            <StatCard icon={<CheckCircle2 size={20} />} label="Approved" value={approvedCount} tone="success" />
            <StatCard icon={<XCircle size={20} />} label="Rejected" value={rejectedCount} tone="danger" />
          </div>

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Pending applications</p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">
                  {pendingItems.length === 0 ? 'No pending applications' : `${pendingItems.length} awaiting review`}
                </h2>
              </div>
              <UserCheck className="text-[#4A3AFF]" size={32} />
            </div>

            {pendingItems.length === 0 ? (
              <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-6 py-12 text-center">
                <CheckCircle2 className="mx-auto text-emerald-500" size={36} />
                <p className="mt-4 font-bold text-[#1A1A2E]">All clear</p>
                <p className="mt-2 text-sm font-bold text-[#9CA3AF]">No agent applications are waiting for manual review.</p>
              </div>
            ) : (
              <AgentReviewQueue items={pendingItems} />
            )}
          </div>

          {allItems.some((r) => r.reviewStatus !== 'pending') && (
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#9CA3AF]">Resolved applications</p>
              <h2 className="mt-2 text-xl font-bold tracking-[-.04em]">{allItems.filter((r) => r.reviewStatus !== 'pending').length} resolved</h2>
              <AgentReviewQueue items={allItems.filter((r) => r.reviewStatus !== 'pending')} readOnly />
            </div>
          )}

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'default' | 'success' | 'danger' }) {
  const toneClass =
    tone === 'success' ? 'bg-emerald-50 text-emerald-600' : tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#EFF6FF] text-[#2563EB]';
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl p-3 ${toneClass}`}>{icon}</div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-bold text-[#9CA3AF]">{label}</p>
    </div>
  );
}
