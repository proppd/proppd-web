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
    title: {
      absolute: `Lead ${id}`,
    },
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
  const sourceHref = lead.sourcePage?.trim().startsWith('/') ? lead.sourcePage.trim() : `/property/${lead.listingSlug}`;
  const emailHref = `mailto:${lead.email}?subject=${encodeURIComponent(`Proppd follow-up for ${lead.listingTitle}`)}`;

  return (
    <main className="proppd-page">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <a className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/admin">
            <ArrowLeft size={16} /> Back to queue
          </a>

          <div className="mt-6 overflow-hidden rounded-xl proppd-panel shadow-sm">
            <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[1fr_320px] lg:p-12">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Lead detail</p>
                <h1 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">{lead.name}</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">{lead.listingTitle}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge>{getLeadSourceLabel(lead.sourcePage)}</Badge>
                  <Badge>{formatLeadIntent(lead.intent)}</Badge>
                  <Badge>{lead.status}</Badge>
                  <Badge>{lead.quality}</Badge>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-white/55">Contact</p>
                <div className="mt-4 space-y-3 text-sm font-bold text-white/82">
                  <DetailLine icon={<Mail size={16} />} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
                  <DetailLine icon={<Phone size={16} />} label="Phone" value={lead.phone} href={`tel:${lead.phone.replace(/\s+/g, '')}`} />
                  <DetailLine icon={<MapPinned size={16} />} label="Listing" value={lead.listingTitle} href={`/property/${lead.listingSlug}`} />
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Timeline</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">Lead activity</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-[#6B7280]">
                  <CalendarClock size={16} /> {timeline.events.length} event{timeline.events.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {timeline.events.map((event) => (
                  <div key={event.id} className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#1A1A2E]">{event.label}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">{new Date(event.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#9CA3AF]">{event.actorName ?? 'System'}</span>
                    </div>
                    {event.note ? <p className="mt-3 text-sm leading-6 text-[#6B7280]">{event.note}</p> : null}
                    {event.actorRole ? <p className="mt-2 text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{event.actorRole}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <ShieldCheck className="text-[#2563EB]" size={28} />
                <h2 className="mt-4 text-2xl font-bold tracking-[-.04em]">Moderation</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">Review and move this lead through the queue without leaving the portal.</p>
                <div className="mt-4">
                  <LeadModerationControls
                    leadId={lead.id}
                    currentStatus={lead.status}
                    currentQuality={lead.quality}
                    enabled={moderationEnabled}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <p className="text-sm font-bold uppercase tracking-[.16em] text-[#4A3AFF]">Summary</p>
                <ul className="mt-4 space-y-3 text-sm font-bold leading-6 text-[#6B7280]">
                  <li>• Last activity: {latestEvent ? `${latestEvent.label}${latestEvent.note ? ` — ${latestEvent.note}` : ''}` : 'No activity yet'}</li>
                  <li>• Source: {getLeadSourceLabel(lead.sourcePage)}</li>
                  <li>• Intent: {formatLeadIntent(lead.intent)}</li>
                  <li>• Created: {new Date(lead.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</li>
                </ul>
              </div>

              <div className="rounded-xl proppd-panel p-6 ">
                <Sparkles className="text-[#2563EB]" size={28} />
                <h2 className="mt-4 text-2xl font-bold tracking-[-.04em]">Context</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">{lead.message}</p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[.16em] text-[#4A3AFF]">Next steps</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">Keep the lead moving</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">
                  Open the source page, reply by email, and keep the listing context close by while the handoff is active.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a className="inline-flex items-center justify-center rounded-full bg-[#4A3AFF] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4A3AFF]" href={emailHref}>
                    Reply by email
                  </a>
                  <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href={sourceHref}>
                    Open source page
                  </a>
                  <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href={`/property/${lead.listingSlug}`}>
                    Open listing
                  </a>
                  <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/admin">
                    Back to queue
                  </a>
                </div>
                <div className="mt-5 rounded-[1.25rem] bg-[#F7F8FA] p-4">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Routing snapshot</p>
                  <div className="mt-3 grid gap-3 text-sm font-bold text-[#6B7280]">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#9CA3AF]">Source</span>
                      <span className="text-right">{getLeadSourceLabel(lead.sourcePage)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#9CA3AF]">Status</span>
                      <span className="text-right capitalize">{lead.status}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#9CA3AF]">Quality</span>
                      <span className="text-right capitalize">{lead.quality}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#9CA3AF]">Created</span>
                      <span className="text-right">{new Date(lead.createdAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#9CA3AF]">Latest activity</span>
                      <span className="text-right">{latestEvent ? getLeadActivityLabel(latestEvent.type) : 'No activity yet'}</span>
                    </div>
                  </div>
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

function Badge({ children }: { children: string }) {
  return <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-white">{children}</span>;
}

function DetailLine({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
      <span className="mt-0.5 text-[#2563EB]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-[.14em] text-white/45">{label}</span>
        <span className="block break-words text-white">{value}</span>
      </span>
    </a>
  );
}
