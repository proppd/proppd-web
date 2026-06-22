import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MessageCircle, Mail, Phone, Clock, CheckCircle, TrendingUp, ExternalLink, Filter, ListChecks } from 'lucide-react';
import { loadPortalLeadQueue, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';
import { buildLeadFilterHref, filterLeads, formatLeadStatus, getLeadCrmStats, getLeadNextAction, getLeadQueue, hasLeadFilters, isLeadStatus, type LeadFilters, type LeadQuality, type LeadRecord, type LeadStatus } from '@/lib/leads/pipeline';
import { LeadPipelineControls } from '@/components/dashboard/lead-pipeline-controls';

export const metadata: Metadata = {
  title: { absolute: 'Leads | Proppd' },
  description: 'Track and manage your property enquiries.',
  alternates: { canonical: '/dashboard/leads' },
};

export const dynamic = 'force-dynamic';

const intentStyles: Record<string, { bg: string; text: string }> = {
  buy: { bg: 'bg-[#4A3AFF]/10', text: 'text-[#4A3AFF]' },
  rent: { bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]' },
  valuation: { bg: 'bg-amber-50', text: 'text-amber-700' },
  general: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getPortalServerUser();
  if (!user) {
    redirect('/login?next=%2Fdashboard%2Fleads');
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  const leadPayload = await loadPortalLeadQueue(access?.agentName ?? undefined);
  const leads = leadPayload.items;
  const controlsEnabled = leadPayload.source === 'database' || leadPayload.source === 'empty';
  const activeFilters = parseLeadFilters(params);
  const filteredLeads = filterLeads(leads, activeFilters);
  const filtersActive = hasLeadFilters(activeFilters);

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  };
  const crmStats = getLeadCrmStats(leads);
  const crmFocusLeads = getLeadQueue(leads)
    .filter((lead) => lead.quality === 'flagged' || ['new', 'contacted', 'viewing_booked', 'qualified'].includes(lead.status))
    .slice(0, 3);

  const statusStyles: Record<LeadStatus, string> = {
    new: 'bg-[#4A3AFF]/10 text-[#4A3AFF]',
    contacted: 'bg-amber-50 text-amber-700',
    viewing_booked: 'bg-[#4A3AFF]/10 text-[#4A3AFF]',
    qualified: 'bg-[#EFF6FF] text-[#2563EB]',
    converted: 'bg-[#DBEAFE] text-[#2563EB]',
    not_interested: 'bg-slate-100 text-slate-500',
    fake_spam: 'bg-red-50 text-red-700',
  };

  return (
    <main className="proppd-page">

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Leads</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">Track your enquiries</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Manage buyer and tenant enquiries from Proppd. Start with the first-response and quality-review lanes.</p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4A3AFF]/10 text-[#4A3AFF]"><ListChecks size={18} /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">How to work this queue</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1A1A2E]">Reply, then update the stage.</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">
                    Open the lead, use Reply/Call, then move it to Contacted, Viewing booked, Qualified, or Closed. Flagged leads should be checked before anyone wastes time.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl proppd-panel p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Queue shortcut</p>
              <p className="mt-2 text-2xl font-bold">{crmStats.needsFirstResponse} first response{crmStats.needsFirstResponse === 1 ? '' : 's'}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-white/65">Open “Needs reply” when you only want the leads that need immediate action.</p>
              <a href={buildLeadFilterHref({ status: 'new' }, '/dashboard/leads')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#1A1A2E] transition hover:bg-white/90">
                Needs reply
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={<MessageCircle size={16} />} label="Total leads" value={stats.total} />
            <MiniStat icon={<Clock size={16} />} label="New" value={stats.new} color="#4A3AFF" />
            <MiniStat icon={<CheckCircle size={16} />} label="Contacted" value={stats.contacted} color="#2563EB" />
            <MiniStat icon={<TrendingUp size={16} />} label="Converted" value={stats.converted} color="#2563EB" />
          </div>

          <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]"><Filter size={13} /> Show</span>
              <FilterChip label="All" href="/dashboard/leads" active={!filtersActive} />
              <FilterChip label="Needs reply" href={buildLeadFilterHref({ status: 'new' }, '/dashboard/leads')} active={activeFilters.status === 'new'} count={stats.new} />
              <FilterChip label="Quality review" href={buildLeadFilterHref({ quality: 'flagged' }, '/dashboard/leads')} active={activeFilters.quality === 'flagged'} count={crmStats.flagged} />
              <FilterChip label="Viewings" href={buildLeadFilterHref({ status: 'viewing_booked' }, '/dashboard/leads')} active={activeFilters.status === 'viewing_booked'} count={crmStats.viewingBooked} />
              <FilterChip label="Qualified" href={buildLeadFilterHref({ status: 'qualified' }, '/dashboard/leads')} active={activeFilters.status === 'qualified'} count={crmStats.qualified} />
            </div>
          </div>

          {/* Lead list */}
          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle size={32} className="mx-auto text-[#9CA3AF]" />
                <h2 className="mt-4 text-lg font-bold text-[#1A1A2E]">{filtersActive ? 'No leads in this lane' : 'No leads yet'}</h2>
                <p className="mt-2 text-sm text-[#6B7280]">{filtersActive ? 'Pick another lane or show all leads to keep working.' : 'Leads will appear here as buyers and tenants enquire about your listings.'}</p>
                {filtersActive ? <a href="/dashboard/leads" className="mt-4 inline-flex rounded-lg bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white">Show all leads</a> : null}
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {filteredLeads.map((lead) => {
                  const intent = intentStyles[lead.intent] || intentStyles.general;
                  return (
                    <div key={lead.id} className="flex items-start gap-4 px-4 py-4 transition hover:bg-[#F7F8FA] sm:px-6">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4A3AFF]/10 text-sm font-bold text-[#4A3AFF]">
                        {lead.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <a href={`/dashboard/leads/${lead.id}`} className="font-bold text-[#1A1A2E] transition hover:text-[#4A3AFF]">{lead.name}</a>
                            <p className="text-xs text-[#9CA3AF]">{lead.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${intent.bg} ${intent.text}`}>
                              {lead.intent}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[lead.status]}`}>
                              {formatLeadStatus(lead.status)}
                            </span>
                            {lead.quality === 'flagged' && (
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase text-red-700">Flagged</span>
                            )}
                          </div>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm text-[#6B7280]">{lead.message}</p>

                        {/* Meta */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                          <span>{lead.listingTitle || 'General enquiry'}</span>
                          {lead.phone && <span>· {lead.phone}</span>}
                          <span>· {new Intl.DateTimeFormat('en-ZA', { month: 'short', day: 'numeric' }).format(new Date(lead.createdAt))}</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          <a href={`mailto:${lead.email}?subject=Re: Proppd enquiry&body=Hi ${lead.name.split(' ')[0]},`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                            <Mail size={12} /> Reply
                          </a>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A2E] transition hover:border-[#93C5FD] hover:text-[#2563EB]">
                              <Phone size={12} /> Call
                            </a>
                          )}
                          {lead.listingSlug && (
                            <a href={`/property/${lead.listingSlug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                              <ExternalLink size={12} /> View listing
                            </a>
                          )}
                        </div>

                        {/* CRM pipeline controls */}
                        <div className="mt-3 border-t border-[#F3F4F6] pt-3">
                          <LeadPipelineControls leadId={lead.id} currentStatus={lead.status} enabled={controlsEnabled} />
                          {lead.latestEventNote ? (
                            <p className="mt-2 text-xs text-[#6B7280]"><span className="font-bold text-[#9CA3AF]">Last note:</span> {lead.latestEventNote}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Agent CRM focus</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-[#1A1A2E]">Today&apos;s follow-up board</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <CrmMetric label="Active" value={crmStats.active} />
                  <CrmMetric label="First response" value={crmStats.needsFirstResponse} tone="urgent" />
                  <CrmMetric label="Viewings" value={crmStats.viewingBooked} />
                  <CrmMetric label="Qualified" value={crmStats.qualified} tone="positive" />
                </div>
                <div className="mt-4 rounded-2xl bg-[#F7F8FA] p-4">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Queue health</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">
                    {crmStats.flagged > 0
                      ? `${crmStats.flagged} flagged lead${crmStats.flagged === 1 ? '' : 's'} need quality review before handoff.`
                      : crmStats.active > 0
                        ? `${crmStats.active} active lead${crmStats.active === 1 ? '' : 's'} remain in the agent CRM loop.`
                        : `${crmStats.closed} closed lead${crmStats.closed === 1 ? '' : 's'} are preserved for reporting.`}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Next best actions</p>
                <div className="mt-4 space-y-3">
                  {crmFocusLeads.length > 0 ? (
                    crmFocusLeads.map((lead) => <CrmActionCard key={lead.id} lead={lead} />)
                  ) : (
                    <p className="rounded-2xl bg-[#F7F8FA] p-4 text-sm font-bold leading-6 text-[#6B7280]">
                      No active lead handoffs right now. New enquiries will appear here with a suggested next step.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>

    </main>
  );
}

function parseLeadFilters(params?: Record<string, string | string[] | undefined>): LeadFilters {
  const status = firstParam(params?.status);
  const quality = firstParam(params?.quality);

  return {
    status: isLeadStatus(status) ? status : 'all',
    quality: isLeadQuality(quality) ? quality : 'all',
  };
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isLeadQuality(value: unknown): value is LeadQuality {
  return value === 'clean' || value === 'duplicate' || value === 'flagged';
}

function FilterChip({ label, href, active, count }: { label: string; href: string; active: boolean; count?: number }) {
  return (
    <a href={href} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition ${active ? 'bg-[#4A3AFF] text-white' : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#4A3AFF]/10 hover:text-[#4A3AFF]'}`}>
      {label}
      {typeof count === 'number' ? <span className={active ? 'text-white/75' : 'text-[#9CA3AF]'}>{count}</span> : null}
    </a>
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

function CrmMetric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'urgent' | 'positive' }) {
  const toneClass = tone === 'urgent' ? 'text-amber-700' : tone === 'positive' ? 'text-[#2563EB]' : 'text-[#1A1A2E]';

  return (
    <div className="rounded-2xl bg-[#F7F8FA] p-3">
      <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#9CA3AF]">{label}</p>
    </div>
  );
}

function CrmActionCard({ lead }: { lead: LeadRecord }) {
  const action = getLeadNextAction(lead);
  const toneClass = {
    urgent: 'bg-amber-50 text-amber-800 ring-amber-100',
    active: 'bg-[#4A3AFF]/10 text-[#4A3AFF] ring-[#4A3AFF]/10',
    positive: 'bg-[#EFF6FF] text-[#2563EB] ring-[#BFDBFE]',
    muted: 'bg-slate-100 text-slate-600 ring-slate-200',
    danger: 'bg-red-50 text-red-700 ring-red-100',
  }[action.tone];

  return (
    <a href={`/dashboard/leads/${lead.id}`} className="block rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#4A3AFF] hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#1A1A2E]">{lead.name}</p>
          <p className="mt-1 text-xs font-bold text-[#9CA3AF]">{lead.listingTitle || 'General enquiry'}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ${toneClass}`}>{formatLeadStatus(lead.status)}</span>
      </div>
      <p className="mt-3 text-sm font-bold text-[#1A1A2E]">{action.label}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-[#6B7280]">{action.detail}</p>
    </a>
  );
}
