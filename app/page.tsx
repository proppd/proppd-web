import { FeaturedAgents } from '@/components/home/featured-agents';
import { FeaturedListings } from '@/components/home/featured-listings';
import { HomeValueSection } from '@/components/home/home-value-section';
import { HeroSearch } from '@/components/home/hero-search';
import { PopularAreas } from '@/components/home/popular-areas';
import { PpraTrustSection } from '@/components/home/ppra-trust-section';
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
      <section className="border-t border-[#E5E7EB] bg-white px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold tracking-[-.04em] text-[#1A1A2E] sm:text-3xl">
            Property in South Africa, verified from the start.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-[#6B7280]">
            <p>
              Proppd is a South African property portal built around a simple idea: every listing should
              come with enough agency, mandate, and property context for a buyer or tenant to make the next
              click with confidence. Whether you are searching for a family home in Sandton, a seaside
              apartment in Sea Point, or a rental in Umhlanga, Proppd connects you directly with PPRA-verified
              estate agents who have the local knowledge and legal standing to guide your transaction.
            </p>
            <p>
              Unlike portals that prioritise listing volume over quality, Proppd focuses on enquiry-ready
              listings. Each property is linked to a named agency, shows the mandate type, and includes a
              clear enquiry route. That means when you contact an agent through Proppd, you know exactly who
              you are dealing with and how your enquiry will be handled — no lead auctions, no fake
              contacts, no dead-end forms.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-6">
              <h3 className="text-lg font-bold text-[#1A1A2E]">Property for sale</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Browse verified homes for sale across South Africa&apos;s most searched suburbs — from
                Bryanston and Sandton in Gauteng to Sea Point and the V&amp;A Waterfront in Cape Town.
                Filter by price, bedrooms, bathrooms, and property type to find homes that match your
                budget and lifestyle. Each listing includes a mortgage calculator, neighbourhood context,
                and a direct enquiry route to the listing agent.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-6">
              <h3 className="text-lg font-bold text-[#1A1A2E]">Property to rent</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Find rental homes from PPRA-verified agents across Johannesburg, Cape Town, Durban, and
                Pretoria. Whether you need a one-bedroom apartment in Rosebank, a family cluster in
                Fourways, or a furnished unit in Strathavon, Proppd&apos;s rental listings show monthly
                pricing, lease context, and agent details upfront so you can enquire with confidence.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] p-6">
              <h3 className="text-base font-bold text-[#1A1A2E]">PPRA-verified agents</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Every agent on Proppd is checked against the Property Practitioners Regulatory Authority
                database. Look for the PPRA badge on agent profiles and listings — it means the agent
                holds a valid Fidelity Fund Certificate.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6">
              <h3 className="text-base font-bold text-[#1A1A2E]">Bond calculator</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Each listing includes a built-in bond calculator with current South African interest rates.
                Adjust the deposit, term, and rate to see your estimated monthly repayment before you
                enquire, then start the pre-approval process directly from the listing page.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] p-6">
              <h3 className="text-base font-bold text-[#1A1A2E]">Neighbourhood context</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Proppd shows walk scores, nearby schools, and amenities for every listing so you can
                evaluate the area, not just the property. Make informed decisions with local data on
                transport, green spaces, and schooling options.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewed />
      <SiteFooter />
    </main>
  );
}
