import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Plus, Pencil, Eye, Home, Clock, CheckCircle, ListChecks } from 'lucide-react';
import { loadMyPortalListings, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';
import { getListingHealthLabel, getListingWorkspaceActions, getListingWorkspaceStats, type ListingWorkspaceAction } from '@/lib/agent/listing-workspace';

export const metadata: Metadata = {
  title: { absolute: 'Listings | Proppd' },
  description: 'Manage your property listings.',
  alternates: { canonical: '/dashboard/listings' },
};

export const dynamic = 'force-dynamic';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Draft' },
  pending_review: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
  available: { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', label: 'Live' },
  under_offer: { bg: 'bg-[#4A3AFF]/10', text: 'text-[#4A3AFF]', label: 'Under offer' },
  sold: { bg: 'bg-[#1A1A2E]/10', text: 'text-[#1A1A2E]', label: 'Sold' },
  rented: { bg: 'bg-[#1A1A2E]/10', text: 'text-[#1A1A2E]', label: 'Rented' },
  archived: { bg: 'bg-[#F3F4F6]', text: 'text-[#9CA3AF]', label: 'Archived' },
};

export default async function Page() {
  const user = await getPortalServerUser();
  if (!user) {
    redirect('/login?next=%2Fdashboard%2Flistings');
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  const { items: listings } = access ? await loadMyPortalListings(access) : { items: [] };

  const stats = getListingWorkspaceStats(listings);
  const actions = getListingWorkspaceActions(listings);

  return (
    <main className="proppd-page">

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Listings</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">Manage your listings</h1>
              <p className="mt-2 text-sm text-[#6B7280]">Keep live stock accurate, photo-ready, and easy for buyers to trust.</p>
            </div>
            <a href="/dashboard/listings/new" className="inline-flex items-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
              <Plus size={16} /> New listing
            </a>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4A3AFF]/10 text-[#4A3AFF]"><ListChecks size={18} /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">How to work listings</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1A1A2E]">Add stock, keep it fresh, then watch performance.</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">
                    Agents should not guess where to go: create new mandates here, edit live stock from the table, and use row health to spot what needs attention.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#1A1A2E] p-5 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Stock checklist</p>
              <div className="mt-4 space-y-3">
                {actions.map((action) => <ListingAction key={action.label} action={action} />)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={<Home size={16} />} label="Total" value={stats.total} />
            <MiniStat icon={<CheckCircle size={16} />} label="For sale" value={stats.sale} color="#2563EB" />
            <MiniStat icon={<Clock size={16} />} label="To rent" value={stats.rent} />
            <MiniStat icon={<Eye size={16} />} label="Views 7d" value={stats.views7d} color="#4A3AFF" />
          </div>

          {/* Listings table */}
          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            {listings.length === 0 ? (
              <div className="p-12 text-center">
                <Home size={32} className="mx-auto text-[#9CA3AF]" />
                <h2 className="mt-4 text-lg font-bold text-[#1A1A2E]">No listings yet</h2>
                <p className="mt-2 text-sm text-[#6B7280]">Create your first listing to get started.</p>
                <a href="/dashboard/listings/new" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
                  <Plus size={14} /> Create listing
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA]">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Property</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Price</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF] sm:table-cell">Location</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF] md:table-cell">Beds</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF] md:table-cell">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => {
                      return (
                        <tr key={listing.slug} className="border-b border-[#F3F4F6] transition hover:bg-[#F7F8FA]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6]">
                                {listing.photos[0] ? (
                                  <img src={listing.photos[0].src} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[#9CA3AF]"><Home size={14} /></div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-[#1A1A2E]">{listing.title}</p>
                                <p className="text-xs text-[#9CA3AF]">{listing.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-[#1A1A2E]">{listing.price}</td>
                          <td className="hidden px-4 py-3 text-[#6B7280] sm:table-cell">{listing.location}</td>
                          <td className="hidden px-4 py-3 text-[#6B7280] md:table-cell">{listing.beds}</td>
                          <td className="hidden px-4 py-3 text-[#6B7280] md:table-cell">
                            <span className="inline-flex items-center gap-1 font-bold text-[#1A1A2E]" title={`${listing.viewsTotal ?? 0} total views`}>
                              <Eye size={13} className="text-[#9CA3AF]" /> {listing.views7d ?? 0}
                              <span className="text-xs font-semibold text-[#9CA3AF]">/ 7d</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${listingHealthClass(getListingHealthLabel(listing))}`}>
                              {getListingHealthLabel(listing)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a href={`/property/${listing.slug}`} className="rounded-lg p-2 text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#1A1A2E]" title="View">
                                <Eye size={16} />
                              </a>
                              <a href={`/dashboard/listings/${listing.slug}/edit`} className="rounded-lg p-2 text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#4A3AFF]" title="Edit">
                                <Pencil size={16} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}

function ListingAction({ action }: { action: ListingWorkspaceAction }) {
  const toneClass = action.tone === 'urgent' ? 'bg-amber-200 text-amber-950' : action.tone === 'active' ? 'bg-white/15 text-white' : 'bg-[#DBEAFE] text-[#1A1A2E]';
  return (
    <a href={action.href} className="block rounded-2xl bg-white/10 p-4 transition hover:bg-white/15">
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${toneClass}`}>{action.tone}</span>
      <p className="mt-3 text-sm font-bold text-white">{action.label}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-white/65">{action.detail}</p>
    </a>
  );
}

function listingHealthClass(label: string): string {
  if (label === 'Needs photos') return 'bg-amber-50 text-amber-700';
  if (label === 'Refresh details') return 'bg-[#4A3AFF]/10 text-[#4A3AFF]';
  if (label === 'Needs exposure') return 'bg-slate-100 text-slate-600';
  return 'bg-[#EFF6FF] text-[#2563EB]';
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span style={{ color: color || '#9CA3AF' }}>{icon}</span>
        <span className="text-lg font-bold text-[#1A1A2E]">{value}</span>
      </div>
      <p className="mt-0.5 text-xs font-bold text-[#9CA3AF]">{label}</p>
    </div>
  );
}
