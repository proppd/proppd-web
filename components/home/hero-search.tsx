import { ArrowRight, Home, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const quickLinks = ['Sandton', 'Sea Point', 'Umhlanga'];

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

        <div className="mx-auto mt-6 max-w-5xl rounded-[1.35rem] border border-white/60 bg-white/95 p-2 shadow-2xl shadow-[#050A30]/14 sm:p-2.5">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-1 pb-1.5 text-xs font-black text-slate-600 sm:flex-wrap sm:justify-center sm:gap-2 sm:text-sm">
            {['Buy', 'Rent', 'Sell', 'Agents', 'Valuations'].map((tab, index) => (
              <a
                key={tab}
                href={index === 1 ? '/properties/to-rent' : index === 2 ? '/list-with-us' : index === 3 ? '/agents' : index === 4 ? '/request-valuation' : '/properties/for-sale'}
                className={`shrink-0 rounded-full px-3 py-1.5 transition sm:px-4 sm:py-2 ${index === 0 ? 'border border-[#3B49FF] bg-white text-[#3B49FF] shadow-sm' : 'hover:bg-[#F5F7FA] hover:text-[#050A30]'}`}
              >
                {tab}
              </a>
            ))}
          </div>
          <form action="/properties" className="grid gap-2 pt-2.5 sm:gap-2.5 lg:grid-cols-[1fr_auto_auto]">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 text-left text-sm font-bold text-slate-500 shadow-inner shadow-slate-100 focus-within:border-[#3B49FF] focus-within:ring-4 focus-within:ring-[#3B49FF]/10 sm:min-h-13 sm:px-5 sm:text-base">
              <Search size={19} className="shrink-0 text-[#3B49FF]" />
              <input
                name="q"
                type="search"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#050A30] outline-none placeholder:text-slate-500 sm:text-base"
                placeholder="Search suburb, city, agent, or listing ID"
                aria-label="Search properties"
              />
            </label>
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-black text-slate-700 hover:bg-[#F5F7FA] hover:text-[#050A30] sm:min-h-13 sm:px-5" href="/properties">
              <SlidersHorizontal size={17} /> Filters
            </a>
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#3B49FF] px-5 font-black text-white shadow-xl shadow-[#3B49FF]/20 transition hover:bg-[#050A30] sm:min-h-13 sm:px-6" type="submit">
              Search <ArrowRight size={17} />
            </button>
          </form>
        </div>

        <div className="mx-auto mt-3 flex max-w-5xl flex-wrap items-center justify-center gap-1.5 text-xs font-bold text-[#050A30] lg:justify-start sm:gap-2 sm:text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-2.5 py-1.5 text-slate-500 ring-1 ring-slate-200/80 sm:gap-2 sm:px-3.5"><MapPin size={14} className="text-[#3B49FF]" /> Popular</span>
          {quickLinks.map((link, index) => (
            <a key={link} className={`${index > 2 ? 'hidden sm:inline-flex' : 'inline-flex'} rounded-full bg-white/80 px-2.5 py-1.5 text-[#050A30] ring-1 ring-slate-200/80 transition hover:text-[#3B49FF] hover:ring-[#3B49FF]/40 sm:px-3.5`} href={`/properties?location=${encodeURIComponent(link)}`}>
              {link}
            </a>
          ))}
          <a className="inline-flex rounded-full bg-white/80 px-2.5 py-1.5 text-[#050A30] ring-1 ring-slate-200/80 transition hover:text-[#3B49FF] hover:ring-[#3B49FF]/40 sm:px-3.5" href="/properties">
            More areas
          </a>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-3">
          {[
            ['Buy verified homes', 'Clear facts and direct enquiry routing.', '/properties/for-sale'],
            ['Find rentals', 'Mobile-first requests with cleaner handoff.', '/properties/to-rent'],
            ['List agency stock', 'Verified inventory and better lead quality.', '/list-with-us'],
          ].map(([title, body, href], index) => (
            <a
              key={title}
              href={href}
              className="group flex items-center gap-3 rounded-[1rem] border border-slate-200/80 bg-[#F8FAFC] px-3 py-2.5 text-left shadow-none transition hover:border-[#3B49FF]/25 hover:bg-white hover:shadow-sm sm:px-3.5 sm:py-3"
            >
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${index === 2 ? 'bg-[#12D6C5]/12 text-[#057a70]' : 'bg-[#3B49FF]/10 text-[#3B49FF]'}`}>
                <Home size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black tracking-[-.03em] text-[#050A30] sm:text-[15px]">{title}</h2>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-600 sm:text-xs">{body}</p>
              </div>
              <ArrowRight size={14} className="ml-auto hidden shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#3B49FF] sm:block" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
