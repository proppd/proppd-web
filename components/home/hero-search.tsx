import { ArrowRight, Home, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const quickLinks = ['Sandton', 'Sea Point', 'Umhlanga', 'Pretoria', 'Cape Town'];

export function HeroSearch() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[linear-gradient(180deg,rgba(5,10,48,.52),rgba(5,10,48,.18)_45%,rgba(255,255,255,0)_100%),radial-gradient(circle_at_24%_20%,rgba(18,214,197,.68),transparent_18rem),radial-gradient(circle_at_72%_12%,rgba(59,73,255,.58),transparent_22rem),linear-gradient(135deg,#eef6ff_0%,#f8fbff_42%,#dff8f4_100%)]" />
      <div className="absolute left-1/2 top-28 -z-10 hidden h-72 w-[62rem] -translate-x-1/2 rounded-[4rem] border border-white/60 bg-white/20 shadow-2xl shadow-[#050A30]/20 backdrop-blur-sm lg:block" />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-14">
        <div className="mx-auto max-w-4xl text-center text-white">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/20 px-4 py-2 text-sm font-black shadow-lg backdrop-blur">
            <ShieldCheck size={16} className="text-[#12D6C5]" /> Verified South African property portal
          </div>
          <h1 className="mt-7 text-[2.75rem] font-black leading-[.96] tracking-[-.07em] drop-shadow-sm sm:text-6xl lg:text-7xl">
            Find your way home.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-white/90 sm:text-lg">
            Search homes, rentals, agents, and verified listings with a cleaner Proppd experience inspired by the portals buyers already understand.
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-5xl rounded-[1.75rem] border border-white/60 bg-white p-3 shadow-2xl shadow-[#050A30]/20">
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 px-2 pb-3 text-sm font-black text-slate-600">
            {['Buy', 'Rent', 'Sell', 'Agents', 'Valuations'].map((tab, index) => (
              <a
                key={tab}
                href={index === 1 ? '/properties/to-rent' : index === 3 ? '/agents' : index === 4 ? '/request-valuation' : '/properties'}
                className={`rounded-full px-5 py-2.5 transition ${index === 0 ? 'bg-[#050A30] text-white shadow-lg shadow-[#050A30]/15' : 'hover:bg-[#F5F7FA] hover:text-[#050A30]'}`}
              >
                {tab}
              </a>
            ))}
          </div>
          <div className="grid gap-3 pt-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-5 text-left text-base font-bold text-slate-500 shadow-inner shadow-slate-100">
              <Search size={23} className="shrink-0 text-[#3B49FF]" />
              <span className="truncate">Enter a suburb, city, province, agent, or listing ID</span>
            </label>
            <a className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 font-black text-[#050A30] hover:bg-[#F5F7FA]" href="/properties">
              <SlidersHorizontal size={19} /> Filters
            </a>
            <a className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-[#3B49FF] px-7 font-black text-white shadow-xl shadow-[#3B49FF]/25 transition hover:bg-[#050A30]" href="/properties">
              Search <ArrowRight size={19} />
            </a>
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-2 text-sm font-bold text-[#050A30] lg:justify-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"><MapPin size={15} className="text-[#3B49FF]" /> Popular searches</span>
          {quickLinks.map((link) => (
            <a key={link} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[#050A30] shadow-sm transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href={`/properties?location=${encodeURIComponent(link)}`}>
              {link}
            </a>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Buy a home', 'Browse verified for-sale properties with clear facts and direct enquiry routing.', '/properties/for-sale'],
            ['Rent a home', 'Find rentals with cleaner lead handoff and mobile-first viewing requests.', '/properties/to-rent'],
            ['List with Proppd', 'Bring agency stock into a portal experience built for trust and fair lead quality.', '/list-with-us'],
          ].map(([title, body, href], index) => (
            <a key={title} href={href} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${index === 2 ? 'bg-[#12D6C5]/15 text-[#057a70]' : 'bg-[#3B49FF]/10 text-[#3B49FF]'}`}>
                <Home size={22} />
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-[-.04em] text-[#050A30]">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{body}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#3B49FF] group-hover:text-[#050A30]">Explore <ArrowRight size={16} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
