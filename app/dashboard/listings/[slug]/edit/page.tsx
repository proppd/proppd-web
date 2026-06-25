import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ListingEditorForm } from '@/components/listings/listing-editor-form';
import { isAiConfigured } from '@/lib/ai/listing-description';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalListingDraftBySlug } from '@/lib/proppd/backend';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: {
    absolute: 'Edit listing | Proppd',
  },
  description: 'Edit an existing Proppd listing draft.',
  alternates: { canonical: '/dashboard/listings/[slug]/edit' },
};

export const dynamic = 'force-dynamic';

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const access = await requireAgentWorkspaceAccess('/dashboard/listings');

  const listing = await loadPortalListingDraftBySlug(slug, access);
  if (listing.items.length === 0 || listing.source === 'error') {
    redirect('/dashboard/listings');
  }

  const current = listing.items[0];

  return (
    <main className="proppd-page">
      <SiteHeader />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl proppd-panel p-8 shadow-sm sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Edit listing</p>
            <h1 className="mt-4 text-5xl font-bold tracking-[-.07em]">Update the live listing record.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
              Changes are saved straight into the database and tied to your authenticated account.
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)] lg:items-start">
            <div>
              <ListingEditorForm mode="edit" initialListing={current} submitUrl={`/api/dashboard/listings/${slug}`} submitLabel="Save changes" aiEnabled={isAiConfigured()} />
            </div>

            <aside className="grid gap-4">
              <SupportCard
                title="Edit status"
                text={`This record is ${current.status === 'draft' ? 'still being prepared' : 'already in circulation'} and belongs to ${current.agencyName ?? current.agentName ?? 'your account'}.`}
              >
                <StatusPill tone={current.status === 'available' ? 'live' : current.status === 'draft' ? 'draft' : 'neutral'}>
                  {formatListingStatus(current.status)}
                </StatusPill>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <MiniStat label="Purpose" value={current.purpose === 'sale' ? 'For sale' : 'To rent'} />
                  <MiniStat label="Featured" value={current.isFeatured ? 'Yes' : 'No'} />
                  <MiniStat label="Agency" value={current.agencyName ?? 'Unassigned'} />
                  <MiniStat label="Agent" value={current.agentName ?? 'Unassigned'} />
                </div>
              </SupportCard>

              <SupportCard title="What to do next" text="Use this page to keep the record ready for buyers, tenants, and internal review.">
                <ul className="mt-4 space-y-3 text-sm font-bold leading-6 text-[#6B7280]">
                  <li>• Confirm the price, status, and featured flag before publishing.</li>
                  <li>• Keep the suburb and city clean so search results stay trustworthy.</li>
                  <li>• Add enough description detail that a lead can enquire without guessing.</li>
                </ul>
              </SupportCard>

              <SupportCard title="Publishing signal" text={getPublishingSignal(current)}>
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#6B7280] shadow-sm ring-1 ring-slate-200">
                  {current.publishedAt
                    ? `Published at ${new Date(current.publishedAt).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}.`
                    : 'This listing is not live yet.'}
                </div>
              </SupportCard>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function formatListingStatus(status: string) {
  const map: Record<string, string> = {
    draft: 'Draft',
    pending_review: 'Pending review',
    available: 'Live',
    coming_soon: 'Coming soon',
    under_offer: 'Under offer',
    sold: 'Sold',
    rented: 'Rented',
    archived: 'Archived',
  };

  return map[status] ?? status;
}

function getPublishingSignal(listing: { status: string; publishedAt: string | null }) {
  if (listing.status === 'draft') return 'Draft listings stay internal until they are marked ready for review or made live.';
  if (listing.status === 'pending_review') return 'Pending review listings are prepared for launch, but not yet presented as live inventory.';
  if (listing.status === 'available') return 'Available listings are treated as live inventory and should stay accurate for lead capture.';
  return 'Keep this record current so the portal and lead routing stay aligned with the real-world listing state.';
}

function SupportCard({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4A3AFF]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
      {children}
    </div>
  );
}

function StatusPill({ tone, children }: { tone: 'live' | 'draft' | 'neutral'; children: React.ReactNode }) {
  const toneClass =
    tone === 'live'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : tone === 'draft'
        ? 'bg-amber-50 text-amber-700 ring-amber-200'
        : 'bg-slate-50 text-[#6B7280] ring-slate-200';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.18em] ring-1 ${toneClass}`}>{children}</span>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#9CA3AF]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#1A1A2E]">{value}</p>
    </div>
  );
}
