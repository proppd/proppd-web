import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, Building2, Mail, MapPin } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalAgentBySlug, loadPortalListings } from '../../../lib/proppd/backend';
import { agents as demoAgents, listings as demoListings } from '@/lib/demo-data';
import { formatDirectoryCount, getAgentListings, slugifyDirectoryName } from '@/lib/directory';

export function generateStaticParams() {
  return demoAgents.map((agent) => ({ slug: slugifyDirectoryName(agent.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const portalAgent = await loadPortalAgentBySlug(slug);
  const agent = portalAgent.items[0] ?? demoAgents.find((entry) => slugifyDirectoryName(entry.name) === slug);

  if (!agent) {
    return { title: 'Agent not found' };
  }

  return {
    title: agent.name,
    description: `${agent.name} is a verified Proppd agent in ${agent.area} with ${agent.listings} active listing${agent.listings === 1 ? '' : 's'}.`,
    alternates: { canonical: `/agents/${slugifyDirectoryName(agent.name)}` },
  };
}

export const dynamic = 'force-dynamic';

export default async function AgentProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portalAgent = await loadPortalAgentBySlug(slug);
  const agent = portalAgent.items[0] ?? demoAgents.find((entry) => slugifyDirectoryName(entry.name) === slug);
  if (!agent) notFound();

  const portalListings = await loadPortalListings();
  const activeListings = getAgentListings(portalListings.source === 'demo' ? demoListings : portalListings.items, agent.name);
  const agentMarketSummary = buildAgentMarketSummary(activeListings);
  const directoryStateLabel =
    portalAgent.source === 'database'
      ? 'Live agent profile connected'
      : portalAgent.source === 'empty'
        ? 'Live directory connected, profile not yet published'
        : portalAgent.source === 'demo'
          ? 'Demo agent profile'
          : 'Agent profile unavailable';
  const listingStateLabel =
    portalListings.source === 'database'
      ? 'Live listings connected'
      : portalListings.source === 'empty'
        ? 'Live listings connected, none active'
        : portalListings.source === 'demo'
          ? 'Demo stock'
          : 'Listings unavailable';

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#3B49FF] to-[#12D6C5] text-3xl font-black text-white">
                  {agent.name.split(' ').map((part: string) => part[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#E9FFFC] px-4 py-2 text-xs font-black uppercase tracking-[.14em] text-[#087d75]">
                    <BadgeCheck size={15} /> Verified profile
                  </div>
                  <h1 className="mt-3 text-5xl font-black tracking-[-.07em] sm:text-6xl">{agent.name}</h1>
                </div>
              </div>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                {agent.name} helps buyers, tenants, and sellers across {agent.area}. This profile is wired to Proppd's verified enquiry foundation and active listing data.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.16em]">
                <span className="rounded-full bg-[#E9FFFC] px-4 py-2 text-[#087d75]">{directoryStateLabel}</span>
                <span className="rounded-full bg-[#F5F7FA] px-4 py-2 text-slate-600">{listingStateLabel}</span>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <ProfileStat label="Agency" value={agent.agency} icon={<Building2 size={18} />} />
                <ProfileStat label="Area" value={agent.area} icon={<MapPin size={18} />} />
                <ProfileStat label="Active listings" value={formatDirectoryCount(activeListings.length, 'listing')} icon={<BadgeCheck size={18} />} />
              </div>
            </div>
            <aside className="rounded-[2.5rem] bg-[#050A30] p-7 text-white shadow-2xl shadow-slate-300/50">
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#12D6C5]">Contact agent</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Send a verified enquiry</h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Best for viewing requests, valuation follow-ups, and direct questions about this agent&apos;s active listings.
              </p>
              <a
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#050A30]"
                href={`mailto:info@proppd.com?subject=Agent enquiry: ${agent.name}`}
              >
                <Mail size={18} /> Email enquiry
              </a>
              <a
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 font-black text-white hover:bg-white/5"
                href={`/properties?agent=${encodeURIComponent(agent.name)}`}
              >
                Browse this agent&apos;s listings
              </a>
            </aside>
          </div>

          <div className="mt-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Active listings</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Listed by {agent.name}</h2>
            </div>
            <a className="hidden rounded-full bg-white px-5 py-3 text-sm font-black text-[#3B49FF] shadow-sm sm:inline-flex" href={`/properties?agent=${encodeURIComponent(agent.name)}`}>
              View all
            </a>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {activeListings.map((listing) => (
              <a key={listing.slug} href={`/property/${listing.slug}`} aria-label={`View ${listing.title}`}>
                <ListingCard listing={listing} />
              </a>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Working with this agent</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">A clean path from search to enquiry.</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <ProfilePill title="Search" text="Filter by area, stock, or school catchment." />
                <ProfilePill title="Shortlist" text="Open listing details and compare verified options." />
                <ProfilePill title="Reach out" text="Send a structured enquiry or viewing request." />
              </div>
              <div className="mt-5 rounded-3xl bg-[#F5F7FA] p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Current market snapshot</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <SnapshotPill label="Active stock" value={formatDirectoryCount(activeListings.length, 'listing')} />
                  <SnapshotPill label="Top suburb" value={agentMarketSummary.topSuburb} />
                  <SnapshotPill label="Top type" value={agentMarketSummary.topType} />
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] bg-[#050A30] p-6 text-white shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Need a shortlist?</p>
              <p className="mt-2 text-2xl font-black tracking-[-.04em]">Focus on the right local stock.</p>
              <p className="mt-3 text-sm font-bold leading-6 text-white/70">
                {activeListings.length} verified listing{activeListings.length === 1 ? '' : 's'} are currently tied to {agent.name}. Save the agent, compare the cards, and send a structured enquiry when you are ready.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <SnapshotPill label="Agency" value={agent.agency} dark />
                <SnapshotPill label="Area" value={agent.area} dark />
                <SnapshotPill label="Listings" value={String(activeListings.length)} dark />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#050A30] shadow-sm" href={`/properties?agent=${encodeURIComponent(agent.name)}`}>
                  Browse listings
                </a>
                <a className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/5" href={`mailto:info@proppd.com?subject=Agent enquiry: ${agent.name}`}>
                  Email agent
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

function ProfileStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-[#F5F7FA] p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-slate-400">{icon} {label}</div>
      <div className="mt-2 text-lg font-black text-[#050A30]">{value}</div>
    </div>
  );
}

function SnapshotPill({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-3xl p-4 ${dark ? 'bg-white/8' : 'bg-white'}`}>
      <div className={`text-xs font-black uppercase tracking-[.14em] ${dark ? 'text-[#12D6C5]' : 'text-slate-400'}`}>{label}</div>
      <div className={`mt-2 text-sm font-black leading-6 ${dark ? 'text-white' : 'text-[#050A30]'}`}>{value}</div>
    </div>
  );
}

function buildAgentMarketSummary(listings: Array<{ suburb?: string; type: string }>) {
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

function ProfilePill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F7FA] p-4">
      <div className="text-sm font-black text-[#050A30]">{title}</div>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{text}</p>
    </div>
  );
}
