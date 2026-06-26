import type { Metadata } from 'next';
import { Plus, Pencil, Eye, Home, Clock, CheckCircle, ListChecks, ShieldCheck, MessageSquare, Bookmark } from 'lucide-react';
import { ListingVerifyToggle } from '@/components/dashboard/listing-verify-toggle';
import { loadDuplicateListingGroups, loadMyPortalListings, type DuplicateListingGroup } from '@/lib/proppd/backend';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';
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
  coming_soon: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Coming soon' },
  under_offer: { bg: 'bg-[#4A3AFF]/10', text: 'text-[#4A3AFF]', label: 'Under offer' },
  sold: { bg: 'bg-[#4A3AFF]/10', text: 'text-[#4A3AFF]', label: 'Sold' },
  rented: { bg: 'bg-[#4A3AFF]/10', text: 'text-[#4A3AFF]', label: 'Rented' },
  archived: { bg: 'bg-[#F3F4F6]', text: 'text-[#9CA3AF]', label: 'Archived' },
};

export default async function Page() {
  const access = await requireAgentWorkspaceAccess('/dashboard/listings');
  const [{ items: listings }, duplicates] = await Promise.all([
    loadMyPortalListings(access),
    loadDuplicateListingGroups(access),
  ]);

  const stats = getListingWorkspaceStats(listings);
  const actions = getListingWorkspaceActions(listings);
  const totalLeads = listings.reduce((sum, l) => sum + (l.leadCount ?? 0), 0);
  const totalSaves = listings.reduce((sum, l) => sum + (l.savesCount ?? 0), 0);

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
            <div className="rounded-2xl proppd-panel p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Stock checklist</p>
              <div className="mt-4 space-y-3">
                {actions.map((action) => <ListingAction key={action.label} action={action} />)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            <MiniStat icon={<Home size={16} />} label="Total" value={stats.total} />
            <MiniStat icon={<CheckCircle size={16} />} label="For sale" value={stats.sale} color="#2563EB" />
            <MiniStat icon={<Clock size={16} />} label="To rent" value={stats.rent} />
            <MiniStat icon={<Eye size={16} />} label="Views 7d" value={stats.views7d} color="#4A3AFF" />
            <MiniStat icon={<MessageSquare size={16} />} label="Enquiries" value={totalLeads} color="#059669" />
            <MiniStat icon={<Bookmark size={16} />} label="Saves" value={totalSaves} color="#D97706" />
          </div>

          {/* Duplicate alert */}
          {duplicates.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Potential duplicates</p>
              <p className="mt-1 text-sm font-semibold text-amber-800">
                {duplicates.length} listing pair{duplicates.length === 1 ? '' : 's'} share the same suburb, bedrooms and a similar price. Review and archive the duplicate.
              </p>
              <div className="mt-4 space-y-3">
                {duplicates.map((group, i) => <DuplicateGroupRow key={i} group={group} />)}
              </div>
            </div>
          )}

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
                      <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF] md:table-cell">Interest</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Status</th>
                      <th className="hidden px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#9CA3AF] sm:table-cell" title="Proppd-verified listing">
                        <ShieldCheck size={13} className="mx-auto" />
                      </th>
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
                          <td className="hidden px-4 py-3 md:table-cell">
                            <IntentCell listing={listing} />
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const s = statusStyles[listing.listingStatus ?? ''];
                              return s ? (
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                              ) : (
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${listingHealthClass(getListingHealthLabel(listing))}`}>
                                  {getListingHealthLabel(listing)}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="hidden px-4 py-3 text-center sm:table-cell">
                            <ListingVerifyToggle slug={listing.slug} initialVerified={listing.isVerified ?? false} />
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

function intentHeat(listing: { views7d?: number; leadCount?: number; savesCount?: number }): 'high' | 'moderate' | 'low' {
  const v = listing.views7d ?? 0;
  const l = listing.leadCount ?? 0;
  const s = listing.savesCount ?? 0;
  if (v >= 30 || l >= 5 || s >= 10) return 'high';
  if (v >= 10 || l >= 2 || s >= 3) return 'moderate';
  return 'low';
}

const heatDot: Record<string, string> = {
  high: 'bg-rose-500',
  moderate: 'bg-amber-400',
  low: 'bg-[#E5E7EB]',
};

function IntentCell({ listing }: { listing: { views7d?: number; viewsTotal?: number; leadCount?: number; savesCount?: number } }) {
  const heat = intentHeat(listing);
  return (
    <div className="flex items-center gap-2">
      <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${heatDot[heat]}`} title={`${heat} interest`} />
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1A2E]" title={`${listing.viewsTotal ?? 0} total views`}>
          <Eye size={11} className="text-[#9CA3AF]" /> {listing.views7d ?? 0}<span className="font-semibold text-[#9CA3AF]">/7d</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1A2E]">
          <MessageSquare size={11} className="text-[#9CA3AF]" /> {listing.leadCount ?? 0}<span className="font-semibold text-[#9CA3AF]">enq</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1A2E]">
          <Bookmark size={11} className="text-[#9CA3AF]" /> {listing.savesCount ?? 0}<span className="font-semibold text-[#9CA3AF]">saves</span>
        </span>
      </div>
    </div>
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

function DuplicateGroupRow({ group }: { group: DuplicateListingGroup }) {
  const location = [group.suburb, group.city].filter(Boolean).join(', ') || 'Unknown location';
  const beds = group.bedrooms !== null ? `${group.bedrooms} bed` : '';
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-lg border border-amber-200 bg-white p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <a href={`/dashboard/listings/${group.slug1}/edit`} className="text-sm font-bold text-[#1A1A2E] hover:text-[#4A3AFF] truncate">{group.title1}</a>
          <span className="text-xs text-[#9CA3AF]">{group.agent1 ?? 'Unassigned'}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <a href={`/dashboard/listings/${group.slug2}/edit`} className="text-sm font-bold text-[#1A1A2E] hover:text-[#4A3AFF] truncate">{group.title2}</a>
          <span className="text-xs text-[#9CA3AF]">{group.agent2 ?? 'Unassigned'}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-amber-800">{group.price}</p>
        <p className="text-xs text-amber-700">{[location, beds].filter(Boolean).join(' · ')}</p>
      </div>
    </div>
  );
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
