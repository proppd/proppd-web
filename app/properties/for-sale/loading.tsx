import { SiteHeader } from '@/components/site/header';
import { ListingGridSkeleton } from '@/components/ui/skeletons';

export default function ForSaleLoading() {
  return (
    <main className="proppd-page">
      <SiteHeader />
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-9 w-64 max-w-full animate-pulse rounded bg-[#E5E7EB]" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[#EEF0F3]" />
          <div className="mt-6">
            <ListingGridSkeleton count={6} />
          </div>
        </div>
      </section>
    </main>
  );
}
