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
import type { ExistingLeadFingerprint, LeadInput } from '@/lib/leads/validation';

export const runtime = 'nodejs';

type LeadRequestBody = LeadInput & LeadPersistenceContext;
type SavedLead = { id: string; status: string; quality: string; flags: string[] };

let postgresPool: Pool | undefined;

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = getPortalDatabaseUrl();

  if ((!supabaseUrl || !serviceRoleKey) && !databaseUrl) {
    return NextResponse.json(
      { ok: false, error: 'Lead persistence is not configured yet. Please use the email handoff while Supabase is being connected.' },
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
    return NextResponse.json({ ok: false, error: 'Lead could not be saved. Please use the email handoff and try again later.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, lead: result }, { status: 201 });
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
