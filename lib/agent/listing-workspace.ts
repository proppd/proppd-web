import type { Listing } from '@/lib/demo-data';

export type ListingWorkspaceStats = {
  total: number;
  sale: number;
  rent: number;
  missingPhotos: number;
  stale: number;
  views7d: number;
};

export type ListingWorkspaceAction = {
  label: string;
  detail: string;
  href: string;
  tone: 'urgent' | 'active' | 'calm';
};

const STALE_DAYS = 21;

export function getListingWorkspaceStats(listings: Listing[], now: Date = new Date()): ListingWorkspaceStats {
  return listings.reduce<ListingWorkspaceStats>(
    (stats, listing) => {
      stats.total += 1;
      if (listing.purpose === 'For sale') stats.sale += 1;
      if (listing.purpose === 'To rent') stats.rent += 1;
      if (listing.photos.length === 0) stats.missingPhotos += 1;
      if (isListingStale(listing, now)) stats.stale += 1;
      stats.views7d += listing.views7d ?? 0;
      return stats;
    },
    { total: 0, sale: 0, rent: 0, missingPhotos: 0, stale: 0, views7d: 0 },
  );
}

export function getListingWorkspaceActions(listings: Listing[], now: Date = new Date()): ListingWorkspaceAction[] {
  const stats = getListingWorkspaceStats(listings, now);
  const actions: ListingWorkspaceAction[] = [];

  if (stats.total === 0) {
    return [
      {
        label: 'Create your first listing',
        detail: 'Add one verified property so the CRM has stock to route buyer and tenant enquiries against.',
        href: '/dashboard/listings/new',
        tone: 'urgent',
      },
    ];
  }

  if (stats.missingPhotos > 0) {
    actions.push({
      label: 'Add missing photos',
      detail: `${stats.missingPhotos} listing${stats.missingPhotos === 1 ? '' : 's'} need photos before they feel trustworthy to buyers.`,
      href: '/dashboard/listings',
      tone: 'urgent',
    });
  }

  if (stats.stale > 0) {
    actions.push({
      label: 'Refresh stale stock',
      detail: `${stats.stale} listing${stats.stale === 1 ? '' : 's'} have not been touched in ${STALE_DAYS}+ days. Check price, photos, and availability.`,
      href: '/dashboard/listings',
      tone: 'active',
    });
  }

  actions.push({
    label: 'Add another mandate',
    detail: 'Use this when a new sale or rental needs to go live quickly.',
    href: '/dashboard/listings/new',
    tone: 'calm',
  });

  return actions.slice(0, 3);
}

export function getListingHealthLabel(listing: Listing, now: Date = new Date()): string {
  if (listing.photos.length === 0) return 'Needs photos';
  if (isListingStale(listing, now)) return 'Refresh details';
  if ((listing.views7d ?? 0) === 0) return 'Needs exposure';
  return 'Ready';
}

function isListingStale(listing: Listing, now: Date): boolean {
  const listedAt = new Date(listing.listedAt);
  if (Number.isNaN(listedAt.getTime())) return false;
  const ageMs = now.getTime() - listedAt.getTime();
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}
