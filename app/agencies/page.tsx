import type { Metadata } from 'next';
import type React from 'react';
import { Building2, MapPin, Search, ShieldCheck, Users } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { agencies as demoAgencies, agents as demoAgents, listings as demoListings } from '@/lib/demo-data';
import { loadPortalAgencies, loadPortalAgents, loadPortalListings } from '../../lib/proppd/backend';
import { filterAgencies, formatDirectorySearchSummary, parseDirectoryQuery, slugifyDirectoryName } from '@/lib/directory';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Agencies',
  description: 'Browse Proppd agencies by city, team size, and active portfolio stock.',
  alternates: { canonical: '/agencies' },
  openGraph: {
    title: 'Agencies | Proppd',
    description: 'Browse Proppd agencies by city, team size, and active portfolio stock.',
    url: '/agencies',
    siteName: 'Proppd',
    type: 'website',
    images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agencies | Proppd',
    description: 'Browse Proppd agencies by city, team size, and active portfolio stock.',
    images: ['/proppd-logo-horizontal.png'],
  },
};

export const dynamic = 'force-dynamic';

export default async function AgenciesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = parseDirectoryQuery(toURLSearchParams(params));
  const [portalAgencies, portalAgents, portalListings] = await Promise.all([
    loadPortalAgencies(),
    loadPortalAgents(),
    loadPortalListings(),
  ]);
  const filteredAgencies = filterAgencies(portalAgencies.items, query);
  const hasSearch = Boolean(query);
  const visibleAgencies = !hasSearch && filteredAgencies.length === 0 ? demoAgencies : filteredAgencies;
  const visibleAgents = !hasSearch && portalAgents.items.length === 0 ? demoAgents : portalAgents.items;
  const visibleListings = !hasSearch && portalListings.items.length === 0 ? demoListings : portalListings.items;
  const agencyWatchlist = buildAgencyWatchlist(visibleAgencies);
  const agencyPulse = buildAgencyPulse(visibleAgencies, visibleAgents, visibleListings);
  const branchLeaders = buildBranchLeaders(visibleAgencies);
  const showEmptyState = hasSearch && visibleAgencies.length === 0;

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Agencies</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-[-.07em] sm:text-6xl">Modern agency profiles</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B7280]">
              A browsable directory foundation for branches, teams, locations, verified enquiries, and active stock.
            </p>
            <form action="/agencies" className="mt-8 grid gap-3 rounded-xl bg-[#F7F8FA] p-3 md:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-bold text-[#9CA3AF] ring-1 ring-transparent transition focus-within:ring-[#4A3AFF]/30">
                <Search size={18} className="text-[#4A3AFF]" />
                <input
                  name="q"
                  type="search"
                  defaultValue={query ?? ''}
                  className="min-w-0 flex-1 bg-transparent font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
                  placeholder="Search agency, city, or operating area"
                  aria-label="Search agencies"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex justify-center rounded-full bg-[#4A3AFF] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#4A3AFF]/20" type="submit">Search</button>
                <a className="inline-flex justify-center rounded-full bg-[#1A1A2E] px-6 py-4 text-sm font-bold !text-white" href="mailto:info@proppd.com?subject=Add my agency to Proppd">
                  List your agency
                </a>
              </div>
            </form>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DirectoryMetric label="Agencies visible" value={visibleAgencies.length} detail="Profiles shown in this directory" />
              <DirectoryMetric label="Active agents" value={visibleAgents.length} detail="Agents tied to the network" />
              <DirectoryMetric label="Portfolio listings" value={visibleListings.length} detail="Visible stock linked to branches" />
            </div>
            <p className="mt-5 text-sm font-bold text-[#9CA3AF]">{formatDirectorySearchSummary(visibleAgencies.length, 'agency', query)}</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {visibleAgencies.map((agency) => (
              <a
                key={agency.name}
                href={`/agencies/${slugifyDirectoryName(agency.name)}`}
                className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <div className="bg-gradient-to-br from-[#1A1A2E] via-[#4A3AFF] to-[#60A5FA] p-6 text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                    <Building2 size={30} />
                  </div>
                  <h2 className="mt-8 text-2xl font-bold tracking-[-.04em]">{agency.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/75"><MapPin size={16} /> {agency.city}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                  <AgencyStat icon={<Users size={17} />} value={agency.agents} label="agents" />
                  <AgencyStat icon={<ShieldCheck size={17} />} value={agency.listings} label="portfolio listings" />
                </div>
              </a>
            ))}
          </div>

          {showEmptyState && (
            <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold tracking-[-.04em]">No agencies match that search yet.</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">Try a wider city or agency search — or ask Proppd to open agency onboarding for that market.</p>
              <a className="mt-5 inline-flex rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold !text-white" href="mailto:info@proppd.com?subject=Agency directory request">Request an agency</a>
            </div>
          )}

          <section className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Directory pulse</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Market snapshot for the current agency network.</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                  See the current pockets, then jump to the right branch or team without repeating the same directory counts again.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="mailto:info@proppd.com?subject=Agency directory updates">
                Save search email →
              </a>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <PulseCard label="Top city" value={agencyPulse.topCity} detail="Primary agency city" />
              <PulseCard label="Leading branch" value={branchLeaders[0]?.label ?? 'Mixed'} detail={branchLeaders[0]?.detail ?? 'The most visible branch by current search results.'} />
              <PulseCard label="Search angle" value="City + team size" detail="Use both to shortlist faster." />
              <PulseCard label="Missing branch" value="Request one" detail="Tell Proppd which city is still thin." />
            </div>
          </section>

          <section className="mt-10">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Directory support</p>
                  <h2 className="mt-3 text-4xl font-bold tracking-[-.06em]">{agencyWatchlist.length ? `${agencyWatchlist.length} active agency pockets` : 'Directory support for growing markets'}</h2>
                  <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                    {agencyWatchlist.length
                      ? 'See where the early agency network is concentrated, then move into the right branch or team profile.'
                      : 'When a market is still thin, Proppd keeps the page useful with a clear path to get listed.'}
                  </p>
                </div>
                <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/agents">
                  Browse related agents →
                </a>
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                <WatchlistCard
                  title="Top cities"
                  body={agencyWatchlist.length ? agencyWatchlist.map(({ label, count }) => `${label} (${count})`).join(' • ') : 'No live cities yet — we will surface them here as verified agencies come online.'}
                />
                <WatchlistCard
                  title="Search playbook"
                  body="Search by agency, city, or operating area. Then compare team size, listing depth, and portfolio strength before you enquire."
                />
                <WatchlistCard
                  title="Need a branch listed?"
                  body="Tell Proppd which market is missing and we can prioritise an agency onboarding review for that region."
                  actionHref="mailto:info@proppd.com?subject=Agency directory request"
                  actionLabel="Request a branch"
                />
              </div>
            </div>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function AgencyStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-3xl bg-[#F7F8FA] p-4">
      <div className="flex items-center gap-2 text-[#4A3AFF]">{icon}<span className="text-2xl font-bold text-[#1A1A2E]">{value}</span></div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">{label}</div>
    </div>
  );
}

function DirectoryMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#1A1A2E]">{value}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{detail}</p>
    </div>
  );
}

function buildAgencyWatchlist(agencies: Array<{ city: string }>): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  agencies.forEach((agency) => {
    const label = agency.city.split(',')[0]?.trim() || agency.city;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 3);
}

function buildAgencyPulse(
  agencies: Array<{ city: string }>,
  agents: Array<unknown>,
  listings: Array<unknown>,
) {
  const topCity = buildAgencyWatchlist(agencies)[0]?.label ?? 'Mixed';
  return {
    totalAgencies: agencies.length,
    totalAgents: agents.length,
    totalListings: listings.length,
    topCity,
  };
}

function buildBranchLeaders(agencies: Array<{ name: string; agents: number; listings: number }>): Array<{ label: string; count: number; detail: string }> {
  return agencies
    .map((agency) => ({
      label: agency.name.trim(),
      count: agency.agents,
      detail: `${agency.agents} visible ${agency.agents === 1 ? 'agent' : 'agents'} and ${agency.listings} ${agency.listings === 1 ? 'listing' : 'listings'} in the current results.`,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 3);
}

function PulseCard({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#1A1A2E]">{value}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{detail}</p>
    </div>
  );
}

function WatchlistCard({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
      <h3 className="text-xl font-bold tracking-[-.03em]">{title}</h3>
      <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">{body}</p>
      {actionHref && actionLabel && (
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF]" href={actionHref}>
          {actionLabel} →
        </a>
      )}
    </article>
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
