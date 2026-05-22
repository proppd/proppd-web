import type React from 'react';
import type { Metadata } from 'next';
import { ArrowLeft, CalendarClock, Mail, MapPinned, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import { LeadModerationControls } from '@/components/admin/lead-moderation-controls';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalLeadTimeline } from '@/lib/proppd/backend';
import { formatLeadIntent, getLeadActivityLabel, getLeadSourceLabel } from '@/lib/leads/pipeline';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Lead ${id} | Proppd`,
    alternates: {
      canonical: `/admin/leads/${id}`,
    },
  };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const timeline = await loadPortalLeadTimeline(id);

  if (!timeline) notFound();

  const lead = timeline.lead;
  const moderationEnabled = timeline.source === 'database';
  const latestEvent = timeline.events[0];

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <a className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/admin">
            <ArrowLeft size={16} /> Back to queue
          </a>

          <div className="mt-6 overflow-hidden rounded-[2.5rem] bg-[#050A30] text-white shadow-sm">
            <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[1fr_320px] lg:p-12">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Lead detail</p>
                <h1 className="mt-4 text-4xl font-black tracking-[-.06em] sm:text-5xl">{lead.name}</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">{lead.listingTitle}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge>{getLeadSourceLabel(lead.sourcePage)}</Badge>
                  <Badge>{formatLeadIntent(lead.intent)}</Badge>
                  <Badge>{lead.status}</Badge>
                  <Badge>{lead.quality}</Badge>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[.18em] text-white/55">Contact</p>
                <div className="mt-4 space-y-3 text-sm font-bold text-white/82">
                  <DetailLine icon={<Mail size={16} />} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
                  <DetailLine icon={<Phone size={16} />} label="Phone" value={lead.phone} href={`tel:${lead.phone.replace(/\s+/g, '')}`} />
                  <DetailLine icon={<MapPinned size={16} />} label="Listing" value={lead.listingTitle} href={`/property/${lead.listingSlug}`} />
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Timeline</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Lead activity</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600">
                  <CalendarClock size={16} /> {timeline.events.length} event{timeline.events.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {timeline.events.map((event) => (
                  <div key={event.id} className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[.16em] text-[#050A30]">{event.label}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-slate-500">{new Date(event.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{event.actorName ?? 'System'}</span>
                    </div>
                    {event.note ? <p className="mt-3 text-sm leading-6 text-slate-600">{event.note}</p> : null}
                    {event.actorRole ? <p className="mt-2 text-xs font-black uppercase tracking-[.14em] text-[#3B49FF]">{event.actorRole}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <ShieldCheck className="text-[#12D6C5]" size={28} />
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">Moderation</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">Review and move this lead through the queue without leaving the portal.</p>
                <div className="mt-4">
                  <LeadModerationControls
                    leadId={lead.id}
                    currentStatus={lead.status}
                    currentQuality={lead.quality}
                    enabled={moderationEnabled}
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                <p className="text-sm font-black uppercase tracking-[.16em] text-[#3B49FF]">Summary</p>
                <ul className="mt-4 space-y-3 text-sm font-bold leading-6 text-slate-600">
                  <li>• Last activity: {latestEvent ? `${latestEvent.label}${latestEvent.note ? ` — ${latestEvent.note}` : ''}` : 'No activity yet'}</li>
                  <li>• Source: {getLeadSourceLabel(lead.sourcePage)}</li>
                  <li>• Intent: {formatLeadIntent(lead.intent)}</li>
                  <li>• Created: {new Date(lead.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</li>
                </ul>
              </div>

              <div className="rounded-[2rem] bg-[#050A30] p-6 text-white">
                <Sparkles className="text-[#12D6C5]" size={28} />
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">Context</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">{lead.message}</p>
              </div>
            </aside>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-white">{children}</span>;
}

function DetailLine({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
      <span className="mt-0.5 text-[#12D6C5]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[.14em] text-white/45">{label}</span>
        <span className="block break-words text-white">{value}</span>
      </span>
    </a>
  );
}
