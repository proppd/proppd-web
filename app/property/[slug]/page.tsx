import { ArrowLeft, Bath, BedDouble, Building2, CalendarDays, Car, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
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

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <a href="/properties" className="inline-flex items-center gap-2 text-sm font-black text-[#3B49FF]">
            <ArrowLeft size={16} /> Back to search
          </a>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
            <article className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm">
              <div className={`relative min-h-[390px] bg-gradient-to-br ${listing.gradient} p-6 text-white sm:p-8`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(18,214,197,.28),transparent_34%)]" />
                <div className="relative flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#050A30]">{listing.purpose}</span>
                  <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black backdrop-blur">{listing.mandate}</span>
                  <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black backdrop-blur">Proppd verified</span>
                </div>
                <div className="relative mt-28 max-w-3xl">
                  <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[.2em] text-white/70">
                    <MapPin size={16} /> {listing.location}
                  </p>
                  <h1 className="mt-4 text-4xl font-black tracking-[-.07em] sm:text-6xl">{listing.title}</h1>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-black">
                    <span className="rounded-2xl bg-white px-5 py-3 text-2xl text-[#050A30]">{listing.price}</span>
                    <span className="flex items-center gap-2 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur"><BedDouble size={18} /> {listing.beds} Beds</span>
                    <span className="flex items-center gap-2 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur"><Bath size={18} /> {listing.baths} Baths</span>
                    <span className="flex items-center gap-2 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur"><Car size={18} /> {listing.parking} Parking</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px]">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Listing overview</p>
                  <p className="mt-4 text-lg leading-8 text-slate-600">{listing.description}</p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {listing.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-[#F5F7FA] p-4 text-sm font-black">
                        <ShieldCheck className="text-[#12D6C5]" size={20} /> {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="mt-10">
                    <h2 className="text-2xl font-black tracking-[-.04em]">Features</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {listing.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          <CheckCircle2 className="text-[#12D6C5]" size={18} /> {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-5">
                  <h2 className="text-lg font-black">Property facts</h2>
                  <div className="mt-5 space-y-3">
                    {facts.map((fact) => (
                      <div key={fact.label} className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 text-sm last:border-0 last:pb-0">
                        <span className="font-bold text-slate-500">{fact.label}</span>
                        <span className="text-right font-black text-[#050A30]">{fact.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-3 text-sm font-bold text-slate-600">
                    <span className="flex items-center gap-2"><Building2 size={16} /> {listing.agency}</span>
                    <span className="flex items-center gap-2"><CalendarDays size={16} /> Listed {formatDate(listing.listedAt)}</span>
                  </div>
                </div>
              </div>
            </article>

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
          </div>

          {relatedListings.length > 0 && (
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Keep browsing</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Related verified listings</h2>
                </div>
                <a href="/properties" className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#050A30] sm:inline-flex">
                  View all
                </a>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {relatedListings.map((related) => (
                  <a key={related.slug} href={`/property/${related.slug}`} aria-label={`View ${related.title}`}>
                    <ListingCard listing={related} />
                  </a>
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
