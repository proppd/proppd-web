import { Pool } from 'pg';
import { getPortalDatabaseUrl, type PortalUserAccess } from './backend';
import type { DealRecord, CreateDealInput, UpdateDealInput, DealStage } from './deal-stages';

// Re-export the client-safe types, stage constants, and pure helpers so server
// callers can keep importing everything from `./deals`. Client components must
// import from `./deal-stages` directly to avoid pulling `pg` into the browser.
export * from './deal-stages';

// ---------------------------------------------------------------------------
// Pool (module-scoped, cached per connection string)
// ---------------------------------------------------------------------------

let _pool: { url: string; pool: Pool } | undefined;

function getPool(): Pool | null {
  const url = getPortalDatabaseUrl();
  if (!url) return null;
  if (_pool?.url === url) return _pool.pool;
  _pool = { url, pool: new Pool({ connectionString: url }) };
  return _pool.pool;
}

// ---------------------------------------------------------------------------
// Access scope helper
// ---------------------------------------------------------------------------

type DealScope =
  | { kind: 'agent'; profileId: string }
  | { kind: 'agency'; agencyId: string }
  | { kind: 'all' };

function dealScopeForAccess(access: PortalUserAccess): DealScope {
  if (access.role === 'super_admin') return { kind: 'all' };
  if (access.agencyId) return { kind: 'agency', agencyId: access.agencyId };
  return { kind: 'agent', profileId: access.profileId };
}

function scopeWhereClause(scope: DealScope): { sql: string; bindings: unknown[] } {
  if (scope.kind === 'all') return { sql: 'true', bindings: [] };
  if (scope.kind === 'agency') return { sql: 'agency_id = $1', bindings: [scope.agencyId] };
  return { sql: 'agent_id = $1', bindings: [scope.profileId] };
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

type DealRow = Record<string, unknown>;

function mapRow(row: DealRow): DealRecord {
  const ts = (v: unknown) =>
    v == null ? null : new Date(v as string | Date).toISOString();
  return {
    id: row.id as string,
    agentId: row.agent_id as string,
    agencyId: (row.agency_id as string | null) ?? null,
    listingId: (row.listing_id as string | null) ?? null,
    propertyAddress: row.property_address as string,
    buyerName: row.buyer_name as string,
    buyerEmail: (row.buyer_email as string | null) ?? null,
    buyerPhone: (row.buyer_phone as string | null) ?? null,
    buyerAttorneyFirm: (row.buyer_attorney_firm as string | null) ?? null,
    buyerAttorneyContact: (row.buyer_attorney_contact as string | null) ?? null,
    sellerAttorneyFirm: (row.seller_attorney_firm as string | null) ?? null,
    sellerAttorneyContact: (row.seller_attorney_contact as string | null) ?? null,
    purchasePriceCents: row.purchase_price_cents != null ? Number(row.purchase_price_cents) : null,
    bondAmountCents: row.bond_amount_cents != null ? Number(row.bond_amount_cents) : null,
    commissionPct: row.commission_pct != null ? Number(row.commission_pct) : null,
    stage: row.stage as DealStage,
    otpSignedAt: ts(row.otp_signed_at),
    bondSubmittedAt: ts(row.bond_submitted_at),
    bondApprovedAt: ts(row.bond_approved_at),
    attorneyInstructedAt: ts(row.attorney_instructed_at),
    deedsLodgedAt: ts(row.deeds_lodged_at),
    registeredAt: ts(row.registered_at),
    fallenThroughAt: ts(row.fallen_through_at),
    fallenThroughReason: (row.fallen_through_reason as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: ts(row.created_at) as string,
    updatedAt: ts(row.updated_at) as string,
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function loadDeals(access: PortalUserAccess): Promise<DealRecord[]> {
  const pool = getPool();
  if (!pool) return [];
  const scope = dealScopeForAccess(access);
  const { sql, bindings } = scopeWhereClause(scope);
  const { rows } = await pool.query<DealRow>(
    `select * from public.deals where ${sql} order by created_at desc`,
    bindings,
  );
  return rows.map(mapRow);
}

export async function createDeal(
  input: CreateDealInput,
  access: PortalUserAccess,
): Promise<DealRecord> {
  const pool = getPool();
  if (!pool) throw new Error('Database not configured.');

  const { rows } = await pool.query<DealRow>(
    `insert into public.deals (
       agent_id, agency_id, listing_id, property_address,
       buyer_name, buyer_email, buyer_phone,
       purchase_price_cents, bond_amount_cents, commission_pct,
       otp_signed_at, notes
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     returning *`,
    [
      access.profileId,
      access.agencyId ?? null,
      input.listingId ?? null,
      input.propertyAddress.trim(),
      input.buyerName.trim(),
      input.buyerEmail?.trim() || null,
      input.buyerPhone?.trim() || null,
      input.purchasePriceCents ?? null,
      input.bondAmountCents ?? null,
      input.commissionPct ?? null,
      input.otpSignedAt ?? null,
      input.notes?.trim() || null,
    ],
  );
  return mapRow(rows[0]);
}

export async function updateDeal(
  id: string,
  patch: UpdateDealInput,
  access: PortalUserAccess,
): Promise<DealRecord | null> {
  const pool = getPool();
  if (!pool) throw new Error('Database not configured.');

  const scope = dealScopeForAccess(access);
  const { sql: scopeSql, bindings: scopeBindings } = scopeWhereClause(scope);

  // Build SET clause dynamically from the patch keys
  const COLUMN_MAP: Record<string, string> = {
    stage: 'stage',
    propertyAddress: 'property_address',
    buyerName: 'buyer_name',
    buyerEmail: 'buyer_email',
    buyerPhone: 'buyer_phone',
    buyerAttorneyFirm: 'buyer_attorney_firm',
    buyerAttorneyContact: 'buyer_attorney_contact',
    sellerAttorneyFirm: 'seller_attorney_firm',
    sellerAttorneyContact: 'seller_attorney_contact',
    purchasePriceCents: 'purchase_price_cents',
    bondAmountCents: 'bond_amount_cents',
    commissionPct: 'commission_pct',
    otpSignedAt: 'otp_signed_at',
    bondSubmittedAt: 'bond_submitted_at',
    bondApprovedAt: 'bond_approved_at',
    attorneyInstructedAt: 'attorney_instructed_at',
    deedsLodgedAt: 'deeds_lodged_at',
    registeredAt: 'registered_at',
    fallenThroughAt: 'fallen_through_at',
    fallenThroughReason: 'fallen_through_reason',
    notes: 'notes',
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, col] of Object.entries(COLUMN_MAP)) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      values.push((patch as Record<string, unknown>)[key]);
      setClauses.push(`${col} = $${values.length}`);
    }
  }

  if (setClauses.length === 0) return null;

  // Offset scope bindings past the SET values AND the id parameter
  const offsetScopeSql = scopeSql.replace(
    /\$(\d+)/g,
    (_, n) => `$${Number(n) + values.length + 1}`,
  );

  const { rows } = await pool.query<DealRow>(
    `update public.deals
     set ${setClauses.join(', ')}
     where id = $${values.length + 1} and ${offsetScopeSql}
     returning *`,
    [...values, id, ...scopeBindings],
  );

  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function deleteDeal(
  id: string,
  access: PortalUserAccess,
): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('Database not configured.');

  const scope = dealScopeForAccess(access);
  const { sql: scopeSql, bindings: scopeBindings } = scopeWhereClause(scope);

  const offsetScopeSql = scopeSql.replace(
    /\$(\d+)/g,
    (_, n) => `$${Number(n) + 1}`,
  );

  const { rowCount } = await pool.query(
    `delete from public.deals where id = $1 and ${offsetScopeSql}`,
    [id, ...scopeBindings],
  );
  return (rowCount ?? 0) > 0;
}
