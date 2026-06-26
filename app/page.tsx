import { FeaturedAgents } from '@/components/home/featured-agents';
import { FeaturedListings } from '@/components/home/featured-listings';
import { HomeValueSection } from '@/components/home/home-value-section';
import { HeroSearch } from '@/components/home/hero-search';
import { PopularAreas } from '@/components/home/popular-areas';
import { PpraTrustSection } from '@/components/home/ppra-trust-section';
import { SeoContentSection } from '@/components/home/seo-content-section';
import { RecentlyViewed } from '@/components/properties/recently-viewed';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { organizationSchema, websiteSchema, faqSchema } from '@/lib/seo/schema';

// Render on each request so live agent/listing changes (e.g. a profile
// name update) appear immediately instead of being frozen at build time.
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="proppd-page">
      {/* Organization + WebSite structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      {/* Homepage FAQ schema for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema([
              {
                question: 'What makes Proppd different from other South African property portals?',
                answer:
                  'Proppd is the only South African property portal where every agent is PPRA-verified. Each listing includes agency name, mandate context, and a clear enquiry route so buyers and tenants can make contact with confidence.',
              },
              {
                question: 'Is Proppd free to use for property seekers?',
                answer:
                  'Yes. Browsing property listings, searching by suburb or city, saving homes, and contacting agents are completely free for buyers, tenants, and property seekers.',
              },
              {
                question: 'What does PPRA-verified mean on Proppd?',
                answer:
                  'PPRA (Property Practitioners Regulatory Authority) verification means the estate agent holds a valid Fidelity Fund Certificate (FFC) issued by the PPRA. Proppd checks this automatically during agent onboarding and displays the verified badge on agent profiles and listings.',
              },
              {
                question: 'Can I list my property on Proppd?',
                answer:
                  'Properties are listed through PPRA-verified agents and agencies on Proppd. If you are an agent, you can sign up at proppd.com/for-agents. If you are a property owner, you can request a valuation and an agent will contact you.',
              },
            ]),
          ),
        }}
      />

      <SiteHeader />
      <HeroSearch />
      <FeaturedListings />
      <PopularAreas />
      <HomeValueSection />
      <FeaturedAgents />
      <PpraTrustSection />

      {/* SEO content section — adds topical depth for search engines */}
      <SeoContentSection />

      <RecentlyViewed />
      <SiteFooter />
    </main>
  );
}
