import { Home, Building, ShieldCheck, Calculator, MapPin } from 'lucide-react';

/**
 * SEO content section — adds topical depth for search engines while
 * matching the design language of other home page sections.
 *
 * Design alignment:
 * - max-w-7xl container (matches FeaturedListings, PopularAreas, etc.)
 * - Eyebrow label pattern (text-xs uppercase tracking-widest text-[#4A3AFF])
 * - rounded-xl cards with icon-in-colored-box pattern
 * - Standard header row (eyebrow + title + description)
 */
export function SeoContentSection() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">
            Property in South Africa
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
            Verified from the start.
          </h2>
          <p className="mt-2 text-[#6B7280]">
            Proppd is a South African property portal built around a simple idea: every listing should
            come with enough agency, mandate, and property context for a buyer or tenant to make the next
            click with confidence.
          </p>
        </div>

        {/* Body copy */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <p className="text-sm leading-relaxed text-[#6B7280]">
            Whether you are searching for a family home in Sandton, a seaside apartment in Sea Point, or
            a rental in Umhlanga, Proppd connects you directly with PPRA-verified estate agents who have
            the local knowledge and legal standing to guide your transaction.
          </p>
          <p className="text-sm leading-relaxed text-[#6B7280]">
            Unlike portals that prioritise listing volume over quality, Proppd focuses on enquiry-ready
            listings. Each property is linked to a named agency, shows the mandate type, and includes a
            clear enquiry route — no lead auctions, no fake contacts, no dead-end forms.
          </p>
        </div>

        {/* Feature cards — 2-up primary */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
                <Home size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">Property for sale</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              Browse verified homes for sale across South Africa&apos;s most searched suburbs — from
              Bryanston and Sandton in Gauteng to Sea Point and the V&amp;A Waterfront in Cape Town.
              Filter by price, bedrooms, bathrooms, and property type to find homes that match your
              budget and lifestyle. Each listing includes a mortgage calculator, neighbourhood context,
              and a direct enquiry route to the listing agent.
            </p>
            <a
              href="/properties/for-sale"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
            >
              Browse homes for sale
            </a>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
                <Building size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">Property to rent</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              Find rental homes from PPRA-verified agents across Johannesburg, Cape Town, Durban, and
              Pretoria. Whether you need a one-bedroom apartment in Rosebank, a family cluster in
              Fourways, or a furnished unit in Strathavon, Proppd&apos;s rental listings show monthly
              pricing, lease context, and agent details upfront so you can enquire with confidence.
            </p>
            <a
              href="/properties/to-rent"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
            >
              Browse rentals
            </a>
          </div>
        </div>

        {/* Feature cards — 3-up secondary */}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <FeatureCard
            icon={<ShieldCheck size={18} />}
            title="PPRA-verified agents"
            description="Every agent on Proppd is checked against the Property Practitioners Regulatory Authority database. Look for the PPRA badge on agent profiles and listings — it means the agent holds a valid Fidelity Fund Certificate."
          />
          <FeatureCard
            icon={<Calculator size={18} />}
            title="Bond calculator"
            description="Each listing includes a built-in bond calculator with current South African interest rates. Adjust the deposit, term, and rate to see your estimated monthly repayment before you enquire, then start the pre-approval process directly from the listing page."
          />
          <FeatureCard
            icon={<MapPin size={18} />}
            title="Neighbourhood context"
            description="Proppd shows walk scores, nearby schools, and amenities for every listing so you can evaluate the area, not just the property. Make informed decisions with local data on transport, green spaces, and schooling options."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-[#1A1A2E]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{description}</p>
    </div>
  );
}
