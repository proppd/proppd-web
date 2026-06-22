import type { MetadataRoute } from 'next';
import { agencies as demoAgencies, agents as demoAgents, listings as demoListings } from '@/lib/demo-data';
import { slugifyDirectoryName, type DirectoryAgency, type DirectoryAgent } from '@/lib/directory';
import { buildCityLandingLinks } from '@/lib/locations';
import { loadPortalAgencies, loadPortalAgents, loadPortalListings } from '../lib/proppd/backend';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com';

const CORE_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/properties', priority: 0.9, changeFrequency: 'daily' },
  { path: '/properties/for-sale', priority: 0.9, changeFrequency: 'daily' },
  { path: '/properties/to-rent', priority: 0.9, changeFrequency: 'daily' },
  { path: '/agents', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/agencies', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/list-with-us', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/home-values', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/request-valuation', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/home-loans', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/business', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [portalListings, portalAgents, portalAgencies] = await Promise.all([
    loadPortalListings(),
    loadPortalAgents(),
    loadPortalAgencies(),
  ]);

  const listings = portalListings.items.length > 0 ? portalListings.items : demoListings;
  const agents: DirectoryAgent[] = portalAgents.items.length > 0 ? portalAgents.items : demoAgents;
  const agencies: DirectoryAgency[] = portalAgencies.items.length > 0 ? portalAgencies.items : demoAgencies;
  const cities = buildCityLandingLinks(listings);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = CORE_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const city of cities) {
    for (const path of [`/properties/for-sale/${city.slug}`, `/properties/to-rent/${city.slug}`, `/estate-agents/${city.slug}`]) {
      entries.push({ url: `${BASE_URL}${path}`, lastModified: now, changeFrequency: 'daily', priority: 0.8 });
    }
  }

  for (const listing of listings) {
    if (listing.isActive === false) continue;
    entries.push({
      url: `${BASE_URL}/property/${listing.slug}`,
      lastModified: listing.listedAt ? new Date(listing.listedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  for (const agent of agents) {
    if (agent.isActive === false) continue;
    entries.push({
      url: `${BASE_URL}/agents/${slugifyDirectoryName(agent.name)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  for (const agency of agencies) {
    if (agency.isActive === false) continue;
    entries.push({
      url: `${BASE_URL}/agencies/${slugifyDirectoryName(agency.name)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return entries;
}
