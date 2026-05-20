import type { ReactNode } from 'react';
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { listings } from '@/lib/demo-data';
import { ListingCard } from '@/components/properties/listing-card';

const featuredListings = listings.filter((listing) => listing.featured);
const topMarkets = buildTopMarkets(featuredListings);

export function FeaturedListings() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Homes for you</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.06em] text-[#050A30] sm:text-5xl">Fresh on Proppd</h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              A familiar card-led browsing flow: price first, facts next, then verified agent routing when you are ready to enquire.
            </p>
          </div>
          <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/properties">
            Browse all properties →
          </a>
        </div>
        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {featuredListings.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <PulseCard icon={<Sparkles size={18} />} label="Live now" value={`${featuredListings.length} featured homes`} detail="Fresh listings ready to browse" tone="indigo" />
          <PulseCard icon={<MapPin size={18} />} label="Top pockets" value={topMarkets.join(' · ')} detail="Where Proppd traffic is clustering" tone="slate" />
          <PulseCard icon={<ShieldCheck size={18} />} label="Lead quality" value="Verified enquiry routing" detail="Built for faster handoff" tone="emerald" />
          <a href="/properties" className="group inline-flex items-center justify-center rounded-[1.75rem] border border-slate-200 bg-[#F5F7FA] p-5 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:bg-white hover:text-[#3B49FF]">
            <span className="flex items-center gap-2">Open marketplace <ArrowRight size={16} className="transition group-hover:translate-x-0.5" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}

function buildTopMarkets(items: typeof featuredListings): string[] {
  const uniqueMarkets = new Map<string, number>();

  for (const listing of items) {
    const market = listing.location.split(',')[0]?.trim() || listing.location;
    uniqueMarkets.set(market, (uniqueMarkets.get(market) ?? 0) + 1);
  }

  return Array.from(uniqueMarkets.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([market]) => market);
}

function PulseCard({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone: 'indigo' | 'slate' | 'emerald' }) {
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
