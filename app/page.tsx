import { FeaturedAgents } from '@/components/home/featured-agents';
import { FeaturedListings } from '@/components/home/featured-listings';
import { HomeTrustStrip } from '@/components/home/home-trust-strip';
import { HeroSearch } from '@/components/home/hero-search';
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
      <SupportStrip />
      <FeaturedAgents />
      <SiteFooter />
    </main>
  );
}
