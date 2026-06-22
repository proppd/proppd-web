import { MapPin, ArrowRight } from 'lucide-react';

const areas = [
  { name: 'Sandton', count: 12, label: 'Johannesburg' },
  { name: 'Sea Point', count: 8, label: 'Cape Town' },
  { name: 'Umhlanga', count: 6, label: 'Durban' },
  { name: 'Rosebank', count: 9, label: 'Johannesburg' },
  { name: 'Waterfront', count: 5, label: 'Cape Town' },
  { name: 'Fourways', count: 7, label: 'Johannesburg' },
];

export function PopularAreas() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Explore</p>
            <h2 className="mt-2 text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
              Popular areas
            </h2>
            <p className="mt-2 text-[#6B7280]">
              Browse by neighbourhood to find the right pocket for your next move.
            </p>
          </div>
          <a
            href="/properties"
            className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
          >
            View all <ArrowRight size={15} />
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <a
              key={area.name}
              href={`/properties?location=${encodeURIComponent(area.name)}`}
              className="group flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 transition hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E]">{area.name}</h3>
                  <p className="text-xs text-[#9CA3AF]">{area.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#F7F8FA] px-2.5 py-1 text-xs font-bold text-[#6B7280]">
                  {area.count} listings
                </span>
                <ArrowRight size={14} className="text-[#9CA3AF] transition group-hover:translate-x-0.5 group-hover:text-[#4A3AFF]" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
