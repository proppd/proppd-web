import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { SavedListingsGallery } from '@/components/properties/saved-listings-gallery';
import { loadPortalListings } from '@/lib/proppd/backend';

export const metadata: Metadata = {
  title: {
    absolute: 'Saved homes | Proppd',
  },
  description: 'Keep a shortlist of saved Proppd homes on this device and sign in to sync them across devices.',
  alternates: { canonical: '/saved' },
};

export const dynamic = 'force-dynamic';

export default async function SavedHomesPage() {
  const portalListings = await loadPortalListings();

  return (
    <main className="proppd-page">
      <SiteHeader />
      <SavedListingsGallery listings={portalListings.items} />
      <SiteFooter />
    </main>
  );
}
