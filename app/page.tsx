import { FeaturedListings } from '@/components/home/featured-listings';
import { HomeTrustStrip } from '@/components/home/home-trust-strip';
import { HeroSearch } from '@/components/home/hero-search';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <HeroSearch />
      <FeaturedListings />
      <HomeTrustStrip />
      <SiteFooter />
    </main>
  );
}
