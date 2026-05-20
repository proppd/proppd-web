import { ArrowRight, Search, ShieldCheck } from 'lucide-react';

const quickLinks = ['Sandton', 'Cape Town', 'Umhlanga', 'Sea Point'];

export function HeroSearch() {
  return (
    <section className="border-b border-slate-200 bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[.2em] text-slate-500">
            <ShieldCheck size={14} className="text-[#3B49FF]" /> South African property portal
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-[-.06em] text-[#050A30] sm:text-5xl lg:text-6xl">
            Simple property search.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Browse homes, rentals, agents, and agencies with a clean portal-style front page.
          </p>
        </div>

        <form action="/properties" className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left font-semibold text-slate-500 shadow-sm focus-within:border-[#3B49FF] focus-within:ring-4 focus-within:ring-[#3B49FF]/10">
            <Search size={20} className="shrink-0 text-[#3B49FF]" />
            <input
              name="q"
              type="search"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#050A30] outline-none placeholder:text-slate-400"
              placeholder="Search suburb, city, province, agent, or listing ID"
              aria-label="Search properties"
            />
          </label>
          <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#050A30] px-6 font-black text-white shadow-sm transition hover:bg-[#3B49FF]" type="submit">
            Search <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="mr-1 text-xs font-black uppercase tracking-[.18em] text-slate-400">Popular</span>
          {quickLinks.map((link) => (
            <a key={link} className="rounded-full border border-slate-200 bg-white px-3 py-2 transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href={`/properties?location=${encodeURIComponent(link)}`}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
