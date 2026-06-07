export function ListingCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="h-52 animate-pulse bg-[#F3F4F6]" />
      <div className="p-4">
        <div className="h-6 w-32 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-2 flex gap-4">
          <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <div className="mt-3 h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-2 h-4 w-36 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
    </article>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F8FA]">
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
