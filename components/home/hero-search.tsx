import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';

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
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10 lg:px-8 lg:pt-20 lg:pb-12">
        {/* Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A2E] sm:text-5xl lg:text-[3.5rem]">
            Find your next home
          </h1>
          <p className="mt-4 text-lg text-[#6B7280]">
            Search verified properties across South Africa
          </p>
        </div>

        {/* Search card */}
        <div className="mx-auto mt-8 max-w-4xl">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E5E7EB] px-1">
            {tabs.map((tab, i) => (
              <a
                key={tab.label}
                href={tab.href}
                className={`rounded-t-lg px-5 py-3 text-sm font-semibold transition ${
                  i === 0
                    ? 'border-b-2 border-[#4A3AFF] text-[#4A3AFF]'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>

          {/* Search input */}
          <div className="rounded-b-xl border border-t-0 border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
            <form action="/properties" className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3">
                <Search size={18} className="shrink-0 text-[#6B7280]" />
                <input
                  name="q"
                  type="search"
                  className="w-full bg-transparent text-sm text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF] sm:text-base"
                  placeholder="Enter a suburb, city, or address"
                  aria-label="Search properties"
                />
              </div>
              <a
                href="/properties"
                className="hidden items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:inline-flex"
              >
                <SlidersHorizontal size={16} /> Filters
              </a>
              <button
                type="submit"
                className="flex shrink-0 items-center gap-2 rounded-lg bg-[#4A3AFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3A2AE0]"
              >
                Search <ArrowRight size={16} />
              </button>
            </form>

            {/* Popular areas */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#9CA3AF]">Popular:</span>
              {popularAreas.map((area) => (
                <a
                  key={area}
                  href={`/properties?location=${encodeURIComponent(area)}`}
                  className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
                >
                  {area}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-4 text-sm sm:justify-start">
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
