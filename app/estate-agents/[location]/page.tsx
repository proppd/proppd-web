import type { Metadata } from 'next';
import { BadgeCheck, Building2, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { agents as demoAgents, listings as demoListings } from '@/lib/demo-data';
import { formatDirectoryCount, slugifyDirectoryName } from '@/lib/directory';
import { buildCityLandingLinks, filterListingsByLocation, findAgentsForLocation, resolveLocationSlug } from '@/lib/locations';
import { loadPortalAgents, loadPortalListings } from '../../../lib/proppd/backend';

type Params = Promise<{ location: string }>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { location: slug } = await params;
  const location = resolveLocationSlug(demoListings, slug);
  if (!location) return { title: 'Location not found' };

  const title = `Estate agents in ${location.name}`;
  const description = `Find verified estate agents in ${location.name} on Proppd. Compare active listings, areas served, and enquire directly — no fake leads.`;
  const canonical = `/estate-agents/${location.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Proppd`,
      description,
      url: canonical,
      siteName: 'Proppd',
      type: 'website',
      images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Proppd`,
      description,
      images: ['/proppd-logo-horizontal.png'],
    },
  };
}

export default async function EstateAgentsLocationPage({ params }: { params: Params }) {
  const { location: slug } = await params;
  const [portalAgents, portalListings] = await Promise.all([loadPortalAgents(), loadPortalListings()]);
  const visibleAgents = portalAgents.items.length > 0 ? portalAgents.items : demoAgents;
  const visibleListings = portalListings.items;

  const location = resolveLocationSlug(visibleListings, slug) ?? resolveLocationSlug(demoListings, slug);
  if (!location) notFound();

  const locationAgents = findAgentsForLocation(visibleAgents, visibleListings, location);
  const locationListings = filterListingsByLocation(visibleListings, location);
  const otherCities = buildCityLandingLinks(visibleListings, location.slug);
  const listingCountByAgent = new Map<string, number>();
  for (const listing of locationListings) {
    listingCountByAgent.set(listing.agent, (listingCountByAgent.get(listing.agent) ?? 0) + 1);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />

      <div className="border-b border-[#E5E7EB] bg-white px-4 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Agents', href: '/agents' },
              { label: location.name },
            ]}
          />
        </div>
      </div>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Agents · {location.name}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-.05em] sm:text-4xl">Estate agents in {location.name}</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-[#6B7280]">
              {formatDirectoryCount(locationAgents.length, 'verified agent')} working the {location.name} market, with{' '}
              {formatDirectoryCount(locationListings.length, 'active listing')} on Proppd right now.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {locationAgents.map((agent) => (
              <a
                key={agent.name}
                href={`/agents/${slugifyDirectoryName(agent.name)}`}
                className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:border-[#4A3AFF]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#4A3AFF]/10 text-[#4A3AFF]">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold text-[#1A1A2E]">
                      {agent.name} <BadgeCheck size={15} className="text-[#2563EB]" />
                    </p>
                    <p className="text-xs font-bold text-[#9CA3AF]">{agent.agency}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm font-bold text-[#6B7280]">
                  <span className="flex items-center gap-2"><MapPin size={15} className="text-[#4A3AFF]" /> {agent.area}</span>
                  <span>
                    {formatDirectoryCount(listingCountByAgent.get(agent.name) ?? 0, `active ${location.name} listing`)}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {locationAgents.length === 0 && (
            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-8 text-sm font-semibold text-[#6B7280]">
              No verified agents listed for {location.name} yet.{' '}
              <a className="font-bold text-[#4A3AFF] hover:text-[#3A2AE0]" href="/agents">Browse all agents</a> or{' '}
              <a className="font-bold text-[#4A3AFF] hover:text-[#3A2AE0]" href="/list-with-us">join Proppd as an agent</a>.
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Browse {location.name} property</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">Search alongside the agents</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CityLink href={`/properties/for-sale/${location.slug}`}>For sale in {location.name}</CityLink>
              <CityLink href={`/properties/to-rent/${location.slug}`}>To rent in {location.name}</CityLink>
              {otherCities.map((city) => (
                <CityLink key={city.slug} href={`/estate-agents/${city.slug}`}>Estate agents in {city.name}</CityLink>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-[#1A1A2E] p-6 text-white shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Work in {location.name}?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">Get verified leads without the noise.</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/72">
              Proppd routes verified enquiries straight to you — fair pricing, modern tools, and a profile buyers can trust.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]" href="/list-with-us">List with Proppd</a>
              <a className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-white" href="/business">How Proppd works</a>
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function CityLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
    >
      <MapPin size={16} className="shrink-0 text-[#4A3AFF]" /> {children}
    </a>
  );
}
