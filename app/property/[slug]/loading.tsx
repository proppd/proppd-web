import { SiteHeader } from '@/components/site/header';
import { PropertyDetailSkeleton } from '@/components/ui/skeletons';

// Shown while the server loads the listing, related homes, and diagnostics
// for a property page (force-dynamic). Keeps the header for continuity.
export default function PropertyLoading() {
  return (
    <>
      <SiteHeader />
      <PropertyDetailSkeleton />
    </>
  );
}
