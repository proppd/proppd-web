import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AlertTriangle, BarChart3, BellRing, CheckCircle2, Home, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadMyPortalListings, loadPortalLeadQueue, loadPortalListings, loadPortalUserAccess } from '../../lib/proppd/backend';
import { getAgentFollowUpActions, getAgentWorkspaceStats, formatAgentResponseSignal, type AgentFollowUpAction } from '@/lib/agent/workspace';
import { formatLeadIntent } from '@/lib/leads/pipeline';

const agentName = 'Lerato Mokoena';

const priorityStyles: Record<AgentFollowUpAction['priority'], string> = {
  high: 'bg-red-50 text-red-700 border-red-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-[#eefcf9] text-[#0f766e] border-[#c8f6ec]',
};

export const metadata: Metadata = {
  title: {
    absolute: 'Agent workspace | Proppd',
  },
  description: 'Agent workspace for lead follow-up, listing health, and response priorities.',
  alternates: {
    canonical: '/dashboard',
  },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getPortalServerUser();
  const access = user ? await loadPortalUserAccess(user.id, user.email) : null;
  if (user && !access) {
    return (
      <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
        <SiteHeader />
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Workspace access</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-.06em]">Your account is not linked to an agent profile yet.</h1>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
              Sign-in worked, but Proppd does not have a live agent or agency profile mapped to this user yet. Use the onboarding flow to request access and we will wire the gateway to your profile.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-[#050A30] px-6 py-3 text-sm font-black !text-white" href="/list-with-us#launch-application">
                Request access
              </a>
              <a className="rounded-full border border-slate-200 px-6 py-3 text-sm font-black text-[#050A30]" href="/agents">
                Browse agents
              </a>
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const portalListings = access ? (await loadMyPortalListings(access)).items : (await loadPortalListings()).items;
  const portalLeads = (await loadPortalLeadQueue(access?.agentName ?? undefined)).items;
  const workspaceAgentName = access?.agentName ?? portalListings[0]?.agent ?? portalLeads[0]?.agent ?? agentName;
  const stats = getAgentWorkspaceStats(workspaceAgentName, portalListings, portalLeads);
  const actions = getAgentFollowUpActions(workspaceAgentName, portalLeads);
  const agentLeads = portalLeads.filter((lead) => lead.agent === workspaceAgentName);
  const agentListings = portalListings.filter((listing) => listing.agent === workspaceAgentName);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.5rem] bg-[#050A30] text-white shadow-sm">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-12">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Agent workspace</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">A practical command centre for listings, leads, and seller follow-up.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  The AgentOS foundation now gives agents a clear command surface for live-style lead priorities, listing health, and the next action to take.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="rounded-full bg-white px-6 py-3 text-sm font-black !text-[#050A30]" href="/admin">
                    Open admin queue
                  </a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white" href="/dashboard/listings">
                    Manage listings
                  </a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white" href="/list-with-us#launch-application">
                    Request AgentOS pilot
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[.18em] text-white/60">Signed-in agent</p>
                <h2 className="mt-4 text-3xl font-black tracking-[-.05em]">{stats.agentName}</h2>
                <p className="mt-2 text-sm font-bold text-white/60">{stats.agencyName}</p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/10 p-3 text-center">
                    <p className="text-2xl font-black text-white">{stats.activeListings}</p>
                    <p className="mt-1 text-[11px] font-black uppercase tracking-[.14em] text-white/60">Listings</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-center">
                    <p className="text-2xl font-black text-white">{stats.newLeads}</p>
                    <p className="mt-1 text-[11px] font-black uppercase tracking-[.14em] text-white/60">New leads</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-center">
                    <p className="text-2xl font-black text-white">{stats.flaggedLeads}</p>
                    <p className="mt-1 text-[11px] font-black uppercase tracking-[.14em] text-white/60">Flagged</p>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-white p-4 text-[#050A30]">
                  <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Response signal</p>
                  <p className="mt-2 font-black">{formatAgentResponseSignal(stats)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Metric icon={<Home size={20} />} label="Active listings" value={stats.activeListings} detail="Visible on Proppd" />
            <Metric icon={<BellRing size={20} />} label="New leads" value={stats.newLeads} detail="Need first response" />
            <Metric icon={<CheckCircle2 size={20} />} label="Qualified" value={stats.qualifiedLeads} detail="High-intent follow-up" />
            <Metric icon={<AlertTriangle size={20} />} label="Quality checks" value={stats.flaggedLeads} detail="Review before routing" warning />
          </div>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Follow-up queue</p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Next best actions</h2>
                  </div>
                  <span className="rounded-full bg-[#eefcf9] px-4 py-2 text-sm font-black text-[#0f766e]">Queue snapshot</span>
                </div>

                <div className="mt-6 space-y-3">
                  {actions.map((action) => (
                    <a key={action.leadId} className="block rounded-[1.5rem] border border-slate-200 p-5 transition hover:border-[#3B49FF] hover:bg-[#F5F7FA]" href={action.href}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-black">{action.label}</p>
                          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{action.detail}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[.12em] ${priorityStyles[action.priority]}`}>{action.priority}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Listings</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Your stock health</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {agentListings.map((listing) => (
                    <a key={listing.slug} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#F5F7FA]" href={`/property/${listing.slug}`}>
                      <div className={`h-28 bg-gradient-to-br ${listing.gradient}`} />
                      <div className="p-5">
                        <p className="text-xs font-black uppercase tracking-[.14em] text-[#3B49FF]">{listing.purpose}</p>
                        <h3 className="mt-2 text-xl font-black tracking-[-.04em]">{listing.title}</h3>
                        <p className="mt-2 text-sm font-bold text-slate-500">{listing.location}</p>
                        <p className="mt-4 font-black">{listing.price}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <MessageCircle className="text-[#12D6C5]" size={28} />
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">Latest enquiry</h2>
                {stats.latestLead ? (
                  <div className="mt-4 text-sm font-bold leading-6 text-slate-600">
                    <p className="font-black text-[#050A30]">{stats.latestLead.name}</p>
                    <p>
                      {formatLeadIntent(stats.latestLead.intent)} on {stats.latestLead.listingTitle}
                    </p>
                    <p className="mt-3 rounded-2xl bg-[#F5F7FA] p-4">“{stats.latestLead.message}”</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-bold text-slate-600">No enquiries yet.</p>
                )}
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <BarChart3 className="text-[#3B49FF]" size={28} />
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">Lead mix</h2>
                <div className="mt-4 space-y-3">
                  {agentLeads.map((lead) => (
                    <div key={lead.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">{lead.name}</p>
                        <span className="text-xs font-black capitalize text-slate-500">{lead.quality}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {formatLeadIntent(lead.intent)} · {lead.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-[#eefcf9] p-6">
                <ShieldCheck className="text-[#0f766e]" size={28} />
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em] text-[#0f766e]">Production gate</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-[#0f766e]">
                  Production auth, tenant-scoped listings, persisted lead changes, and notification routing are being connected behind this workspace.
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#050A30] p-6 text-white">
                <Sparkles className="text-[#12D6C5]" size={28} />
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">Next release</h2>
                <ul className="mt-4 space-y-2 text-sm font-bold leading-6 text-white/70">
                  <li>• Tenant-scoped permissions and audit events.</li>
                  <li>• Notification routing for new enquiries.</li>
                  <li>• Agent assist tools for follow-up and copy.</li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Metric({ icon, label, value, detail, warning = false }: { icon: ReactNode; label: string; value: number; detail: string; warning?: boolean }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl p-3 ${warning ? 'bg-red-50 text-red-600' : 'bg-[#eefcf9] text-[#0f766e]'}`}>{icon}</div>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <h2 className="mt-1 font-black">{label}</h2>
      <p className="mt-1 text-sm font-bold text-slate-500">{detail}</p>
    </div>
  );
}
