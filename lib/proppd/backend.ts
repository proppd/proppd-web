import { Pool, type PoolClient } from 'pg';
import { agencies as demoAgencies, agents as demoAgents, listings as demoListings, type Listing } from '../demo-data';
import { demoLeads } from '../leads/demo-leads';
import { getLeadQueue, getLeadActivityLabel, getLeadSourceLabel, type LeadRecord, type LeadQuality, type LeadStatus, type LeadIntent } from '../leads/pipeline';
import { getSupabaseBrowserConfig } from '../supabase/env';
import type { DirectoryAgency, DirectoryAgent } from '../directory';
import { slugifyAgentName } from '../agents/profile';
import { portalPropertyTypeOptions, slugifyListingTitle } from './listing-editor';

export type PortalBackendMode = 'database' | 'demo';
export type PortalDataSource = 'database' | 'demo' | 'empty' | 'error';

export type PortalBackendDiagnostics = {
  backendMode: PortalBackendMode;
  databaseConfigured: boolean;
  databaseUrlSource: string | null;
  databaseUrlHost: string | null;
  databaseUrlIsPooler: boolean;
  browserSupabaseConfigured: boolean;
  serviceRoleConfigured: boolean;
  canReadDatabase: boolean;
  listingCount: number | null;
  leadCount: number | null;
  agentCount: number | null;
  agencyCount: number | null;
  error?: string;
};

export type PortalPayload<T> = {
  source: PortalDataSource;
  items: T[];
  error?: string;
};

export type PortalUserAccess = {
  userId: string;
  profileId: string;
  role: 'super_admin' | 'agency_admin' | 'agent' | 'user';
  agentId: string | null;
  agentName: string | null;
  agencyId: string | null;
  agencyName: string | null;
};

const ADMIN_EMAIL = 'info@proppd.com';

export type PortalListingDraft = {
  id: string;
  slug: string;
  title: string;
  purpose: 'sale' | 'rent';
  status: string;
  price: number;
  description: string | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  bedrooms: number | string | null;
  bathrooms: number | string | null;
  parking: number | string | null;
  propertyTypeSlug: string | null;
  propertyTypeName: string | null;
  agencyId: string | null;
  agencyName: string | null;
  agentId: string | null;
  agentName: string | null;
  isFeatured: boolean;
  floorSizeSqm: number | string | null;
  erfSizeSqm: number | string | null;
  ratesAndTaxes: number | string | null;
  levies: number | string | null;
  publishedAt: string | null;
  createdAt: string;
  photos: { src: string; alt: string }[];
};

export type PortalListingPhotoInput = { src: string; alt: string };

export type PortalListingWriteInput = {
  title: string;
  purpose: 'sale' | 'rent';
  status: 'draft' | 'pending_review' | 'available' | 'under_offer' | 'sold' | 'rented' | 'archived';
  price: number;
  description: string;
  suburb: string;
  city: string;
  province: string;
  propertyTypeSlug: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  floorSizeSqm?: number;
  erfSizeSqm?: number;
  ratesAndTaxes?: number;
  levies?: number;
  isFeatured?: boolean;
  photos?: PortalListingPhotoInput[];
};

export type PortalDirectoryAgent = DirectoryAgent;
export type PortalDirectoryAgency = DirectoryAgency;


type PortalEnv = Record<string, string | undefined>;

type ListingRow = {
  id: string;
  slug: string;
  purpose: 'sale' | 'rent';
  title: string;
  description: string | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  price: string | number;
  bedrooms: number | string | null;
  bathrooms: number | string | null;
  parking: number | string | null;
  agency_name: string | null;
  agent_name: string | null;
  property_type_name: string | null;
  features: string[] | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  image_urls: string[] | null;
  image_alts: string[] | null;
  status: string;
  published_at: string | null;
  created_at: string;
  is_featured: boolean | null;
  floor_size_sqm: number | string | null;
  erf_size_sqm: number | string | null;
  rates_and_taxes: number | string | null;
  levies: number | string | null;
  views_total?: number | string | null;
  views_7d?: number | string | null;
};

type LeadRow = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  message: string;
  intent: string;
  status: string;
  quality: string;
  flags: string[] | null;
  created_at: string;
  source_page: string | null;
  listing_slug: string | null;
  listing_title: string | null;
  agent_name: string | null;
  agency_name: string | null;
  latest_event_type: string | null;
  latest_event_at: string | null;
  latest_event_note: string | null;
  latest_event_count: number | string | null;
};

type LeadEventRow = {
  id: string;
  event_type: string;
  notes: string | null;
  created_at: string;
  actor_name: string | null;
  actor_role: string | null;
  metadata: Record<string, unknown> | null;
};

export type LeadEventRecord = {
  id: string;
  type: string;
  label: string;
  note: string | null;
  createdAt: string;
  actorName: string | null;
  actorRole: string | null;
  metadata: Record<string, unknown>;
};

export type LeadTimeline = {
  source: PortalDataSource;
  lead: LeadRecord;
  events: LeadEventRecord[];
};

const FALLBACK_GRADIENTS = [
  'from-[#1A1A2E] via-[#4A3AFF] to-[#00C9A7]',
  'from-[#1A1A2E] via-[#4A3AFF] to-[#00C9A7]',
  'from-[#1A1A2E] via-[#4A3AFF] to-[#00C9A7]',
];

const FALLBACK_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80', alt: 'Modern suburban house exterior with garden' },
  { src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80', alt: 'Bright apartment lounge with balcony light' },
  { src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80', alt: 'Townhouse exterior with landscaped entrance' },
];

let poolCache: { connectionString: string; pool: Pool } | undefined;

type PortalDatabaseUrlInfo = {
  url: string | null;
  source: string | null;
  host: string | null;
  isPooler: boolean;
};

type PortalDatabaseEnvKey = (typeof PORTAL_DATABASE_ENV_KEYS)[number];

const PORTAL_DATABASE_ENV_KEYS = [
  'POSTGRES_PRISMA_URL',
  'SUPABASE_POOLER_URL',
  'POSTGRES_POOLER_URL',
  'POSTGRES_URL',
  'DATABASE_URL',
  'SUPABASE_DB_URL',
  'POSTGRES_URL_NON_POOLING',
] as const;

export function getPortalDatabaseUrl(env: PortalEnv = process.env): string | null {
  return getPortalDatabaseUrlInfo(env).url;
}

export function getPortalDatabaseUrlInfo(env: PortalEnv = process.env): PortalDatabaseUrlInfo {
  const candidates: Array<{ key: PortalDatabaseEnvKey; value: string }> = [];

  for (const key of PORTAL_DATABASE_ENV_KEYS) {
    const value = normaliseEnvValue(env[key]);
    if (value) {
      candidates.push({ key, value });
    }
  }

  if (candidates.length === 0) {
    return { url: null, source: null, host: null, isPooler: false };
  }

  const enriched = candidates.map((candidate) => {
    const host = getHostname(candidate.value);
    return {
      ...candidate,
      host,
      isPooler: isPoolerDatabaseHost(host),
    };
  });

  const preferred = enriched.find((candidate) => candidate.isPooler) ?? enriched[0];
  return {
    url: preferred.value,
    source: preferred.key,
    host: preferred.host,
    isPooler: preferred.isPooler,
  };
}

export function getPortalBackendMode(env: PortalEnv = process.env): PortalBackendMode {
  return getPortalDatabaseUrl(env) ? 'database' : 'demo';
}

export function getPortalBackendDiagnostics(env: PortalEnv = process.env): PortalBackendDiagnostics {
  const browserConfig = getSupabaseBrowserConfig(env);
  const databaseUrl = getPortalDatabaseUrlInfo(env);
  return {
    backendMode: getPortalBackendMode(env),
    databaseConfigured: Boolean(databaseUrl.url),
    databaseUrlSource: databaseUrl.source,
    databaseUrlHost: databaseUrl.host,
    databaseUrlIsPooler: databaseUrl.isPooler,
    browserSupabaseConfigured: Boolean(browserConfig),
    serviceRoleConfigured: Boolean(normaliseEnvValue(env.SUPABASE_SERVICE_ROLE_KEY)),
    canReadDatabase: Boolean(databaseUrl.url),
    listingCount: null,
    leadCount: null,
    agentCount: null,
    agencyCount: null,
  };
}

export async function loadPortalListings(env: PortalEnv = process.env): Promise<PortalPayload<Listing>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: demoListings };
  }

  try {
    const rows = await queryListings(databaseUrl);
    if (rows.length === 0) {
      return fallbackToDemoOnEmptySource(demoListings, 'No published database listings yet, using verified launch stock.');
    }
    return { source: 'database', items: rows.map(mapListingRow) };
  } catch (error) {
    const message = errorMessage(error);
    console.error('[proppd] loadPortalListings error:', message);
    // Fall back to demo on any database error, not just connectivity errors
    return { source: 'demo', items: demoListings, error: `Database error, using demo fallback: ${message}` };
  }
}

export async function loadPortalListingBySlug(slug: string, env: PortalEnv = process.env): Promise<PortalPayload<Listing>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    const item = demoListings.find((listing) => listing.slug === slug);
    return { source: 'demo', items: item ? [item] : [] };
  }

  try {
    const rows = await queryListings(databaseUrl, slug);
    return { source: rows.length > 0 ? 'database' : 'empty', items: rows.map(mapListingRow) };
  } catch (error) {
    const fallback = demoListings.find((listing) => listing.slug === slug);
    return fallbackToDemoOnDatabaseConnectivityError(error, fallback ? [fallback] : []);
  }
}

export async function loadPortalLeadQueue(agentName?: string, env: PortalEnv = process.env): Promise<PortalPayload<LeadRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    const items = agentName ? demoLeads.filter((lead) => lead.agent === agentName) : demoLeads;
    return { source: 'demo', items: getLeadQueue(items) };
  }

  try {
    const rows = await queryLeads(databaseUrl, agentName);
    return { source: rows.length > 0 ? 'database' : 'empty', items: rows.map(mapLeadRow).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()) };
  } catch (error) {
    return fallbackToDemoOnDatabaseConnectivityError(error, agentName ? getLeadQueue(demoLeads.filter((lead) => lead.agent === agentName)) : getLeadQueue(demoLeads));
  }
}

export async function loadPortalLeadById(leadId: string, env: PortalEnv = process.env): Promise<PortalPayload<LeadRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    const lead = getLeadQueue(demoLeads).find((entry) => entry.id === leadId);
    return lead ? { source: 'demo', items: [lead] } : { source: 'empty', items: [] };
  }

  try {
    const rows = await queryLeads(databaseUrl);
    const item = rows.map(mapLeadRow).find((lead) => lead.id === leadId);
    return item ? { source: 'database', items: [item] } : { source: 'empty', items: [] };
  } catch (error) {
    const fallback = getLeadQueue(demoLeads).find((entry) => entry.id === leadId);
    return fallbackToDemoOnDatabaseConnectivityError(error, fallback ? [fallback] : []);
  }
}

export async function loadPortalLeadTimeline(leadId: string, env: PortalEnv = process.env): Promise<LeadTimeline | null> {
  const leadPayload = await loadPortalLeadById(leadId, env);
  const lead = leadPayload.items[0];
  if (!lead) return null;

  if (leadPayload.source !== 'database') {
    return {
      source: leadPayload.source,
      lead,
      events: buildDemoLeadTimeline(lead),
    };
  }

  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return {
      source: leadPayload.source,
      lead,
      events: buildDemoLeadTimeline(lead),
    };
  }

  try {
    const events = await queryLeadEvents(databaseUrl, leadId);
    return {
      source: leadPayload.source,
      lead,
      events: events.length > 0 ? events.map(mapLeadEventRow) : buildDemoLeadTimeline(lead),
    };
  } catch {
    return {
      source: leadPayload.source,
      lead,
      events: buildDemoLeadTimeline(lead),
    };
  }
}

export type PortalLeadWorkflowUpdate = {
  status?: LeadStatus;
  quality?: 'clean' | 'duplicate' | 'flagged';
};

export async function updatePortalLeadWorkflow(
  leadId: string,
  access: PortalUserAccess,
  input: PortalLeadWorkflowUpdate,
  env: PortalEnv = process.env,
): Promise<PortalPayload<LeadRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'error', items: [], error: 'Database connection is not configured.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const rows = await queryLeads(databaseUrl);
    const current = rows.find((entry) => entry.id === leadId);
    if (!current) {
      return { source: 'error', items: [], error: 'Lead not found.' };
    }

    const ownsLead =
      access.role === 'super_admin' ||
      (access.agentName !== null && current.agent_name === access.agentName) ||
      (access.agencyName !== null && current.agency_name === access.agencyName);
    if (!ownsLead) {
      return { source: 'error', items: [], error: 'Access denied for this lead.' };
    }

    const nextStatus = input.status ?? mapLeadStatus(current.status);
    const nextQuality = input.quality ? mapLeadQualityForDatabase(input.quality) : current.quality;

    await pool.query(
      `update public.leads
       set status = $1::public.lead_status,
           quality = $2::public.lead_quality,
           updated_at = now()
       where id = $3`,
      [nextStatus, nextQuality, leadId],
    );

    await pool.query(
      `insert into public.lead_events (lead_id, actor_id, event_type, notes, metadata)
       values ($1, $2, $3, $4, $5)`,
      [
        leadId,
        access.profileId,
        'workflow_updated',
        buildLeadWorkflowEventNotes(mapLeadStatus(current.status), nextStatus, mapLeadQuality(current.quality), input.quality ? mapLeadQuality(input.quality) : mapLeadQuality(current.quality)),
        JSON.stringify({
          previous_status: current.status,
          next_status: nextStatus,
          previous_quality: current.quality,
          next_quality: nextQuality,
          actor_role: access.role,
        }),
      ],
    );

    return await loadPortalLeadById(leadId, env);
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export function buildLeadWorkflowEventNotes(previousStatus: LeadStatus, nextStatus: LeadStatus, previousQuality: LeadQuality, nextQuality: LeadQuality): string {
  const changes: string[] = [];

  if (previousStatus !== nextStatus) {
    changes.push(`status ${previousStatus} → ${nextStatus}`);
  }

  if (previousQuality !== nextQuality) {
    changes.push(`quality ${previousQuality} → ${nextQuality}`);
  }

  if (changes.length === 0) {
    return 'Lead workflow reviewed without status or quality changes.';
  }

  return `Updated ${changes.join(' and ')}.`;
}

export async function loadPortalAgents(env: PortalEnv = process.env): Promise<PortalPayload<DirectoryAgent>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: demoAgents };
  }

  try {
    const rows = await queryDirectoryAgents(databaseUrl);
    if (rows.length === 0) {
      return fallbackToDemoOnEmptySource(demoAgents, 'No database agent profiles yet, using verified launch profiles.');
    }
    return { source: 'database', items: rows };
  } catch (error) {
    return fallbackToDemoOnDatabaseConnectivityError(error, demoAgents);
  }
}

export async function loadPortalAgencies(env: PortalEnv = process.env): Promise<PortalPayload<DirectoryAgency>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: demoAgencies };
  }

  try {
    const rows = await queryDirectoryAgencies(databaseUrl);
    if (rows.length === 0) {
      return fallbackToDemoOnEmptySource(demoAgencies, 'No database agency profiles yet, using verified launch agencies.');
    }
    return { source: 'database', items: rows };
  } catch (error) {
    return fallbackToDemoOnDatabaseConnectivityError(error, demoAgencies);
  }
}

export async function loadPortalAgentBySlug(slug: string, env: PortalEnv = process.env): Promise<PortalPayload<DirectoryAgent>> {
  const directory = await loadPortalAgents(env);
  const item = directory.items.find((agent) => slugifyText(agent.name) === slug);
  return { ...directory, items: item ? [item] : [] };
}

export async function loadPortalAgencyBySlug(slug: string, env: PortalEnv = process.env): Promise<PortalPayload<DirectoryAgency>> {
  const directory = await loadPortalAgencies(env);
  const item = directory.items.find((agency) => slugifyText(agency.name) === slug);
  return { ...directory, items: item ? [item] : [] };
}

function normaliseRole(value: string): PortalUserAccess['role'] {
  if (value === 'super_admin' || value === 'agency_admin' || value === 'agent' || value === 'user') {
    return value;
  }
  return 'user';
}

type ManagedListingRow = ListingRow & {
  property_type_slug: string | null;
  agency_id: string | null;
  agent_id: string | null;
};

async function queryManagedListings(databaseUrl: string, access: PortalUserAccess, slug?: string): Promise<ManagedListingRow[]> {
  const pool = getPortalPool(databaseUrl);
  const values: string[] = [];
  const clauses: string[] = [];

  if (slug) {
    values.push(slug);
    clauses.push(`l.slug = $${values.length}`);
  }

  if (access.role !== 'super_admin') {
    const ownershipClauses: string[] = [];
    if (access.agentId) {
      values.push(access.agentId);
      ownershipClauses.push(`l.agent_id = $${values.length}`);
    }
    if (access.agencyId) {
      values.push(access.agencyId);
      ownershipClauses.push(`l.agency_id = $${values.length}`);
    }
    if (ownershipClauses.length > 0) {
      clauses.push(`(${ownershipClauses.join(' or ')})`);
    }
  }

  const sql = `
    select
      l.id,
      l.slug,
      l.purpose,
      l.title,
      l.description,
      l.suburb,
      l.city,
      l.province,
      l.price,
      l.bedrooms,
      l.bathrooms,
      l.parking,
      ag.id as agency_id,
      ag.name as agency_name,
      a.id as agent_id,
      a.name as agent_name,
      pt.slug as property_type_slug,
      pt.name as property_type_name,
      coalesce(array_agg(distinct f.feature) filter (where f.feature is not null), '{}'::text[]) as features,
      coalesce(array_agg(distinct i.image_url) filter (where i.image_url is not null), '{}'::text[]) as image_urls,
      coalesce(array_agg(distinct i.alt_text) filter (where i.alt_text is not null), '{}'::text[]) as image_alts,
      min(case when i.is_cover then i.image_url end) as cover_image_url,
      min(case when i.is_cover then i.alt_text end) as cover_image_alt,
      l.status,
      l.published_at,
      l.created_at,
      l.is_featured,
      l.floor_size_sqm,
      l.erf_size_sqm,
      l.rates_and_taxes,
      l.levies,
      (select count(*) from public.listing_views v where v.listing_id = l.id) as views_total,
      (select count(*) from public.listing_views v where v.listing_id = l.id and v.viewed_at >= now() - interval '7 days') as views_7d
    from public.listings l
    left join public.agencies ag on ag.id = l.agency_id
    left join public.agents a on a.id = l.agent_id
    left join public.property_types pt on pt.id = l.property_type_id
    left join public.listing_features f on f.listing_id = l.id
    left join public.listing_images i on i.listing_id = l.id
    ${clauses.length > 0 ? `where ${clauses.join(' and ')}` : ''}
    group by l.id, ag.id, ag.name, a.id, a.name, pt.slug, pt.name
    order by coalesce(l.published_at, l.created_at) desc, l.created_at desc
  `;

  const result = await pool.query<ManagedListingRow>(sql, values);
  return result.rows;
}

function mapListingDraftRow(row: ManagedListingRow): PortalListingDraft {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    purpose: row.purpose,
    status: row.status,
    price: toNumber(row.price),
    description: row.description,
    suburb: row.suburb,
    city: row.city,
    province: row.province,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parking: row.parking,
    propertyTypeSlug: row.property_type_slug,
    propertyTypeName: row.property_type_name,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    agentId: row.agent_id,
    agentName: row.agent_name,
    isFeatured: Boolean(row.is_featured),
    floorSizeSqm: row.floor_size_sqm,
    erfSizeSqm: row.erf_size_sqm,
    ratesAndTaxes: row.rates_and_taxes,
    levies: row.levies,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    photos: buildDraftPhotos(row),
  };
}

function buildDraftPhotos(row: ManagedListingRow): { src: string; alt: string }[] {
  const urls = row.image_urls ?? [];
  const alts = row.image_alts ?? [];
  const photos = urls.map((src, index) => ({ src, alt: alts[index] ?? row.cover_image_alt ?? row.title }));

  if (row.cover_image_url) {
    const coverIndex = photos.findIndex((photo) => photo.src === row.cover_image_url);
    if (coverIndex > 0) {
      const [cover] = photos.splice(coverIndex, 1);
      photos.unshift(cover);
    } else if (coverIndex === -1) {
      photos.unshift({ src: row.cover_image_url, alt: row.cover_image_alt ?? row.title });
    }
  }

  return photos;
}

async function replaceListingImages(client: QueryClient, listingId: string, photos: PortalListingPhotoInput[]): Promise<void> {
  await client.query('delete from public.listing_images where listing_id = $1', [listingId]);
  if (photos.length === 0) return;

  const values: unknown[] = [];
  const rows: string[] = [];
  photos.forEach((photo, index) => {
    const base = index * 4;
    rows.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, ${index})`);
    values.push(listingId, photo.src, photo.alt, index === 0);
  });

  await client.query(
    `insert into public.listing_images (listing_id, image_url, alt_text, is_cover, sort_order) values ${rows.join(', ')}`,
    values,
  );
}

async function ensurePropertyTypeId(pool: Pool, slug: string): Promise<string> {
  const option = portalPropertyTypeOptions.find((entry) => entry.slug === slug);
  if (!option) {
    throw new Error(`Unknown property type: ${slug}`);
  }

  const result = await pool.query<{ id: string }>(
    `insert into public.property_types (name, slug, category, sort_order)
     values ($1, $2, $3, $4)
     on conflict (slug) do update set
       name = excluded.name,
       category = excluded.category,
       sort_order = excluded.sort_order,
       is_active = true
     returning id`,
    [option.label, option.slug, option.category, portalPropertyTypeOptions.findIndex((entry) => entry.slug === slug) * 10 + 10],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error(`Could not ensure property type: ${slug}`);
  }

  return row.id;
}

async function generateUniqueListingSlug(pool: Pool, title: string): Promise<string> {
  const base = slugifyListingTitle(title) || 'listing';
  let candidate = base;
  let attempts = 0;

  while (attempts < 5) {
    const exists = await pool.query<{ slug: string }>('select slug from public.listings where slug = $1 limit 1', [candidate]);
    if (exists.rowCount === 0) {
      return candidate;
    }

    attempts += 1;
    candidate = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  }

  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

export async function loadPortalUserAccess(userId: string, userEmail?: string | null, env: PortalEnv = process.env): Promise<PortalUserAccess | null> {
  const isAdminEmail = userEmail?.trim().toLowerCase() === ADMIN_EMAIL;
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return isAdminEmail
      ? {
          userId,
          profileId: 'demo-admin',
          role: 'super_admin',
          agentId: null,
          agentName: null,
          agencyId: null,
          agencyName: 'Proppd',
        }
      : null;
  }

  const pool = getPortalPool(databaseUrl);
  const result = await pool.query<{
    profile_id: string;
    role: string;
    agent_id: string | null;
    agent_name: string | null;
    agency_id: string | null;
    agency_name: string | null;
  }>(
    `select
      p.id as profile_id,
      p.role,
      a.id as agent_id,
      a.name as agent_name,
      ag.id as agency_id,
      ag.name as agency_name
    from public.profiles p
    left join public.agents a on a.profile_id = p.id
    left join public.agencies ag on ag.id = a.agency_id
    where p.id = $1
    limit 1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) {
    return isAdminEmail
      ? {
          userId,
          profileId: 'admin-email',
          role: 'super_admin',
          agentId: null,
          agentName: null,
          agencyId: null,
          agencyName: 'Proppd',
        }
      : null;
  }

  return {
    userId,
    profileId: row.profile_id,
    role: isAdminEmail ? 'super_admin' : normaliseRole(row.role),
    agentId: row.agent_id,
    agentName: row.agent_name,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
  };
}

export async function loadManagedListingDrafts(access: PortalUserAccess, env: PortalEnv = process.env): Promise<PortalPayload<PortalListingDraft>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: [] };
  }

  try {
    const rows = await queryManagedListings(databaseUrl, access);
    return { source: rows.length > 0 ? 'database' : 'empty', items: rows.map(mapListingDraftRow) };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

const MODERATION_STATUSES = ['draft', 'pending_review', 'available', 'under_offer', 'sold', 'rented', 'archived'] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export type ListingModerationInput = {
  status?: ModerationStatus;
  isFeatured?: boolean;
};

export async function setPortalListingModeration(
  slug: string,
  access: PortalUserAccess,
  input: ListingModerationInput,
  env: PortalEnv = process.env,
): Promise<PortalPayload<PortalListingDraft>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'error', items: [], error: 'Database connection is not configured.' };
  }

  if (input.status === undefined && input.isFeatured === undefined) {
    return { source: 'error', items: [], error: 'Nothing to update.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const owned = await queryManagedListings(databaseUrl, access, slug);
    if (owned.length === 0) {
      return { source: 'error', items: [], error: 'You do not have access to moderate this listing.' };
    }

    const sets: string[] = ['updated_at = now()'];
    const values: unknown[] = [];

    if (input.status !== undefined) {
      values.push(input.status);
      sets.push(`status = $${values.length}::public.listing_status`);
      sets.push(`published_at = case when $${values.length}::public.listing_status = 'available' and published_at is null then now() else published_at end`);
    }
    if (input.isFeatured !== undefined) {
      values.push(input.isFeatured);
      sets.push(`is_featured = $${values.length}`);
    }

    values.push(slug);
    const result = await pool.query<PortalListingDraft>(
      `update public.listings set ${sets.join(', ')}
       where slug = $${values.length}
       returning
         id, slug, title, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking,
         (select slug from public.property_types where id = property_type_id) as property_type_slug,
         (select name from public.property_types where id = property_type_id) as property_type_name,
         agency_id, (select name from public.agencies where id = agency_id) as agency_name,
         agent_id, (select name from public.agents where id = agent_id) as agent_name,
         is_featured, floor_size_sqm, erf_size_sqm, rates_and_taxes, levies, published_at, created_at`,
      values,
    );

    const row = result.rows[0];
    if (!row) {
      return { source: 'error', items: [], error: 'Listing could not be updated.' };
    }

    await logAdminActivity(pool, access.profileId, 'listing_moderation', 'listing', row.id, {
      slug,
      status: input.status ?? null,
      isFeatured: input.isFeatured ?? null,
    });

    return { source: 'database', items: [{ ...row, photos: [] }] };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

async function logAdminActivity(
  client: QueryClient,
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown>,
): Promise<void> {
  try {
    const actor = actorId && /^[0-9a-f-]{36}$/i.test(actorId) ? actorId : null;
    await client.query(
      `insert into public.admin_activity_logs (actor_id, action, entity_type, entity_id, metadata)
       values ($1, $2, $3, $4, $5)`,
      [actor, action, entityType, entityId, JSON.stringify(metadata)],
    );
  } catch {
    // Activity logging is best-effort and must never block a moderation action.
  }
}

export async function loadMyPortalListings(access: PortalUserAccess, env: PortalEnv = process.env): Promise<PortalPayload<Listing>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: demoListings.filter((listing) => listing.agent === access.agentName || access.role === 'super_admin') };
  }

  try {
    const rows = await queryManagedListings(databaseUrl, access);
    return { source: rows.length > 0 ? 'database' : 'empty', items: rows.map(mapListingRow) };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export async function loadPortalListingDraftBySlug(slug: string, access: PortalUserAccess, env: PortalEnv = process.env): Promise<PortalPayload<PortalListingDraft>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: [] };
  }

  try {
    const rows = await queryManagedListings(databaseUrl, access, slug);
    return { source: rows.length > 0 ? 'database' : 'empty', items: rows.map(mapListingDraftRow) };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export async function createPortalListing(access: PortalUserAccess, input: PortalListingWriteInput, env: PortalEnv = process.env): Promise<PortalPayload<PortalListingDraft>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'error', items: [], error: 'Database connection is not configured.' };
  }

  if (!access.agentId && access.role !== 'super_admin') {
    return { source: 'error', items: [], error: 'This account is not linked to an agent profile yet.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const propertyTypeId = await ensurePropertyTypeId(pool, input.propertyTypeSlug);
    const slug = await generateUniqueListingSlug(pool, input.title);
    const result = await pool.query<PortalListingDraft>(
      `insert into public.listings (
        agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description,
        suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, rates_and_taxes, levies,
        is_featured, created_by, published_at
      ) values (
        $1, $2, $3, $4, $5, $6::public.listing_purpose, $7::public.listing_status, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, case when $7::public.listing_status = 'available' then now() else null end
      )
      returning
        id, slug, title, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking,
        (select slug from public.property_types where id = property_type_id) as property_type_slug,
        (select name from public.property_types where id = property_type_id) as property_type_name,
        agency_id, (select name from public.agencies where id = agency_id) as agency_name,
        agent_id, (select name from public.agents where id = agent_id) as agent_name,
        is_featured, floor_size_sqm, erf_size_sqm, rates_and_taxes, levies, published_at, created_at`,
      [
        access.agencyId,
        access.agentId,
        propertyTypeId,
        input.title,
        slug,
        input.purpose,
        input.status,
        input.price,
        input.description,
        input.suburb,
        input.city,
        input.province,
        input.bedrooms ?? null,
        input.bathrooms ?? null,
        input.parking ?? null,
        input.floorSizeSqm ?? null,
        input.erfSizeSqm ?? null,
        input.ratesAndTaxes ?? null,
        input.levies ?? null,
        Boolean(input.isFeatured),
        access.profileId,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      return { source: 'error', items: [], error: 'Listing could not be created.' };
    }

    if (input.photos && input.photos.length > 0) {
      await replaceListingImages(pool, row.id, input.photos);
    }

    return { source: 'database', items: [{ ...row, photos: input.photos ?? [] }] };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export async function updatePortalListingBySlug(
  slug: string,
  access: PortalUserAccess,
  input: PortalListingWriteInput,
  env: PortalEnv = process.env,
): Promise<PortalPayload<PortalListingDraft>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'error', items: [], error: 'Database connection is not configured.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const owned = await queryManagedListings(databaseUrl, access, slug);
    if (owned.length === 0 && access.role !== 'super_admin') {
      return { source: 'error', items: [], error: 'You do not have access to edit this listing.' };
    }

    const propertyTypeId = await ensurePropertyTypeId(pool, input.propertyTypeSlug);
    const result = await pool.query<PortalListingDraft>(
      `update public.listings set
        property_type_id = $1,
        title = $2,
        purpose = $3::public.listing_purpose,
        status = $4::public.listing_status,
        price = $5,
        description = $6,
        suburb = $7,
        city = $8,
        province = $9,
        bedrooms = $10,
        bathrooms = $11,
        parking = $12,
        floor_size_sqm = $13,
        erf_size_sqm = $14,
        rates_and_taxes = $15,
        levies = $16,
        is_featured = $17,
        updated_at = now(),
        published_at = case when $4::public.listing_status = 'available' and published_at is null then now() else published_at end
      where slug = $18
      returning
        id, slug, title, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking,
        (select slug from public.property_types where id = property_type_id) as property_type_slug,
        (select name from public.property_types where id = property_type_id) as property_type_name,
        agency_id, (select name from public.agencies where id = agency_id) as agency_name,
        agent_id, (select name from public.agents where id = agent_id) as agent_name,
        is_featured, floor_size_sqm, erf_size_sqm, rates_and_taxes, levies, published_at, created_at`,
      [
        propertyTypeId,
        input.title,
        input.purpose,
        input.status,
        input.price,
        input.description,
        input.suburb,
        input.city,
        input.province,
        input.bedrooms ?? null,
        input.bathrooms ?? null,
        input.parking ?? null,
        input.floorSizeSqm ?? null,
        input.erfSizeSqm ?? null,
        input.ratesAndTaxes ?? null,
        input.levies ?? null,
        Boolean(input.isFeatured),
        slug,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      return { source: 'error', items: [], error: 'Listing could not be updated.' };
    }

    if (input.photos) {
      await replaceListingImages(pool, row.id, input.photos);
    }

    return { source: 'database', items: [{ ...row, photos: input.photos ?? [] }] };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export type PortalAgentProfile = {
  agentId: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  bio: string | null;
  areasServed: string[];
  agencyId: string | null;
  agencyName: string | null;
  photoUrl: string | null;
  isVerified: boolean;
};

type AgentProfileRow = {
  agent_id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  bio: string | null;
  areas_served: string[] | null;
  agency_id: string | null;
  agency_name: string | null;
  photo_url: string | null;
  is_verified: boolean;
};

const AGENT_PROFILE_SELECT = `
  select
    a.id as agent_id,
    a.name,
    a.slug,
    a.phone,
    a.whatsapp,
    a.email::text as email,
    a.bio,
    a.areas_served,
    a.agency_id,
    ag.name as agency_name,
    a.photo_url,
    a.is_verified
  from public.agents a
  left join public.agencies ag on ag.id = a.agency_id
`;

export async function loadPortalAgentProfile(userId: string, env: PortalEnv = process.env): Promise<PortalPayload<PortalAgentProfile>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: [] };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const result = await pool.query<AgentProfileRow>(`${AGENT_PROFILE_SELECT} where a.profile_id = $1 limit 1`, [userId]);
    const row = result.rows[0];
    return { source: row ? 'database' : 'empty', items: row ? [mapAgentProfileRow(row)] : [] };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export type PortalAgentProfileWriteInput = {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  bio?: string;
  agencyName: string;
  areasServed: string[];
};

export async function upsertPortalAgentProfile(
  userId: string,
  input: PortalAgentProfileWriteInput,
  env: PortalEnv = process.env,
): Promise<PortalPayload<PortalAgentProfile>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'error', items: [], error: 'Database connection is not configured.' };
  }

  const pool = getPortalPool(databaseUrl);
  const client = await pool.connect();

  try {
    await client.query('begin');

    const agencyId = await ensureAgencyId(client, input.agencyName, userId);
    const existing = await client.query<{ id: string }>('select id from public.agents where profile_id = $1 limit 1', [userId]);

    let agentId: string;
    if (existing.rows[0]) {
      agentId = existing.rows[0].id;
      await client.query(
        `update public.agents set
          name = $1, phone = $2, whatsapp = $3, email = $4, bio = $5, areas_served = $6, agency_id = $7, updated_at = now()
        where id = $8`,
        [input.name, input.phone, input.whatsapp ?? null, input.email ?? null, input.bio ?? null, input.areasServed, agencyId, agentId],
      );
    } else {
      const slug = await generateUniqueAgentSlug(client, input.name);
      const inserted = await client.query<{ id: string }>(
        `insert into public.agents (profile_id, agency_id, name, slug, phone, whatsapp, email, bio, areas_served)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         returning id`,
        [userId, agencyId, input.name, slug, input.phone, input.whatsapp ?? null, input.email ?? null, input.bio ?? null, input.areasServed],
      );
      agentId = inserted.rows[0].id;
      await client.query(
        `update public.profiles set role = 'agent'::public.app_role, updated_at = now()
         where id = $1 and role = 'user'::public.app_role`,
        [userId],
      );
    }

    const result = await client.query<AgentProfileRow>(`${AGENT_PROFILE_SELECT} where a.id = $1 limit 1`, [agentId]);
    await client.query('commit');

    const row = result.rows[0];
    if (!row) {
      return { source: 'error', items: [], error: 'Profile could not be saved.' };
    }
    return { source: 'database', items: [mapAgentProfileRow(row)] };
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    return { source: 'error', items: [], error: errorMessage(error) };
  } finally {
    client.release();
  }
}

function mapAgentProfileRow(row: AgentProfileRow): PortalAgentProfile {
  return {
    agentId: row.agent_id,
    name: row.name,
    slug: row.slug,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    bio: row.bio,
    areasServed: row.areas_served ?? [],
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    photoUrl: row.photo_url,
    isVerified: row.is_verified,
  };
}

type QueryClient = Pool | PoolClient;

async function ensureAgencyId(client: QueryClient, agencyName: string, createdBy: string): Promise<string> {
  const found = await client.query<{ id: string }>(
    'select id from public.agencies where lower(name) = lower($1) limit 1',
    [agencyName],
  );
  if (found.rows[0]) return found.rows[0].id;

  const baseSlug = slugifyAgentName(agencyName) || 'agency';
  const slug = await generateUniqueSlug(client, 'agencies', baseSlug);
  const inserted = await client.query<{ id: string }>(
    'insert into public.agencies (name, slug, created_by) values ($1, $2, $3) returning id',
    [agencyName, slug, createdBy],
  );
  return inserted.rows[0].id;
}

async function generateUniqueAgentSlug(client: QueryClient, name: string): Promise<string> {
  const baseSlug = slugifyAgentName(name) || 'agent';
  return generateUniqueSlug(client, 'agents', baseSlug);
}

async function generateUniqueSlug(client: QueryClient, table: 'agents' | 'agencies', baseSlug: string): Promise<string> {
  const existing = await client.query<{ slug: string }>(
    `select slug from public.${table} where slug = $1 or slug like $2`,
    [baseSlug, `${baseSlug}-%`],
  );
  if (!existing.rows.some((row) => row.slug === baseSlug)) return baseSlug;

  const taken = new Set(existing.rows.map((row) => row.slug));
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadPortalDiagnostics(env: PortalEnv = process.env): Promise<PortalBackendDiagnostics> {
  const diagnostics = getPortalBackendDiagnostics(env);
  const databaseUrl = getPortalDatabaseUrl(env);

  if (!databaseUrl) {
    return diagnostics;
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const [listingsCount, leadCount, agentCount, agencyCount] = await Promise.all([
      queryCount(pool, "select count(*)::int as count from public.listings where status in ('available', 'under_offer', 'sold', 'rented')"),
      queryCount(pool, 'select count(*)::int as count from public.leads'),
      queryCount(pool, 'select count(*)::int as count from public.agents where is_active = true'),
      queryCount(pool, 'select count(*)::int as count from public.agencies where is_active = true'),
    ]);

    return {
      ...diagnostics,
      canReadDatabase: true,
      listingCount: listingsCount,
      leadCount,
      agentCount,
      agencyCount,
    };
  } catch (error) {
    return {
      ...diagnostics,
      canReadDatabase: false,
      error: errorMessage(error),
    };
  }
}

async function queryListings(databaseUrl: string, slug?: string): Promise<ListingRow[]> {
  const pool = getPortalPool(databaseUrl);
  const values: Array<string> = [];
  const clauses = ["l.status in ('available', 'under_offer', 'sold', 'rented')"];

  if (slug) {
    values.push(slug);
    clauses.push(`l.slug = $${values.length}`);
  }

  const sql = `
    select
      l.id,
      l.slug,
      l.purpose,
      l.title,
      l.description,
      l.suburb,
      l.city,
      l.province,
      l.price,
      l.bedrooms,
      l.bathrooms,
      l.parking,
      ag.name as agency_name,
      a.name as agent_name,
      pt.name as property_type_name,
      coalesce(array_agg(distinct f.feature) filter (where f.feature is not null), '{}'::text[]) as features,
      coalesce(array_agg(distinct i.image_url) filter (where i.image_url is not null), '{}'::text[]) as image_urls,
      coalesce(array_agg(distinct i.alt_text) filter (where i.alt_text is not null), '{}'::text[]) as image_alts,
      min(case when i.is_cover then i.image_url end) as cover_image_url,
      min(case when i.is_cover then i.alt_text end) as cover_image_alt,
      l.status,
      l.published_at,
      l.created_at,
      l.is_featured,
      l.floor_size_sqm,
      l.erf_size_sqm,
      l.rates_and_taxes,
      l.levies
    from public.listings l
    left join public.agencies ag on ag.id = l.agency_id
    left join public.agents a on a.id = l.agent_id
    left join public.property_types pt on pt.id = l.property_type_id
    left join public.listing_features f on f.listing_id = l.id
    left join public.listing_images i on i.listing_id = l.id
    where ${clauses.join(' and ')}
    group by l.id, ag.name, a.name, pt.name
    order by coalesce(l.published_at, l.created_at) desc, l.created_at desc
  `;

  const result = await pool.query<ListingRow>(sql, values);
  console.log(`[proppd] queryListings returned ${result.rows.length} rows`);
  return result.rows;
}

async function queryLeads(databaseUrl: string, agentName?: string): Promise<LeadRow[]> {
  const pool = getPortalPool(databaseUrl);
  const values: Array<string> = [];
  const clauses: string[] = [];

  if (agentName) {
    values.push(agentName);
    clauses.push(`a.name = $${values.length}`);
  }

  const sql = `
    select
      l.id,
      l.name,
      l.surname,
      l.email,
      l.phone,
      l.message,
      l.intent,
      l.status,
      l.quality,
      l.flags,
      l.created_at,
      l.source_page,
      li.slug as listing_slug,
      li.title as listing_title,
      a.name as agent_name,
      ag.name as agency_name,
      le.event_type as latest_event_type,
      le.created_at as latest_event_at,
      le.notes as latest_event_note,
      le.event_count as latest_event_count
    from public.leads l
    left join public.listings li on li.id = l.listing_id
    left join public.agents a on a.id = l.agent_id
    left join public.agencies ag on ag.id = l.agency_id
    left join lateral (
      select le.event_type, le.created_at, le.notes, count(*) over () as event_count
      from public.lead_events le
      where le.lead_id = l.id
      order by le.created_at desc
      limit 1
    ) le on true
    ${clauses.length > 0 ? `where ${clauses.join(' and ')}` : ''}
    order by l.created_at desc
    limit 250
  `;

  const result = await pool.query<LeadRow>(sql, values);
  return result.rows;
}

async function queryLeadEvents(databaseUrl: string, leadId: string): Promise<LeadEventRow[]> {
  const pool = getPortalPool(databaseUrl);
  const result = await pool.query<LeadEventRow>(
    `select
       le.id,
       le.event_type,
       le.notes,
       le.created_at,
       p.full_name as actor_name,
       p.role as actor_role,
       le.metadata
     from public.lead_events le
     left join public.profiles p on p.id = le.actor_id
     where le.lead_id = $1
     order by le.created_at desc
     limit 25`,
    [leadId],
  );

  return result.rows;
}

function mapLeadEventRow(row: LeadEventRow): LeadEventRecord {
  return {
    id: row.id,
    type: row.event_type,
    label: getLeadActivityLabel(row.event_type),
    note: row.notes,
    createdAt: row.created_at,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    metadata: row.metadata ?? {},
  };
}

function buildDemoLeadTimeline(lead: LeadRecord): LeadEventRecord[] {
  const events: LeadEventRecord[] = [];
  const sourceLabel = getLeadSourceLabel(lead.sourcePage);
  const createdAt = lead.createdAt;

  events.push({
    id: `${lead.id}-created`,
    type: 'lead_created',
    label: getLeadActivityLabel('lead_created'),
    note: `Lead captured from ${sourceLabel.toLowerCase()}.`,
    createdAt,
    actorName: null,
    actorRole: null,
    metadata: {},
  });

  if (lead.latestEventType && lead.latestEventType !== 'lead_created') {
    events.unshift({
      id: `${lead.id}-latest`,
      type: lead.latestEventType,
      label: getLeadActivityLabel(lead.latestEventType),
      note: lead.latestEventNote ?? null,
      createdAt: lead.latestEventAt ?? lead.createdAt,
      actorName: null,
      actorRole: null,
      metadata: { count: lead.latestEventCount ?? 1 },
    });
  }

  return events.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

async function queryDirectoryAgents(databaseUrl: string): Promise<DirectoryAgent[]> {
  const pool = getPortalPool(databaseUrl);
  const sql = `
    select
      a.name,
      a.slug,
      coalesce(array_to_string(a.areas_served, ', '), coalesce(ag.city, 'South Africa')) as area,
      ag.name as agency_name,
      count(l.id)::int as listings
    from public.agents a
    left join public.agencies ag on ag.id = a.agency_id
    left join public.listings l on l.agent_id = a.id and l.status in ('available', 'under_offer', 'sold', 'rented')
    where a.is_active = true
    group by a.name, a.slug, ag.name, ag.city
    order by a.name asc
  `;

  const result = await pool.query<{
    name: string;
    slug: string;
    area: string | null;
    agency_name: string | null;
    listings: number | string;
  }>(sql);

  return result.rows.map((row) => ({
    name: row.name,
    agency: row.agency_name ?? 'Independent agent',
    area: row.area ?? 'South Africa',
    listings: Number(row.listings ?? 0),
  }));
}

async function queryDirectoryAgencies(databaseUrl: string): Promise<DirectoryAgency[]> {
  const pool = getPortalPool(databaseUrl);
  const sql = `
    select
      ag.name,
      ag.slug,
      ag.city,
      count(distinct a.id)::int as agents,
      count(distinct l.id) filter (where l.status in ('available', 'under_offer', 'sold', 'rented'))::int as listings
    from public.agencies ag
    left join public.agents a on a.agency_id = ag.id and a.is_active = true
    left join public.listings l on l.agency_id = ag.id
    where ag.is_active = true
    group by ag.name, ag.slug, ag.city
    order by ag.name asc
  `;

  const result = await pool.query<{
    name: string;
    slug: string;
    city: string | null;
    agents: number | string;
    listings: number | string;
  }>(sql);

  return result.rows.map((row) => ({
    name: row.name,
    city: row.city ?? 'South Africa',
    agents: Number(row.agents ?? 0),
    listings: Number(row.listings ?? 0),
  }));
}

function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function queryCount(pool: Pool, sql: string): Promise<number> {
  const result = await pool.query<{ count: number | string }>(sql);
  const value = result.rows[0]?.count;
  return Number(value ?? 0);
}

function getPortalPool(connectionString: string): Pool {
  if (!poolCache || poolCache.connectionString !== connectionString) {
    poolCache = {
      connectionString,
      pool: new Pool({
        connectionString,
        max: 2,
        ssl: databaseNeedsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
      }),
    };
  }

  return poolCache.pool;
}

function mapListingRow(row: ListingRow): Listing {
  const suburb = normaliseText(row.suburb) ?? 'Unknown suburb';
  const city = normaliseText(row.city) ?? 'Unknown city';
  const province = normaliseText(row.province) ?? 'South Africa';
  const purpose = row.purpose === 'rent' ? 'To rent' : 'For sale';
  const priceValue = toNumber(row.price);
  const price = formatListingPrice(priceValue, row.purpose);
  const photos = buildListingPhotos(row);
  const gradient = FALLBACK_GRADIENTS[stableIndex(row.slug, FALLBACK_GRADIENTS.length)];

  return {
    id: row.id,
    slug: row.slug,
    purpose,
    title: row.title,
    location: `${suburb}, ${city}`,
    suburb,
    city,
    province,
    price,
    priceValue,
    beds: toInteger(row.bedrooms),
    baths: toInteger(row.bathrooms),
    parking: toInteger(row.parking),
    type: row.property_type_name ?? 'Property',
    agency: row.agency_name ?? 'Unassigned agency',
    agent: row.agent_name ?? 'Unassigned agent',
    gradient,
    photos,
    description: row.description ?? '',
    features: normaliseTextArray(row.features),
    highlights: buildHighlights(row),
    mandate: buildMandate(row),
    listedAt: (row.published_at ?? row.created_at).slice(0, 10),
    floorSize: toOptionalNumber(row.floor_size_sqm),
    erfSize: toOptionalNumber(row.erf_size_sqm),
    rates: toMoneyDisplay(row.rates_and_taxes),
    levies: toMoneyDisplay(row.levies),
    featured: Boolean(row.is_featured),
    viewsTotal: toOptionalNumber(row.views_total ?? null),
    views7d: toOptionalNumber(row.views_7d ?? null),
  };
}

function mapLeadRow(row: LeadRow): LeadRecord {
  const intent = mapLeadIntent(row.intent);
  const quality = mapLeadQuality(row.quality);
  const status = mapLeadStatus(row.status);
  const name = `${row.name} ${row.surname}`.trim();

  return {
    id: row.id,
    name,
    email: row.email,
    phone: row.phone,
    intent,
    status,
    quality,
    listingTitle: row.listing_title ?? 'Unassigned listing',
    listingSlug: row.listing_slug ?? 'unassigned',
    agent: row.agent_name ?? 'Unassigned agent',
    agency: row.agency_name ?? 'Unassigned agency',
    sourcePage: row.source_page ?? undefined,
    latestEventType: row.latest_event_type ?? undefined,
    latestEventAt: row.latest_event_at ?? undefined,
    latestEventNote: row.latest_event_note ?? undefined,
    latestEventCount: row.latest_event_count === null ? undefined : Number(row.latest_event_count),
    createdAt: row.created_at,
    message: row.message,
    flags: row.flags ?? [],
  };
}

function buildListingPhotos(row: ListingRow): Listing['photos'] {
  const imageUrls = row.image_urls ?? [];
  const imageAlts = row.image_alts ?? [];
  const photos = imageUrls.map((src, index) => ({ src, alt: imageAlts[index] ?? row.cover_image_alt ?? row.title }));

  if (row.cover_image_url) {
    const coverAlt = row.cover_image_alt ?? row.title;
    if (!photos.some((photo) => photo.src === row.cover_image_url)) {
      photos.unshift({ src: row.cover_image_url, alt: coverAlt });
    }
  }

  if (photos.length > 0) {
    return photos.slice(0, 3);
  }

  const fallback = FALLBACK_PHOTOS[stableIndex(row.slug, FALLBACK_PHOTOS.length)];
  return [fallback, FALLBACK_PHOTOS[(stableIndex(row.slug, FALLBACK_PHOTOS.length) + 1) % FALLBACK_PHOTOS.length], FALLBACK_PHOTOS[(stableIndex(row.slug, FALLBACK_PHOTOS.length) + 2) % FALLBACK_PHOTOS.length]].slice(0, 3);
}

function buildHighlights(row: ListingRow): Listing['highlights'] {
  const highlights = [buildMandate(row), row.is_featured ? 'Featured listing' : 'Freshly published'];
  if (row.status === 'under_offer') highlights.push('Under offer');
  if (row.status === 'sold' || row.status === 'rented') highlights.push('Recently completed');
  return highlights.slice(0, 3);
}

function buildMandate(row: ListingRow): Listing['mandate'] {
  if (row.is_featured) return 'Verified mandate';
  if (row.agent_name && row.agency_name) return 'Agency verified';
  return 'Owner verified';
}

function mapLeadIntent(value: string): LeadIntent {
  if (value === 'valuation' || value === 'finance' || value === 'viewing' || value === 'more_info') return value;
  return 'more_info';
}

function mapLeadStatus(value: string): LeadStatus {
  if (value === 'new' || value === 'contacted' || value === 'qualified' || value === 'archived') return value;
  if (value === 'viewing_booked' || value === 'converted') return 'qualified';
  return 'archived';
}

function mapLeadQuality(value: string): LeadQuality {
  if (value === 'duplicate') return 'duplicate';
  if (value === 'suspicious' || value === 'spam') return 'flagged';
  return 'clean';
}

function mapLeadQualityForDatabase(value: PortalLeadWorkflowUpdate['quality']): 'valid' | 'duplicate' | 'suspicious' {
  if (value === 'duplicate') return 'duplicate';
  if (value === 'flagged') return 'suspicious';
  return 'valid';
}

function formatListingPrice(value: number, purpose: 'sale' | 'rent'): string {
  const formatted = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }).format(Math.max(0, value));
  return `R ${formatted}${purpose === 'rent' ? ' pm' : ''}`;
}

function normaliseText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normaliseTextArray(values: string[] | null): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function toNumber(value: string | number | null): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toOptionalNumber(value: string | number | null): number | undefined {
  if (value === null) return undefined;
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toInteger(value: string | number | null): number {
  return Math.max(0, Math.round(toNumber(value)));
}

function toMoneyDisplay(value: string | number | null): string | undefined {
  if (value === null) return undefined;
  const numberValue = toNumber(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return undefined;
  return `R ${new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }).format(numberValue)}${numberValue < 100000 ? ' pm' : ''}`;
}

function stableIndex(seed: string, modulus: number): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }
  return modulus > 0 ? hash % modulus : 0;
}

function databaseNeedsSsl(connectionString: string): boolean {
  try {
    const url = new URL(connectionString);
    return !['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
}

function fallbackToDemoOnDatabaseConnectivityError<T>(error: unknown, items: T[]): PortalPayload<T> {
  const message = errorMessage(error);
  if (!isDatabaseConnectivityError(message)) {
    return { source: 'error', items: [], error: message };
  }

  return {
    source: 'demo',
    items,
    error: `Database connection failed, using verified launch fallback: ${message}`,
  };
}

function fallbackToDemoOnEmptySource<T>(items: T[], error: string): PortalPayload<T> {
  return { source: 'demo', items, error };
}

function isDatabaseConnectivityError(message: string): boolean {
  return [
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'ECONNRESET',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'Connection terminated unexpectedly',
    'timeout expired',
  ].some((token) => message.includes(token));
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function getHostname(connectionString: string): string | null {
  try {
    return new URL(connectionString).hostname;
  } catch {
    return null;
  }
}

function isPoolerDatabaseHost(host: string | null): boolean {
  return Boolean(host && host.includes('pooler') && host.includes('supabase.com'));
}

function normaliseEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}
