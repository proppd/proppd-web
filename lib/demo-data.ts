import { sakstonsAgencies, sakstonsAgents, sakstonsListings } from './sakstons-data';

export type Listing = {
  id: string;
  slug: string;
  purpose: 'For sale' | 'To rent';
  title: string;
  location: string;
  suburb: string;
  city: string;
  province: string;
  price: string;
  priceValue: number;
  beds: number;
  baths: number;
  parking: number;
  type: string;
  agency: string;
  agent: string;
  gradient: string;
  photos: { src: string; alt: string }[];
  description: string;
  features: string[];
  highlights: string[];
  mandate: 'Verified mandate' | 'Owner verified' | 'Agency verified';
  listedAt: string;
  floorSize?: number;
  erfSize?: number;
  rates?: string;
  levies?: string;
  lat?: number;
  lng?: number;
  featured?: boolean;
  isActive?: boolean;
};

export const listings: Listing[] = [
  {
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    slug: 'modern-3-bedroom-house-in-sandton-12345',
    purpose: 'For sale',
    title: 'Modern 3-bedroom house in Sandton',
    location: 'Sandton, Johannesburg',
    suburb: 'Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    price: 'R 3 250 000',
    priceValue: 3250000,
    beds: 3,
    baths: 2,
    parking: 2,
    type: 'House',
    agency: 'Proppd Verified Realty',
    agent: 'Lerato Mokoena',
    gradient: 'from-[#1A1A2E] via-[#4A3AFF] to-[#00C9A7]',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
        alt: 'Modern suburban house exterior with garden',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
        alt: 'Open-plan living room with neutral finishes',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
        alt: 'Modern kitchen and dining area',
      },
    ],
    description:
      'A secure, move-in-ready Sandton home with open-plan living, a private entertainment patio, and fast access to major business nodes. Built for buyers who want verified information before they book a viewing.',
    features: ['Solar-ready inverter point', 'Private garden', 'Open-plan kitchen', 'Covered patio', 'Security estate access', 'Fibre ready'],
    highlights: ['Verified mandate', 'Transfer-ready document pack', 'Family-friendly estate'],
    mandate: 'Verified mandate',
    listedAt: '2026-05-09',
    floorSize: 188,
    erfSize: 402,
    rates: 'R 1 850 pm',
    levies: 'R 1 420 pm',
    featured: true,
    lat: -26.0989,
    lng: 28.0556,
  },
  {
    id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    slug: 'sea-point-apartment-with-parking-20401',
    purpose: 'To rent',
    title: 'Sea Point apartment with secure parking',
    location: 'Sea Point, Cape Town',
    suburb: 'Sea Point',
    city: 'Cape Town',
    province: 'Western Cape',
    price: 'R 18 500 pm',
    priceValue: 18500,
    beds: 2,
    baths: 2,
    parking: 1,
    type: 'Apartment',
    agency: 'Atlantic Property Co.',
    agent: 'Mia Jacobs',
    gradient: 'from-[#1A1A2E] via-[#4A3AFF] to-[#00C9A7]',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
        alt: 'Bright apartment lounge with balcony light',
      },
      {
        src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
        alt: 'Compact modern apartment living space',
      },
      {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
        alt: 'Apartment bedroom with clean finishes',
      },
    ],
    description:
      'A bright Atlantic Seaboard rental with secure parking, sea-facing balcony light, and managed viewing coordination. Ideal for professionals who need a verified rental before submitting documents.',
    features: ['Secure basement parking', 'Balcony', 'Lift access', '24-hour access control', 'Walk to promenade', 'Fibre ready'],
    highlights: ['Occupation-ready', 'Managed rental screening', 'Verified agency listing'],
    mandate: 'Agency verified',
    listedAt: '2026-05-12',
    floorSize: 82,
    levies: 'Included in rent',
    featured: true,
    lat: -33.9187,
    lng: 18.3893,
  },
  {
    id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    slug: 'family-townhouse-in-umhlanga-77120',
    purpose: 'For sale',
    title: 'Family townhouse in Umhlanga',
    location: 'Umhlanga, Durban',
    suburb: 'Umhlanga',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    price: 'R 2 150 000',
    priceValue: 2150000,
    beds: 3,
    baths: 2,
    parking: 2,
    type: 'Townhouse',
    agency: 'Coastal Living',
    agent: 'Aiden Naidoo',
    gradient: 'from-[#1A1A2E] via-[#4A3AFF] to-[#00C9A7]',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80',
        alt: 'Townhouse exterior with landscaped entrance',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80',
        alt: 'Townhouse open-plan lounge and dining area',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80',
        alt: 'Family home bedroom with warm light',
      },
    ],
    description:
      'A lock-up-and-go Umhlanga townhouse with practical family spaces, pet-friendly outdoor flow, and an agency-verified sale file. Positioned for coastal buyers who want clarity before an offer.',
    features: ['Pet-friendly garden', 'Double parking bay', 'Complex pool', 'Guest bathroom', 'North-coast access', 'Secure complex'],
    highlights: ['Owner verified', 'Complex financials requested', 'Coastal family location'],
    mandate: 'Owner verified',
    listedAt: '2026-05-14',
    floorSize: 136,
    erfSize: 218,
    rates: 'R 1 260 pm',
    levies: 'R 2 050 pm',
    featured: true,
    lat: -29.7284,
    lng: 31.0823,
  },
  ...sakstonsListings,
];

export const agents = [
  { name: 'Lerato Mokoena', agency: 'Proppd Verified Realty', area: 'Johannesburg North', listings: 18 },
  { name: 'Mia Jacobs', agency: 'Atlantic Property Co.', area: 'Atlantic Seaboard', listings: 11 },
  { name: 'Aiden Naidoo', agency: 'Coastal Living', area: 'Durban North Coast', listings: 14 },
  ...sakstonsAgents,
];

export const agencies = [
  { name: 'Proppd Verified Realty', city: 'Johannesburg', agents: 8, listings: 48 },
  { name: 'Atlantic Property Co.', city: 'Cape Town', agents: 5, listings: 31 },
  { name: 'Coastal Living', city: 'Durban', agents: 6, listings: 36 },
  ...sakstonsAgencies,
];
