import { ArrowRight, BadgeCheck, Home, Mail, Search, ShieldCheck } from 'lucide-react';

const routes = [
  {
    title: 'Buying or renting',
    text: 'Start with the search bar, then narrow by suburb, purpose, beds, and price before opening an enquiry.',
    href: '/properties',
    cta: 'Search homes',
    icon: Search,
  },
  {
    title: 'Listing property',
    text: 'Agencies and owners can move into a verified listing route instead of a generic contact form.',
    href: '/list-with-us',
    cta: 'List with us',
    icon: BadgeCheck,
  },
  {
    title: 'Need support',
    text: 'Route valuation, finance, partnership, and support questions to the right Proppd inbox.',
    href: '/contact',
    cta: 'Contact Proppd',
    icon: Mail,
  },
];

export function SupportStrip() {
  return (
    <section className="bg-[linear-gradient(180deg,#fff_0%,#f7f9fd_100%)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="proppd-glass overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-7">
          <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3B49FF]/12 bg-white/70 px-4 py-2 text-sm font-black text-[#3344f5] shadow-sm">
                <ShieldCheck size={16} className="text-[#12D6C5]" /> Portal routes
              </div>
              <h2 className="mt-5 max-w-xl text-3xl font-black tracking-[-.055em] text-[#050A30] sm:text-4xl">
                Search, shortlist, and enquire without losing your place.
              </h2>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                Move from a suburb search into verified listings, agent profiles, valuations, or support without landing on a dead-end page.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:max-w-xl">
                {['Search', 'Shortlist', 'Enquire'].map((step, index) => (
                  <div key={step} className="rounded-2xl border border-slate-200/80 bg-white/68 px-4 py-3">
                    <p className="text-xs font-black text-[#3344f5]">0{index + 1}</p>
                    <p className="mt-1 text-sm font-black text-[#050A30]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {routes.map(({ title, text, href, cta, icon: Icon }) => (
                <a
                  key={title}
                  href={href}
                  className="group proppd-card flex min-h-56 flex-col rounded-[1.5rem] p-5 transition hover:-translate-y-0.5 hover:border-[#3B49FF]/30 hover:shadow-[var(--proppd-lift-shadow)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eefcf9] text-[#0f766e]">
                      <Icon size={20} />
                    </div>
                    <span className="rounded-full bg-[#F5F7FA] px-3 py-1 text-xs font-black text-slate-500 transition group-hover:text-[#3344f5]">
                      Open
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-[-.035em] text-[#050A30]">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
                  <span className="proppd-link-arrow mt-auto inline-flex items-center gap-2 pt-5 text-sm">
                    {cta} <ArrowRight size={15} />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/62 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#050A30] text-white">
                <Home size={18} />
              </div>
              <p className="text-sm font-bold leading-6 text-slate-600">
                Start with search, then shortlist homes, compare professionals, or open a direct enquiry route.
              </p>
            </div>
            <a className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#3344f5] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#3344f5]/20 transition hover:bg-[#050A30]" href="/properties">
              Browse marketplace
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
