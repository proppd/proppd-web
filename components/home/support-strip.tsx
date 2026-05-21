import { ArrowRight, BadgeCheck, Mail, Search, ShieldCheck } from 'lucide-react';

const supportCards = [
  {
    title: 'Search and shortlist',
    text: 'Use the properties routes and quick filters to narrow the right suburbs before you enquire.',
    href: '/properties',
    cta: 'Browse properties',
    icon: Search,
  },
  {
    title: 'List with Proppd',
    text: 'Agency and launch partners can move into a cleaner onboarding flow for verified exposure.',
    href: '/list-with-us',
    cta: 'Start listing',
    icon: BadgeCheck,
  },
  {
    title: 'Get routed fast',
    text: 'If you need support, route it straight to the right inbox instead of guessing the page owner.',
    href: '/contact',
    cta: 'Contact Proppd',
    icon: Mail,
  },
];

export function SupportStrip() {
  return (
    <section className="bg-[#F5F7FA] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_.95fr]">
        <div className="rounded-[2.5rem] bg-[#050A30] p-8 text-white shadow-2xl shadow-[#050A30]/20 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#12D6C5]">
            <ShieldCheck size={15} /> Next step
          </div>
          <h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-.06em] sm:text-5xl">Pick the right route before you spend time scrolling.</h2>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/72">
            Proppd works best when buyers, tenants, agencies, and support requests land on the right flow from the start.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-full bg-white px-6 py-3 text-sm font-black text-[#050A30] transition hover:bg-[#F5F7FA]" href="/properties">
              Browse properties
            </a>
            <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10" href="/contact">
              Contact Proppd
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['01', 'Search the market', 'Start with suburb, city, or agent.'],
              ['02', 'Shortlist the fit', 'Compare listings by price, area, and stock quality.'],
              ['03', 'Open the route', 'Jump into enquiry, listing, or support without dead ends.'],
            ].map(([step, title, text]) => (
              <div key={title} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#12D6C5]/15 text-xs font-black text-[#12D6C5]">{step}</div>
                <h3 className="mt-3 text-sm font-black tracking-[-.02em] text-white">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {supportCards.map(({ title, text, href, cta, icon: Icon }) => (
            <a key={title} href={href} className="group flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3B49FF] hover:shadow-xl hover:shadow-slate-200/70">
              <div className="inline-flex rounded-2xl bg-[#eefcf9] p-3 text-[#0f766e]">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-xl font-black tracking-[-.04em] text-[#050A30]">{title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
              <span className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-black text-[#3B49FF] group-hover:text-[#050A30]">
                {cta} <ArrowRight size={15} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
