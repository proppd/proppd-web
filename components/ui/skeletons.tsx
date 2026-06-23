// Mirrors the real ListingCard layout (image, price, location, facts, footer)
// so the grid reserves space and avoids pop-in while data loads.
export function ListingCardSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
      aria-hidden="true"
    >
      <div className="h-56 animate-pulse bg-[#E5E7EB] sm:h-64" />
      <div className="p-4">
        <div className="h-7 w-28 animate-pulse rounded bg-[#E5E7EB]" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-4 flex gap-4">
          <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-3">
          <div className="h-3 w-24 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-3 w-14 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
      </div>
    </article>
  );
}

// A grid of listing skeletons, announced to assistive tech as a loading state.
export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2" role="status" aria-label="Loading listings">
      <span className="sr-only">Loading listings…</span>
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <main className="proppd-page">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 overflow-hidden rounded-xl bg-white p-3 lg:grid-cols-[1.35fr_.65fr]">
            <div className="h-[25rem] animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="grid gap-3">
              <div className="h-48 animate-pulse rounded-lg bg-[#F3F4F6]" />
              <div className="h-48 animate-pulse rounded-lg bg-[#F3F4F6]" />
            </div>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_390px]">
            <div className="space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="h-8 w-48 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="mt-4 h-4 w-64 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="mt-6 grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F3F4F6]" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-xl bg-white shadow-sm" />
              <div className="h-60 animate-pulse rounded-xl bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-[#F3F4F6]" />
        <div className="flex-1">
          <div className="h-5 w-32 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}
