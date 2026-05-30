import type { Metadata } from 'next';
import { BadgeCheck, Building2, MapPin, Search } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalAgencies, loadPortalAgents, loadPortalListings } from '../../lib/proppd/backend';
import { filterAgents, formatDirectorySearchSummary, parseDirectoryQuery, slugifyDirectoryName } from '@/lib/directory';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Agents',
  description: 'Browse verified Proppd agents by area, agency, and active listing count.',
  alternates: { canonical: '/agents' },
  openGraph: {
    title: 'Agents | Proppd',
    description: 'Browse verified Proppd agents by area, agency, and active listing count.',
    url: '/agents',
    siteName: 'Proppd',
    type: 'website',
    images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agents | Proppd',
    description: 'Browse verified Proppd agents by area, agency, and active listing count.',
    images: ['/proppd-logo-horizontal.png'],
  },
};

export const dynamic = 'force-dynamic';

export default async function AgentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = parseDirectoryQuery(toURLSearchParams(params));
  const [portalAgents, portalAgencies, portalListings] = await Promise.all([
    loadPortalAgents(),
    loadPortalAgencies(),
    loadPortalListings(),
  ]);
  const filteredAgents = filterAgents(portalAgents.items, query);
  const agentWatchlist = buildAgentWatchlist(filteredAgents);
  const directoryPulse = buildDirectoryPulse(filteredAgents, portalAgencies.items, portalListings.items);
  const agencyLeaders = buildAgencyLeaders(filteredAgents);
  const featuredAgency = agencyLeaders[0];
  const featuredProfiles = buildFeaturedProfiles(filteredAgents, portalListings.items);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Agents</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Verified property professionals</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Browse early Proppd agent profiles by area, agency, verification status, and active listing count.
            </p>
            <form action="/agents" className="mt-8 grid gap-3 rounded-[2rem] bg-[#F5F7FA] p-3 md:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-bold text-slate-500 ring-1 ring-transparent transition focus-within:ring-[#3B49FF]/30">
                <Search size={18} className="text-[#3B49FF]" />
                <input
                  name="q"
                  type="search"
                  defaultValue={query ?? ''}
                  className="min-w-0 flex-1 bg-transparent font-bold text-[#050A30] outline-none placeholder:text-slate-500"
                  placeholder="Search by agent, agency, or service area"
                  aria-label="Search agents"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex justify-center rounded-full bg-[#3B49FF] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20" type="submit">Search</button>
                <a className="inline-flex justify-center rounded-full bg-[#050A30] px-6 py-4 text-sm font-black !text-white" href="/list-with-us#launch-application">
                  Join directory
                </a>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-black text-[#3B49FF]">
              <span className="mr-1 text-xs font-black uppercase tracking-[.18em] text-slate-400">Popular searches</span>
              {['Sandton', 'Cape Town', 'Durban', 'Johannesburg North'].map((area) => (
                <a
                  key={area}
                  href={`/agents?q=${encodeURIComponent(area)}`}
                  className="inline-flex items-center rounded-full border border-[#3B49FF]/15 bg-white px-4 py-2 shadow-sm transition hover:border-[#3B49FF] hover:text-[#050A30]"
                >
                  {area}
                </a>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DirectoryMetric label="Verified agents" value={filteredAgents.length} detail="Profiles visible in this view" />
              <DirectoryMetric label="Agencies represented" value={portalAgencies.items.length} detail="Launch partners in network" />
              <DirectoryMetric label="Portfolio listings" value={portalListings.items.length} detail="Live stock connected to agents" />
            </div>
            <p className="mt-5 text-sm font-black text-slate-500">{formatDirectorySearchSummary(filteredAgents.length, 'agent', query)}</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <a
                key={agent.name}
                href={`/agents/${slugifyDirectoryName(agent.name)}`}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3B49FF] to-[#12D6C5] text-2xl font-black text-white">
                  {agent.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">
                  <BadgeCheck size={16} /> Verified agent
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-[-.04em]">{agent.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500"><Building2 size={16} /> {agent.agency}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500"><MapPin size={16} /> {agent.area}</p>
                <div className="mt-6 rounded-3xl bg-[#F5F7FA] p-4">
                  <div className="text-3xl font-black text-[#050A30]">{agent.listings}</div>
                  <div className="text-xs font-black uppercase tracking-[.16em] text-slate-400">portfolio listings</div>
                </div>
              </a>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
                <div className="p-8 sm:p-10">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3B49FF]/10 text-[#3B49FF]">
                    <BadgeCheck size={24} />
                  </div>
                  <h2 className="mt-5 text-2xl font-black tracking-[-.04em] sm:text-3xl">No agents match that search yet.</h2>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                    Try a wider agency, city, or area search — or ask Proppd to add a launch partner in that market.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm font-black text-[#3B49FF]">
                    {['Sandton', 'Cape Town', 'Durban', 'Pretoria'].map((area) => (
                      <a
                        key={area}
                        href={`/agents?q=${encodeURIComponent(area)}`}
                        className="inline-flex items-center rounded-full border border-[#3B49FF]/15 bg-[#3B49FF]/6 px-4 py-2 transition hover:border-[#3B49FF] hover:bg-white"
                      >
                        {area}
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a className="inline-flex rounded-full bg-[#050A30] px-5 py-3 text-sm font-black !text-white shadow-lg" href="/list-with-us#launch-application">
                      Request an agent
                    </a>
                    <a className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-[#050A30] shadow-sm transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/agencies">
                      Browse related agencies
                    </a>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-[#F5F7FA] p-8 sm:p-10 lg:border-l lg:border-t-0">
                  <p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">Try next</p>
                  <div className="mt-4 grid gap-3">
                    {[
                      ['Search by city', 'Use area names like Sandton, Cape Town, or Durban.'],
                      ['Search by agency', 'Jump straight to a branch or launch partner.'],
                      ['Request a profile', 'Tell Proppd which market is still thin.'],
                    ].map(([title, body]) => (
                      <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#12D6C5]/12 text-[#057a70]">
                            <Search size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#050A30]">{title}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Directory pulse</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Market snapshot for the current agent network.</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                  See the current pockets, then jump to the right profile or agency without repeating the same directory counts again.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="mailto:info@proppd.com?subject=Agent directory updates">
                Save search email →
              </a>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <PulseCard label="Top area" value={directoryPulse.topArea} detail="Most common service pocket" />
              <PulseCard label="Leading agency" value={agencyLeaders[0]?.label ?? 'Mixed'} detail={agencyLeaders[0]?.detail ?? 'The most visible agency by current search results.'} />
              <PulseCard label="Search angle" value="Area + agency" detail="Use both to shortlist faster." />
              <PulseCard label="Missing profile" value="Request one" detail="Tell Proppd which market is still thin." />
            </div>
          </section>

          <section className="mt-8 rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Featured profiles</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Agents with live stock tied to them.</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                  These profiles give the lower half something concrete to explore: real names, real areas, and the listings that make each pocket worth browsing.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/properties">
                Browse all listings →
              </a>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {featuredProfiles.map((profile) => (
                <article key={profile.agentName} className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Live stock</p>
                      <h3 className="mt-2 text-2xl font-black tracking-[-.04em] text-[#050A30]">{profile.agentName}</h3>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#3B49FF] shadow-sm">
                      {profile.listingCount} {profile.listingCount === 1 ? 'listing' : 'listings'}
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-600">{profile.agencyName}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{profile.area}</p>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Featured listing</p>
                    <p className="mt-2 text-lg font-black tracking-[-.03em] text-[#050A30]">{profile.featuredListingTitle}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{profile.featuredListingMeta}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={profile.agentHref} className="inline-flex items-center rounded-full bg-[#050A30] px-4 py-2 text-sm font-black !text-white shadow-sm">
                      Open profile
                    </a>
                    <a href={profile.listingsHref} className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]">
                      View listings
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Directory support</p>
                  <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">{agentWatchlist.length ? `${agentWatchlist.length} active agent pockets` : 'Directory support for launch partners'}</h2>
                  <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                    {agentWatchlist.length
                      ? 'Quickly see where the early network is concentrated, then move into the right team or individual profile.'
                      : 'When a market is still thin, Proppd keeps the page useful with launch guidance and a clear path to get listed.'}
                  </p>
                </div>
                <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/agencies">
                  Browse related agencies →
                </a>
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-4">
                <WatchlistCard
                  title="Top areas"
                  body={agentWatchlist.length ? agentWatchlist.map(({ label, count }) => `${label} (${count})`).join(' • ') : 'No live pockets yet — we will surface them here as launch partners come online.'}
                />
                <WatchlistCard
                  title="Search playbook"
                  body="Search by agent, agency, or service area. Then compare the top pocket, leading agency, and response readiness before you enquire."
                />
                <WatchlistCard
                  title="Featured agency"
                  body={featuredAgency ? `${featuredAgency.label} currently has ${featuredAgency.count} visible ${featuredAgency.count === 1 ? 'profile' : 'profiles'} in this search.` : 'Browse agencies to find a leading branch in this market.'}
                  actionHref={featuredAgency ? `/agencies?q=${encodeURIComponent(featuredAgency.label)}` : '/agencies'}
                  actionLabel={featuredAgency ? 'Open agency' : 'Browse agencies'}
                />
                <WatchlistCard
                  title="Need a launch partner?"
                  body="Tell Proppd which market is missing and we can prioritise a verified agent or branch for onboarding review."
                  actionHref="/list-with-us#launch-application"
                  actionLabel="Request a profile"
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

function buildAgentWatchlist(agents: Array<{ area: string }>): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  agents.forEach((agent) => {
    const label = agent.area.split(',')[0]?.trim() || agent.area;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 3);
}

function buildDirectoryPulse(
  agents: Array<{ area: string; agency: string; listings: number }>,
  agencies: Array<{ name: string }>,
  listings: Array<unknown>,
) {
  const topArea = buildAgentWatchlist(agents)[0]?.label ?? 'Mixed';
  return {
    totalAgents: agents.length,
    totalAgencies: agencies.length,
    totalListings: listings.length,
    topArea,
  };
}

function buildAgencyLeaders(agents: Array<{ agency: string }>): Array<{ label: string; count: number; detail: string }> {
  const counts = new Map<string, number>();
  agents.forEach((agent) => {
    const label = agent.agency.trim();
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      detail: `${count} visible ${count === 1 ? 'profile' : 'profiles'} in the current results.`,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 3);
}
function buildFeaturedProfiles(
  agents: Array<{ name: string; agency: string; area: string; listings: number }>,
  listings: Array<{ title: string; suburb: string; city: string; price: string; agent: string; slug: string }>,
): Array<{ agentName: string; agencyName: string; area: string; listingCount: number; featuredListingTitle: string; featuredListingMeta: string; agentHref: string; listingsHref: string }> {
  return agents
    .map((agent) => {
      const agentListings = listings.filter((listing) => listing.agent === agent.name);
      const featuredListing = agentListings[0];
      return {
        agentName: agent.name,
        agencyName: agent.agency,
        area: agent.area,
        listingCount: agent.listings,
        featuredListingTitle: featuredListing?.title ?? 'View their current listings',
        featuredListingMeta: featuredListing ? `${featuredListing.suburb}, ${featuredListing.city} · ${featuredListing.price}` : 'Use the stock filter to see this profile’s live inventory.',
        agentHref: `/agents/${slugifyDirectoryName(agent.name)}`,
        listingsHref: `/properties?agent=${encodeURIComponent(agent.name)}`,
      };
    })
    .sort((left, right) => right.listingCount - left.listingCount || left.agentName.localeCompare(right.agentName))
    .slice(0, 3);
}


function PulseCard({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-4">
      <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-[-.04em] text-[#050A30]">{value}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function DirectoryMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-[-.04em] text-[#050A30]">{value}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
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
    <article className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-5">
      <h3 className="text-xl font-black tracking-[-.03em]">{title}</h3>
      <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{body}</p>
      {actionHref && actionLabel && (
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#3B49FF]" href={actionHref}>
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
