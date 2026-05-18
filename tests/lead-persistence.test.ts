import { describe, expect, it } from 'vitest';
import { prepareLeadInsert, qualityFromFlags, stripUndefinedFields } from '@/lib/leads/persistence';

const validLead = {
  name: 'Nandi',
  surname: 'Maseko',
  email: 'NANDI@EXAMPLE.COM',
  phone: '+27 82 123 4567',
  message: 'Please send viewing times for this listing next week.',
  intent: 'viewing' as const,
  popiaConsent: true,
};

describe('lead persistence preparation', () => {
  it('maps validated lead input to the Supabase leads schema', () => {
    const prepared = prepareLeadInsert(validLead, {
      listingId: 'listing-1',
      agentId: 'agent-1',
      agencyId: 'agency-1',
      sourcePage: '/property/example',
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    });

    expect(prepared.success).toBe(true);
    if (prepared.success) {
      expect(prepared.data).toMatchObject({
        listing_id: 'listing-1',
        agent_id: 'agent-1',
        agency_id: 'agency-1',
        email: 'nandi@example.com',
        status: 'new',
        quality: 'valid',
        popia_consent: true,
      });
    }
  });

  it('marks duplicate leads without hiding them from the admin queue', () => {
    const prepared = prepareLeadInsert(
      validLead,
      { listingId: 'listing-1' },
      [{ email: 'nandi@example.com', phone: '0821234567', listingId: 'listing-1', createdAt: new Date().toISOString() }],
    );

    expect(prepared.success).toBe(true);
    if (prepared.success) {
      expect(prepared.data.quality).toBe('duplicate');
      expect(prepared.data.flags).toContain('duplicate-enquiry');
    }
  });

  it('maps spam and suspicious flags to database quality states', () => {
    expect(qualityFromFlags(['spam-keyword'])).toBe('spam');
    expect(qualityFromFlags(['suspicious-short-message'])).toBe('suspicious');
    expect(qualityFromFlags([])).toBe('valid');
  });

  it('removes undefined optional fields before Supabase insert', () => {
    expect(stripUndefinedFields({ listing_id: undefined, name: 'Nandi', source_page: '/x' })).toEqual({ name: 'Nandi', source_page: '/x' });
  });

  it('rejects persistence without POPIA consent', () => {
    const prepared = prepareLeadInsert({ ...validLead, popiaConsent: false });

    expect(prepared.success).toBe(false);
    if (!prepared.success) {
      expect(prepared.errors).toContain('POPIA consent is required');
    }
  });
});
