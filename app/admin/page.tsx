import type React from 'react';
import type { Metadata } from 'next';
import { AlertTriangle, CheckCircle2, Clock3, Filter, ShieldCheck, UserCheck } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { demoLeads } from '@/lib/leads/demo-leads';
import { formatLeadIntent, getLeadPipelineStats, getLeadQueue, groupLeadsByStatus, type LeadQuality } from '@/lib/leads/pipeline';

export const metadata: Metadata = {
  title: 'Lead operations',
  alternates: {
    canonical: '/admin',
  },
};

const qualityStyles: Record<LeadQuality, string> = {
  clean: 'bg-[#eefcf9] text-[#0f766e]',
  duplicate: 'bg-amber-50 text-amber-700',
  flagged: 'bg-red-50 text-red-700',
};

export default function Page() {
  const stats = getLeadPipelineStats(demoLeads);
  const queue = getLeadQueue(demoLeads);
  const grouped = groupLeadsByStatus(demoLeads);

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
                  <p className="text-xs font-black uppercase tracking-[.18em] text-white/50">Top of queue</p>
                  <div className="mt-3 grid gap-3 text-sm font-bold text-white/78">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/55">Newest</span>
                      <span className="text-right">{queue[0]?.name ?? 'No leads yet'}</span>
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Lead queue</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Newest enquiries</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600">
                  <Filter size={16} /> Review queue
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200">
                <div className="hidden grid-cols-[1fr_120px_110px_100px_130px] gap-4 bg-[#F5F7FA] px-5 py-3 text-xs font-black uppercase tracking-[.14em] text-slate-500 md:grid">
                  <span>Lead</span>
                  <span>Intent</span>
                  <span>Quality</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {queue.map((lead) => (
                    <a key={lead.id} className="grid gap-4 px-5 py-5 transition hover:bg-[#F5F7FA] md:grid-cols-[1fr_120px_110px_100px_130px]" href={`/property/${lead.listingSlug}`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-[#050A30]">{lead.name}</p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[.12em] text-slate-500">{lead.id}</span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-500">{lead.listingTitle}</p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{lead.message}</p>
                        {lead.flags.length > 0 && <p className="mt-2 text-xs font-black text-red-600">Flags: {lead.flags.join(', ')}</p>}
                      </div>
                      <p className="text-sm font-black text-[#3B49FF]">{formatLeadIntent(lead.intent)}</p>
                      <p><span className={`rounded-full px-3 py-1 text-xs font-black ${qualityStyles[lead.quality]}`}>{lead.quality}</span></p>
                      <p className="text-sm font-black capitalize text-slate-600">{lead.status}</p>
                      <p><span className="inline-flex whitespace-nowrap rounded-full bg-[#050A30] px-4 py-2 text-xs font-black text-white">Review lead</span></p>
                    </a>
                  ))}
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
              <div className="rounded-[2rem] border border-slate-200 bg-[#eefcf9] p-6">
                <p className="text-sm font-black uppercase tracking-[.16em] text-[#0f766e]">Next backend gate</p>
                <p className="mt-3 text-sm font-bold leading-6 text-[#0f766e]">
                  Supabase schema, RLS, and seed foundations are now in the repo. The next production gate is applying them to Supabase, then wiring live lead writes, audit events, and notification routing.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <AdminNote title="Live writes" text="Persist new enquiries to the operational queue." />
                  <AdminNote title="Audit trail" text="Record review, status changes, and routing decisions." />
                  <AdminNote title="Notifications" text="Hand off qualified leads to the right inbox fast." />
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

function Metric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'warning' }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-[#050A30]">
      <p className={`text-3xl font-black ${tone === 'warning' ? 'text-red-600' : ''}`}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[.14em] text-slate-500">{label}</p>
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
