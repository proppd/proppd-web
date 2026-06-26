/**
 * Reusable Schema.org JSON-LD builders for Proppd SEO.
 *
 * Usage: import { organizationSchema, breadcrumbSchema } from '@/lib/seo/schema'
 * Then inject via:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
 */

const BASE_URL = 'https://proppd.com';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Proppd',
    url: BASE_URL,
    logo: `${BASE_URL}/proppd-logo-horizontal.png`,
    description:
      'South African property portal for PPRA-verified listings, direct enquiries, and agent-led stock.',
    email: 'info@proppd.com',
    areaServed: { '@type': 'Country', name: 'South Africa' },
    knowsAbout: [
      'Property for sale in South Africa',
      'Property to rent in South Africa',
      'PPRA verified estate agents',
      'Real estate listings',
      'Property technology',
    ],
    sameAs: [
      'https://twitter.com/proppd',
      'https://facebook.com/proppd',
      'https://www.linkedin.com/company/proppd',
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Proppd',
    url: BASE_URL,
    description:
      'South African property portal for verified listings, direct enquiries, and agent-led stock.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/properties?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string; // relative path e.g. "/properties/for-sale"
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function faqSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Build RealEstateListing schema from listing data.
 * (Used on property detail pages — replaces inline JSON.stringify.)
 */
export function realEstateListingSchema(listing: {
  title: string;
  description: string;
  slug: string;
  photos: { src: string }[];
  priceValue: number;
  city: string;
  province: string;
  beds: number;
  baths: number;
  agent: string;
  agency: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${BASE_URL}/property/${listing.slug}`,
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
  };
}
