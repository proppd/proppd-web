import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BarChart3, BellRing, CalendarClock, CheckCircle2, ChevronRight, Clock, Eye, Home, ListChecks, ListPlus, MessageCircle, Plus, TrendingUp, User, Zap } from 'lucide-react';
import { FollowUpPanel } from '@/components/dashboard/follow-up-panel';
import { loadMyPortalListings, loadPortalLeadQueue, leadQueueScopeForAccess } from '../../lib/proppd/backend';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';
import { getAgentFollowUpActions, getAgentResponseStats, getAgentToolCards, getAgentWorkspaceStats, formatAgentResponseSignal, type AgentFollowUpAction, type AgentToolCard } from '@/lib/agent/workspace';
import { formatIdleDuration } from '@/lib/leads/follow-ups';

const agentName = 'Lerato Mokoena';

export const metadata: Metadata = {
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
  const followUpActions = getAgentFollowUpActions(workspaceAgentName, portalLeads).slice(0, 3);
  const responseStats = getAgentResponseStats(workspaceAgentName, portalLeads);
  const toolCards = getAgentToolCards(stats);
  const views7d = agentListings.reduce((sum, l) => sum + (l.views7d ?? 0), 0);
  const now = new Date();
  const upcomingViewings = agentLeads
    .filter((l) => typeof l.viewingAt === 'string' && l.viewingAt.length > 0 && new Date(l.viewingAt) >= now)
    .sort((a, b) => new Date(a.viewingAt!).getTime() - new Date(b.viewingAt!).getTime())
    .slice(0, 3);

  return (
    <main className="proppd-page overflow-x-hidden">
      {/* Hero banner */}
      <section className="px-4 pt-8 pb-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Dashboard</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl">Welcome back, {stats.agentName.split(' ')[0]}</h1>
              <p className="mt-2 text-sm font-semibold text-[#6B7280]">{stats.agencyName} · {formatAgentResponseSignal(stats)}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] sm:w-auto" href="/dashboard/listings/new">
                <Plus size={16} /> New listing
              </a>
              <a className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-5 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:w-auto" href="/dashboard/listings">
                <ListPlus size={16} /> Manage listings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Speed-to-lead banner */}
      <section className="px-4 pb-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SpeedToLeadBanner stats={responseStats} />
        </div>
      </section>

      {/* Start-here CRM guide */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Start here</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A2E]">What do you need to do?</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#6B7280]">
                  The CRM is split into plain tasks: reply to people, manage stock, and keep your public profile ready. If you are unsure, open leads first.
                </p>
              </div>
              <a href="/dashboard/leads" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
                <MessageCircle size={16} /> Work leads
              </a>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <CrmRouteCard icon={<MessageCircle size={18} />} label="1. Reply to enquiries" text="New, flagged, and qualified leads live here. This is the daily work queue." href="/dashboard/leads" cta="Open lead queue" tone="primary" />
              <CrmRouteCard icon={<ListPlus size={18} />} label="2. Keep listings updated" text="Create stock, edit photos and prices, and check listing performance." href="/dashboard/listings" cta="Manage listings" />
              <CrmRouteCard icon={<Plus size={18} />} label="3. Add a property" text="Use this when a new mandate or rental needs to go live." href="/dashboard/listings/new" cta="Create listing" />
              <CrmRouteCard icon={<User size={18} />} label="4. Fix your profile" text="Update the public agent details buyers and tenants see." href="/dashboard/profile" cta="Edit profile" />
            </div>
          </div>

          <div className="rounded-2xl proppd-panel p-5 shadow-sm sm:p-6 lg:self-start">
            <ListChecks size={24} className="text-[#2563EB]" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight">Daily agent checklist</h2>
            <div className="mt-5 space-y-3">
              <ChecklistRow done={stats.newLeads === 0} label={stats.newLeads > 0 ? `${stats.newLeads} new lead${stats.newLeads === 1 ? '' : 's'} need a first reply` : 'No first replies waiting'} />
              <ChecklistRow done={stats.flaggedLeads === 0} label={stats.flaggedLeads > 0 ? `${stats.flaggedLeads} lead${stats.flaggedLeads === 1 ? '' : 's'} need quality review` : 'Quality checks are clear'} />
              <ChecklistRow done={stats.activeListings > 0} label={stats.activeListings > 0 ? `${stats.activeListings} active listing${stats.activeListings === 1 ? '' : 's'} available` : 'Add your first listing'} />
            </div>
            <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm font-bold leading-6 text-white/70">
              Rule of thumb: answer leads first, then update listings, then check profile. The sidebar keeps those routes visible everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section id="performance" className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
            <StatCard icon={<Home size={20} />} label="Active listings" value={stats.activeListings} color="#4A3AFF" />
            <StatCard icon={<Eye size={20} />} label="Views (7 days)" value={views7d} color="#1A1A2E" />
            <StatCard icon={<BellRing size={20} />} label="New leads" value={stats.newLeads} color="#2563EB" />
            <StatCard icon={<CheckCircle2 size={20} />} label="Qualified" value={stats.qualifiedLeads} color="#4A3AFF" />
            <StatCard icon={<TrendingUp size={20} />} label="Converted" value={stats.convertedLeads} color="#166534" sub={stats.totalLeads > 0 ? `${stats.conversionRate}% rate` : undefined} />
            <StatCard icon={<CalendarClock size={20} />} label="Viewings" value={upcomingViewings.length} color="#2563EB" href="/dashboard/viewings" sub={upcomingViewings.length > 0 ? 'upcoming' : undefined} />
          </div>
        </div>
      </section>

      {/* Follow-up reminders */}
      <section className="px-4 pb-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FollowUpPanel leads={agentLeads} />
        </div>
      </section>

      {/* Agent tools */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AgentToolbox actions={followUpActions} toolCards={toolCards} newLeads={stats.newLeads} flaggedLeads={stats.flaggedLeads} />
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
              <QuickAction icon={<User size={18} />} label="Profile" href="/dashboard/profile" />
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

      {/* Upcoming viewings */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#1A1A2E]">
              <CalendarClock size={16} className="text-[#2563EB]" /> Upcoming viewings
            </h2>
            <a href="/dashboard/viewings" className="text-xs font-bold text-[#2563EB]">Full schedule</a>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingViewings.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">No viewings booked yet. Book one from a lead and it appears here.</p>
            ) : (
              upcomingViewings.map((lead) => {
                const d = new Date(lead.viewingAt!);
                return (
                  <a key={lead.id} href={`/dashboard/leads/${lead.id}`} className="flex items-center justify-between rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 transition hover:border-[#2563EB]/40 hover:bg-[#DBEAFE]/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <CalendarClock size={15} className="shrink-0 text-[#2563EB]" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1A1A2E] truncate">{lead.name}</p>
                        <p className="text-xs text-[#6B7280]">{lead.listingTitle}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right pl-3">
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
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${listing.purpose === 'For sale' ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'bg-[#DBEAFE] text-[#2563EB]'}`}>
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

function SpeedToLeadBanner({ stats }: { stats: ReturnType<typeof getAgentResponseStats> }) {
  const tone =
    stats.health === 'urgent'
      ? { bg: 'border-red-200 bg-red-50', icon: 'bg-red-100 text-red-700', accent: 'text-red-700' }
      : stats.health === 'watch'
        ? { bg: 'border-amber-200 bg-amber-50', icon: 'bg-amber-100 text-amber-700', accent: 'text-amber-700' }
        : { bg: 'border-[#A7F3D0] bg-[#F0FDF4]', icon: 'bg-[#DCFCE7] text-[#166534]', accent: 'text-[#166534]' };

  const headline =
    stats.health === 'urgent'
      ? stats.oldestWaitingHours !== null
        ? `Oldest enquiry waiting ${formatIdleDuration(stats.oldestWaitingHours)}`
        : `${stats.overdueFollowUps} follow-up${stats.overdueFollowUps === 1 ? '' : 's'} overdue`
      : stats.health === 'watch'
        ? `${stats.needsResponse} enquiry${stats.needsResponse === 1 ? '' : 'ies'} awaiting a first reply`
        : 'You are on top of every enquiry';

  const detail =
    stats.health === 'clear'
      ? 'No leads are waiting and no follow-ups are overdue. The first agent to reply wins the deal — keep it up.'
      : 'Buyers contact several agents at once. The first to respond wins the deal, so clear these before anything else.';

  return (
    <div className={`flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between ${tone.bg}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}>
          {stats.health === 'clear' ? <Zap size={20} /> : <Clock size={20} />}
        </span>
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${tone.accent}`}>Speed to lead</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1A1A2E]">{headline}</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#6B7280]">{detail}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="text-center">
          <p className={`text-2xl font-bold ${tone.accent}`}>{stats.needsResponse}</p>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9CA3AF]">Awaiting reply</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${tone.accent}`}>{stats.overdueFollowUps}</p>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9CA3AF]">Overdue</p>
        </div>
        {(stats.needsResponse > 0 || stats.overdueFollowUps > 0) && (
          <a href="/dashboard/leads?status=new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A1A2E] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#000]">
            Work now
          </a>
        )}
      </div>
    </div>
  );
}

function CrmRouteCard({ icon, label, text, href, cta, tone = 'default' }: { icon: ReactNode; label: string; text: string; href: string; cta: string; tone?: 'default' | 'primary' }) {
  return (
    <a href={href} className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${tone === 'primary' ? 'border-[#4A3AFF]/25 bg-[#4A3AFF]/5' : 'border-[#E5E7EB] bg-white hover:border-[#4A3AFF]/30'}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A3AFF]/10 text-[#4A3AFF]">{icon}</span>
      <h3 className="mt-3 text-base font-bold text-[#1A1A2E]">{label}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">{text}</p>
      <span className="mt-3 inline-flex text-xs font-bold text-[#4A3AFF] transition group-hover:text-[#3A2AE0]">{cta} →</span>
    </a>
  );
}

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#DBEAFE] text-[#1A1A2E]' : 'bg-amber-200 text-amber-950'}`}>
        {done ? <CheckCircle2 size={15} /> : <BellRing size={15} />}
      </span>
      <span className="text-sm font-bold leading-5 text-white/80">{label}</span>
    </div>
  );
}

function AgentToolbox({ actions, toolCards, newLeads, flaggedLeads }: { actions: AgentFollowUpAction[]; toolCards: AgentToolCard[]; newLeads: number; flaggedLeads: number }) {
  return (
    <div className="grid gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl proppd-panel p-5 lg:self-start">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Agent tools</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">CRM command centre</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-white/65">
          Work the next lead, protect quality, and keep listing actions close to the agent workspace.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <ToolMetric label="New leads" value={newLeads} />
          <ToolMetric label="Quality review" value={flaggedLeads} tone={flaggedLeads > 0 ? 'warning' : 'calm'} />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          {toolCards.map((card) => <AgentToolCardView key={card.label} card={card} />)}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-[#1A1A2E]">Priority worklist</h3>
              <a href="/dashboard/leads" className="text-xs font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">Open CRM</a>
            </div>
            <div className="mt-3 space-y-2">
              {actions.length > 0 ? (
                actions.map((action) => <AgentActionRow key={action.leadId} action={action} />)
              ) : (
                <p className="rounded-xl bg-[#F7F8FA] p-4 text-sm font-bold text-[#6B7280]">No urgent CRM actions right now. New enquiries and quality checks will appear here.</p>
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <ToolLink icon={<MessageCircle size={16} />} label="Lead queue" text="Open all enquiries" href="/dashboard/leads" />
            <ToolLink icon={<ListPlus size={16} />} label="Listing tools" text="Edit active stock" href="/dashboard/listings" />
            <ToolLink icon={<BarChart3 size={16} />} label="Performance" text="Review views and lead flow" href="/dashboard#performance" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentToolCardView({ card }: { card: AgentToolCard }) {
  const toneClass = {
    priority: 'border-[#4A3AFF]/20 bg-[#4A3AFF]/6 text-[#4A3AFF]',
    quality: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]',
    listing: 'border-[#1A1A2E]/10 bg-[#F7F8FA] text-[#1A1A2E]',
  }[card.tone];

  return (
    <a href={card.href} className="group rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4A3AFF]/30 hover:shadow-md">
      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${toneClass}`}>{card.label}</span>
      <h3 className="mt-3 text-base font-bold text-[#1A1A2E]">{card.title}</h3>
      <p className="mt-2 text-xs font-bold leading-5 text-[#6B7280]">{card.detail}</p>
      <span className="mt-3 inline-flex text-xs font-bold text-[#4A3AFF] transition group-hover:text-[#3A2AE0]">{card.cta} →</span>
    </a>
  );
}

function ToolMetric({ label, value, tone = 'calm' }: { label: string; value: number; tone?: 'calm' | 'warning' }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className={tone === 'warning' ? 'text-2xl font-bold text-amber-200' : 'text-2xl font-bold text-white'}>{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[.12em] text-white/45">{label}</p>
    </div>
  );
}

function AgentActionRow({ action }: { action: AgentFollowUpAction }) {
  const priorityClass = action.priority === 'high' ? 'bg-red-50 text-red-700' : action.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-[#4A3AFF]/10 text-[#4A3AFF]';

  return (
    <a href={action.href} className="flex items-start justify-between gap-3 rounded-xl border border-[#F3F4F6] p-3 transition hover:border-[#4A3AFF]/30 hover:bg-[#F7F8FA]">
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#1A1A2E]">{action.label}</span>
        <span className="mt-1 block text-xs font-bold leading-5 text-[#6B7280]">{action.detail}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${priorityClass}`}>{action.priority}</span>
    </a>
  );
}

function ToolLink({ icon, label, text, href }: { icon: ReactNode; label: string; text: string; href: string }) {
  return (
    <a href={href} className="flex items-start gap-3 rounded-xl bg-[#F7F8FA] p-3 transition hover:bg-white hover:ring-1 hover:ring-[#4A3AFF]/20">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">{icon}</span>
      <span>
        <span className="block text-sm font-bold text-[#1A1A2E]">{label}</span>
        <span className="mt-0.5 block text-xs font-bold text-[#9CA3AF]">{text}</span>
      </span>
    </a>
  );
}

function StatCard({ icon, label, value, color, sub, href }: { icon: React.ReactNode; label: string; value: number; color: string; sub?: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}10`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
        <p className="text-xs font-bold text-[#9CA3AF]">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] font-bold" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:border-[#2563EB]/30 sm:p-5">
      {inner}
    </a>
  ) : (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      {inner}
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
