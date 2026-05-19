import type { Metadata } from 'next';
import type React from 'react';
import { Building2, MapPin, Search, ShieldCheck, Users } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalAgencies } from '../../lib/proppd/backend';
import { filterAgencies, formatDirectorySearchSummary, parseDirectoryQuery, slugifyDirectoryName } from '@/lib/directory';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Agencies',
  description: 'Browse Proppd agencies by city, team size, and active portfolio stock.',
  alternates: { canonical: '/agencies' },
};

export const dynamic = 'force-dynamic';

export default async function AgenciesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = parseDirectoryQuery(toURLSearchParams(params));
  const portalAgencies = (await loadPortalAgencies()).items;
  const filteredAgencies = filterAgencies(portalAgencies, query);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Agencies</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Modern agency profiles</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A browsable directory foundation for branches, teams, locations, verified enquiries, and active stock.
            </p>
            <form action="/agencies" className="mt-8 grid gap-3 rounded-[2rem] bg-[#F5F7FA] p-3 md:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-bold text-slate-500 ring-1 ring-transparent transition focus-within:ring-[#3B49FF]/30">
                <Search size={18} className="text-[#3B49FF]" />
                <input
                  name="q"
                  type="search"
                  defaultValue={query ?? ''}
                  className="min-w-0 flex-1 bg-transparent font-bold text-[#050A30] outline-none placeholder:text-slate-500"
                  placeholder="Search agency, city, or operating area"
                  aria-label="Search agencies"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex justify-center rounded-full bg-[#3B49FF] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20" type="submit">Search</button>
                <a className="inline-flex justify-center rounded-full bg-[#050A30] px-6 py-4 text-sm font-black !text-white" href="mailto:info@proppd.com?subject=Add my agency to Proppd">
                  Add agency
                </a>
              </div>
            </form>
            <p className="mt-5 text-sm font-black text-slate-500">{formatDirectorySearchSummary(filteredAgencies.length, 'agency', query)}</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {filteredAgencies.map((agency) => (
              <a
                key={agency.name}
                href={`/agencies/${slugifyDirectoryName(agency.name)}`}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <div className="bg-gradient-to-br from-[#050A30] via-[#3B49FF] to-[#12D6C5] p-6 text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                    <Building2 size={30} />
                  </div>
                  <h2 className="mt-8 text-2xl font-black tracking-[-.04em]">{agency.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/75"><MapPin size={16} /> {agency.city}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                  <AgencyStat icon={<Users size={17} />} value={agency.agents} label="agents" />
                  <AgencyStat icon={<ShieldCheck size={17} />} value={agency.listings} label="portfolio listings" />
                </div>
              </a>
            ))}
          </div>

          {filteredAgencies.length === 0 && (
            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-[-.04em]">No agencies match that search yet.</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-600">Try a wider city or agency search — or ask Proppd to open launch onboarding for that market.</p>
              <a className="mt-5 inline-flex rounded-full bg-[#050A30] px-5 py-3 text-sm font-black !text-white" href="mailto:info@proppd.com?subject=Agency directory request">Request an agency</a>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function AgencyStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F7FA] p-4">
      <div className="flex items-center gap-2 text-[#3B49FF]">{icon}<span className="text-2xl font-black text-[#050A30]">{value}</span></div>
      <div className="mt-1 text-xs font-black uppercase tracking-[.16em] text-slate-400">{label}</div>
    </div>
  );
}

function toURLSearchParams(params: Record<string, string | string[] | undefined>): URLSearchParams {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
    } else if (value !== undefined) {
      search.set(key, value);
    }
  });
  return search;
}
