import { FeaturedAgents } from '@/components/home/featured-agents';
import { FeaturedListings } from '@/components/home/featured-listings';
import { HomeTrustStrip } from '@/components/home/home-trust-strip';
import { HomeValueSection } from '@/components/home/home-value-section';
import { HeroSearch } from '@/components/home/hero-search';
import { PopularAreas } from '@/components/home/popular-areas';
import { RecentlyViewed } from '@/components/properties/recently-viewed';
import { SupportStrip } from '@/components/home/support-strip';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Proppd',
            url: 'https://proppd.com',
            description: 'South African property portal for verified listings, direct enquiries, and agent-led stock.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://proppd.com/properties?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <SiteHeader />
      <HeroSearch />
      <FeaturedListings />
      <HomeTrustStrip />
      <HomeValueSection />
      <PopularAreas />
      <SupportStrip />
      <FeaturedAgents />
      <RecentlyViewed />
      <SiteFooter />
    </main>
  );
}
