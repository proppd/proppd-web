import type { Metadata } from 'next';
import { CalendarClock, CheckCircle2, ChevronRight, Clock, Eye, Home, MessageCircle, Plus, TrendingUp, Zap } from 'lucide-react';
import { FollowUpPanel } from '@/components/dashboard/follow-up-panel';
import { loadMyPortalListings, loadPortalLeadQueue, leadQueueScopeForAccess } from '../../lib/proppd/backend';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';
import { getAgentResponseStats, getAgentWorkspaceStats } from '@/lib/agent/workspace';
import { formatIdleDuration } from '@/lib/leads/follow-ups';
import type { LeadRecord } from '@/lib/leads/pipeline';

const agentName = 'Lerato Mokoena';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { absolute: 'Dashboard | Proppd' },
  description: 'Manage your listings, track leads, and monitor performance.',
  alternates: { canonical: '/dashboard' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const access = await requireAgentWorkspaceAccess('/dashboard');

  const portalListings = (await loadMyPortalListings(access)).items;
  const portalLeads = (await loadPortalLeadQueue(leadQueueScopeForAccess(access))).items;
  const workspaceAgentName = access.agentName ?? portalListings[0]?.agent ?? portalLeads[0]?.agent ?? agentName;
  const stats = getAgentWorkspaceStats(workspaceAgentName, portalListings, portalLeads);
  const agentListings = portalListings.filter((l) => l.agent === workspaceAgentName);
  const agentLeads = portalLeads.filter((l) => l.agent === workspaceAgentName);
  const responseStats = getAgentResponseStats(workspaceAgentName, portalLeads);
  const now = new Date();
  const upcomingViewings = agentLeads
    .filter((l) => typeof l.viewingAt === 'string' && l.viewingAt.length > 0 && new Date(l.viewingAt) >= now)
    .sort((a, b) => new Date(a.viewingAt!).getTime() - new Date(b.viewingAt!).getTime())
    .slice(0, 3);

  return (
    <main className="space-y-4">
      {/* Welcome */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A2E]">
              Welcome back, {stats.agentName.split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">{stats.agencyName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard/leads"
              className="inline-flex items-center gap-2 rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
            >
              <MessageCircle size={15} /> Work leads
            </a>
            <a
              href="/dashboard/listings/new"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
            >
              <Plus size={15} /> New listing
            </a>
          </div>
        </div>
      </div>

      {/* Speed-to-lead alert — compact strip when all clear, prominent when not */}
      {responseStats.health === 'clear' ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] px-4 py-2.5 text-sm font-bold text-[#166534]">
          <CheckCircle2 size={15} /> All enquiries are up to date — no leads waiting.
        </div>
      ) : (
        <SpeedToLeadBanner stats={responseStats} />
      )}

      {/* Key stats — 2×2 on mobile, 4 across on desktop */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<MessageCircle size={18} />} label="New leads" value={stats.newLeads} color="#4A3AFF" href="/dashboard/leads" />
        <StatCard icon={<CalendarClock size={18} />} label="Viewings" value={upcomingViewings.length} color="#2563EB" href="/dashboard/viewings" sub={upcomingViewings.length > 0 ? 'upcoming' : undefined} />
        <StatCard icon={<Home size={18} />} label="Active listings" value={stats.activeListings} color="#1A1A2E" href="/dashboard/listings" />
        <StatCard icon={<TrendingUp size={18} />} label="Converted" value={stats.convertedLeads} color="#166534" sub={stats.totalLeads > 0 ? `${stats.conversionRate}% rate` : undefined} />
      </div>

      {/* Follow-ups + Recent leads */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FollowUpPanel leads={agentLeads} />
        <RecentLeads leads={agentLeads} />
      </div>

      {/* Upcoming viewings + Your listings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingViewings viewings={upcomingViewings} />
        <YourListings listings={agentListings} />
      </div>
    </main>
  );
}

function SpeedToLeadBanner({ stats }: { stats: ReturnType<typeof getAgentResponseStats> }) {
  const tone =
    stats.health === 'urgent'
      ? { bg: 'border-red-200 bg-red-50', icon: 'bg-red-100 text-red-700', accent: 'text-red-700', btn: 'border-red-300 text-red-700 hover:bg-red-50' }
      : { bg: 'border-amber-200 bg-amber-50', icon: 'bg-amber-100 text-amber-700', accent: 'text-amber-700', btn: 'border-amber-300 text-amber-700 hover:bg-amber-50' };

  const headline =
    stats.health === 'urgent'
      ? stats.oldestWaitingHours !== null
        ? `Oldest enquiry waiting ${formatIdleDuration(stats.oldestWaitingHours)}`
        : `${stats.overdueFollowUps} follow-up${stats.overdueFollowUps === 1 ? '' : 's'} overdue`
      : `${stats.needsResponse} enquiry${stats.needsResponse === 1 ? '' : 'ies'} awaiting a first reply`;

  return (
    <div className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${tone.bg}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
          <Clock size={18} />
        </span>
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${tone.accent}`}>Speed to lead</p>
          <p className="mt-0.5 text-base font-bold text-[#1A1A2E]">{headline}</p>
          <p className="mt-0.5 text-xs font-semibold text-[#6B7280]">
            The first agent to reply wins the deal — clear these before anything else.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <div className="flex gap-4">
          <div className="text-center">
            <p className={`text-xl font-bold ${tone.accent}`}>{stats.needsResponse}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Awaiting reply</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${tone.accent}`}>{stats.overdueFollowUps}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Overdue</p>
          </div>
        </div>
        <a
          href="/dashboard/leads?status=new"
          className={`inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-bold transition ${tone.btn}`}
        >
          Work now →
        </a>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub, href }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
        <p className="text-xs font-bold text-[#9CA3AF]">{label}</p>
        {sub && <p className="text-[10px] font-bold" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:border-[#4A3AFF]/30">
      {inner}
    </a>
  ) : (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">{inner}</div>
  );
}

function RecentLeads({ leads }: { leads: LeadRecord[] }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#1A1A2E]">Recent leads</h2>
        <a href="/dashboard/leads" className="text-xs font-bold text-[#4A3AFF]">View all</a>
      </div>
      <div className="mt-4 space-y-2">
        {leads.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">
            No leads yet. They&apos;ll appear here as buyers and tenants enquire.
          </p>
        ) : (
          leads.slice(0, 5).map((lead) => (
            <a
              key={lead.id}
              href={`/dashboard/leads/${lead.id}`}
              className="flex items-center justify-between rounded-lg border border-[#F3F4F6] px-3 py-2.5 transition hover:border-[#4A3AFF]/30 hover:bg-[#F7F8FA]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1A1A2E]">{lead.name}</p>
                <p className="truncate text-xs text-[#9CA3AF]">{lead.intent} · {lead.email}</p>
              </div>
              <ChevronRight size={14} className="shrink-0 text-[#9CA3AF]" />
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function UpcomingViewings({ viewings }: { viewings: { id: string; name: string; listingTitle: string; viewingAt?: string | null }[] }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#1A1A2E]">
          <CalendarClock size={15} className="text-[#2563EB]" /> Upcoming viewings
        </h2>
        <a href="/dashboard/viewings" className="text-xs font-bold text-[#2563EB]">Full schedule</a>
      </div>
      <div className="mt-4 space-y-2">
        {viewings.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">
            No viewings booked yet. Book one from a lead and it appears here.
          </p>
        ) : (
          viewings.map((lead) => {
            const d = new Date(lead.viewingAt!);
            return (
              <a
                key={lead.id}
                href={`/dashboard/leads/${lead.id}`}
                className="flex items-center justify-between rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 transition hover:border-[#2563EB]/40 hover:bg-[#DBEAFE]/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1A1A2E]">{lead.name}</p>
                  <p className="truncate text-xs text-[#6B7280]">{lead.listingTitle}</p>
                </div>
                <div className="shrink-0 pl-3 text-right">
                  <p className="text-xs font-bold text-[#2563EB]">
                    {new Intl.DateTimeFormat('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }).format(d)}
                  </p>
                  <p className="text-xs font-semibold text-[#6B7280]">
                    {new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit' }).format(d)}
                  </p>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}

function YourListings({ listings }: { listings: { slug: string; title: string; price: string; location: string; viewsTotal?: number | null; purpose: string }[] }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#1A1A2E]">Your listings</h2>
        <a href="/dashboard/listings" className="text-xs font-bold text-[#4A3AFF]">Manage all</a>
      </div>
      <div className="mt-4 space-y-2">
        {listings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E7EB] p-8 text-center">
            <p className="text-sm text-[#9CA3AF]">No listings yet.</p>
            <a
              href="/dashboard/listings/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
            >
              <Plus size={14} /> Create your first listing
            </a>
          </div>
        ) : (
          listings.slice(0, 5).map((listing) => (
            <div
              key={listing.slug}
              className="flex items-center justify-between rounded-lg border border-[#F3F4F6] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1A1A2E]">{listing.title}</p>
                <p className="text-xs text-[#9CA3AF]">{listing.price} · {listing.location}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden items-center gap-1 text-xs font-bold text-[#9CA3AF] sm:inline-flex">
                  <Eye size={12} /> {listing.viewsTotal ?? 0}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${listing.purpose === 'For sale' ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'bg-[#DBEAFE] text-[#2563EB]'}`}>
                  {listing.purpose}
                </span>
                <a href={`/dashboard/listings/${listing.slug}/edit`} className="text-xs font-bold text-[#4A3AFF]">Edit</a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
