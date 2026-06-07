import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MessageCircle, Mail, Phone, Clock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalLeadQueue, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: { absolute: 'Leads | Proppd' },
  description: 'Track and manage your property enquiries.',
  alternates: { canonical: '/dashboard/leads' },
};

export const dynamic = 'force-dynamic';

const intentStyles: Record<string, { bg: string; text: string }> = {
  buy: { bg: 'bg-[#4A3AFF]/10', text: 'text-[#4A3AFF]' },
  rent: { bg: 'bg-[#00C9A7]/10', text: 'text-[#00C9A7]' },
  valuation: { bg: 'bg-amber-50', text: 'text-amber-700' },
  general: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

export default async function Page() {
  const user = await getPortalServerUser();
  if (!user) {
    redirect('/login?next=%2Fdashboard%2Fleads');
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  const { items: leads } = await loadPortalLeadQueue(access?.agentName ?? undefined);

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.quality === 'clean').length,
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <SiteHeader />

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Leads</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">Track your enquiries</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Manage buyer and tenant enquiries from Proppd.</p>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={<MessageCircle size={16} />} label="Total leads" value={stats.total} />
            <MiniStat icon={<Clock size={16} />} label="New" value={stats.new} color="#4A3AFF" />
            <MiniStat icon={<CheckCircle size={16} />} label="Contacted" value={stats.contacted} color="#00C9A7" />
            <MiniStat icon={<AlertTriangle size={16} />} label="High quality" value={stats.qualified} color="#F59E0B" />
          </div>

          {/* Lead list */}
          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            {leads.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle size={32} className="mx-auto text-[#9CA3AF]" />
                <h2 className="mt-4 text-lg font-bold text-[#1A1A2E]">No leads yet</h2>
                <p className="mt-2 text-sm text-[#6B7280]">Leads will appear here as buyers and tenants enquire about your listings.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {leads.map((lead) => {
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
                            <p className="font-bold text-[#1A1A2E]">{lead.name}</p>
                            <p className="text-xs text-[#9CA3AF]">{lead.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${intent.bg} ${intent.text}`}>
                              {lead.intent}
                            </span>
                            {lead.quality === 'clean' && (
                              <span className="rounded-full bg-[#E6FBF7] px-2.5 py-1 text-[10px] font-bold uppercase text-[#00C9A7]">Clean</span>
                            )}
                            {lead.quality === 'flagged' && (
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">Flagged</span>
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
                            <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A2E] transition hover:border-[#00C9A7] hover:text-[#00C9A7]">
                              <Phone size={12} /> Call
                            </a>
                          )}
                          {lead.listingSlug && (
                            <a href={`/property/${lead.listingSlug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
                              <ExternalLink size={12} /> View listing
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
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
