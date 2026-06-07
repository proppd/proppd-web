import { ArrowRight, BadgeCheck, Home, Mail, Search } from 'lucide-react';

const routes = [
  {
    title: 'Buying or renting',
    text: 'Start with search, then narrow by suburb, purpose, beds, and price.',
    href: '/properties',
    cta: 'Search homes',
    icon: Search,
  },
  {
    title: 'Listing property',
    text: 'Move into a verified listing route instead of a generic contact form.',
    href: '/list-with-us',
    cta: 'List with us',
    icon: BadgeCheck,
  },
  {
    title: 'Need support',
    text: 'Send valuation, finance, partnership, and support questions to the right inbox.',
    href: '/contact',
    cta: 'Contact us',
    icon: Mail,
  },
];

export function SupportStrip() {
  return (
    <section className="bg-[#F7F8FA]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
            How Proppd works
          </h2>
          <p className="mt-3 text-[#6B7280]">
            Search, shortlist, and enquire without losing your place.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
          {routes.map(({ title, text, href, cta, icon: Icon }) => (
            <a
              key={title}
              href={href}
              className="group rounded-xl border border-[#E5E7EB] bg-white p-6 transition hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6FBF7] text-[#00C9A7]">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#1A1A2E]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A3AFF] transition group-hover:gap-2.5">
                {cta} <ArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A2E] text-white">
              <Home size={18} />
            </div>
            <p className="text-sm font-semibold text-[#6B7280]">
              Start with search, then shortlist homes or open a direct enquiry route.
            </p>
          </div>
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
