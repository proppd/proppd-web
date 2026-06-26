import type { Metadata } from 'next';
import { Handshake } from 'lucide-react';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';
import { loadMyPortalListings } from '@/lib/proppd/backend';
import { loadDeals } from '@/lib/proppd/deals';
import { DealPipelineList } from '@/components/dashboard/deal-pipeline-list';

export const metadata: Metadata = {
  title: { absolute: 'Sale Pipeline | Proppd' },
  description: 'Track your deals from OTP signing through to transfer registration.',
  alternates: { canonical: '/dashboard/deals' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const access = await requireAgentWorkspaceAccess('/dashboard/deals');

  const [deals, { items: listingItems }] = await Promise.all([
    loadDeals(access),
    loadMyPortalListings(access),
  ]);

  const listings = listingItems.map((l) => ({
    id: l.id,
    title: l.title,
    streetAddress: l.location,
  }));

  const active = deals.filter((d) => d.stage !== 'fallen_through' && d.stage !== 'registered');
  const registered = deals.filter((d) => d.stage === 'registered');
  const fallen = deals.filter((d) => d.stage === 'fallen_through');

  const totalCommissionCents = [...active, ...registered]
    .filter((d) => d.purchasePriceCents != null && d.commissionPct != null)
    .reduce((sum, d) => sum + Math.round((d.purchasePriceCents! * d.commissionPct!) / 100), 0);

  return (
    <main>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4A3AFF]/10 text-[#4A3AFF]">
            <Handshake size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Sale pipeline</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A2E]">Deal tracker</h1>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">
              Track your deals from OTP signing through to transfer registration.
            </p>
          </div>
        </div>

        {deals.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="In progress" value={active.length} />
            <StatCard label="Registered" value={registered.length} color="#065F46" />
            <StatCard label="Fallen through" value={fallen.length} color="#991B1B" />
            <StatCard
              label="Est. commission"
              value={totalCommissionCents > 0 ? formatZarShort(totalCommissionCents) : '—'}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <DealPipelineList initialDeals={deals} listings={listings} />
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold" style={{ color: color ?? '#1A1A2E' }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs font-bold text-[#9CA3AF]">{label}</p>
    </div>
  );
}

function formatZarShort(cents: number): string {
  const rand = cents / 100;
  if (rand >= 1_000_000) return `R${(rand / 1_000_000).toFixed(1)}m`;
  if (rand >= 1_000) return `R${(rand / 1_000).toFixed(0)}k`;
  return `R${rand.toFixed(0)}`;
}
