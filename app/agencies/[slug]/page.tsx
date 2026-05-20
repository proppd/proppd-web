import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Building2, Mail, MapPin, ShieldCheck, Users } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalAgencies, loadPortalAgents, loadPortalListings } from '../../../lib/proppd/backend';
import { agencies as demoAgencies, agents as demoAgents, listings as demoListings } from '@/lib/demo-data';
import { formatDirectoryCount, getAgencyAgents, getAgencyListings, slugifyDirectoryName } from '@/lib/directory';

export function generateStaticParams() {
  return demoAgencies.map((agency) => ({ slug: slugifyDirectoryName(agency.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const portalAgency = await loadPortalAgencies();
  const agency = portalAgency.items[0] ?? demoAgencies.find((entry) => slugifyDirectoryName(entry.name) === slug);

  if (!agency) {
    return { title: 'Agency not found' };
  }

  return {
    title: agency.name,
    description: `${agency.name} is a verified Proppd agency in ${agency.city} with ${agency.agents} agent${agency.agents === 1 ? '' : 's'} and ${agency.listings} active listing${agency.listings === 1 ? '' : 's'}.`,
    alternates: { canonical: `/agencies/${slugifyDirectoryName(agency.name)}` },
    openGraph: {
      title: `${agency.name} | Proppd`,
      description: `${agency.name} is a verified Proppd agency in ${agency.city} with ${agency.agents} agent${agency.agents === 1 ? '' : 's'} and ${agency.listings} active listing${agency.listings === 1 ? '' : 's'}.`,
      url: `/agencies/${slugifyDirectoryName(agency.name)}`,
      siteName: 'Proppd',
      type: 'website',
      images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${agency.name} | Proppd`,
      description: `${agency.name} is a verified Proppd agency in ${agency.city} with ${agency.agents} agent${agency.agents === 1 ? '' : 's'} and ${agency.listings} active listing${agency.listings === 1 ? '' : 's'}.`,
      images: ['/proppd-logo-horizontal.png'],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function AgencyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portalAgency = await loadPortalAgencies();
  const agency = portalAgency.items[0] ?? demoAgencies.find((entry) => slugifyDirectoryName(entry.name) === slug);
  if (!agency) notFound();

  const [portalAgents, portalListings] = await Promise.all([loadPortalAgents(), loadPortalListings()]);
  const team = getAgencyAgents(portalAgents.source === 'demo' ? demoAgents : portalAgents.items, agency.name);
  const activeListings = getAgencyListings(portalListings.source === 'demo' ? demoListings : portalListings.items, agency.name);
  const agencyMarketSummary = buildAgencyMarketSummary(activeListings);
  const directoryStateLabel =
    portalAgency.source === 'database'
      ? 'Live agency directory connected'
      : portalAgency.source === 'empty'
        ? 'Live directory connected, branch not yet published'
        : portalAgency.source === 'demo'
          ? 'Demo agency profile'
          : 'Agency profile unavailable';
  const teamStateLabel =
    portalAgents.source === 'database'
      ? 'Live team data connected'
      : portalAgents.source === 'empty'
        ? 'Live team directory connected, no agents yet'
        : portalAgents.source === 'demo'
          ? 'Demo team'
          : 'Team data unavailable';
  const listingStateLabel =
    portalListings.source === 'database'
      ? 'Live stock connected'
      : portalListings.source === 'empty'
        ? 'Live stock connected, none active'
        : portalListings.source === 'demo'
          ? 'Demo stock'
          : 'Stock unavailable';

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#050A30] via-[#3B49FF] to-[#12D6C5] p-8 text-white sm:p-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/15 backdrop-blur">
                <Building2 size={36} />
              </div>
              <p className="mt-8 text-sm font-black uppercase tracking-[.2em] text-[#BFFFF8]">Agency profile</p>
              <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">{agency.name}</h1>
              <p className="mt-5 flex items-center gap-2 text-lg font-bold text-white/80"><MapPin size={20} /> {agency.city}</p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              <AgencyMetric icon={<Users size={18} />} label="Team" value={formatDirectoryCount(team.length, 'agent')} />
              <AgencyMetric icon={<ShieldCheck size={18} />} label="Active stock" value={formatDirectoryCount(activeListings.length, 'listing')} />
              <AgencyMetric icon={<Building2 size={18} />} label="Status" value="Verified agency" />
            </div>
            <div className="px-6 pb-6 sm:px-8">
              <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.16em]">
                <span className="rounded-full bg-[#E9FFFC] px-4 py-2 text-[#087d75]">{directoryStateLabel}</span>
                <span className="rounded-full bg-[#F5F7FA] px-4 py-2 text-slate-600">{teamStateLabel}</span>
                <span className="rounded-full bg-[#F5F7FA] px-4 py-2 text-slate-600">{listingStateLabel}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="rounded-[2rem] bg-white p-7 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[.18em] text-[#3B49FF]">Agency team</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Verified professionals</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {team.map((agent) => (
                    <a key={agent.name} href={`/agents/${slugifyDirectoryName(agent.name)}`} className="rounded-3xl border border-slate-200 p-5 transition hover:border-[#3B49FF]/40 hover:bg-[#F5F7FA]">
                      <div className="text-lg font-black">{agent.name}</div>
                      <div className="mt-2 text-sm font-bold text-slate-500">{agent.area}</div>
                      <div className="mt-4 text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">{formatDirectoryCount(agent.listings, 'portfolio listing')}</div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Agency listings</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Current stock</h2>
                </div>
                <a className="hidden rounded-full bg-white px-5 py-3 text-sm font-black text-[#3B49FF] shadow-sm sm:inline-flex" href={`/properties?agency=${encodeURIComponent(agency.name)}`}>
                  View all
                </a>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {activeListings.map((listing) => (
                  <a key={listing.slug} href={`/property/${listing.slug}`} aria-label={`View ${listing.title}`}>
                    <ListingCard listing={listing} />
                  </a>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-[2.5rem] bg-[#050A30] p-7 text-white shadow-2xl shadow-slate-300/50">
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#12D6C5]">Agency enquiry</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Contact {agency.name}</h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Best for launch onboarding, branch updates, mandate requests, or listing corrections for this agency.
              </p>
              <a
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#050A30]"
                href={`mailto:info@proppd.com?subject=Agency enquiry: ${agency.name}`}
              >
                <Mail size={18} /> Email agency
              </a>
              <a
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 font-black text-white hover:bg-white/5"
                href={`/properties?agency=${encodeURIComponent(agency.name)}`}
              >
                View agency listings
              </a>
            </aside>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_.9fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">How to work with this agency</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Simple, verified, and route-friendly.</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <AgencyPill title="Browse" text="Review the branch, team, and current stock." />
                <AgencyPill title="Choose" text="Open a listing and compare the verified details." />
                <AgencyPill title="Enquire" text="Use the agency handoff to start the conversation." />
              </div>
              <div className="mt-5 rounded-3xl bg-[#F5F7FA] p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Portfolio snapshot</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <AgencySnapshotPill label="Team" value={formatDirectoryCount(team.length, 'agent')} />
                  <AgencySnapshotPill label="Stock" value={formatDirectoryCount(activeListings.length, 'listing')} />
                  <AgencySnapshotPill label="Top suburb" value={agencyMarketSummary.topSuburb} />
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] bg-[#050A30] p-6 text-white shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Need a shortlist?</p>
              <p className="mt-2 text-2xl font-black tracking-[-.04em]">Keep browsing in {agency.city}.</p>
              <p className="mt-3 text-sm font-bold leading-6 text-white/70">
                {team.length} verified agent{team.length === 1 ? '' : 's'} and {activeListings.length} active listing{activeListings.length === 1 ? '' : 's'} are currently tied to {agency.name}.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <AgencySnapshotPill label="City" value={agency.city} dark />
                <AgencySnapshotPill label="Agents" value={String(team.length)} dark />
                <AgencySnapshotPill label="Stock" value={String(activeListings.length)} dark />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#050A30] shadow-sm" href={`/properties?agency=${encodeURIComponent(agency.name)}`}>
                  View listings
                </a>
                <a className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/5" href={`/agents?agency=${encodeURIComponent(agency.name)}`}>
                  Browse agents
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function AgencyMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F7FA] p-5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-slate-400">{icon} {label}</div>
      <div className="mt-2 text-xl font-black text-[#050A30]">{value}</div>
    </div>
  );
}

function AgencySnapshotPill({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-3xl p-4 ${dark ? 'bg-white/8' : 'bg-white'}`}>
      <div className={`text-xs font-black uppercase tracking-[.14em] ${dark ? 'text-[#12D6C5]' : 'text-slate-400'}`}>{label}</div>
      <div className={`mt-2 text-sm font-black leading-6 ${dark ? 'text-white' : 'text-[#050A30]'}`}>{value}</div>
    </div>
  );
}

function buildAgencyMarketSummary(listings: Array<{ suburb?: string; type: string }>) {
  const bySuburb = new Map<string, number>();
  const byType = new Map<string, number>();

  for (const listing of listings) {
    if (listing.suburb) bySuburb.set(listing.suburb, (bySuburb.get(listing.suburb) ?? 0) + 1);
    byType.set(listing.type, (byType.get(listing.type) ?? 0) + 1);
  }

  const topSuburb = Array.from(bySuburb.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? 'Mixed areas';
  const topType = Array.from(byType.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? 'Mixed';

  return { topSuburb, topType };
}

function AgencyPill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F7FA] p-4">
      <div className="text-sm font-black text-[#050A30]">{title}</div>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{text}</p>
    </div>
  );
}
