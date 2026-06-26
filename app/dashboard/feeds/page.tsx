import type { Metadata } from 'next';
import { Rss } from 'lucide-react';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';
import { loadFeedSources } from '@/lib/proppd/backend';
import { FeedSourcesList } from '@/components/dashboard/feed-sources-list';

export const metadata: Metadata = {
  title: { absolute: 'Feed Sources | Proppd' },
  description: 'Connect your listing feed to sync your stock into Proppd automatically.',
  alternates: { canonical: '/dashboard/feeds' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function FeedsPage() {
  const access = await requireAgentWorkspaceAccess('/dashboard/feeds');

  if (access.role !== 'agency_admin' && access.role !== 'super_admin') {
    return (
      <main>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4A3AFF]/10 text-[#4A3AFF]">
              <Rss size={24} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Feed sources</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A2E]">Agency admins only</h1>
              <p className="mt-2 text-sm text-[#6B7280]">
                Feed source management is handled by your agency admin. Ask them to set up your listing feed connection.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const result = await loadFeedSources(access);
  const feeds = result.source === 'error' ? [] : result.items;

  const activeCount = feeds.filter((f) => f.isActive).length;
  const errorCount = feeds.filter((f) => f.lastStatus === 'error').length;

  return (
    <main>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4A3AFF]/10 text-[#4A3AFF]">
            <Rss size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Feed sources</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A2E]">Listing feeds</h1>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">
              Connect your listing feed to sync your stock into Proppd automatically.
            </p>
          </div>
        </div>

        {feeds.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatCard label="Total feeds" value={feeds.length} />
            <StatCard label="Active" value={activeCount} color="#065F46" />
            <StatCard label="Errors" value={errorCount} color={errorCount > 0 ? '#991B1B' : undefined} />
          </div>
        )}
      </div>

      <div className="mt-6">
        <FeedSourcesList initialFeeds={feeds} />
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold" style={{ color: color ?? '#1A1A2E' }}>{value}</p>
      <p className="mt-0.5 text-xs font-bold text-[#9CA3AF]">{label}</p>
    </div>
  );
}
