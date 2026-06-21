import { describe, expect, it } from 'vitest';
import { listings } from '@/lib/demo-data';
import { getListingHealthLabel, getListingWorkspaceActions, getListingWorkspaceStats } from '@/lib/agent/listing-workspace';

describe('listing workspace helpers', () => {
  const now = new Date('2026-06-21T12:00:00Z');

  it('summarises agent listing stock in plain CRM buckets', () => {
    const stats = getListingWorkspaceStats(listings.slice(0, 3), now);

    expect(stats.total).toBe(3);
    expect(stats.sale).toBe(2);
    expect(stats.rent).toBe(1);
    expect(stats.missingPhotos).toBe(0);
    expect(stats.stale).toBe(3);
  });

  it('gives agents practical next listing actions', () => {
    const actions = getListingWorkspaceActions([{ ...listings[0], photos: [] }], now);

    expect(actions[0]).toMatchObject({ label: 'Add missing photos', tone: 'urgent', href: '/dashboard/listings' });
    expect(actions.some((action) => action.label === 'Refresh stale stock')).toBe(true);
  });

  it('handles a zero-listing workspace with a clear first action', () => {
    expect(getListingWorkspaceActions([], now)[0]).toMatchObject({
      label: 'Create your first listing',
      href: '/dashboard/listings/new',
      tone: 'urgent',
    });
  });

  it('labels listing health for row-level guidance', () => {
    expect(getListingHealthLabel({ ...listings[0], photos: [] }, now)).toBe('Needs photos');
    expect(getListingHealthLabel({ ...listings[0], listedAt: '2026-06-20', views7d: 0 }, now)).toBe('Needs exposure');
    expect(getListingHealthLabel({ ...listings[0], listedAt: '2026-06-20', views7d: 4 }, now)).toBe('Ready');
  });
});
