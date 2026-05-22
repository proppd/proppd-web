import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const schemaSql = readFileSync(join(repoRoot, 'supabase/migrations/001_initial_schema.sql'), 'utf8');
const rlsSql = readFileSync(join(repoRoot, 'supabase/migrations/002_rls_policies.sql'), 'utf8');
const seedSql = readFileSync(join(repoRoot, 'supabase/seed.sql'), 'utf8');
const sakstonsSeedSql = readFileSync(join(repoRoot, 'supabase/sakstons_seed.sql'), 'utf8');

const expectedTables = [
  'profiles',
  'agencies',
  'agents',
  'property_types',
  'locations',
  'listings',
  'listing_images',
  'listing_features',
  'leads',
  'lead_events',
  'saved_properties',
  'admin_activity_logs',
];

describe('Supabase portal foundation', () => {
  it('defines the core portal tables from the MVP data model', () => {
    for (const table of expectedTables) {
      expect(schemaSql).toContain(`create table public.${table}`);
    }
  });

  it('keeps listing search and lead quality operationally queryable', () => {
    expect(schemaSql).toContain('search_vector tsvector');
    expect(schemaSql).toContain('refresh_listing_search_vector');
    expect(schemaSql).toContain('create index listings_search_vector_idx');
    expect(schemaSql).toContain("create type public.lead_quality as enum ('unreviewed', 'valid', 'suspicious', 'duplicate', 'spam')");
    expect(schemaSql).toContain('create index leads_agent_idx');
    expect(schemaSql).toContain('create index leads_agency_idx');
  });

  it('enables RLS on every operational table', () => {
    for (const table of expectedTables) {
      expect(rlsSql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it('allows public lead creation only with POPIA consent and scopes lead review', () => {
    expect(rlsSql).toContain('public can create leads');
    expect(rlsSql).toContain('popia_consent = true');
    expect(rlsSql).toContain('assigned agents read leads');
    expect(rlsSql).toContain('assigned agents update lead workflow');
  });

  it('ships preview data for South African portal smoke tests', () => {
    expect(seedSql).toContain("'Sandton', 'Johannesburg'");
    expect(seedSql).toContain("'Sea Point', 'Cape Town'");
    expect(seedSql).toContain("'Umhlanga', 'Durban'");
    expect(seedSql).toContain('Proppd Verified Realty');
  });

  it('keeps Sakstons seed as live onboarding data', () => {
    expect(sakstonsSeedSql).toContain("'Sakstons', 'sakstons'");
    expect(sakstonsSeedSql).toContain('Live agency import from sakstons.com stock');
    expect(sakstonsSeedSql).toContain('is_active = true');
    expect(sakstonsSeedSql.match(/insert into public\.listings/g)?.length).toBe(38);
  });
});
