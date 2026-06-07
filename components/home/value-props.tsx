import { BadgeCheck, ShieldCheck, TrendingUp, Users } from 'lucide-react';

const values = [
  {
    title: 'Verified listings',
    text: 'Every listing is checked for agency legitimacy, mandate clarity, and enquiry routing.',
    icon: ShieldCheck,
  },
  {
    title: 'Clean search',
    text: 'Search-first browsing with suburb, price, beds, and property type filters that work.',
    icon: BadgeCheck,
  },
  {
    title: 'Direct agent routes',
    text: 'Connect with named professionals and agencies instead of generic contact forms.',
    icon: Users,
  },
  {
    title: 'Market data',
    text: 'Price trends and property insights to help you make informed decisions.',
    icon: TrendingUp,
  },
];

export function ValueProps() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
            Why Proppd
          </h2>
          <p className="mt-3 text-[#6B7280]">
            Property technology built for South African markets.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ title, text, icon: Icon }) => (
            <div key={title} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6FBF7] text-[#00C9A7]">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1A1A2E]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
