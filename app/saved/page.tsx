import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { SavedListingsGallery } from '@/components/properties/saved-listings-gallery';
import { SavedSearchList } from '@/components/properties/saved-search-list';
import { loadPortalListings } from '@/lib/proppd/backend';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { savedHomeSlugsFromRows } from '@/lib/listings/saved-home';

export const metadata: Metadata = {
  title: {
    absolute: 'Saved homes | Proppd',
  },
  description: 'Your Proppd shortlist — saved homes synced to your account and available across devices.',
  alternates: { canonical: '/saved' },
};

export const dynamic = 'force-dynamic';

export default async function SavedHomesPage() {
  const [portalListings, cloudSlugs] = await Promise.all([
    loadPortalListings(),
    fetchCloudSlugs(),
  ]);

  return (
    <main className="proppd-page">
      <SiteHeader />
      <SavedListingsGallery listings={portalListings.items} initialSlugs={cloudSlugs} />
      <SavedSearchList />
      <SiteFooter />
    </main>
  );
}

async function fetchCloudSlugs(): Promise<string[] | null> {
  try {
    const supabase = await createPortalSupabaseServerClient();
    if (!supabase) return null;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    const { data } = await supabase
      .from('saved_homes')
      .select('slug')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    return savedHomeSlugsFromRows(data);
  } catch {
    return null;
  }
}

