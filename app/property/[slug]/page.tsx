import { ArrowLeft, Bath, BedDouble, Building2, CalendarDays, Car, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';
import { buildEnquiryMailto, buildListingShareText, getListingBySlug, getListingFacts, getRelatedListings } from '@/lib/listings/details';

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListingBySlug(listings, slug);
  if (!listing) notFound();

  const facts = getListingFacts(listing);
  const relatedListings = getRelatedListings(listings, listing, 2);
  const enquiryHref = buildEnquiryMailto(listing);
  const shareText = buildListingShareText(listing);

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

            <aside className="h-fit rounded-[2.5rem] bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#3B49FF]">Enquire safely</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Contact {listing.agent}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Send a prefilled enquiry to Proppd. The full Supabase lead workflow is staged behind this POPIA-aware handoff.
              </p>
              <div className="mt-5 rounded-3xl bg-[#F5F7FA] p-4 text-sm text-slate-600">
                <p className="font-black text-[#050A30]">Your enquiry includes:</p>
                <ul className="mt-3 space-y-2 font-bold">
                  <li>• Listing title and price</li>
                  <li>• Proppd property URL</li>
                  <li>• Agent routing context</li>
                </ul>
              </div>
              <a className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#050A30] px-5 py-3 font-black text-white shadow-lg shadow-slate-900/10" href={enquiryHref}>
                <span className="text-white">Email enquiry</span>
              </a>
              <a className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30]" href={`/agents/${slugifyName(listing.agent)}`}>
                View agent profile
              </a>
              <p className="mt-5 rounded-2xl bg-[#eefcf9] p-4 text-xs font-bold leading-5 text-[#0f766e]">
                POPIA note: only send personal details you are comfortable sharing for this property enquiry.
              </p>
              <div className="mt-5 rounded-2xl border border-slate-200 p-4 text-xs font-mono leading-5 text-slate-500">
                {shareText}
              </div>
            </aside>
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
