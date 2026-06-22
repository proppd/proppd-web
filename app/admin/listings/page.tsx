import type { Metadata } from 'next';
import { AlertTriangle, CheckCircle2, Clock3, Home, Star } from 'lucide-react';
import { ListingModerationControls } from '@/components/admin/listing-moderation-controls';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadManagedListingDrafts, loadPortalUserAccess, type PortalListingDraft } from '@/lib/proppd/backend';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Listing management',
  alternates: { canonical: '/admin/listings' },
};

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  available: 'Available',
  under_offer: 'Under offer',
  sold: 'Sold',
  rented: 'Rented',
  archived: 'Archived',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_review: 'bg-amber-50 text-amber-700',
  available: 'bg-[#EFF6FF] text-[#2563EB]',
  under_offer: 'bg-[#4A3AFF]/10 text-[#4A3AFF]',
  sold: 'bg-[#1A1A2E]/10 text-[#1A1A2E]',
  rented: 'bg-[#1A1A2E]/10 text-[#1A1A2E]',
  archived: 'bg-slate-100 text-slate-400',
};

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const statusFilter = getSingle(params.status);

  const user = await getPortalServerUser();
  const access = user ? await loadPortalUserAccess(user.id, user.email ?? undefined) : null;

  if (!user || !access) {
    return <AdminGate title="Sign in required" message="Sign in with an admin account to manage listings." href="/login?next=%2Fadmin%2Flistings" cta="Sign in" />;
  }
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return <AdminGate title="Admins only" message="Your account does not have listing moderation access." href="/dashboard" cta="Back to dashboard" />;
  }

  const payload = await loadManagedListingDrafts(access);
  const moderationEnabled = payload.source === 'database' || payload.source === 'empty';
  const all = payload.items;
  const listings = statusFilter ? all.filter((l) => l.status === statusFilter) : all;

  const counts = {
    total: all.length,
    pending: all.filter((l) => l.status === 'pending_review').length,
    available: all.filter((l) => l.status === 'available').length,
    featured: all.filter((l) => l.isFeatured).length,
  };

  const statusTabs = ['all', 'pending_review', 'available', 'draft', 'under_offer', 'archived'];

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-[#1A1A2E] p-8 text-white shadow-sm sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Listing management</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Approve, feature, and moderate listings</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Review what agents publish, approve pending listings, feature the best stock, and archive anything that should come down.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="/admin" className="rounded-full border border-white/20 px-4 py-2 font-bold text-white transition hover:bg-white/10">Lead operations</a>
              <a href="/admin/diagnostics" className="rounded-full border border-white/20 px-4 py-2 font-bold text-white transition hover:bg-white/10">Diagnostics</a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <StatCard icon={<Home size={20} />} label="Total listings" value={counts.total} />
            <StatCard icon={<Clock3 size={20} />} label="Pending review" value={counts.pending} warning={counts.pending > 0} />
            <StatCard icon={<CheckCircle2 size={20} />} label="Available" value={counts.available} />
            <StatCard icon={<Star size={20} />} label="Featured" value={counts.featured} />
          </div>

          {!moderationEnabled && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              {payload.source === 'error'
                ? `Listings could not be loaded: ${payload.error ?? 'unknown error'}.`
                : 'Connect a live Supabase database to load and moderate real listings.'}
            </div>
          )}

          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => {
                const isActive = (tab === 'all' && !statusFilter) || tab === statusFilter;
                return (
                  <a
                    key={tab}
                    href={tab === 'all' ? '/admin/listings' : `/admin/listings?status=${tab}`}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[.12em] transition ${isActive ? 'bg-[#1A1A2E] text-white' : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#4A3AFF] hover:text-[#4A3AFF]'}`}
                  >
                    {tab === 'all' ? 'All' : STATUS_LABELS[tab] ?? tab}
                  </a>
                );
              })}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA]">
                    <Th>Listing</Th>
                    <Th>Agent / Agency</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th>Moderate</Th>
                  </tr>
                </thead>
                <tbody>
                  {listings.length > 0 ? (
                    listings.map((listing) => (
                      <tr key={listing.slug} className="border-b border-[#F3F4F6] align-top transition hover:bg-[#F7F8FA]">
                        <td className="px-4 py-4">
                          <a href={`/property/${listing.slug}`} className="font-bold text-[#1A1A2E] transition hover:text-[#4A3AFF]">{listing.title}</a>
                          <p className="mt-1 text-xs text-[#9CA3AF]">{[listing.suburb, listing.city].filter(Boolean).join(', ') || '—'}</p>
                          {listing.isFeatured && <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#4A3AFF]"><Star size={11} className="fill-[#4A3AFF]" /> Featured</span>}
                        </td>
                        <td className="px-4 py-4 text-[#6B7280]">
                          <p className="font-bold text-[#1A1A2E]">{listing.agentName ?? 'Unassigned'}</p>
                          <p className="text-xs text-[#9CA3AF]">{listing.agencyName ?? '—'}</p>
                        </td>
                        <td className="px-4 py-4 font-bold text-[#1A1A2E]">{formatPrice(listing)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[listing.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {STATUS_LABELS[listing.status] ?? listing.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <ListingModerationControls slug={listing.slug} currentStatus={listing.status} isFeatured={listing.isFeatured} enabled={moderationEnabled} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <p className="font-bold text-[#1A1A2E]">No listings{statusFilter ? ` with status “${STATUS_LABELS[statusFilter] ?? statusFilter}”` : ''} yet.</p>
                        <p className="mt-1 text-sm text-[#9CA3AF]">Listings created by agents will appear here for review.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function formatPrice(listing: PortalListingDraft): string {
  const value = typeof listing.price === 'number' ? listing.price : Number(listing.price);
  if (!Number.isFinite(value)) return '—';
  const formatted = `R ${value.toLocaleString('en-ZA')}`;
  return listing.purpose === 'rent' ? `${formatted} pm` : formatted;
}

function getSingle(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">{children}</th>;
}

function StatCard({ icon, label, value, warning = false }: { icon: React.ReactNode; label: string; value: number; warning?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl p-3 ${warning ? 'bg-amber-50 text-amber-600' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>{icon}</div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-bold text-[#9CA3AF]">{label}</p>
    </div>
  );
}

function AdminGate({ title, message, href, cta }: { title: string; message: string; href: string; cta: string }) {
  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <SiteHeader />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Listing management</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1A1A2E]">{title}</h1>
          <p className="mt-4 text-sm text-[#6B7280]">{message}</p>
          <a href={href} className="mt-6 inline-flex rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">{cta}</a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
