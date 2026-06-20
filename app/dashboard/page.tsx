import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BarChart3, BellRing, Building2, CheckCircle2, ChevronRight, Eye, Home, ListPlus, MessageCircle, Phone, Plus, TrendingUp, Users } from 'lucide-react';
import { FollowUpPanel } from '@/components/dashboard/follow-up-panel';
import { loadMyPortalListings, loadPortalLeadQueue, loadPortalListings, loadPortalUserAccess } from '../../lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';
import { getAgentWorkspaceStats, formatAgentResponseSignal, type AgentFollowUpAction } from '@/lib/agent/workspace';

const agentName = 'Lerato Mokoena';

export const metadata: Metadata = {
  title: { absolute: 'Dashboard | Proppd' },
  description: 'Manage your listings, track leads, and monitor performance.',
  alternates: { canonical: '/dashboard' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getPortalServerUser();
  const access = user ? await loadPortalUserAccess(user.id, user.email) : null;
  if (user && !access) {
    return (
      <main className="min-h-screen bg-[#F7F8FA]">
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">One quick step left</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1A1A2E]">Set up your agent profile to get started.</h1>
            <p className="mt-4 text-sm text-[#6B7280]">
              You&apos;re signed in. Add your name, agency, and the areas you serve, and you&apos;ll be ready to publish listings and receive leads. It takes under a minute.
            </p>
            <div className="mt-6 flex gap-3">
              <a className="rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]" href="/dashboard/profile">Set up my profile</a>
              <a className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]" href="/agents">Browse agents</a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const portalListings = access ? (await loadMyPortalListings(access)).items : (await loadPortalListings()).items;
  const portalLeads = (await loadPortalLeadQueue(access?.agentName ?? undefined)).items;
  const workspaceAgentName = access?.agentName ?? portalListings[0]?.agent ?? portalLeads[0]?.agent ?? agentName;
  const stats = getAgentWorkspaceStats(workspaceAgentName, portalListings, portalLeads);
  const agentListings = portalListings.filter((l) => l.agent === workspaceAgentName);
  const agentLeads = portalLeads.filter((l) => l.agent === workspaceAgentName);
  const views7d = agentListings.reduce((sum, l) => sum + (l.views7d ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      {/* Hero banner */}
      <section className="bg-[#1A1A2E] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#00C9A7]">Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Welcome back, {stats.agentName.split(' ')[0]}</h1>
              <p className="mt-2 text-sm text-white/60">{stats.agencyName} · {formatAgentResponseSignal(stats)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] transition hover:bg-[#F7F8FA]" href="/dashboard/listings/new">
                <Plus size={16} /> New listing
              </a>
              <a className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10" href="/dashboard/listings">
                <ListPlus size={16} /> Manage listings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard icon={<Home size={20} />} label="Active listings" value={stats.activeListings} color="#4A3AFF" />
            <StatCard icon={<Eye size={20} />} label="Views (7 days)" value={views7d} color="#1A1A2E" />
            <StatCard icon={<BellRing size={20} />} label="New leads" value={stats.newLeads} color="#00C9A7" />
            <StatCard icon={<CheckCircle2 size={20} />} label="Qualified" value={stats.qualifiedLeads} color="#4A3AFF" />
            <StatCard icon={<TrendingUp size={20} />} label="Total leads" value={stats.totalLeads} color="#00C9A7" />
          </div>
        </div>
      </section>

      {/* Follow-up reminders */}
      <section className="px-4 pb-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FollowUpPanel leads={agentLeads} />
        </div>
      </section>

      {/* Quick actions + Recent leads */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Quick actions */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#1A1A2E]">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <QuickAction icon={<Plus size={18} />} label="New listing" href="/dashboard/listings/new" />
              <QuickAction icon={<ListPlus size={18} />} label="All listings" href="/dashboard/listings" />
              <QuickAction icon={<MessageCircle size={18} />} label="Lead queue" href="/dashboard/leads" />
              <QuickAction icon={<Building2 size={18} />} label="Admin panel" href="/admin" />
            </div>
          </div>

          {/* Recent leads */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#1A1A2E]">Recent leads</h2>
              <a href="/dashboard/leads" className="text-xs font-bold text-[#4A3AFF]">View all</a>
            </div>
            <div className="mt-4 space-y-3">
              {agentLeads.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">No leads yet. They&apos;ll appear here as buyers and tenants enquire.</p>
              ) : (
                agentLeads.slice(0, 4).map((lead) => (
                  <a key={lead.id} href={`/dashboard/leads/${lead.id}`} className="flex items-center justify-between rounded-lg border border-[#F3F4F6] px-3 py-2.5 transition hover:border-[#4A3AFF]/30 hover:bg-[#F7F8FA]">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#1A1A2E] truncate">{lead.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{lead.intent} · {lead.email}</p>
                    </div>
                    <ChevronRight size={14} className="shrink-0 text-[#9CA3AF]" />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Your listings */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1A1A2E]">Your listings</h2>
            <a href="/dashboard/listings" className="text-xs font-bold text-[#4A3AFF]">Manage all</a>
          </div>
          <div className="mt-4 space-y-3">
            {agentListings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#E5E7EB] p-8 text-center">
                <p className="text-sm text-[#9CA3AF]">No listings yet.</p>
                <a href="/dashboard/listings/new" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
                  <Plus size={14} /> Create your first listing
                </a>
              </div>
            ) : (
              agentListings.slice(0, 5).map((listing) => (
                <div key={listing.slug} className="flex items-center justify-between rounded-lg border border-[#F3F4F6] px-4 py-3 transition hover:border-[#4A3AFF]/20">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#1A1A2E] truncate">{listing.title}</p>
                    <p className="text-xs text-[#9CA3AF]">{listing.price} · {listing.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden items-center gap-1 text-xs font-bold text-[#9CA3AF] sm:inline-flex" title="Total views">
                      <Eye size={13} /> {listing.viewsTotal ?? 0}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${listing.purpose === 'For sale' ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'bg-[#00C9A7]/10 text-[#00C9A7]'}`}>
                      {listing.purpose}
                    </span>
                    <a href={`/dashboard/listings/${listing.slug}/edit`} className="text-xs font-bold text-[#4A3AFF]">Edit</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}10`, color }}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
          <p className="text-xs font-bold text-[#9CA3AF]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 transition hover:border-[#4A3AFF]/20 hover:bg-white">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
        {icon}
      </div>
      <span className="text-sm font-bold text-[#1A1A2E]">{label}</span>
    </a>
  );
}
