import { ArrowRight, Home, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const quickLinks = ['Sandton', 'Sea Point', 'Umhlanga', 'Pretoria', 'Cape Town'];

export function HeroSearch() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[27rem] bg-[linear-gradient(180deg,rgba(5,10,48,.66),rgba(5,10,48,.32)_48%,rgba(255,255,255,0)_100%),radial-gradient(circle_at_24%_20%,rgba(18,214,197,.62),transparent_18rem),radial-gradient(circle_at_72%_12%,rgba(59,73,255,.62),transparent_22rem),linear-gradient(135deg,#eef6ff_0%,#f8fbff_42%,#dff8f4_100%)]" />
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-7 sm:px-6 lg:px-8 lg:pb-10 lg:pt-10">
        <div className="mx-auto max-w-4xl text-center text-white">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/18 px-4 py-2 text-xs font-black uppercase tracking-[.16em] shadow-lg backdrop-blur sm:text-sm sm:normal-case sm:tracking-normal">
            <ShieldCheck size={16} className="text-[#12D6C5]" /> Verified South African property portal
          </div>
          <h1 className="mt-6 text-[2.55rem] font-black leading-[.96] tracking-[-.07em] drop-shadow-sm sm:text-6xl lg:text-7xl">
            Find your way home.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-white sm:text-lg">
            Search verified homes, rentals, agents, and listings across South Africa.
          </p>
        </div>

        <div className="mx-auto mt-7 max-w-5xl rounded-[1.5rem] border border-white/70 bg-white p-2.5 shadow-2xl shadow-[#050A30]/18 sm:p-3">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-1 pb-2 text-sm font-black text-slate-600 sm:flex-wrap sm:justify-center sm:gap-2">
            {['Buy', 'Rent', 'Sell', 'Agents', 'Valuations'].map((tab, index) => (
              <a
                key={tab}
                href={index === 1 ? '/properties/to-rent' : index === 2 ? '/list-with-us' : index === 3 ? '/agents' : index === 4 ? '/request-valuation' : '/properties/for-sale'}
                className={`shrink-0 rounded-full px-4 py-2 transition sm:px-5 ${index === 0 ? 'border border-[#3B49FF] bg-white text-[#3B49FF] shadow-sm' : 'hover:bg-[#F5F7FA] hover:text-[#050A30]'}`}
              >
                {tab}
              </a>
            ))}
          </div>
          <form action="/properties" className="grid gap-2 pt-3 sm:gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 text-left text-base font-bold text-slate-500 shadow-inner shadow-slate-100 focus-within:border-[#3B49FF] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#3B49FF]/10 sm:min-h-15 sm:px-5">
              <Search size={22} className="shrink-0 text-[#3B49FF]" />
              <input
                name="q"
                type="search"
                className="min-w-0 flex-1 bg-transparent text-base font-bold text-[#050A30] outline-none placeholder:text-slate-500"
                placeholder="Search suburb, city, agent, or listing ID"
                aria-label="Search properties"
              />
            </label>
            <a className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 font-black text-[#050A30] hover:bg-[#F5F7FA] sm:min-h-15" href="/properties">
              <SlidersHorizontal size={19} /> Filters
            </a>
            <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#3B49FF] px-7 font-black text-white shadow-xl shadow-[#3B49FF]/25 transition hover:bg-[#050A30] sm:min-h-15" type="submit">
              Search <ArrowRight size={19} />
            </button>
          </form>
        </div>

        <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-2 text-sm font-bold text-[#050A30] lg:justify-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-slate-600 ring-1 ring-slate-200/80"><MapPin size={15} className="text-[#3B49FF]" /> Popular</span>
          {quickLinks.map((link, index) => (
            <a key={link} className={`${index > 2 ? 'hidden sm:inline-flex' : 'inline-flex'} rounded-full bg-white/85 px-3.5 py-2 text-[#050A30] ring-1 ring-slate-200/80 transition hover:text-[#3B49FF] hover:ring-[#3B49FF]/40`} href={`/properties?location=${encodeURIComponent(link)}`}>
              {link}
            </a>
          ))}
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {[
            ['Buy verified homes', 'For-sale properties with clear facts and direct enquiry routing.', '/properties/for-sale'],
            ['Find rentals', 'Rental stock with cleaner handoff and mobile-first viewing requests.', '/properties/to-rent'],
            ['List agency stock', 'Bring verified inventory into a portal built for lead quality.', '/list-with-us'],
          ].map(([title, body, href], index) => (
            <a key={title} href={href} className="group flex items-center gap-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 sm:p-5">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${index === 2 ? 'bg-[#12D6C5]/15 text-[#057a70]' : 'bg-[#3B49FF]/10 text-[#3B49FF]'}`}>
                <Home size={21} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black tracking-[-.035em] text-[#050A30] sm:text-xl">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
              <ArrowRight size={17} className="ml-auto hidden shrink-0 text-[#3B49FF] transition group-hover:translate-x-1 group-hover:text-[#050A30] sm:block" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
