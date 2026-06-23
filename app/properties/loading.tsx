import { SiteHeader } from '@/components/site/header';
import { ListingGridSkeleton } from '@/components/ui/skeletons';

// Shown by Next while the server fetches portal listings for /properties.
// Mirrors the real layout (search bar + results header + grid) so the
// transition into the loaded page is smooth rather than a blank flash.
export default function PropertiesLoading() {
  return (
    <main className="proppd-page">
      <SiteHeader />

      {/* Search bar placeholder */}
      <section className="border-b border-[#E5E7EB] bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm sm:p-4">
            <div className="h-12 min-w-[14rem] flex-1 animate-pulse rounded-full bg-[#EEF0F3] sm:h-14" />
            <div className="hidden h-12 w-32 animate-pulse rounded-full bg-[#EEF0F3] sm:block" />
            <div className="hidden h-12 w-32 animate-pulse rounded-full bg-[#EEF0F3] md:block" />
            <div className="h-11 w-24 animate-pulse rounded-full bg-[#E5E7EB]" />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
              <div className="h-7 w-56 animate-pulse rounded bg-[#E5E7EB]" />
              <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-[#EEF0F3]" />
            </div>
            <div className="mt-5">
              <ListingGridSkeleton count={6} />
            </div>
          </div>

          {/* Sidebar placeholder (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 h-[28rem] animate-pulse rounded-xl border border-[#E5E7EB] bg-white" />
          </aside>
        </div>
      </section>
    </main>
  );
}
