import { Building2, Sparkles, TrendingUp } from 'lucide-react';
import { listings } from '@/lib/demo-data';

const featuredListings = listings.filter((listing) => listing.featured);
const saleListings = listings.filter((listing) => listing.purpose === 'For sale');

const topCities = buildTopCities(featuredListings);
const averageSalePrice = average(saleListings.map((l) => l.priceValue));

export function MarketPulse() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Sparkles size={18} />}
            value={`${featuredListings.length}`}
            label="Featured homes live"
          />
          <StatCard
            icon={<Building2 size={18} />}
            value={topCities.slice(0, 2).join(' · ')}
            label="Top areas"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            value={formatCurrency(averageSalePrice)}
            label="Avg. asking price"
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-[#1A1A2E]">{value}</p>
        <p className="text-sm text-[#6B7280]">{label}</p>
      </div>
    </div>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
    notation: value >= 1_000_000 ? 'compact' : 'standard',
  }).format(value);
}

function buildTopCities(items: typeof featuredListings) {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.city, (map.get(item.city) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([city]) => city);
}
