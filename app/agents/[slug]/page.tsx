import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, Building2, Mail, MapPin } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { agents, listings } from '@/lib/demo-data';
import { findAgentBySlug, formatDirectoryCount, getAgentListings, slugifyDirectoryName } from '@/lib/directory';

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: slugifyDirectoryName(agent.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = findAgentBySlug(agents, slug);

  if (!agent) {
    return { title: 'Agent not found' };
  }

  return {
    title: agent.name,
    description: `${agent.name} is a verified Proppd agent in ${agent.area} with ${agent.listings} active listing${agent.listings === 1 ? '' : 's'}.`,
    alternates: { canonical: `/agents/${slugifyDirectoryName(agent.name)}` },
  };
}

export default async function AgentProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = findAgentBySlug(agents, slug);
  if (!agent) notFound();

  const activeListings = getAgentListings(listings, agent.name);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#3B49FF] to-[#12D6C5] text-3xl font-black text-white">
                  {agent.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
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
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <ProfileStat label="Agency" value={agent.agency} icon={<Building2 size={18} />} />
                <ProfileStat label="Area" value={agent.area} icon={<MapPin size={18} />} />
                <ProfileStat label="Demo stock" value={formatDirectoryCount(activeListings.length, 'listing')} icon={<BadgeCheck size={18} />} />
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
