import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { prepareLeadInsert, stripUndefinedFields, type LeadPersistenceContext } from '@/lib/leads/persistence';
import type { ExistingLeadFingerprint, LeadInput } from '@/lib/leads/validation';

export const runtime = 'nodejs';

type LeadRequestBody = LeadInput & LeadPersistenceContext;

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
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

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const existingLeads = await loadRecentLeadFingerprints(supabase, context.listingId, body.email, body.phone);
  const prepared = prepareLeadInsert(body as LeadInput, context, existingLeads);

  if (prepared.success === false) {
    return NextResponse.json({ ok: false, errors: prepared.errors }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('leads')
    .insert(stripUndefinedFields(prepared.data))
    .select('id, status, quality, flags')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Lead could not be saved. Please use the email handoff and try again later.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, lead: data }, { status: 201 });
}

async function loadRecentLeadFingerprints(
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

  return (data as Array<{ email: string; phone: string; listing_id: string; created_at: string }>).map((lead) => ({
    email: String(lead.email),
    phone: String(lead.phone),
    listingId: String(lead.listing_id),
    createdAt: String(lead.created_at),
  }));
}
