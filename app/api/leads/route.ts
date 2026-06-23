import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Pool, type QueryResult } from 'pg';
import { NextResponse, type NextRequest } from 'next/server';
import {
  prepareLeadInsert,
  stripUndefinedFields,
  type LeadPersistenceContext,
  type PreparedLeadInsert,
} from '@/lib/leads/persistence';
import { getPortalDatabaseUrl } from '@/lib/proppd/backend';
import { notifyOnNewLead } from '@/lib/notifications/lead-notifications';
import type { ExistingLeadFingerprint, LeadInput } from '@/lib/leads/validation';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';
import { logServerError } from '@/lib/security/logging';

export const runtime = 'nodejs';

type LeadNotifyTarget = {
  agentName: string | null;
  agentEmail: string | null;
  listingTitle: string | null;
  listingSlug: string | null;
};

type LeadRequestBody = LeadInput & LeadPersistenceContext;
type SavedLead = { id: string; status: string; quality: string; flags: string[] };

let postgresPool: Pool | undefined;

export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.leadForm);
  if (limited) return limited;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = getPortalDatabaseUrl();

  if ((!supabaseUrl || !serviceRoleKey) && !databaseUrl) {
    return NextResponse.json(
      { ok: false, error: 'Portal routing is not available yet. Please send the prepared email enquiry instead.' },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Partial<LeadRequestBody>;
  const context: LeadPersistenceContext = {
    listingId: body.listingId,
    agentId: body.agentId,
    agencyId: body.agencyId,
    sourcePage: body.sourcePage,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    userAgent: request.headers.get('user-agent') ?? undefined,
  };

  const existingLeads = databaseUrl
    ? await loadRecentLeadFingerprintsFromPostgres(databaseUrl, context.listingId, body.email, body.phone)
    : await loadRecentLeadFingerprintsFromSupabase(
        createClient(supabaseUrl as string, serviceRoleKey as string, { auth: { persistSession: false } }),
        context.listingId,
        body.email,
        body.phone,
      );
  const prepared = prepareLeadInsert(body as LeadInput, context, existingLeads);

  if (prepared.success === false) {
    return NextResponse.json({ ok: false, errors: prepared.errors }, { status: 400 });
  }

  const result = databaseUrl
    ? await saveLeadWithPostgres(databaseUrl, prepared.data)
    : await saveLeadWithSupabase(
        createClient(supabaseUrl as string, serviceRoleKey as string, { auth: { persistSession: false } }),
        prepared.data,
      );

  if (!result) {
    return NextResponse.json({ ok: false, error: 'The enquiry could not be routed. Please send the prepared email enquiry and try again later.' }, { status: 502 });
  }

  // Best-effort notifications: never let an email failure break a captured lead.
  try {
    const target = databaseUrl
      ? await loadLeadNotifyTargetFromPostgres(databaseUrl, context.agentId, context.listingId)
      : await loadLeadNotifyTargetFromSupabase(
          createClient(supabaseUrl as string, serviceRoleKey as string, { auth: { persistSession: false } }),
          context.agentId,
          context.listingId,
        );

    await notifyOnNewLead({
      quality: result.quality as 'valid' | 'suspicious' | 'duplicate' | 'spam',
      agentName: target.agentName,
      agentEmail: target.agentEmail,
      listingTitle: target.listingTitle,
      listingSlug: target.listingSlug,
      leadName: prepared.data.name,
      leadSurname: prepared.data.surname,
      leadEmail: prepared.data.email,
      leadPhone: prepared.data.phone,
      message: prepared.data.message,
      intent: prepared.data.intent,
    });
  } catch (error) {
    logServerError('[leads] notification failed', error);
  }

  return NextResponse.json({ ok: true, lead: result }, { status: 201 });
}

async function loadLeadNotifyTargetFromPostgres(databaseUrl: string, agentId?: string, listingId?: string): Promise<LeadNotifyTarget> {
  const pool = getPostgresPool(databaseUrl);
  const target: LeadNotifyTarget = { agentName: null, agentEmail: null, listingTitle: null, listingSlug: null };

  if (agentId) {
    const agent = await pool.query<{ name: string; email: string | null }>(
      'select name, email::text as email from public.agents where id = $1 limit 1',
      [agentId],
    );
    if (agent.rows[0]) {
      target.agentName = agent.rows[0].name;
      target.agentEmail = agent.rows[0].email;
    }
  }

  if (listingId) {
    const listing = await pool.query<{ title: string; slug: string }>(
      'select title, slug from public.listings where id = $1 limit 1',
      [listingId],
    );
    if (listing.rows[0]) {
      target.listingTitle = listing.rows[0].title;
      target.listingSlug = listing.rows[0].slug;
    }
  }

  return target;
}

async function loadLeadNotifyTargetFromSupabase(supabase: SupabaseClient, agentId?: string, listingId?: string): Promise<LeadNotifyTarget> {
  const target: LeadNotifyTarget = { agentName: null, agentEmail: null, listingTitle: null, listingSlug: null };

  if (agentId) {
    const { data } = await supabase.from('agents').select('name, email').eq('id', agentId).maybeSingle();
    if (data) {
      target.agentName = (data as { name: string }).name ?? null;
      target.agentEmail = (data as { email: string | null }).email ?? null;
    }
  }

  if (listingId) {
    const { data } = await supabase.from('listings').select('title, slug').eq('id', listingId).maybeSingle();
    if (data) {
      target.listingTitle = (data as { title: string }).title ?? null;
      target.listingSlug = (data as { slug: string }).slug ?? null;
    }
  }

  return target;
}

async function saveLeadWithSupabase(supabase: SupabaseClient, lead: PreparedLeadInsert): Promise<SavedLead | null> {
  const { data, error } = await supabase
    .from('leads')
    .insert(stripUndefinedFields(lead))
    .select('id, status, quality, flags')
    .single();

  if (error || !data) {
    return null;
  }

  return data as SavedLead;
}

async function saveLeadWithPostgres(databaseUrl: string, lead: PreparedLeadInsert): Promise<SavedLead | null> {
  const pool = getPostgresPool(databaseUrl);
  const result = await pool.query<SavedLead>(
    `insert into public.leads (
      listing_id, agent_id, agency_id, name, surname, email, phone, message, intent, status, quality,
      flags, source_page, ip_address, user_agent, popia_consent
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::inet, $15, $16)
    returning id, status, quality, flags`,
    [
      lead.listing_id ?? null,
      lead.agent_id ?? null,
      lead.agency_id ?? null,
      lead.name,
      lead.surname,
      lead.email,
      lead.phone,
      lead.message,
      lead.intent,
      lead.status,
      lead.quality,
      lead.flags,
      lead.source_page ?? null,
      lead.ip_address ?? null,
      lead.user_agent ?? null,
      lead.popia_consent,
    ],
  );

  return result.rows[0] ?? null;
}

async function loadRecentLeadFingerprintsFromSupabase(
  supabase: SupabaseClient,
  listingId?: string,
  email?: unknown,
  phone?: unknown,
): Promise<ExistingLeadFingerprint[]> {
  if (!listingId || typeof email !== 'string' || typeof phone !== 'string') {
    return [];
  }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('leads')
    .select('email, phone, listing_id, created_at')
    .eq('listing_id', listingId)
    .gte('created_at', since)
    .limit(25);

  if (error || !data) {
    return [];
  }

  return (data as Array<{ email: string; phone: string; listing_id: string; created_at: string }>).map(toLeadFingerprint);
}

async function loadRecentLeadFingerprintsFromPostgres(
  databaseUrl: string,
  listingId?: string,
  email?: unknown,
  phone?: unknown,
): Promise<ExistingLeadFingerprint[]> {
  if (!listingId || typeof email !== 'string' || typeof phone !== 'string') {
    return [];
  }

  const pool = getPostgresPool(databaseUrl);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const result: QueryResult<{ email: string; phone: string; listing_id: string; created_at: string }> = await pool.query(
    `select email, phone, listing_id, created_at
     from public.leads
     where listing_id = $1 and created_at >= $2
     order by created_at desc
     limit 25`,
    [listingId, since],
  );

  return result.rows.map(toLeadFingerprint);
}

function toLeadFingerprint(lead: { email: string; phone: string; listing_id: string; created_at: string }): ExistingLeadFingerprint {
  return {
    email: String(lead.email),
    phone: String(lead.phone),
    listingId: String(lead.listing_id),
    createdAt: String(lead.created_at),
  };
}

function getPostgresPool(connectionString: string): Pool {
  if (!postgresPool) {
    const host = safeDatabaseHost(connectionString);
    postgresPool = new Pool({
      connectionString,
      ssl: host && !['localhost', '127.0.0.1'].includes(host) ? { rejectUnauthorized: false } : undefined,
      max: 2,
    });
  }

  return postgresPool;
}

function safeDatabaseHost(connectionString: string): string | null {
  try {
    return new URL(connectionString).hostname;
  } catch {
    return null;
  }
}
