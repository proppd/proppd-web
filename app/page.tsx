import { FeaturedAgents } from '@/components/home/featured-agents';
import { FeaturedListings } from '@/components/home/featured-listings';
import { HomeTrustStrip } from '@/components/home/home-trust-strip';
import { HomeValueSection } from '@/components/home/home-value-section';
import { HeroSearch } from '@/components/home/hero-search';
import { PopularAreas } from '@/components/home/popular-areas';
import { SupportStrip } from '@/components/home/support-strip';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <HeroSearch />
      <FeaturedListings />
      <HomeTrustStrip />
      <HomeValueSection />
      <PopularAreas />
      <SupportStrip />
      <FeaturedAgents />
      <SiteFooter />
    </main>
  );
}
