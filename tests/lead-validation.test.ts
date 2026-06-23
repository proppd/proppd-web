import { describe, expect, it } from 'vitest';
import { detectLeadFlags, validateLeadInput } from '@/lib/leads/validation';

describe('validateLeadInput', () => {
  it('accepts a complete POPIA-consented listing enquiry', () => {
    const result = validateLeadInput({
      name: 'Lerato',
      surname: 'Mokoena',
      email: 'buyer@example.com',
      phone: '+27 82 123 4567',
      message: 'Please send viewing times for this property.',
      intent: 'viewing',
      popiaConsent: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('buyer@example.com');
      expect(result.data.intent).toBe('viewing');
    }
  });

  it('rejects invalid contact details and missing POPIA consent', () => {
    const result = validateLeadInput({
      name: 'A',
      surname: '',
      email: 'not-email',
      phone: '123',
      message: 'hi',
      intent: 'finance',
      popiaConsent: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain('Valid email is required');
      expect(result.errors).toContain('POPIA consent is required');
    }
  });

  it('rejects unexpected lead form fields', () => {
    const payload = {
      name: 'Lerato',
      surname: 'Mokoena',
      email: 'buyer@example.com',
      phone: '+27 82 123 4567',
      message: 'Please send viewing times for this property.',
      intent: 'viewing',
      popiaConsent: true,
      isAdmin: true,
    } as unknown;

    const result = validateLeadInput(payload);

    expect(result.success).toBe(false);
  });
});

describe('detectLeadFlags', () => {
  it('flags suspicious spam keywords and duplicate enquiries', () => {
    const flags = detectLeadFlags(
      {
        email: 'buyer@example.com',
        phone: '+27821234567',
        message: 'Guaranteed SEO crypto investment for your portal',
        listingId: 'listing-1',
      },
      [
        {
          email: 'buyer@example.com',
          phone: '+27821234567',
          listingId: 'listing-1',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ],
    );

    expect(flags).toEqual(expect.arrayContaining(['spam-keyword', 'duplicate-enquiry']));
  });
});
