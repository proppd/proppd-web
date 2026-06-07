import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { SearchAutocomplete } from '@/components/search/search-autocomplete';

const tabs = [
  { label: 'Buy', href: '/properties/for-sale' },
  { label: 'Rent', href: '/properties/to-rent' },
  { label: 'Sell', href: '/list-with-us' },
  { label: 'Agents', href: '/agents' },
];

const popularAreas = ['Sandton', 'Sea Point', 'Umhlanga', 'Rosebank', 'Waterfront'];

export function HeroSearch() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 sm:pt-14 sm:pb-8 lg:px-8 lg:pt-20 lg:pb-12">
        {/* Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-5xl lg:text-[3.5rem]">
            Find your next home
          </h1>
          <p className="mt-3 text-base text-[#6B7280] sm:text-lg">
            Search verified properties across South Africa
          </p>
        </div>

        {/* Search card */}
        <div className="mx-auto mt-6 max-w-4xl sm:mt-8">
          {/* Tabs — scrollable on mobile */}
          <div className="flex overflow-x-auto border-b border-[#E5E7EB] px-1 scrollbar-none">
            {tabs.map((tab, i) => (
              <a
                key={tab.label}
                href={tab.href}
                className={`shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-semibold transition sm:px-5 sm:py-3 ${
                  i === 0
                    ? 'border-b-2 border-[#4A3AFF] text-[#4A3AFF]'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>

          {/* Search input — stacks on mobile */}
          <div className="rounded-b-xl border border-t-0 border-[#E5E7EB] bg-white p-3 shadow-sm sm:p-5">
            <form action="/properties" className="grid gap-2.5 sm:flex sm:items-center sm:gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 sm:px-4 sm:py-3">
                <SearchAutocomplete
                  name="q"
                  placeholder="Enter a suburb, city, or address"
                />
              </div>
              <div className="flex gap-2.5">
                <a
                  href="/properties"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:py-3"
                >
                  <SlidersHorizontal size={16} /> Filters
                </a>
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3A2AE0] sm:flex-none sm:px-6 sm:py-3"
                >
                  Search <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* Popular areas — scrollable on mobile */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto sm:mt-4 sm:flex-wrap">
              <span className="shrink-0 text-xs font-semibold text-[#9CA3AF]">Popular:</span>
              {popularAreas.map((area) => (
                <a
                  key={area}
                  href={`/properties?location=${encodeURIComponent(area)}`}
                  className="shrink-0 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
                >
                  {area}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-3 text-sm sm:mt-6 sm:justify-start sm:gap-4">
          <a href="/properties/for-sale" className="font-semibold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
            Buy a home →
          </a>
          <a href="/properties/to-rent" className="font-semibold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
            Find rentals →
          </a>
          <a href="/list-with-us" className="font-semibold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
            List your property →
          </a>
        </div>
      </div>
    </section>
  );
}
