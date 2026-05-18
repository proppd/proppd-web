export type Listing = {
  slug: string;
  purpose: 'For sale' | 'To rent';
  title: string;
  location: string;
  price: string;
  priceValue: number;
  beds: number;
  baths: number;
  parking: number;
  type: string;
  agency: string;
  agent: string;
  gradient: string;
  featured?: boolean;
};

export const listings: Listing[] = [
  {
    slug: 'modern-3-bedroom-house-in-sandton-12345',
    purpose: 'For sale',
    title: 'Modern 3-bedroom house in Sandton',
    location: 'Sandton, Johannesburg',
    price: 'R 3 250 000',
    priceValue: 3250000,
    beds: 3,
    baths: 2,
    parking: 2,
    type: 'House',
    agency: 'Proppd Verified Realty',
    agent: 'Lerato Mokoena',
    gradient: 'from-[#050A30] via-[#1b2cff] to-[#12D6C5]',
    featured: true,
  },
  {
    slug: 'sea-point-apartment-with-parking-20401',
    purpose: 'To rent',
    title: 'Sea Point apartment with secure parking',
    location: 'Sea Point, Cape Town',
    price: 'R 18 500 pm',
    priceValue: 18500,
    beds: 2,
    baths: 2,
    parking: 1,
    type: 'Apartment',
    agency: 'Atlantic Property Co.',
    agent: 'Mia Jacobs',
    gradient: 'from-[#041025] via-[#3B49FF] to-[#12D6C5]',
    featured: true,
  },
  {
    slug: 'family-townhouse-in-umhlanga-77120',
    purpose: 'For sale',
    title: 'Family townhouse in Umhlanga',
    location: 'Umhlanga, Durban',
    price: 'R 2 150 000',
    priceValue: 2150000,
    beds: 3,
    baths: 2,
    parking: 2,
    type: 'Townhouse',
    agency: 'Coastal Living',
    agent: 'Aiden Naidoo',
    gradient: 'from-[#050A30] via-[#1167ff] to-[#12D6C5]',
    featured: true,
  },
];

export const agents = [
  { name: 'Lerato Mokoena', agency: 'Proppd Verified Realty', area: 'Johannesburg North', listings: 18 },
  { name: 'Mia Jacobs', agency: 'Atlantic Property Co.', area: 'Atlantic Seaboard', listings: 11 },
  { name: 'Aiden Naidoo', agency: 'Coastal Living', area: 'Durban North Coast', listings: 14 },
];

export const agencies = [
  { name: 'Proppd Verified Realty', city: 'Johannesburg', agents: 8, listings: 48 },
  { name: 'Atlantic Property Co.', city: 'Cape Town', agents: 5, listings: 31 },
  { name: 'Coastal Living', city: 'Durban', agents: 6, listings: 36 },
];
