import { AgentCta } from '@/components/home/agent-cta';
import { FeaturedAgents } from '@/components/home/featured-agents';
import { FeaturedListings } from '@/components/home/featured-listings';
import { HeroSearch } from '@/components/home/hero-search';
import { MarketPulse } from '@/components/home/market-pulse';
import { SupportStrip } from '@/components/home/support-strip';
import { ValueProps } from '@/components/home/value-props';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <HeroSearch />
      <MarketPulse />
      <FeaturedListings />
      <FeaturedAgents />
      <SupportStrip />
      <ValueProps />
      <AgentCta />
      <SiteFooter />
    </main>
  );
}
