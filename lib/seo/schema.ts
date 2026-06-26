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
    // TODO: add `sameAs: [...]` with the official social profile URLs once the
    // Proppd accounts (X/Twitter, Facebook, LinkedIn) are live. Pointing at
    // profiles that don't exist yet feeds Google dead entity links.
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
 *
 * For rentals (purpose === 'To rent') the price is expressed as a per-month
 * UnitPriceSpecification so search engines don't read a monthly rent as an
 * outright purchase price.
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
  purpose?: 'For sale' | 'To rent';
  listedAt?: string;
  floorSize?: number;
  lat?: number;
  lng?: number;
}) {
  const isRental = listing.purpose === 'To rent';

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'ZAR',
    availability: 'https://schema.org/InStock',
    businessFunction: isRental
      ? 'http://purl.org/goodrelations/v1#LeaseOut'
      : 'http://purl.org/goodrelations/v1#Sell',
  };

  if (isRental) {
    offer.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      price: listing.priceValue,
      priceCurrency: 'ZAR',
      unitCode: 'MON',
      unitText: 'per month',
    };
  } else {
    offer.price = listing.priceValue;
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${BASE_URL}/property/${listing.slug}`,
    image: listing.photos.map((photo) => photo.src).filter(Boolean),
    offers: offer,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city,
      addressRegion: listing.province,
      addressCountry: 'ZA',
    },
    numberOfBedrooms: listing.beds,
    numberOfBathroomsTotal: listing.baths,
    agent: {
      '@type': 'RealEstateAgent',
      name: listing.agent,
      worksFor: {
        '@type': 'Organization',
        name: listing.agency,
      },
    },
  };

  if (listing.listedAt) schema.datePosted = listing.listedAt;
  if (typeof listing.floorSize === 'number' && listing.floorSize > 0) {
    schema.floorSize = {
      '@type': 'QuantitativeValue',
      value: listing.floorSize,
      unitCode: 'MTK', // square metres
    };
  }
  if (typeof listing.lat === 'number' && typeof listing.lng === 'number') {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: listing.lat,
      longitude: listing.lng,
    };
  }

  return schema;
}

/**
 * Build RealEstateAgent schema for an agent profile page.
 */
export function realEstateAgentSchema(agent: {
  name: string;
  slug: string;
  area: string;
  agency: string;
  ffcNumber?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: agent.name,
    url: `${BASE_URL}/agents/${agent.slug}`,
    areaServed: agent.area,
    worksFor: {
      '@type': 'Organization',
      name: agent.agency,
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Proppd',
      url: BASE_URL,
    },
  };

  // The Fidelity Fund Certificate is the agent's professional licence number.
  if (agent.ffcNumber) {
    schema.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'PPRA Fidelity Fund Certificate',
      value: agent.ffcNumber,
    };
  }

  return schema;
}

/**
 * Build RealEstateAgent (firm-level) schema for an agency profile page.
 */
export function realEstateAgencySchema(agency: {
  name: string;
  slug: string;
  city: string;
  ffcNumber?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: agency.name,
    url: `${BASE_URL}/agencies/${agency.slug}`,
    areaServed: agency.city,
    address: {
      '@type': 'PostalAddress',
      addressLocality: agency.city,
      addressCountry: 'ZA',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Proppd',
      url: BASE_URL,
    },
  };

  if (agency.ffcNumber) {
    schema.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'PPRA Fidelity Fund Certificate',
      value: agency.ffcNumber,
    };
  }

  return schema;
}
