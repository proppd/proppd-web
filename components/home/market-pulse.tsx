import type { ReactNode } from 'react';
import { ArrowRight, TrendingUp, Building2, Sparkles } from 'lucide-react';
import { listings } from '@/lib/demo-data';

const featuredListings = listings.filter((listing) => listing.featured);
const saleListings = listings.filter((listing) => listing.purpose === 'For sale');
const rentListings = listings.filter((listing) => listing.purpose === 'To rent');

export function MarketPulse() {
  const topCities = buildTopCities(featuredListings);
  const averageSalePrice = average(saleListings.map((listing) => listing.priceValue));
  const averageRentPrice = average(rentListings.map((listing) => listing.priceValue));

  return (
    <section className="bg-white px-4 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.15fr]">
          <StatCard
            icon={<Sparkles size={18} />}
            label="Live now"
            value={`${featuredListings.length} featured homes`}
            detail="Fresh, verified inventory ready to browse"
            tone="indigo"
          />
          <StatCard
            icon={<Building2 size={18} />}
            label="Top pockets"
            value={topCities.join(' · ')}
            detail="Where the strongest browsing demand is clustering"
            tone="slate"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Average asking"
            value={formatCurrency(averageSalePrice)}
            detail="For-sale homes across the current demo stock"
            tone="emerald"
          />
          <div className="rounded-[1.75rem] border border-[#050A30] bg-[#050A30] p-6 text-white shadow-2xl shadow-[#050A30]/20">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-[#12D6C5]">
              Start here
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-[-.04em]">Pick the fastest route to the right outcome.</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
              Compare buy, rent, or list options before you spend time on the wrong route.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a
                href="/properties"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#050A30] transition hover:bg-[#F5F7FA]"
              >
                Search properties <ArrowRight size={16} />
              </a>
              <a
                href="/request-valuation"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Request valuation
              </a>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[.16em] text-white/55">Need support or a different route? Use the contact page.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone: 'indigo' | 'slate' | 'emerald' }) {
  const toneClasses = {
    indigo: 'bg-[#3B49FF]/10 text-[#3B49FF]',
    slate: 'bg-slate-100 text-[#050A30]',
    emerald: 'bg-[#eefcf9] text-[#0f766e]',
  }[tone];

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl p-3 ${toneClasses}`}>{icon}</div>
      <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black tracking-[-.03em] text-[#050A30]">{value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
    notation: value >= 1_000_000 ? 'compact' : 'standard',
  }).format(value);
}

function buildTopCities(items: typeof featuredListings): string[] {
  const uniqueCities = new Map<string, number>();

  for (const listing of items) {
    uniqueCities.set(listing.city, (uniqueCities.get(listing.city) ?? 0) + 1);
  }

  return Array.from(uniqueCities.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([city]) => city);
}
