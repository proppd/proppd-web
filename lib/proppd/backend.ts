import { Pool, type PoolClient } from 'pg';
import { type Listing } from '../demo-data';
import { sakstonsAgents, sakstonsAgencies, sakstonsListings } from '../sakstons-data';
import { demoLeads } from '../leads/demo-leads';
import { getLeadQueue, getLeadActivityLabel, getLeadSourceLabel, isLeadStatus, type LeadRecord, type LeadQuality, type LeadStatus, type LeadIntent } from '../leads/pipeline';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';
import { isAllowedSuperAdminEmail } from '@/lib/auth/super-admin';
import { logServerError } from '@/lib/security/logging';
import type { DirectoryAgency, DirectoryAgent } from '../directory';
import { slugifyAgentName } from '../agents/profile';
import { portalPropertyTypeOptions, slugifyListingTitle, type PortalListingStatus } from './listing-editor';

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

export const AGENT_WORKSPACE_FORBIDDEN_MESSAGE = 'AgentOS and CRM are only available to approved agents and agencies.';

/**
 * The set of leads a portal account is allowed to see.
 *  - 'all'    : super admins (the whole platform)
 *  - 'agent'  : a single agent's leads, matched by agent name
 *  - 'agency' : every lead routed to an agency, matched by agency id
 *  - 'none'   : no access / no workspace identity — returns an empty queue
 *
 * The dashboard reads leads through a connection that bypasses RLS, so this
 * scope is the only thing keeping one agency's lead PII from another. It must
 * fail closed: anything without a concrete identity resolves to 'none'.
 */
export type LeadQueueScope =
  | { kind: 'all' }
  | { kind: 'agent'; agentName: string }
  | { kind: 'agency'; agencyId: string }
  | { kind: 'none' };

export function leadQueueScopeForAccess(access: PortalUserAccess | null | undefined): LeadQueueScope {
  if (!access) return { kind: 'none' };
  if (access.role === 'super_admin') return { kind: 'all' };
  if (access.role === 'agency_admin') return access.agencyId ? { kind: 'agency', agencyId: access.agencyId } : { kind: 'none' };
  if (access.role === 'agent') return access.agentName ? { kind: 'agent', agentName: access.agentName } : { kind: 'none' };
  return { kind: 'none' };
}

export function canAccessAgentWorkspace(access: PortalUserAccess | null | undefined): access is PortalUserAccess {
  if (!access) return false;
  // Super admins have full access regardless of agent linkage.
  if (access.role === 'super_admin') return true;
  // A role string alone is NOT enough: an account whose role says 'agent' or
  // 'agency_admin' but has no linked agent/agency record has no workspace of
  // its own. Letting it through means the dashboard falls back to the first
  // agent in the dataset (and the global lead queue), exposing another agent's
  // data. Require a concrete workspace identity so the CRM fails closed.
  if (access.role === 'agency_admin') return Boolean(access.agencyId);
  if (access.role === 'agent') return Boolean(access.agentId);
  return false;
}

/**
 * Clamps a role read from the database for a non-allowlisted email. A
 * super_admin value on such an account must never be honoured (defence in
 * depth behind the DB allowlist trigger): downgrade to the most privilege the
 * account's linkage actually supports.
 */
export function clampNonAdminRole(role: PortalUserAccess['role'], hasAgentLink: boolean): PortalUserAccess['role'] {
  if (role === 'super_admin') return hasAgentLink ? 'agent' : 'user';
  return role;
}

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
  isVerified: boolean;
  mandateType: string | null;
  mandateSellerName: string | null;
  mandateCommissionPct: number | null;
  mandateExpiresAt: string | null;
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
  status: 'draft' | 'pending_review' | 'available' | 'coming_soon' | 'under_offer' | 'sold' | 'rented' | 'archived';
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
  mandateType?: 'sole' | 'joint' | 'open';
  mandateSellerName?: string;
  mandateCommissionPct?: number;
  mandateExpiresAt?: string;
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
  is_verified: boolean | null;
  mandate_type: string | null;
  mandate_seller_name: string | null;
  mandate_commission_pct: string | number | null;
  mandate_expires_at: string | null;
  floor_size_sqm: number | string | null;
  erf_size_sqm: number | string | null;
  rates_and_taxes: number | string | null;
  levies: number | string | null;
  max_historical_price?: number | string | null;
  views_total?: number | string | null;
  views_7d?: number | string | null;
  lead_count?: number | string | null;
  saves_count?: number | string | null;
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
  viewing_at: string | null;
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
  'from-[#1A1A2E] via-[#4A3AFF] to-[#60A5FA]',
  'from-[#1A1A2E] via-[#4A3AFF] to-[#60A5FA]',
  'from-[#1A1A2E] via-[#4A3AFF] to-[#60A5FA]',
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
    return { source: 'demo', items: sakstonsListings };
  }

  try {
    const rows = await queryListings(databaseUrl);
    if (rows.length === 0) {
      return fallbackToDemoOnEmptySource(sakstonsListings, 'No published database listings yet, using verified launch stock.');
    }
    return { source: 'database', items: rows.map(mapListingRow) };
  } catch (error) {
    logServerError('[proppd] loadPortalListings error', error);
    return { source: 'demo', items: sakstonsListings, error: 'Database error, using verified launch fallback.' };
  }
}

export async function loadPortalListingBySlug(slug: string, env: PortalEnv = process.env): Promise<PortalPayload<Listing>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    const item = sakstonsListings.find((listing) => listing.slug === slug);
    return { source: 'demo', items: item ? [item] : [] };
  }

  try {
    const rows = await queryListings(databaseUrl, slug);
    return { source: rows.length > 0 ? 'database' : 'empty', items: rows.map(mapListingRow) };
  } catch (error) {
    const fallback = sakstonsListings.find((listing) => listing.slug === slug);
    return fallbackToDemoOnDatabaseConnectivityError(error, fallback ? [fallback] : []);
  }
}

export type ListingPricePoint = { price: number; recordedAt: string };

export async function loadListingPriceHistory(slug: string, env: PortalEnv = process.env): Promise<ListingPricePoint[]> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return [];

  try {
    const pool = getPortalPool(databaseUrl);
    const result = await pool.query<{ price: string | number; recorded_at: string }>(
      `select h.price, h.recorded_at
       from public.listing_price_history h
       join public.listings l on l.id = h.listing_id
       where l.slug = $1
       order by h.recorded_at asc`,
      [slug],
    );
    return result.rows.map((r) => ({ price: toNumber(r.price), recordedAt: r.recorded_at }));
  } catch {
    return [];
  }
}

export async function loadPortalLeadQueue(scope: LeadQueueScope, env: PortalEnv = process.env): Promise<PortalPayload<LeadRecord>> {
  // Fail closed: an account with no workspace identity sees no leads.
  if (scope.kind === 'none') return { source: 'empty', items: [] };

  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: getLeadQueue(filterDemoLeadsByScope(scope)) };
  }

  try {
    const rows = await queryLeads(databaseUrl, scope);
    return { source: rows.length > 0 ? 'database' : 'empty', items: rows.map(mapLeadRow).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()) };
  } catch (error) {
    return fallbackToDemoOnDatabaseConnectivityError(error, getLeadQueue(filterDemoLeadsByScope(scope)));
  }
}

// Demo/showcase fallback only (no live PII). Agency scope can't be matched by id
// against demo data, so it shows the demo set; agent scope filters by name.
function filterDemoLeadsByScope(scope: LeadQueueScope): LeadRecord[] {
  if (scope.kind === 'agent') return demoLeads.filter((lead) => lead.agent === scope.agentName);
  return demoLeads;
}

export async function loadPortalLeadById(leadId: string, env: PortalEnv = process.env): Promise<PortalPayload<LeadRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    const lead = getLeadQueue(demoLeads).find((entry) => entry.id === leadId);
    return lead ? { source: 'demo', items: [lead] } : { source: 'empty', items: [] };
  }

  try {
    const rows = await queryLeads(databaseUrl, { kind: 'all' });
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
  viewingAt?: string;
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
    const rows = await queryLeads(databaseUrl, { kind: 'all' });
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
    const viewingAt = input.viewingAt ?? null;

    await pool.query(
      `update public.leads
       set status = $1::public.lead_status,
           quality = $2::public.lead_quality,
           viewing_at = coalesce($4::timestamptz, viewing_at),
           updated_at = now()
       where id = $3`,
      [nextStatus, nextQuality, leadId, viewingAt],
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

export async function addPortalLeadNote(
  leadId: string,
  access: PortalUserAccess,
  note: string,
  env: PortalEnv = process.env,
): Promise<PortalPayload<LeadRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'error', items: [], error: 'Database connection is not configured.' };
  }

  const trimmed = note.trim();
  if (trimmed.length < 2) {
    return { source: 'error', items: [], error: 'Note is too short.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const rows = await queryLeads(databaseUrl, { kind: 'all' });
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

    await pool.query(
      `insert into public.lead_events (lead_id, actor_id, event_type, notes, metadata)
       values ($1, $2, 'note_added', $3, $4)`,
      [leadId, access.profileId, trimmed.slice(0, 2000), JSON.stringify({ actor_role: access.role })],
    );

    return await loadPortalLeadById(leadId, env);
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export type ConsumerEnquiryRecord = {
  id: string;
  listingTitle: string;
  listingSlug: string;
  listingCoverImage: string | null;
  agentName: string;
  status: LeadStatus;
  intent: LeadIntent;
  viewingAt: string | null;
  createdAt: string;
};

export async function loadConsumerEnquiries(userEmail: string, env: PortalEnv = process.env): Promise<PortalPayload<ConsumerEnquiryRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return { source: 'empty', items: [] };

  try {
    const pool = getPortalPool(databaseUrl);
    const result = await pool.query<{
      id: string;
      listing_title: string | null;
      listing_slug: string | null;
      cover_image_url: string | null;
      agent_name: string | null;
      status: string;
      intent: string;
      viewing_at: string | null;
      created_at: string;
    }>(
      `select
         l.id,
         li.title as listing_title,
         li.slug as listing_slug,
         min(case when img.is_cover then img.image_url end) as cover_image_url,
         a.name as agent_name,
         l.status,
         l.intent,
         l.viewing_at,
         l.created_at
       from public.leads l
       left join public.listings li on li.id = l.listing_id
       left join public.listing_images img on img.listing_id = l.listing_id
       left join public.agents a on a.id = l.agent_id
       where lower(l.email) = lower($1)
         and l.quality != 'spam'
         and l.status != 'fake_spam'
       group by l.id, li.title, li.slug, a.name
       order by l.created_at desc
       limit 50`,
      [userEmail.trim()],
    );

    const items: ConsumerEnquiryRecord[] = result.rows.map((row) => ({
      id: row.id,
      listingTitle: row.listing_title ?? 'Property enquiry',
      listingSlug: row.listing_slug ?? '',
      listingCoverImage: row.cover_image_url ?? null,
      agentName: row.agent_name ?? 'Proppd agent',
      status: mapLeadStatus(row.status),
      intent: mapLeadIntent(row.intent),
      viewingAt: row.viewing_at != null ? new Date(row.viewing_at as unknown as string | Date).toISOString() : null,
      createdAt: row.created_at,
    }));

    return { source: items.length > 0 ? 'database' : 'empty', items };
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
    return { source: 'demo', items: sakstonsAgents };
  }

  try {
    const rows = await queryDirectoryAgents(databaseUrl);
    if (rows.length === 0) {
      return fallbackToDemoOnEmptySource(sakstonsAgents, 'No database agent profiles yet, using verified launch profiles.');
    }
    return { source: 'database', items: rows };
  } catch (error) {
    return fallbackToDemoOnDatabaseConnectivityError(error, sakstonsAgents);
  }
}

export async function loadPortalAgencies(env: PortalEnv = process.env): Promise<PortalPayload<DirectoryAgency>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { source: 'demo', items: sakstonsAgencies };
  }

  try {
    const rows = await queryDirectoryAgencies(databaseUrl);
    if (rows.length === 0) {
      return fallbackToDemoOnEmptySource(sakstonsAgencies, 'No database agency profiles yet, using verified launch agencies.');
    }
    return { source: 'database', items: rows };
  } catch (error) {
    return fallbackToDemoOnDatabaseConnectivityError(error, sakstonsAgencies);
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
      l.is_verified,
      l.mandate_type,
      l.mandate_seller_name,
      l.mandate_commission_pct,
      l.mandate_expires_at,
      l.floor_size_sqm,
      l.erf_size_sqm,
      l.rates_and_taxes,
      l.levies,
      (select count(*) from public.listing_views v where v.listing_id = l.id) as views_total,
      (select count(*) from public.listing_views v where v.listing_id = l.id and v.viewed_at >= now() - interval '7 days') as views_7d,
      (select count(*) from public.leads ld where ld.listing_id = l.id) as lead_count,
      (select count(*) from public.saved_homes sh where sh.slug = l.slug) as saves_count
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
    isVerified: Boolean(row.is_verified),
    mandateType: row.mandate_type ?? null,
    mandateSellerName: row.mandate_seller_name ?? null,
    mandateCommissionPct: row.mandate_commission_pct !== null ? Number(row.mandate_commission_pct) : null,
    mandateExpiresAt: row.mandate_expires_at ?? null,
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
  const isAdminEmail = isAllowedSuperAdminEmail(userEmail);
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
    role: isAdminEmail ? 'super_admin' : clampNonAdminRole(normaliseRole(row.role), row.agent_id !== null),
    agentId: row.agent_id,
    agentName: row.agent_name,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
  };
}

/**
 * Returns true when the email belongs to a verified, active agent — i.e. an
 * agent who has passed PPRA/Fidelity Fund validation (modelled as
 * agents.is_verified). Used to let onboarded agents self-serve their first
 * passwordless login while keeping everyone else invite-only. Fails closed.
 */
export async function isVerifiedAgentEmail(email: string, env: PortalEnv = process.env): Promise<boolean> {
  const clean = email.trim().toLowerCase();
  if (!clean.includes('@')) return false;

  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return false;

  const pool = getPortalPool(databaseUrl);
  const result = await pool.query<{ eligible: boolean }>(
    `select exists(
       select 1 from public.agents
       where lower(email) = $1 and is_verified and is_active
     ) as eligible`,
    [clean],
  );
  return result.rows[0]?.eligible ?? false;
}

export async function doesProfileExistForEmail(email: string, env: PortalEnv = process.env): Promise<boolean> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return false;
  try {
    const pool = getPortalPool(databaseUrl);
    const result = await pool.query<{ exists: boolean }>(
      `select exists(select 1 from public.profiles where email = $1) as exists`,
      [email.trim().toLowerCase()],
    );
    return result.rows[0]?.exists ?? false;
  } catch {
    return false;
  }
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

const MODERATION_STATUSES = ['draft', 'pending_review', 'available', 'coming_soon', 'under_offer', 'sold', 'rented', 'archived'] as const;
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
    return { source: 'demo', items: sakstonsListings.filter((listing) => listing.agent === access.agentName || access.role === 'super_admin') };
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

export type ImportListingItem = {
  externalRef: string | null;
  listing: PortalListingWriteInput;
};

export type ImportListingsInput = {
  /** Origin label stored on each listing, e.g. the agency feed name. */
  source: string;
  /** Required when a super admin imports on behalf of an agency. */
  targetAgencyId?: string | null;
  targetAgentId?: string | null;
  items: ImportListingItem[];
};

export type ImportListingsResult = {
  source: PortalDataSource;
  created: number;
  updated: number;
  failed: number;
  errors: { ref: string; message: string }[];
  error?: string;
};

/**
 * Bulk import listings from an agency feed. Listings carrying an external
 * reference are upserted by (agency_id, external_ref) so re-running a feed
 * updates rows instead of duplicating them. Listings without a reference are
 * always inserted.
 */
export async function importPortalListings(
  access: PortalUserAccess,
  input: ImportListingsInput,
  env: PortalEnv = process.env,
): Promise<ImportListingsResult> {
  const empty: ImportListingsResult = { source: 'error', created: 0, updated: 0, failed: 0, errors: [] };

  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) {
    return { ...empty, error: 'Database connection is not configured.' };
  }

  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { ...empty, error: 'Only admins can import listings.' };
  }

  const agencyId = access.role === 'super_admin' ? (input.targetAgencyId ?? null) : access.agencyId;
  if (!agencyId) {
    return { ...empty, error: 'A target agency is required to import listings.' };
  }
  if (access.role === 'agency_admin' && input.targetAgencyId && input.targetAgencyId !== access.agencyId) {
    return { ...empty, error: 'You can only import listings into your own agency.' };
  }

  const agentId = access.role === 'super_admin' ? (input.targetAgentId ?? null) : (input.targetAgentId ?? access.agentId);
  const source = input.source.trim() || 'feed-import';

  let created = 0;
  let updated = 0;
  const errors: { ref: string; message: string }[] = [];

  try {
    const pool = getPortalPool(databaseUrl);
    for (const item of input.items) {
      const ref = item.externalRef ?? item.listing.title;
      try {
        const outcome = await upsertImportedListing(pool, agencyId, agentId, access.profileId, source, item, env);
        if (outcome === 'updated') updated += 1;
        else created += 1;
      } catch (error) {
        errors.push({ ref, message: errorMessage(error) });
      }
    }
  } catch (error) {
    return { ...empty, error: errorMessage(error) };
  }

  return {
    source: 'database',
    created,
    updated,
    failed: errors.length,
    errors,
  };
}

async function upsertImportedListing(
  pool: Pool,
  agencyId: string,
  agentId: string | null,
  profileId: string,
  source: string,
  item: ImportListingItem,
  _env: PortalEnv,
): Promise<'created' | 'updated'> {
  const propertyTypeId = await ensurePropertyTypeId(pool, item.listing.propertyTypeSlug);
  const listing = item.listing;

  if (item.externalRef) {
    const updateResult = await pool.query<{ id: string }>(
      `update public.listings set
        property_type_id = $1, agent_id = coalesce($2, agent_id), title = $3,
        purpose = $4::public.listing_purpose, status = $5::public.listing_status, price = $6,
        description = $7, suburb = $8, city = $9, province = $10,
        bedrooms = $11, bathrooms = $12, parking = $13, floor_size_sqm = $14, erf_size_sqm = $15,
        rates_and_taxes = $16, levies = $17, is_featured = $18, source = $19, imported_at = now(),
        updated_at = now(),
        published_at = case when $5::public.listing_status = 'available' and published_at is null then now() else published_at end
      where agency_id = $20 and external_ref = $21
      returning id`,
      [
        propertyTypeId, agentId, listing.title, listing.purpose, listing.status, listing.price,
        listing.description, listing.suburb, listing.city, listing.province,
        listing.bedrooms ?? null, listing.bathrooms ?? null, listing.parking ?? null,
        listing.floorSizeSqm ?? null, listing.erfSizeSqm ?? null, listing.ratesAndTaxes ?? null, listing.levies ?? null,
        Boolean(listing.isFeatured), source, agencyId, item.externalRef,
      ],
    );

    const existing = updateResult.rows[0];
    if (existing) {
      if (listing.photos && listing.photos.length > 0) {
        await replaceListingImages(pool, existing.id, listing.photos);
      }
      return 'updated';
    }
  }

  const slug = await generateUniqueListingSlug(pool, listing.title);
  const insertResult = await pool.query<{ id: string }>(
    `insert into public.listings (
      agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description,
      suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, rates_and_taxes, levies,
      is_featured, created_by, source, external_ref, imported_at, published_at
    ) values (
      $1, $2, $3, $4, $5, $6::public.listing_purpose, $7::public.listing_status, $8, $9,
      $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23, now(), case when $7::public.listing_status = 'available' then now() else null end
    ) returning id`,
    [
      agencyId, agentId, propertyTypeId, listing.title, slug, listing.purpose, listing.status, listing.price, listing.description,
      listing.suburb, listing.city, listing.province, listing.bedrooms ?? null, listing.bathrooms ?? null, listing.parking ?? null,
      listing.floorSizeSqm ?? null, listing.erfSizeSqm ?? null, listing.ratesAndTaxes ?? null, listing.levies ?? null,
      Boolean(listing.isFeatured), profileId || null, source, item.externalRef,
    ],
  );

  const inserted = insertResult.rows[0];
  if (inserted && listing.photos && listing.photos.length > 0) {
    await replaceListingImages(pool, inserted.id, listing.photos);
  }

  return 'created';
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
        mandate_type = $19,
        mandate_seller_name = $20,
        mandate_commission_pct = $21,
        mandate_expires_at = $22,
        updated_at = now(),
        published_at = case when $4::public.listing_status = 'available' and published_at is null then now() else published_at end
      where slug = $18
      returning
        id, slug, title, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking,
        (select slug from public.property_types where id = property_type_id) as property_type_slug,
        (select name from public.property_types where id = property_type_id) as property_type_name,
        agency_id, (select name from public.agencies where id = agency_id) as agency_name,
        agent_id, (select name from public.agents where id = agent_id) as agent_name,
        is_featured, is_verified, mandate_type, mandate_seller_name, mandate_commission_pct, mandate_expires_at,
        floor_size_sqm, erf_size_sqm, rates_and_taxes, levies, published_at, created_at`,
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
        input.mandateType ?? null,
        input.mandateSellerName ?? null,
        input.mandateCommissionPct ?? null,
        input.mandateExpiresAt ?? null,
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

export async function toggleListingVerification(
  slug: string,
  verified: boolean,
  access: PortalUserAccess,
  env: PortalEnv = process.env,
): Promise<{ ok: boolean; error?: string }> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return { ok: false, error: 'Database not configured.' };

  try {
    const pool = getPortalPool(databaseUrl);
    const owned = await queryManagedListings(databaseUrl, access, slug);
    if (owned.length === 0 && access.role !== 'super_admin') {
      return { ok: false, error: 'You do not have access to this listing.' };
    }

    await pool.query(
      `update public.listings set is_verified = $1, updated_at = now() where slug = $2`,
      [verified, slug],
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export type DuplicateListingGroup = {
  slug1: string;
  title1: string;
  agent1: string | null;
  slug2: string;
  title2: string;
  agent2: string | null;
  suburb: string | null;
  city: string | null;
  bedrooms: number | null;
  price: string;
};

export async function loadDuplicateListingGroups(
  access: PortalUserAccess,
  env: PortalEnv = process.env,
): Promise<DuplicateListingGroup[]> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return [];

  try {
    const pool = getPortalPool(databaseUrl);
    const values: (string | boolean)[] = [];

    // For non-admins scope to pairs involving the agent's own listings.
    let ownershipFilter = '';
    if (access.role !== 'super_admin') {
      const ors: string[] = [];
      if (access.agentId) {
        values.push(access.agentId);
        ors.push(`l1.agent_id = $${values.length} or l2.agent_id = $${values.length}`);
      }
      if (access.agencyId) {
        values.push(access.agencyId);
        ors.push(`l1.agency_id = $${values.length} or l2.agency_id = $${values.length}`);
      }
      if (ors.length > 0) ownershipFilter = `and (${ors.join(' or ')})`;
    }

    const sql = `
      select
        l1.slug  as slug1,  l1.title as title1,
        a1.name  as agent1,
        l2.slug  as slug2,  l2.title as title2,
        a2.name  as agent2,
        l1.suburb, l1.city,
        l1.bedrooms,
        l1.price
      from public.listings l1
      join public.listings l2
        on  l2.id > l1.id
        and lower(trim(coalesce(l1.suburb,''))) = lower(trim(coalesce(l2.suburb,'')))
        and lower(trim(coalesce(l1.city,'')))   = lower(trim(coalesce(l2.city,'')))
        and l1.purpose   = l2.purpose
        and l1.bedrooms  = l2.bedrooms
        and l1.price > 0
        and abs(l1.price - l2.price) / l1.price < 0.05
        and l2.status not in ('archived','fake_spam')
      left join public.agents a1 on a1.id = l1.agent_id
      left join public.agents a2 on a2.id = l2.agent_id
      where l1.status not in ('archived','fake_spam')
      ${ownershipFilter}
      order by l1.created_at desc
      limit 10
    `;

    const result = await pool.query<{
      slug1: string; title1: string; agent1: string | null;
      slug2: string; title2: string; agent2: string | null;
      suburb: string | null; city: string | null;
      bedrooms: string | null; price: string;
    }>(sql, values);

    return result.rows.map((r) => ({
      ...r,
      bedrooms: r.bedrooms !== null ? Number(r.bedrooms) : null,
      price: formatListingPrice(Number(r.price), 'sale'),
    }));
  } catch {
    return [];
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
      queryCount(pool, "select count(*)::int as count from public.listings where status in ('available', 'coming_soon', 'under_offer', 'sold', 'rented')"),
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
  const clauses = ["l.status in ('available', 'coming_soon', 'under_offer', 'sold', 'rented')"];

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
      l.is_verified,
      l.mandate_type,
      l.mandate_seller_name,
      l.mandate_commission_pct,
      l.mandate_expires_at,
      l.floor_size_sqm,
      l.erf_size_sqm,
      l.rates_and_taxes,
      l.levies,
      (select max(h.price) from public.listing_price_history h where h.listing_id = l.id) as max_historical_price
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
  return result.rows;
}

async function queryLeads(databaseUrl: string, scope: LeadQueueScope): Promise<LeadRow[]> {
  const pool = getPortalPool(databaseUrl);
  const values: Array<string> = [];
  const clauses: string[] = [];

  if (scope.kind === 'agent') {
    values.push(scope.agentName);
    clauses.push(`a.name = $${values.length}`);
  } else if (scope.kind === 'agency') {
    values.push(scope.agencyId);
    clauses.push(`l.agency_id = $${values.length}`);
  }
  // scope.kind === 'all' adds no clause; 'none' never reaches this function.

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
      l.viewing_at,
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
      a.is_verified,
      a.ffc_number,
      a.ffc_verified_at,
      coalesce(array_to_string(a.areas_served, ', '), coalesce(ag.city, 'South Africa')) as area,
      ag.name as agency_name,
      count(l.id)::int as listings
    from public.agents a
    left join public.agencies ag on ag.id = a.agency_id
    left join public.listings l on l.agent_id = a.id and l.status in ('available', 'coming_soon', 'under_offer', 'sold', 'rented')
    where a.is_active = true
    group by a.id, ag.name, ag.city
    order by a.name asc
  `;

  const result = await pool.query<{
    name: string;
    slug: string;
    is_verified: boolean;
    ffc_number: string | null;
    ffc_verified_at: string | Date | null;
    area: string | null;
    agency_name: string | null;
    listings: number | string;
  }>(sql);

  return result.rows.map((row) => ({
    name: row.name,
    agency: row.agency_name ?? 'Independent agent',
    area: row.area ?? 'South Africa',
    listings: Number(row.listings ?? 0),
    isVerified: row.is_verified === true,
    ffcNumber: row.ffc_number ?? undefined,
    ffcVerifiedAt: row.ffc_verified_at ? new Date(row.ffc_verified_at).toISOString() : undefined,
  }));
}

async function queryDirectoryAgencies(databaseUrl: string): Promise<DirectoryAgency[]> {
  const pool = getPortalPool(databaseUrl);
  const sql = `
    select
      ag.name,
      ag.slug,
      ag.city,
      ag.is_verified,
      ag.ffc_number,
      ag.ffc_verified_at,
      count(distinct a.id)::int as agents,
      count(distinct l.id) filter (where l.status in ('available', 'coming_soon', 'under_offer', 'sold', 'rented'))::int as listings
    from public.agencies ag
    left join public.agents a on a.agency_id = ag.id and a.is_active = true
    left join public.listings l on l.agency_id = ag.id
    where ag.is_active = true
    group by ag.name, ag.slug, ag.city, ag.is_verified, ag.ffc_number, ag.ffc_verified_at
    order by ag.name asc
  `;

  const result = await pool.query<{
    name: string;
    slug: string;
    city: string | null;
    is_verified: boolean;
    ffc_number: string | null;
    ffc_verified_at: string | Date | null;
    agents: number | string;
    listings: number | string;
  }>(sql);

  return result.rows.map((row) => ({
    name: row.name,
    city: row.city ?? 'South Africa',
    agents: Number(row.agents ?? 0),
    listings: Number(row.listings ?? 0),
    isVerified: row.is_verified === true,
    ffcNumber: row.ffc_number ?? undefined,
    ffcVerifiedAt: row.ffc_verified_at ? new Date(row.ffc_verified_at).toISOString() : undefined,
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
  const maxHistoricalPrice = toOptionalNumber(row.max_historical_price ?? null);
  // A price drop of at least 1% from the highest recorded asking price.
  const priceReduced = maxHistoricalPrice !== undefined && maxHistoricalPrice > priceValue * 1.01;

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
    isVerified: Boolean(row.is_verified),
    mandateType: (row.mandate_type as 'sole' | 'joint' | 'open' | null) ?? undefined,
    mandateSellerName: row.mandate_seller_name ?? undefined,
    mandateCommissionPct: row.mandate_commission_pct !== null ? Number(row.mandate_commission_pct) : undefined,
    mandateExpiresAt: row.mandate_expires_at ?? undefined,
    priceReduced,
    previousPrice: priceReduced ? maxHistoricalPrice : undefined,
    viewsTotal: toOptionalNumber(row.views_total ?? null),
    views7d: toOptionalNumber(row.views_7d ?? null),
    leadCount: toOptionalNumber(row.lead_count ?? null),
    savesCount: toOptionalNumber(row.saves_count ?? null),
    listingStatus: row.status,
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
    viewingAt: row.viewing_at != null ? new Date(row.viewing_at as unknown as string | Date).toISOString() : undefined,
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
  if (row.status === 'coming_soon') highlights.push('Coming soon');
  if (row.status === 'under_offer') highlights.push('Under offer');
  if (row.status === 'sold' || row.status === 'rented') highlights.push('Recently completed');
  return highlights.slice(0, 3);
}

function buildMandate(row: ListingRow): Listing['mandate'] {
  if (row.mandate_type === 'sole') return 'Sole mandate';
  if (row.mandate_type === 'joint') return 'Joint mandate';
  if (row.mandate_type === 'open') return 'Open mandate';
  if (row.is_featured) return 'Verified mandate';
  if (row.agent_name && row.agency_name) return 'Agency verified';
  return 'Owner verified';
}

function mapLeadIntent(value: string): LeadIntent {
  if (value === 'valuation' || value === 'finance' || value === 'viewing' || value === 'more_info') return value;
  return 'more_info';
}

function mapLeadStatus(value: string): LeadStatus {
  if (isLeadStatus(value)) return value;
  // Legacy/unknown values fall back to the entry stage.
  return 'new';
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

// --- Scheduled feed sources --------------------------------------------------

export type FeedSourceFormat = 'csv' | 'xml' | 'json';
export type FeedAuthType = 'none' | 'basic' | 'bearer';

export type FeedSourceRecord = {
  id: string;
  agencyId: string;
  agencyName: string | null;
  name: string;
  url: string;
  format: FeedSourceFormat | null;
  recordTag: string | null;
  defaultStatus: PortalListingStatus;
  frequencyMinutes: number;
  isActive: boolean;
  authType: FeedAuthType;
  authUsername: string | null;
  hasCredentials: boolean;  // true when a password or token is stored; credentials never returned
  lastRunAt: string | null;
  lastStatus: string | null;
  lastMessage: string | null;
  lastSummary: unknown;
  createdAt: string;
};

export type FeedSourceWriteInput = {
  agencyId: string;
  name: string;
  url: string;
  format?: FeedSourceFormat | null;
  recordTag?: string | null;
  defaultStatus?: PortalListingStatus;
  frequencyMinutes?: number;
  isActive?: boolean;
  authType?: FeedAuthType;
  authUsername?: string | null;
  authPassword?: string | null;  // undefined = don't change; null = clear
  authToken?: string | null;     // undefined = don't change; null = clear
};

type FeedSourceRow = {
  id: string;
  agency_id: string;
  agency_name: string | null;
  name: string;
  url: string;
  format: string | null;
  record_tag: string | null;
  default_status: string;
  frequency_minutes: number | string;
  is_active: boolean;
  auth_type: string;
  auth_username: string | null;
  has_credentials: boolean;
  last_run_at: string | null;
  last_status: string | null;
  last_message: string | null;
  last_summary: unknown;
  created_at: string;
};

const FEED_SOURCE_SELECT = `select
  fs.id, fs.agency_id, fs.name, fs.url, fs.format, fs.record_tag, fs.default_status,
  fs.frequency_minutes, fs.is_active, fs.auth_type, fs.auth_username,
  (fs.auth_password is not null or fs.auth_token is not null) as has_credentials,
  fs.last_run_at, fs.last_status, fs.last_message, fs.last_summary, fs.created_at,
  (select name from public.agencies where id = fs.agency_id) as agency_name
from public.feed_sources fs`;

function mapFeedSourceRow(row: FeedSourceRow): FeedSourceRecord {
  return {
    id: row.id,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    name: row.name,
    url: row.url,
    format: (row.format as FeedSourceFormat | null) ?? null,
    recordTag: row.record_tag,
    defaultStatus: row.default_status as PortalListingStatus,
    frequencyMinutes: Number(row.frequency_minutes),
    isActive: row.is_active,
    authType: (row.auth_type as FeedAuthType) ?? 'none',
    authUsername: row.auth_username,
    hasCredentials: Boolean(row.has_credentials),
    lastRunAt: row.last_run_at,
    lastStatus: row.last_status,
    lastMessage: row.last_message,
    lastSummary: row.last_summary,
    createdAt: row.created_at,
  };
}

function feedSourceAgencyScope(access: PortalUserAccess): string | null {
  // Agency admins are scoped to their own agency; super admins see all.
  return access.role === 'super_admin' ? null : access.agencyId;
}

export async function loadFeedSources(access: PortalUserAccess, env: PortalEnv = process.env): Promise<PortalPayload<FeedSourceRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return { source: 'error', items: [], error: 'Database connection is not configured.' };
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { source: 'error', items: [], error: 'Only admins can manage feed sources.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const scope = feedSourceAgencyScope(access);
    const result = scope
      ? await pool.query<FeedSourceRow>(`${FEED_SOURCE_SELECT} where fs.agency_id = $1 order by fs.created_at desc`, [scope])
      : await pool.query<FeedSourceRow>(`${FEED_SOURCE_SELECT} order by fs.created_at desc`);
    return { source: 'database', items: result.rows.map(mapFeedSourceRow) };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export async function createFeedSource(access: PortalUserAccess, input: FeedSourceWriteInput, env: PortalEnv = process.env): Promise<PortalPayload<FeedSourceRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return { source: 'error', items: [], error: 'Database connection is not configured.' };
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { source: 'error', items: [], error: 'Only admins can manage feed sources.' };
  }

  const agencyId = access.role === 'super_admin' ? input.agencyId : access.agencyId;
  if (!agencyId) return { source: 'error', items: [], error: 'A target agency is required.' };
  if (access.role === 'agency_admin' && input.agencyId && input.agencyId !== access.agencyId) {
    return { source: 'error', items: [], error: 'You can only add feeds for your own agency.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const result = await pool.query<{ id: string }>(
      `insert into public.feed_sources (agency_id, name, url, format, record_tag, default_status, frequency_minutes, is_active, auth_type, auth_username, auth_password, auth_token, created_by)
       values ($1, $2, $3, $4, $5, $6::public.listing_status, $7, $8, $9, $10, $11, $12, $13) returning id`,
      [
        agencyId,
        input.name,
        input.url,
        input.format ?? null,
        input.recordTag ?? null,
        input.defaultStatus ?? 'pending_review',
        input.frequencyMinutes ?? 1440,
        input.isActive ?? true,
        input.authType ?? 'none',
        input.authUsername ?? null,
        input.authPassword ?? null,
        input.authToken ?? null,
        access.profileId || null,
      ],
    );
    const id = result.rows[0]?.id;
    if (!id) return { source: 'error', items: [], error: 'Feed source could not be created.' };
    const created = await pool.query<FeedSourceRow>(`${FEED_SOURCE_SELECT} where fs.id = $1`, [id]);
    return { source: 'database', items: created.rows.map(mapFeedSourceRow) };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export async function updateFeedSource(
  id: string,
  access: PortalUserAccess,
  patch: Partial<Omit<FeedSourceWriteInput, 'agencyId'>>,
  env: PortalEnv = process.env,
): Promise<PortalPayload<FeedSourceRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return { source: 'error', items: [], error: 'Database connection is not configured.' };
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { source: 'error', items: [], error: 'Only admins can manage feed sources.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const scope = feedSourceAgencyScope(access);

    // Auth fields use explicit CASE so null means "clear to null" rather than "keep existing".
    // Undefined (field absent from patch) falls through to the ELSE = keep existing.
    const authProvided = 'authType' in patch || 'authPassword' in patch || 'authToken' in patch;
    const scopeParam = scope ? `and agency_id = $${authProvided ? 13 : 10}` : '';

    const baseParams = [
      id,
      patch.name ?? null,
      patch.url ?? null,
      patch.format ?? null,
      patch.recordTag ?? null,
      patch.defaultStatus ?? null,
      patch.frequencyMinutes ?? null,
      patch.isActive ?? null,
    ];

    let result;
    if (authProvided) {
      result = await pool.query<{ id: string }>(
        `update public.feed_sources set
          name = coalesce($2, name),
          url = coalesce($3, url),
          format = coalesce($4, format),
          record_tag = coalesce($5, record_tag),
          default_status = coalesce($6, default_status)::public.listing_status,
          frequency_minutes = coalesce($7, frequency_minutes),
          is_active = coalesce($8, is_active),
          auth_type = coalesce($9, auth_type),
          auth_username = coalesce($10, auth_username),
          auth_password = $11,
          auth_token = $12,
          updated_at = now()
        where id = $1 ${scopeParam}
        returning id`,
        scope
          ? [...baseParams, patch.authType ?? null, patch.authUsername ?? null, patch.authPassword ?? null, patch.authToken ?? null, scope]
          : [...baseParams, patch.authType ?? null, patch.authUsername ?? null, patch.authPassword ?? null, patch.authToken ?? null],
      );
    } else {
      result = await pool.query<{ id: string }>(
        `update public.feed_sources set
          name = coalesce($2, name),
          url = coalesce($3, url),
          format = coalesce($4, format),
          record_tag = coalesce($5, record_tag),
          default_status = coalesce($6, default_status)::public.listing_status,
          frequency_minutes = coalesce($7, frequency_minutes),
          is_active = coalesce($8, is_active),
          updated_at = now()
        where id = $1 ${scopeParam}
        returning id`,
        scope
          ? [...baseParams, scope]
          : baseParams,
      );
    }

    if (result.rowCount === 0) return { source: 'error', items: [], error: 'Feed source not found.' };
    const updated = await pool.query<FeedSourceRow>(`${FEED_SOURCE_SELECT} where fs.id = $1`, [id]);
    return { source: 'database', items: updated.rows.map(mapFeedSourceRow) };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

export async function deleteFeedSource(id: string, access: PortalUserAccess, env: PortalEnv = process.env): Promise<PortalPayload<{ id: string }>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return { source: 'error', items: [], error: 'Database connection is not configured.' };
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return { source: 'error', items: [], error: 'Only admins can manage feed sources.' };
  }

  try {
    const pool = getPortalPool(databaseUrl);
    const scope = feedSourceAgencyScope(access);
    const result = scope
      ? await pool.query('delete from public.feed_sources where id = $1 and agency_id = $2', [id, scope])
      : await pool.query('delete from public.feed_sources where id = $1', [id]);
    if (result.rowCount === 0) return { source: 'error', items: [], error: 'Feed source not found.' };
    return { source: 'database', items: [{ id }] };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

/**
 * Returns the Authorization header value for a feed, or null if the feed has
 * no credentials. Credentials are never included in FeedSourceRecord — call
 * this only inside server-side sync runners immediately before fetching.
 */
export async function loadFeedAuthHeader(id: string, env: PortalEnv = process.env): Promise<string | null> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return null;
  try {
    const pool = getPortalPool(databaseUrl);
    const result = await pool.query<{ auth_type: string; auth_username: string | null; auth_password: string | null; auth_token: string | null }>(
      `select auth_type, auth_username, auth_password, auth_token from public.feed_sources where id = $1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;
    if (row.auth_type === 'basic' && row.auth_username && row.auth_password) {
      return 'Basic ' + Buffer.from(`${row.auth_username}:${row.auth_password}`).toString('base64');
    }
    if (row.auth_type === 'bearer' && row.auth_token) {
      return `Bearer ${row.auth_token}`;
    }
    return null;
  } catch {
    return null;
  }
}

/** Load active feed sources for the scheduled runner (system context). */
export async function loadActiveFeedSources(env: PortalEnv = process.env): Promise<PortalPayload<FeedSourceRecord>> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return { source: 'error', items: [], error: 'Database connection is not configured.' };
  try {
    const pool = getPortalPool(databaseUrl);
    const result = await pool.query<FeedSourceRow>(`${FEED_SOURCE_SELECT} where fs.is_active = true order by fs.last_run_at asc nulls first`);
    return { source: 'database', items: result.rows.map(mapFeedSourceRow) };
  } catch (error) {
    return { source: 'error', items: [], error: errorMessage(error) };
  }
}

/** Record the outcome of a scheduled feed run. */
export async function recordFeedRun(
  id: string,
  outcome: { status: 'ok' | 'error'; message: string; summary: unknown },
  env: PortalEnv = process.env,
): Promise<void> {
  const databaseUrl = getPortalDatabaseUrl(env);
  if (!databaseUrl) return;
  try {
    const pool = getPortalPool(databaseUrl);
    await pool.query(
      `update public.feed_sources set last_run_at = now(), last_status = $2, last_message = $3, last_summary = $4::jsonb, updated_at = now() where id = $1`,
      [id, outcome.status, outcome.message.slice(0, 500), JSON.stringify(outcome.summary ?? null)],
    );
  } catch (error) {
    logServerError('recordFeedRun', error);
  }
}

/** Synthetic super-admin access for system/cron-driven imports (no profile FK). */
export function systemFeedAccess(): PortalUserAccess {
  return {
    userId: 'system-feed-cron',
    profileId: '',
    role: 'super_admin',
    agentId: null,
    agentName: null,
    agencyId: null,
    agencyName: null,
  };
}
