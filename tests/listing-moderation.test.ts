import { describe, expect, it } from 'vitest';
import { isListingStatus, LISTING_STATUSES } from '@/lib/proppd/listing-editor';

describe('isListingStatus', () => {
  it('accepts every valid listing status', () => {
    for (const status of LISTING_STATUSES) {
      expect(isListingStatus(status)).toBe(true);
    }
  });

  it('covers the full moderation lifecycle', () => {
    expect(LISTING_STATUSES).toEqual([
      'draft',
      'pending_review',
      'available',
      'coming_soon',
      'under_offer',
      'sold',
      'rented',
      'archived',
    ]);
  });

  it('rejects unknown or malformed values', () => {
    expect(isListingStatus('published')).toBe(false);
    expect(isListingStatus('')).toBe(false);
    expect(isListingStatus(undefined)).toBe(false);
    expect(isListingStatus(null)).toBe(false);
    expect(isListingStatus(3)).toBe(false);
  });
});
