'use client';

import { useState } from 'react';
import { Handshake } from 'lucide-react';
import { DealPipelineCard } from './deal-pipeline-card';
import { NewDealButton } from './new-deal-form';
import type { DealRecord } from '@/lib/proppd/deals';

type Listing = { id: string; title: string; streetAddress: string };

type Props = {
  initialDeals: DealRecord[];
  listings: Listing[];
};

export function DealPipelineList({ initialDeals, listings }: Props) {
  const [deals, setDeals] = useState<DealRecord[]>(initialDeals);

  function handleUpdate(updated: DealRecord) {
    setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  function handleDelete(id: string) {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }

  function handleCreated(deal: DealRecord) {
    setDeals((prev) => [deal, ...prev]);
  }

  const active = deals.filter((d) => d.stage !== 'fallen_through');
  const fallen = deals.filter((d) => d.stage === 'fallen_through');

  return (
    <div>
      <div className="flex items-center justify-end">
        <NewDealButton listings={listings} onCreated={handleCreated} />
      </div>

      {deals.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
          <Handshake size={36} className="mx-auto text-[#D1D5DB]" />
          <p className="mt-4 text-base font-bold text-[#9CA3AF]">No deals yet</p>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Create your first deal to track the sale pipeline from OTP signing to transfer registration.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4">
            {active.map((deal) => (
              <DealPipelineCard
                key={deal.id}
                deal={deal}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {fallen.length > 0 && (
            <section className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-red-500">
                Fallen through ({fallen.length})
              </p>
              <div className="grid gap-4">
                {fallen.map((deal) => (
                  <DealPipelineCard
                    key={deal.id}
                    deal={deal}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
