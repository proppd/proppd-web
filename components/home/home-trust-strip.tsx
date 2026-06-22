import { BadgeCheck, Building2, MapPinned } from 'lucide-react';
import { agencies, listings } from '@/lib/demo-data';

const metroCount = new Set(listings.map((listing) => listing.city)).size;
const featuredCount = listings.filter((listing) => listing.featured).length;

export function HomeTrustStrip() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
            South Africa&apos;s verified property portal
          </h2>
          <p className="mt-3 text-[#6B7280]">
            Clean search, verified listings, and direct routes to agents and agencies.
          </p>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-6">
          <StatCard
            icon={<BadgeCheck size={20} />}
            value={`${featuredCount}`}
            label="Featured listings"
          />
          <StatCard
            icon={<MapPinned size={20} />}
            value={`${metroCount}`}
            label="Metro areas"
          />
          <StatCard
            icon={<Building2 size={20} />}
            value={`${agencies.length}`}
            label="Partner agencies"
          />
        </div>

        {/* CTA strip */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-4 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-6 py-5">
          <p className="text-sm font-semibold text-[#6B7280]">
            Search starts clean, listings stay verified, every enquiry has a clear route.
          </p>
          <a
            href="/properties"
            className="shrink-0 rounded-lg bg-[#4A3AFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3A2AE0]"
          >
            Browse properties
          </a>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
        {icon}
      </div>
      <p className="mt-4 text-3xl font-bold text-[#1A1A2E]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#6B7280]">{label}</p>
    </div>
  );
}
