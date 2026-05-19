import type { ReactNode } from 'react';
import { ArrowLeft, Bath, BedDouble, Building2, CalendarDays, Car, CheckCircle2, Heart, Home, MapPin, Share2, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EnquiryForm } from '@/components/property/enquiry-form';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';
import { buildListingShareText, getListingBySlug, getListingFacts, getRelatedListings } from '@/lib/listings/details';

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListingBySlug(listings, slug);
  if (!listing) notFound();

  const facts = getListingFacts(listing);
  const relatedListings = getRelatedListings(listings, listing, 2);
  const shareText = buildListingShareText(listing);
  const agentProfileHref = `/agents/${slugifyName(listing.agent)}`;

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <a href="/properties" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-[#050A30] hover:border-[#3B49FF] hover:text-[#3B49FF]">
            <ArrowLeft size={16} /> Back to search
          </a>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black"><Share2 size={15} /> Share</button>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#050A30] px-4 py-2 text-sm font-black text-white"><Heart size={15} /> Save</button>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 overflow-hidden rounded-[2rem] bg-white p-3 shadow-sm lg:grid-cols-[1.35fr_.65fr]">
            <div className={`relative min-h-[25rem] overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${listing.gradient} p-6 text-white`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,.42),transparent_14rem),linear-gradient(180deg,rgba(5,10,48,0)_30%,rgba(5,10,48,.65)_100%)]" />
              <div className="relative flex gap-2">
                <span className="rounded-md bg-white px-3 py-1 text-xs font-black uppercase tracking-[.08em] text-[#050A30]">{listing.purpose}</span>
                <span className="rounded-md bg-[#12D6C5] px-3 py-1 text-xs font-black uppercase tracking-[.08em] text-[#050A30]">Verified</span>
              </div>
              <div className="relative mt-48 max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur"><MapPin size={16} /> {listing.location}</p>
                <h1 className="mt-4 text-4xl font-black tracking-[-.065em] sm:text-6xl">{listing.title}</h1>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {listing.highlights.slice(0, 2).map((highlight, index) => (
                <div key={highlight} className={`relative min-h-48 overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${listing.gradient} p-5 text-white`}>
                  <div className="absolute inset-0 bg-[#050A30]/25" />
                  <div className="relative flex h-full flex-col justify-between">
                    <span className="w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#050A30]">Photo {index + 2} / 18</span>
                    <p className="text-xl font-black tracking-[-.03em]">{highlight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_390px]">
            <article className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-4xl font-black tracking-[-.05em] text-[#050A30]">{listing.price}</div>
                    <p className="mt-2 flex items-center gap-2 text-base font-bold text-slate-600"><MapPin size={17} /> {listing.location}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center sm:min-w-[28rem]">
                    <FactIcon icon={<BedDouble size={20} />} value={String(listing.beds)} label="Beds" />
                    <FactIcon icon={<Bath size={20} />} value={String(listing.baths)} label="Baths" />
                    <FactIcon icon={<Car size={20} />} value={String(listing.parking)} label="Parking" />
                    <FactIcon icon={<Home size={20} />} value={listing.type} label="Type" />
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Overview</p>
                  <p className="mt-4 text-lg leading-8 text-slate-700">{listing.description}</p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {listing.highlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl border border-slate-200 bg-[#F5F7FA] p-4 text-sm font-black">
                      <ShieldCheck className="mb-3 text-[#12D6C5]" size={20} /> {highlight}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black tracking-[-.04em]">What this home offers</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {listing.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <CheckCircle2 className="text-[#12D6C5]" size={19} /> {feature}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black tracking-[-.04em]">Property details</h2>
                <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 text-sm">
                      <span className="font-bold text-slate-500">{fact.label}</span>
                      <span className="text-right font-black text-[#050A30]">{fact.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 text-sm">
                    <span className="font-bold text-slate-500">Agency</span>
                    <span className="text-right font-black text-[#050A30]">{listing.agency}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 text-sm">
                    <span className="font-bold text-slate-500">Listed</span>
                    <span className="text-right font-black text-[#050A30]">{formatDate(listing.listedAt)}</span>
                  </div>
                </div>
              </section>
            </article>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="mb-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#3B49FF]/10 text-[#3B49FF]"><Building2 size={22} /></div>
                  <div>
                    <p className="text-sm font-black text-[#050A30]">{listing.agent}</p>
                    <p className="text-xs font-bold text-slate-500">{listing.agency}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
                  <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#12D6C5]" /> {listing.mandate}</span>
                  <span className="flex items-center gap-2"><CalendarDays size={16} /> Listed {formatDate(listing.listedAt)}</span>
                </div>
              </div>
              <EnquiryForm
                agentProfileHref={agentProfileHref}
                listing={{
                  id: listing.id,
                  slug: listing.slug,
                  title: listing.title,
                  price: listing.price,
                  agent: listing.agent,
                  agency: listing.agency,
                }}
                shareText={shareText}
              />
            </aside>
          </div>

          {relatedListings.length > 0 && (
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Keep browsing</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Similar homes you may like</h2>
                </div>
                <a href="/properties" className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#050A30] sm:inline-flex">
                  View all
                </a>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {relatedListings.map((related) => (
                  <ListingCard key={related.slug} listing={related} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function FactIcon({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[#F5F7FA] p-3">
      <div className="mx-auto grid h-8 w-8 place-items-center text-[#3B49FF]">{icon}</div>
      <div className="mt-1 truncate text-lg font-black">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{label}</div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
