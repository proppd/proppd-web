import type { Metadata } from 'next';
import { BadgeCheck, Building2, MapPin, Search } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { agencies as demoAgencies, agents as demoAgents, listings as demoListings } from '@/lib/demo-data';
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
  const hasSearch = Boolean(query);
  const visibleAgents = !hasSearch && filteredAgents.length === 0 ? demoAgents : filteredAgents;
  const visibleAgencies = !hasSearch && portalAgencies.items.length === 0 ? demoAgencies : portalAgencies.items;
  const visibleListings = !hasSearch && portalListings.items.length === 0 ? demoListings : portalListings.items;
  const agentWatchlist = buildAgentWatchlist(visibleAgents);
  const directoryPulse = buildDirectoryPulse(visibleAgents, visibleAgencies, visibleListings);
  const agencyLeaders = buildAgencyLeaders(visibleAgents);
  const featuredAgency = agencyLeaders[0];
  const featuredProfiles = buildFeaturedProfiles(visibleAgents, visibleListings);
  const showEmptyState = hasSearch && visibleAgents.length === 0;

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Agents</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-[-.07em] sm:text-6xl">Verified property professionals</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B7280]">
              Browse early Proppd agent profiles by area, agency, verification status, and active listing count.
            </p>
            <form action="/agents" className="mt-8 grid gap-3 rounded-xl bg-[#F7F8FA] p-3 md:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-bold text-[#9CA3AF] ring-1 ring-transparent transition focus-within:ring-[#4A3AFF]/30">
                <Search size={18} className="text-[#4A3AFF]" />
                <input
                  name="q"
                  type="search"
                  defaultValue={query ?? ''}
                  className="min-w-0 flex-1 bg-transparent font-bold text-[#1A1A2E] outline-none placeholder:text-[#9CA3AF]"
                  placeholder="Search by agent, agency, or service area"
                  aria-label="Search agents"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex justify-center rounded-full bg-[#4A3AFF] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#4A3AFF]/20" type="submit">Search</button>
                <a className="inline-flex justify-center rounded-full bg-[#1A1A2E] px-6 py-4 text-sm font-bold !text-white" href="/list-with-us#launch-application">
                  List your agency
                </a>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-bold text-[#4A3AFF]">
              <span className="mr-1 text-xs font-bold uppercase tracking-[.18em] text-[#9CA3AF]">Popular searches</span>
              {['Sandton', 'Cape Town', 'Durban', 'Johannesburg North'].map((area) => (
                <a
                  key={area}
                  href={`/agents?q=${encodeURIComponent(area)}`}
                  className="inline-flex items-center rounded-full border border-[#4A3AFF]/15 bg-white px-4 py-2 shadow-sm transition hover:border-[#4A3AFF] hover:text-[#1A1A2E]"
                >
                  {area}
                </a>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DirectoryMetric label="Verified agents" value={visibleAgents.length} detail="Profiles visible in this view" />
              <DirectoryMetric label="Agencies represented" value={visibleAgencies.length} detail="Agencies in network" />
              <DirectoryMetric label="Portfolio listings" value={visibleListings.length} detail="Live stock connected to agents" />
            </div>
            <p className="mt-5 text-sm font-bold text-[#9CA3AF]">{formatDirectorySearchSummary(visibleAgents.length, 'agent', query)}</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {visibleAgents.map((agent) => (
              <a
                key={agent.name}
                href={`/agents/${slugifyDirectoryName(agent.name)}`}
                className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#4A3AFF] to-[#60A5FA] text-2xl font-bold text-white">
                  {agent.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">
                  <BadgeCheck size={16} /> Verified agent
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">{agent.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#9CA3AF]"><Building2 size={16} /> {agent.agency}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#9CA3AF]"><MapPin size={16} /> {agent.area}</p>
                <div className="mt-6 rounded-3xl bg-[#F7F8FA] p-4">
                  <div className="text-3xl font-bold text-[#1A1A2E]">{agent.listings}</div>
                  <div className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">portfolio listings</div>
                </div>
              </a>
            ))}
          </div>

          {showEmptyState && (
            <div className="mt-8 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
                <div className="p-8 sm:p-10">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4A3AFF]/10 text-[#4A3AFF]">
                    <BadgeCheck size={24} />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold tracking-[-.04em] sm:text-3xl">No agents match that search yet.</h2>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#6B7280]">
                    Try a wider agency, city, or area search — or ask Proppd to add a verified agency in that market.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-[#4A3AFF]">
                    {['Sandton', 'Cape Town', 'Durban', 'Pretoria'].map((area) => (
                      <a
                        key={area}
                        href={`/agents?q=${encodeURIComponent(area)}`}
                        className="inline-flex items-center rounded-full border border-[#4A3AFF]/15 bg-[#4A3AFF]/6 px-4 py-2 transition hover:border-[#4A3AFF] hover:bg-white"
                      >
                        {area}
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a className="inline-flex rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold !text-white shadow-lg" href="/list-with-us#launch-application">
                      Request an agent
                    </a>
                    <a className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/agencies">
                      Browse related agencies
                    </a>
                  </div>
                </div>

                <div className="border-t border-[#E5E7EB] bg-[#F7F8FA] p-8 sm:p-10 lg:border-l lg:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9CA3AF]">Try next</p>
                  <div className="mt-4 grid gap-3">
                    {[
                      ['Search by city', 'Use area names like Sandton, Cape Town, or Durban.'],
                      ['Search by agency', 'Jump straight to a branch or verified agency.'],
                      ['Request a profile', 'Tell Proppd which market is still thin.'],
                    ].map(([title, body]) => (
                      <div key={title} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
                            <Search size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1A2E]">{title}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Directory pulse</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Market snapshot for the current agent network.</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                  See the current pockets, then jump to the right profile or agency without repeating the same directory counts again.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="mailto:info@proppd.com?subject=Agent directory updates">
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

          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Featured profiles</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Agents with live stock tied to them.</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                  These profiles give the lower half something concrete to explore: real names, real areas, and the listings that make each pocket worth browsing.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties">
                Browse all listings →
              </a>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {featuredProfiles.map((profile) => (
                <article key={profile.agentName} className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">Live stock</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#1A1A2E]">{profile.agentName}</h3>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#4A3AFF] shadow-sm">
                      {profile.listingCount} {profile.listingCount === 1 ? 'listing' : 'listings'}
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#6B7280]">{profile.agencyName}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#9CA3AF]">{profile.area}</p>

                  <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Featured listing</p>
                    <p className="mt-2 text-lg font-bold tracking-[-.03em] text-[#1A1A2E]">{profile.featuredListingTitle}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{profile.featuredListingMeta}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={profile.agentHref} className="inline-flex items-center rounded-full bg-[#1A1A2E] px-4 py-2 text-sm font-bold !text-white shadow-sm">
                      Open profile
                    </a>
                    <a href={profile.listingsHref} className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                      View listings
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Directory support</p>
                  <h2 className="mt-3 text-4xl font-bold tracking-[-.06em]">{agentWatchlist.length ? `${agentWatchlist.length} active agent pockets` : 'Directory support for growing markets'}</h2>
                  <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                    {agentWatchlist.length
                      ? 'Quickly see where the early network is concentrated, then move into the right team or individual profile.'
                      : 'When a market is still thin, Proppd keeps the page useful with a clear path to get listed.'}
                  </p>
                </div>
                <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/agencies">
                  Browse related agencies →
                </a>
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-4">
                <WatchlistCard
                  title="Top areas"
                  body={agentWatchlist.length ? agentWatchlist.map(({ label, count }) => `${label} (${count})`).join(' • ') : 'No live pockets yet — we will surface them here as verified agencies come online.'}
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
                  title="Need a verified agency?"
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
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#1A1A2E]">{value}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{detail}</p>
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
