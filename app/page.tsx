import { FeaturedListings } from '@/components/home/featured-listings';
import { HeroSearch } from '@/components/home/hero-search';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <HeroSearch />
      <FeaturedListings />
      <SiteFooter />
    </main>
  );
}
