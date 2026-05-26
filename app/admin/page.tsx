import type React from 'react';
import type { Metadata } from 'next';
import { AlertTriangle, CheckCircle2, Clock3, Filter, ShieldCheck, UserCheck, Search, X } from 'lucide-react';
import { LeadModerationControls } from '@/components/admin/lead-moderation-controls';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalDiagnostics, loadPortalLeadQueue } from '@/lib/proppd/backend';
import {
  buildLeadFilterHref,
  filterLeads,
  getLeadActivityLabel,
  formatLeadIntent,
  getLeadPipelineStats,
  getLeadQueue,
  getLeadSourceLabel,
  getLeadSourceStats,
  groupLeadsByStatus,
  hasLeadFilters,
  type LeadQuality,
  type LeadSourceGroup,
  type LeadStatus,
} from '@/lib/leads/pipeline';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Lead operations',
  alternates: {
    canonical: '/admin',
  },
};

export const dynamic = 'force-dynamic';

const qualityStyles: Record<LeadQuality, string> = {
  clean: 'bg-[#eefcf9] text-[#0f766e]',
  duplicate: 'bg-amber-50 text-amber-700',
  flagged: 'bg-red-50 text-red-700',
};

const statusOptions: Array<{ value: LeadStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All leads' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
];

const qualityOptions: Array<{ value: LeadQuality | 'all'; label: string }> = [
  { value: 'all', label: 'All quality' },
  { value: 'clean', label: 'Clean' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'flagged', label: 'Flagged' },
];

const sourceOptions: Array<{ value: LeadSourceGroup | 'all'; label: string }> = [
  { value: 'all', label: 'All sources' },
  { value: 'launch', label: 'Launch applications' },
  { value: 'property', label: 'Property enquiries' },
  { value: 'valuation', label: 'Valuation requests' },
  { value: 'agent', label: 'Agent directory' },
  { value: 'general', label: 'General enquiries' },
  { value: 'portal', label: 'Portal enquiries' },
];

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = getSingleParam(params.q).trim();
  const selectedStatus = parseStatus(getSingleParam(params.status));
  const selectedQuality = parseQuality(getSingleParam(params.quality));
  const selectedSource = parseSource(getSingleParam(params.source));

  const [leadPayload, diagnostics] = await Promise.all([loadPortalLeadQueue(), loadPortalDiagnostics()]);
  const filteredLeads = filterLeads(leadPayload.items, {
    query,
    status: selectedStatus,
    quality: selectedQuality,
    source: selectedSource,
  });
  const queue = getLeadQueue(filteredLeads);
  const stats = getLeadPipelineStats(filteredLeads);
  const sourceStats = getLeadSourceStats(filteredLeads);
  const queueSourceStats = getLeadSourceStats(leadPayload.items);
  const grouped = groupLeadsByStatus(filteredLeads);
  const hasFilters = hasLeadFilters({ query, status: selectedStatus, quality: selectedQuality, source: selectedSource });
  const moderationEnabled = leadPayload.source !== 'demo' && leadPayload.source !== 'error';
  const sourceLabel =
    leadPayload.source === 'database'
      ? 'Live queue connected to Supabase'
      : leadPayload.source === 'empty'
        ? 'Live backend connected, no leads yet'
        : leadPayload.source === 'demo'
          ? 'Demo preview queue'
          : 'Queue unavailable';
  const moderationDigest = queue.slice(0, 3).map((lead) => ({
    name: lead.name,
    detail: `${formatLeadIntent(lead.intent)} · ${lead.quality}`,
    action: lead.flags.length > 0 ? `Review ${lead.flags[0]}` : lead.status === 'new' ? 'Reply by email' : 'Open listing',
  }));

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.5rem] bg-[#050A30] text-white shadow-sm">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-12">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Lead operations</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Lead quality, listing trust, and agent follow-up in one queue.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Proppd’s operations layer separates real enquiries from duplicates and suspicious traffic before agents waste time.
                </p>
                <p className="mt-5 text-sm font-bold uppercase tracking-[.18em] text-white/50">
                  {hasFilters ? `Showing ${filteredLeads.length} filtered leads` : `Showing all ${stats.total} leads`}
                </p>
                <div className={`mt-6 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.18em] ${moderationEnabled ? 'bg-white/10 text-white' : 'bg-amber-100 text-amber-900'}`}>
                  {sourceLabel}
                </div>
                <div className="mt-6">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-white/45">Source lanes</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sourceOptions.map((option) => {
                      const isActive = selectedSource === option.value;
                      const count =
                        option.value === 'launch'
                          ? queueSourceStats.launch
                          : option.value === 'property'
                            ? queueSourceStats.property
                            : option.value === 'valuation'
                              ? queueSourceStats.valuation
                              : option.value === 'agent'
                                ? queueSourceStats.agent
                                : option.value === 'portal'
                                  ? queueSourceStats.portal
                                  : option.value === 'general'
                                    ? queueSourceStats.general
                                    : leadPayload.items.length;

                      return (
                        <a
                          key={option.value}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[.16em] transition ${isActive ? 'border-white/40 bg-white text-[#050A30]' : 'border-white/10 bg-white/8 text-white/75 hover:border-white/30 hover:text-white'}`}
                          href={buildLeadFilterHref({ query, status: selectedStatus, quality: selectedQuality, source: option.value })}
                        >
                          <span>{option.label}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? 'bg-[#050A30] text-white' : 'bg-white/10 text-white/70'}`}>
                            {count}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[.18em] text-white/60">Queue snapshot</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Metric label="Total leads" value={stats.total} />
                  <Metric label="New" value={stats.newLeads} />
                  <Metric label="Qualified" value={stats.qualified} />
                  <Metric label="Flagged" value={stats.flagged} tone="warning" />
                </div>
                <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-white/50">Source mix</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-bold text-white/80 sm:grid-cols-3">
                    <SourceChip label="Launch" value={sourceStats.launch} />
                    <SourceChip label="Property" value={sourceStats.property} />
                    <SourceChip label="Valuation" value={sourceStats.valuation} />
                    <SourceChip label="Agent" value={sourceStats.agent} />
                    <SourceChip label="Portal" value={sourceStats.portal} />
                    <SourceChip label="General" value={sourceStats.general} />
                  </div>
                </div>
                <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-white/50">Top of queue</p>
                  <div className="mt-3 grid gap-3 text-sm font-bold text-white/78">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/55">Newest</span>
                      <span className="text-right">{queue[0]?.name ?? 'No matching leads'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/55">Intent</span>
                      <span className="text-right">{queue[0] ? formatLeadIntent(queue[0].intent) : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/55">Requires review</span>
                      <span className="text-right">{stats.flagged} leads</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <StatusCard icon={<Clock3 size={20} />} label="New leads" value={grouped.new.length} detail="Needs first response" />
            <StatusCard icon={<UserCheck size={20} />} label="Contacted" value={grouped.contacted.length} detail="Agent has followed up" />
            <StatusCard icon={<CheckCircle2 size={20} />} label="Qualified" value={grouped.qualified.length} detail="High-intent buyer/tenant" />
            <StatusCard icon={<AlertTriangle size={20} />} label="Flagged quality" value={stats.flagged} detail="Review before routing" warning />
          </div>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
              <div className={`mb-6 rounded-[1.75rem] border px-5 py-4 text-sm font-bold ${moderationEnabled ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                <span className="font-black uppercase tracking-[.14em]">Lead moderation</span>
                <span className="ml-3">{moderationEnabled ? 'Live review actions are enabled.' : 'Actions stay in preview until a live Supabase database is connected.'}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Lead queue</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Newest enquiries</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600">
                  <Filter size={16} /> Review queue
                </span>
              </div>

              <form className="mt-6 grid gap-3 rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-4 lg:grid-cols-[minmax(0,1fr)_180px_220px_220px_auto]" method="get">
                <label className="sr-only" htmlFor="admin-lead-search">
                  Search leads
                </label>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3">
                  <Search size={16} className="text-slate-400" />
                  <input
                    id="admin-lead-search"
                    name="q"
                    defaultValue={query}
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#050A30] outline-none placeholder:text-slate-500"
                    placeholder="Search lead, listing, agent, or agency"
                    aria-label="Search leads"
                  />
                </div>

                <label className="sr-only" htmlFor="admin-lead-source">
                  Lead source
                </label>
                <select
                  id="admin-lead-source"
                  name="source"
                  defaultValue={selectedSource}
                  className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#050A30] outline-none"
                  aria-label="Filter by source"
                >
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor="admin-lead-status">
                  Lead status
                </label>
                <select
                  id="admin-lead-status"
                  name="status"
                  defaultValue={selectedStatus}
                  className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#050A30] outline-none"
                  aria-label="Filter by status"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor="admin-lead-quality">
                  Lead quality
                </label>
                <select
                  id="admin-lead-quality"
                  name="quality"
                  defaultValue={selectedQuality}
                  className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#050A30] outline-none"
                  aria-label="Filter by quality"
                >
                  {qualityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <button className="inline-flex flex-1 items-center justify-center rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]" type="submit">
                    Apply filters
                  </button>
                  {hasFilters ? (
                    <a className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/admin">
                      <X size={16} className="mr-2" /> Clear
                    </a>
                  ) : null}
                </div>
              </form>

              {hasFilters ? (
                <div className="mt-4 flex flex-wrap gap-2 text-sm font-black text-slate-600">
                  {query ? <span className="rounded-full bg-slate-100 px-3 py-1">Search: “{query}”</span> : null}
                  {selectedStatus !== 'all' ? <span className="rounded-full bg-slate-100 px-3 py-1">Status: {selectedStatus}</span> : null}
                  {selectedQuality !== 'all' ? <span className="rounded-full bg-slate-100 px-3 py-1">Quality: {selectedQuality}</span> : null}
                  {selectedSource !== 'all' ? <span className="rounded-full bg-slate-100 px-3 py-1">Source: {selectedSource}</span> : null}
                </div>
              ) : null}

              <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200">
                <div className="hidden grid-cols-[1fr_120px_110px_100px_240px] gap-4 bg-[#F5F7FA] px-5 py-3 text-xs font-black uppercase tracking-[.14em] text-slate-500 md:grid">
                  <span>Lead</span>
                  <span>Intent</span>
                  <span>Quality</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {queue.length > 0 ? (
                    queue.map((lead) => (
                      <div key={lead.id} className="grid gap-4 px-5 py-5 transition hover:bg-[#F5F7FA] md:grid-cols-[1fr_120px_110px_100px_240px]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <a className="font-black text-[#050A30] transition hover:text-[#3B49FF]" href={`/admin/leads/${lead.id}`}>
                              {lead.name}
                            </a>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[.12em] text-slate-500">{lead.id}</span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-slate-500">{lead.listingTitle}</p>
                          <p className="mt-1 text-xs font-black uppercase tracking-[.14em] text-[#3B49FF]">{getLeadSourceLabel(lead.sourcePage)}</p>
                          {lead.latestEventType ? (
                            <p className="mt-1 text-xs font-black uppercase tracking-[.14em] text-slate-400">
                              Last activity: {getLeadActivityLabel(lead.latestEventType)}
                              {lead.latestEventCount ? ` · ${lead.latestEventCount} events` : ''}
                              {lead.latestEventNote ? ` · ${lead.latestEventNote}` : ''}
                            </p>
                          ) : null}
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{lead.message}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <a className="inline-flex rounded-full bg-white px-3 py-2 text-xs font-black text-[#3B49FF] ring-1 ring-slate-200 transition hover:ring-[#3B49FF]" href={`/property/${lead.listingSlug}`}>
                              Open listing
                            </a>
                            <a className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-200" href={`mailto:${lead.email}?subject=Proppd follow-up for ${encodeURIComponent(lead.listingTitle)}`}>
                              Reply by email
                            </a>
                          </div>
                          {lead.flags.length > 0 && <p className="mt-2 text-xs font-black text-red-600">Flags: {lead.flags.join(', ')}</p>}
                        </div>
                        <p className="text-sm font-black text-[#3B49FF]">{formatLeadIntent(lead.intent)}</p>
                        <p><span className={`rounded-full px-3 py-1 text-xs font-black ${qualityStyles[lead.quality]}`}>{lead.quality}</span></p>
                        <p className="text-sm font-black capitalize text-slate-600">{lead.status}</p>
                        <LeadModerationControls
                          leadId={lead.id}
                          currentStatus={lead.status}
                          currentQuality={lead.quality}
                          enabled={moderationEnabled}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-10 text-center">
                      <p className="text-base font-black text-[#050A30]">No leads match the current filters.</p>
                      <p className="mt-2 text-sm font-bold text-slate-500">Clear the search or switch the filters to bring the queue back.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <ShieldCheck className="text-[#12D6C5]" size={28} />
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">Lead trust rules</h2>
                <ul className="mt-4 space-y-3 text-sm font-bold leading-6 text-slate-600">
                  <li>• POPIA consent required before routing.</li>
                  <li>• Duplicate enquiries stay visible but marked.</li>
                  <li>• Spam keywords and suspicious messages are flagged.</li>
                  <li>• Agent follow-up can move leads to contacted or qualified.</li>
                </ul>
              </div>
              <div className="rounded-[2rem] bg-[#050A30] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Moderation digest</p>
                <div className="mt-4 space-y-3">
                  {moderationDigest.length > 0 ? (
                    moderationDigest.map((item) => (
                      <div key={item.name} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-white">{item.name}</p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-white/55">{item.detail}</p>
                          </div>
                          <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black text-white/80">{item.action}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-bold leading-6 text-white/70">No leads are currently visible in the queue.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-[#eefcf9] p-6">
                <p className="text-sm font-black uppercase tracking-[.16em] text-[#0f766e]">Queue health</p>
                <p className="mt-3 text-sm font-bold leading-6 text-[#0f766e]">
                  {diagnostics.databaseConfigured
                    ? `Supabase is wired for backend reads${diagnostics.canReadDatabase ? ' and the live queue is reachable.' : ', but the database check is currently failing.'}`
                    : 'Supabase is not connected yet, so the admin queue is running on demo data.'}
                </p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-white/75 p-4 text-[#0f766e]">
                    <p className="text-xs font-black uppercase tracking-[.14em]">Moderation loop</p>
                    <p className="mt-2 text-sm font-bold leading-6">Review the newest lead, open the property, reply by email, then update the status once the handoff is complete.</p>
                  </div>
                  <div className="rounded-2xl bg-white/75 p-4 text-[#0f766e]">
                    <p className="text-xs font-black uppercase tracking-[.14em]">What stays visible</p>
                    <p className="mt-2 text-sm font-bold leading-6">Duplicates, spam, and flagged enquiries remain in the queue so the team can see why a lead needs attention.</p>
                  </div>
                  <div className="rounded-2xl bg-white/75 p-4 text-[#0f766e]">
                    <p className="text-xs font-black uppercase tracking-[.14em]">Next backend gate</p>
                    <p className="mt-2 text-sm font-bold leading-6">Persist moderation actions, route notifications, and expose audit events in the diagnostics view.</p>
                  </div>
                </div>
                <div className="mt-5">
                  <a className="inline-flex items-center justify-center rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]" href="/admin/diagnostics">
                    Open backend diagnostics
                  </a>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function getSingleParam(value?: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function parseStatus(value: string): LeadStatus | 'all' {
  return value === 'new' || value === 'contacted' || value === 'qualified' ? value : 'all';
}

function parseQuality(value: string): LeadQuality | 'all' {
  return value === 'clean' || value === 'duplicate' || value === 'flagged' ? value : 'all';
}

function parseSource(value: string): LeadSourceGroup | 'all' {
  return value === 'launch' || value === 'property' || value === 'valuation' || value === 'agent' || value === 'portal' || value === 'general' ? value : 'all';
}

function Metric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'warning' }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-[#050A30]">
      <p className={`text-3xl font-black ${tone === 'warning' ? 'text-red-600' : ''}`}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[.14em] text-slate-500">{label}</p>
    </div>
  );
}

function SourceChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-3">
      <p className="text-[11px] font-black uppercase tracking-[.14em] text-white/50">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function StatusCard({ icon, label, value, detail, warning = false }: { icon: React.ReactNode; label: string; value: number; detail: string; warning?: boolean }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl p-3 ${warning ? 'bg-red-50 text-red-600' : 'bg-[#eefcf9] text-[#0f766e]'}`}>{icon}</div>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <h2 className="mt-1 font-black">{label}</h2>
      <p className="mt-1 text-sm font-bold text-slate-500">{detail}</p>
    </div>
  );
}

function AdminNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/75 p-4 text-[#0f766e]">
      <p className="text-xs font-black uppercase tracking-[.14em]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6">{text}</p>
    </div>
  );
}
