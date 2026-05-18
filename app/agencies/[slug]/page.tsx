import { notFound } from 'next/navigation';
import { Building2, Mail, MapPin, ShieldCheck, Users } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { agencies, agents, listings } from '@/lib/demo-data';
import { findAgencyBySlug, formatDirectoryCount, getAgencyAgents, getAgencyListings, slugifyDirectoryName } from '@/lib/directory';

export function generateStaticParams() {
  return agencies.map((agency) => ({ slug: slugifyDirectoryName(agency.name) }));
}

export default async function AgencyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agency = findAgencyBySlug(agencies, slug);
  if (!agency) notFound();

  const team = getAgencyAgents(agents, agency.name);
  const activeListings = getAgencyListings(listings, agency.name);

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
              <AgencyMetric icon={<ShieldCheck size={18} />} label="Demo stock" value={formatDirectoryCount(activeListings.length, 'listing')} />
              <AgencyMetric icon={<Building2 size={18} />} label="Status" value="Verified agency" />
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
                Send a launch enquiry for valuations, mandates, listing corrections, or joining the Proppd rollout.
              </p>
              <a
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#050A30]"
                href={`mailto:info@proppd.com?subject=Agency enquiry: ${agency.name}`}
              >
                <Mail size={18} /> Email agency
              </a>
            </aside>
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
