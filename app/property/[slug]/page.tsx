import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Bath, BedDouble, Building2, CalendarDays, Car, CheckCircle2, Home, MapPin, Share2, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EnquiryForm } from '@/components/property/enquiry-form';
import { ReportListingButton } from '@/components/property/report-listing';
import { MortgageCalculator } from '@/components/finance/mortgage-calculator';
import { PreApprovalForm } from '@/components/finance/pre-approval-form';
import { NeighborhoodContext } from '@/components/property/neighborhood-context';
import { PhotoLightbox } from '@/components/property/photo-lightbox';
import { MobileEnquiryBar } from '@/components/property/mobile-enquiry-bar';
import { PriceHistory } from '@/components/property/price-history';
import { PropertyTracking } from '@/components/property/property-tracking';
import { ListingCard } from '@/components/properties/listing-card';
import { SaveListingButton } from '@/components/properties/save-listing-button';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { loadPortalDiagnostics, loadPortalListingBySlug, loadPortalListings, loadPortalAgents } from '../../../lib/proppd/backend';
import { PpraVerificationDialog } from '@/components/agent/ppra-verification-dialog';
import { PpraVerifiedBadge } from '@/components/agent/ppra-verified-badge';
import { listings as demoListings } from '@/lib/demo-data';
import { buildEnquiryMailto, buildListingShareText, getListingBySlug, getListingFacts, getRelatedListings } from '@/lib/listings/details';

export function generateStaticParams() {
  return demoListings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const portalListing = await loadPortalListingBySlug(slug);
  const listing = portalListing.items[0] ?? getListingBySlug(demoListings, slug);

  if (!listing) {
    return { title: 'Property not found' };
  }

  const ogImage = listing.photos[0]?.src;
  const ogImageAlt = listing.photos[0]?.alt ?? listing.title;

  return {
    title: listing.title,
    description: `${listing.title} in ${listing.location} is listed by ${listing.agent} at ${listing.price}. View photos, facts, and verified enquiry details on Proppd.`,
    alternates: { canonical: `/property/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description: `${listing.title} in ${listing.location} · ${listing.price}`,
      url: `/property/${listing.slug}`,
      siteName: 'Proppd',
      type: 'website',
      images: ogImage ? [{ url: ogImage, alt: ogImageAlt }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: listing.title,
      description: `${listing.title} in ${listing.location} · ${listing.price}`,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [portalListing, portalListings, diagnostics, portalAgents] = await Promise.all([
    loadPortalListingBySlug(slug),
    loadPortalListings(),
    loadPortalDiagnostics(),
    loadPortalAgents(),
  ]);
  const listing = portalListing.items[0] ?? getListingBySlug(demoListings, slug);
  if (!listing) notFound();

  const listingAgent = portalAgents.items.find((a) => a.name === listing.agent);

  const facts = getListingFacts(listing);
  const relatedSourceListings = portalListings.source === 'database' ? portalListings.items : demoListings;
  const relatedListings = getRelatedListings(relatedSourceListings, listing, 2);
  const shareText = buildListingShareText(listing);
  const agentProfileHref = `/agents/${slugifyName(listing.agent)}`;
  const listingSourceLabel = getListingSourceLabel(portalListing.source);
  const relatedSourceLabel = getRelatedSourceLabel(portalListings.source);
  const leadRoutingLive = diagnostics.databaseConfigured && diagnostics.canReadDatabase;
  const leadRoutingLabel = leadRoutingLive ? 'Enquiry route confirmed' : 'Direct email route available';
  const leadRoutingDetail = leadRoutingLive
    ? 'Your enquiry is captured securely and routed to the relevant agent or agency.'
    : 'Your enquiry can open in email so the agent still receives a clear handoff.';

  return (
    <main className="proppd-page pb-20 lg:pb-0">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: listing.title,
            description: listing.description,
            url: `/property/${listing.slug}`,
            image: listing.photos[0]?.src,
            offers: {
              '@type': 'Offer',
              price: listing.priceValue,
              priceCurrency: 'ZAR',
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: listing.city,
              addressRegion: listing.province,
              addressCountry: 'ZA',
            },
            numberOfBedrooms: listing.beds,
            numberOfBathroomsTotal: listing.baths,
            agent: {
              '@type': 'Person',
              name: listing.agent,
              worksFor: {
                '@type': 'Organization',
                name: listing.agency,
              },
            },
          }),
        }}
      />
      <PropertyTracking
        slug={listing.slug}
        title={listing.title}
        price={listing.price}
        location={listing.location}
        beds={listing.beds}
        baths={listing.baths}
        photo={listing.photos[0]?.src ?? ''}
      />
      <SiteHeader />

      <div className="border-b border-[#E5E7EB] bg-white px-4 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Properties', href: '/properties' },
              { label: listing.purpose === 'For sale' ? 'For sale' : 'To rent', href: listing.purpose === 'For sale' ? '/properties/for-sale' : '/properties/to-rent' },
              { label: listing.title },
            ]}
          />
        </div>
      </div>

      <section className="border-b border-[#E5E7EB] bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <a href="/properties" className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-[#1A1A2E] hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
            <ArrowLeft size={16} /> Back to search
          </a>
          <div className="flex items-center gap-2">
            <a href={buildShareMailto(listing)} className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-bold"><Share2 size={15} /> Share</a>
            <SaveListingButton
              slug={listing.slug}
              title={listing.title}
 className="inline-flex items-center gap-2 rounded-full bg-[#4A3AFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 overflow-hidden rounded-xl bg-white p-3 shadow-sm lg:grid-cols-[1.35fr_.65fr]">
            <div className={`relative min-h-[16rem] overflow-hidden rounded-lg bg-gradient-to-br ${listing.gradient} p-4 text-white sm:min-h-[25rem] sm:p-6`}>
              <PhotoLightbox photos={listing.photos} startIndex={0} />
              {listing.photos[0]?.src && (
                <Image
                  src={listing.photos[0].src}
                  alt={listing.photos[0]?.alt ?? listing.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,48,.12)_0%,rgba(5,10,48,.08)_42%,rgba(5,10,48,.82)_100%)]" />
              <div className="relative flex gap-2">
                <span className="rounded-md bg-white px-3 py-1 text-xs font-bold uppercase tracking-[.08em] text-[#1A1A2E]">{listing.purpose}</span>
                <a href="#verification" className="rounded-md bg-[#DBEAFE] px-3 py-1 text-xs font-bold uppercase tracking-[.08em] text-[#1A1A2E] transition hover:bg-white">Verified</a>
              </div>
              <div className="relative mt-20 max-w-3xl sm:mt-48">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur sm:px-4 sm:py-2 sm:text-sm"><MapPin size={14} /> {listing.location}</p>
                <h1 className="mt-3 text-2xl font-bold tracking-[-.065em] sm:mt-4 sm:text-4xl lg:text-6xl">{listing.title}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SourceBadge tone="sky">{listingSourceLabel}</SourceBadge>
                  <SourceBadge tone="emerald">{relatedSourceLabel}</SourceBadge>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#1A1A2E] shadow-lg backdrop-blur sm:bottom-6 sm:right-6 sm:px-4 sm:py-2 sm:text-sm">
                View all {listing.photos.length} photos
              </div>
            </div>
            <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-1">
              {listing.photos.slice(1, 3).map((photo, index) => (
                <div key={photo.src} className={`group relative min-h-48 overflow-hidden rounded-lg bg-gradient-to-br ${listing.gradient} p-5 text-white`}>
                  {photo.src && (
                    <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,48,.18)_0%,rgba(5,10,48,.62)_100%)]" />
                  {/* Open the gallery at this photo */}
                  <PhotoLightbox photos={listing.photos} startIndex={index + 1} />
                  <div className="relative flex h-full flex-col justify-between">
                    <span className="w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1A1A2E]">Photo {index + 2} / {listing.photos.length}</span>
                    <p className="text-xl font-bold tracking-[-.03em]">{listing.highlights[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_390px]">
            <article className="space-y-6">
              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 border-b border-[#F3F4F6] pb-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-4xl font-bold tracking-[-.05em] text-[#1A1A2E]">{listing.price}</div>
                    <p className="mt-2 flex items-center gap-2 text-base font-bold text-[#6B7280]"><MapPin size={17} /> {listing.location}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center sm:min-w-[28rem]">
                    <FactIcon icon={<BedDouble size={20} />} value={String(listing.beds)} label="Beds" />
                    <FactIcon icon={<Bath size={20} />} value={String(listing.baths)} label="Baths" />
                    <FactIcon icon={<Car size={20} />} value={String(listing.parking)} label="Parking" />
                    <FactIcon icon={<Home size={20} />} value={listing.type} label="Type" />
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Overview</p>
                  <p className="mt-4 text-lg leading-8 text-[#6B7280]">{listing.description}</p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {listing.highlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 text-sm font-bold">
                      <ShieldCheck className="mb-3 text-[#2563EB]" size={20} /> {highlight}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold tracking-[-.04em]">What this home offers</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {listing.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-bold text-[#6B7280]">
                      <CheckCircle2 className="text-[#2563EB]" size={19} /> {feature}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold tracking-[-.04em]">Property details</h2>
                <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] pb-4 text-sm">
                      <span className="font-bold text-[#9CA3AF]">{fact.label}</span>
                      <span className="text-right font-bold text-[#1A1A2E]">{fact.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] pb-4 text-sm">
                    <span className="font-bold text-[#9CA3AF]">Agency</span>
                    <span className="text-right font-bold text-[#1A1A2E]">{listing.agency}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] pb-4 text-sm">
                    <span className="font-bold text-[#9CA3AF]">Listed</span>
                    <span className="text-right font-bold text-[#1A1A2E]">{formatDate(listing.listedAt)}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <PriceHistory listingPrice={listing.priceValue} listedAt={listing.listedAt} />
              </section>

              <section id="verification" className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 shadow-sm sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">How verification works</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
                  <div>
                    <h2 className="text-2xl font-bold tracking-[-.04em] text-[#1A1A2E]">A clearer handoff before you enquire.</h2>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#2563EB]">
                      Proppd marks a listing as verified when the listing has enough agency, mandate, and property context for a buyer or tenant to make the next click with confidence.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <VerificationPoint title="Agency named" text={listing.agency} />
                    <VerificationPoint title="Mandate shown" text={listing.mandate} />
                    <VerificationPoint title="Handoff route" text={leadRoutingLive ? 'Portal enquiry route' : 'Email enquiry route'} />
                  </div>
                </div>
                <div className="mt-5 border-t border-[#BFDBFE] pt-4">
                  <ReportListingButton listing={{ slug: listing.slug, title: listing.title, agent: listing.agent, agency: listing.agency }} />
                </div>
              </section>
            </article>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#4A3AFF] text-sm font-bold text-white">{agentInitials(listing.agent)}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#1A1A2E]">{listing.agent}</p>
                    <p className="flex items-center gap-1 truncate text-xs font-bold text-[#9CA3AF]"><Building2 size={12} className="shrink-0" /> {listing.agency}</p>
                  </div>
                  {listingAgent?.isVerified && listingAgent.ffcNumber ? (
                    <PpraVerificationDialog agentName={listing.agent} ffcNumber={listingAgent.ffcNumber} size="sm" className="ml-auto shrink-0" />
                  ) : listingAgent?.isVerified ? (
                    <PpraVerifiedBadge size="sm" className="ml-auto shrink-0" />
                  ) : null}
                </div>
                <div className="mt-4 grid gap-2 text-sm font-bold text-[#6B7280]">
                  <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#2563EB]" /> {listing.mandate}</span>
                  <span className="flex items-center gap-2"><CalendarDays size={16} /> Listed {formatDate(listing.listedAt)}</span>
                </div>
                <a href={agentProfileHref} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2.5 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                  View agent profile <ArrowRight size={15} />
                </a>
              </div>
              <div className="mb-4">
                <MortgageCalculator price={listing.priceValue} />
              </div>
              <div className="mb-4">
                <NeighborhoodContext location={listing.location} city={listing.city} />
              </div>
              <div className="mb-4">
                <PreApprovalForm listingPrice={listing.priceValue} listingTitle={listing.title} />
              </div>
              <div id="enquiry" className="scroll-mt-24">
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
                  routingLabel={leadRoutingLabel}
                  routingDetail={leadRoutingDetail}
                />
              </div>
            </aside>
          </div>

          {relatedListings.length > 0 && (
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Keep browsing</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">Similar homes you may like</h2>
                </div>
                <a href="/properties" className="hidden rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] sm:inline-flex">
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

      <MobileEnquiryBar price={listing.price} agent={listing.agent} />
    </main>
  );
}

function FactIcon({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] p-3">
      <div className="mx-auto grid h-8 w-8 place-items-center text-[#4A3AFF]">{icon}</div>
      <div className="mt-1 truncate text-lg font-bold">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#9CA3AF]">{label}</div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function agentInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildShareMailto(listing: { title: string; slug: string }) {
  const subject = encodeURIComponent(`Proppd listing: ${listing.title}`);
  const body = encodeURIComponent(`I found this Proppd listing worth reviewing: ${listing.title}\n\n/property/${listing.slug}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

function VerificationPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A2E]"><ShieldCheck size={16} className="text-[#2563EB]" /> {title}</div>
      <p className="mt-2 text-sm font-bold leading-5 text-[#6B7280]">{text}</p>
    </div>
  );
}

function getListingSourceLabel(source: 'database' | 'demo' | 'empty' | 'error') {
  if (source === 'database') return 'Verified listing';
  if (source === 'demo') return 'Verified listing';
  if (source === 'empty') return 'Verification pending';
  return 'Enquiry-ready listing';
}

function getRelatedSourceLabel(source: 'database' | 'demo' | 'empty' | 'error') {
  if (source === 'database') return 'Similar verified homes';
  if (source === 'demo') return 'Verified market matches';
  if (source === 'empty') return 'Similar homes coming soon';
  return 'Curated similar homes';
}

function SourceBadge({ children, tone }: { children: ReactNode; tone: 'sky' | 'emerald' }) {
  const toneClasses = tone === 'sky' ? 'bg-[#4A3AFF]/10 text-[#4A3AFF] ring-[#4A3AFF]/15' : 'bg-[#DBEAFE] text-[#2563EB] ring-[#2563EB]/20';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] ring-1 ${toneClasses}`}>
      {children}
    </span>
  );
}
