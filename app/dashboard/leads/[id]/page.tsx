import type { Metadata } from 'next';
import { ArrowLeft, CalendarClock, Mail, MapPinned, Phone, MessageSquare } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { LeadPipelineControls } from '@/components/dashboard/lead-pipeline-controls';
import { loadPortalLeadTimeline, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';
import { formatLeadIntent, formatLeadStatus } from '@/lib/leads/pipeline';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: { absolute: `Lead ${id} | Proppd` },
    alternates: { canonical: `/dashboard/leads/${id}` },
    robots: { index: false, follow: false },
  };
}

export default async function AgentLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getPortalServerUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/dashboard/leads/${id}`)}`);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) redirect('/dashboard/profile');

  const timeline = await loadPortalLeadTimeline(id);
  if (!timeline) notFound();

  const lead = timeline.lead;

  // Agents only see their own leads (agency admins see their agency; super admins all).
  const owns =
    access.role === 'super_admin' ||
    (access.agentName !== null && lead.agent === access.agentName) ||
    (access.agencyName !== null && lead.agency === access.agencyName);
  if (!owns) notFound();

  const controlsEnabled = timeline.source === 'database';
  const emailHref = `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.listingTitle}`)}&body=${encodeURIComponent(`Hi ${lead.name.split(' ')[0]},\n\n`)}`;

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <a className="inline-flex items-center gap-2 text-sm font-bold text-[#6B7280] transition hover:text-[#4A3AFF]" href="/dashboard/leads">
            <ArrowLeft size={16} /> Back to leads
          </a>

          <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Lead</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A2E]">{lead.name}</h1>
                <p className="mt-1 text-sm text-[#6B7280]">{lead.listingTitle}</p>
              </div>
              <span className="inline-flex h-fit items-center rounded-full bg-[#4A3AFF]/10 px-3 py-1.5 text-xs font-bold uppercase text-[#4A3AFF]">
                {formatLeadStatus(lead.status)}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ContactCard icon={<Mail size={15} />} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
              <ContactCard icon={<Phone size={15} />} label="Phone" value={lead.phone} href={`tel:${lead.phone.replace(/\s+/g, '')}`} />
              <ContactCard icon={<MapPinned size={15} />} label="Listing" value={lead.listingTitle} href={`/property/${lead.listingSlug}`} />
            </div>

            <div className="mt-5 rounded-lg bg-[#F7F8FA] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Enquiry · {formatLeadIntent(lead.intent)}</p>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">{lead.message}</p>
            </div>

            <div className="mt-5 border-t border-[#F3F4F6] pt-5">
              <LeadPipelineControls leadId={lead.id} currentStatus={lead.status} enabled={controlsEnabled} />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A1A2E]"><MessageSquare size={18} className="text-[#4A3AFF]" /> Activity timeline</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9CA3AF]">
                <CalendarClock size={14} /> {timeline.events.length} event{timeline.events.length === 1 ? '' : 's'}
              </span>
            </div>

            {timeline.events.length === 0 ? (
              <p className="mt-4 text-sm text-[#9CA3AF]">No activity yet. Update the stage or add a note above to start the history.</p>
            ) : (
              <ol className="mt-5 space-y-4">
                {timeline.events.map((event) => (
                  <li key={event.id} className="relative border-l-2 border-[#E5E7EB] pl-5">
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#4A3AFF]" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#1A1A2E]">{event.label}</p>
                      <p className="text-xs font-semibold text-[#9CA3AF]">{new Date(event.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    {event.note ? <p className="mt-1 text-sm leading-6 text-[#6B7280]">{event.note}</p> : null}
                    <p className="mt-1 text-xs font-semibold text-[#9CA3AF]">{event.actorName ?? 'System'}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={emailHref} className="inline-flex items-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"><Mail size={15} /> Reply by email</a>
            {lead.listingSlug && (
              <a href={`/property/${lead.listingSlug}`} className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]">View listing</a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} className="flex items-start gap-2.5 rounded-lg border border-[#E5E7EB] bg-white p-3 transition hover:border-[#4A3AFF]">
      <span className="mt-0.5 text-[#4A3AFF]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{label}</span>
        <span className="block truncate text-sm font-bold text-[#1A1A2E]">{value}</span>
      </span>
    </a>
  );
}
