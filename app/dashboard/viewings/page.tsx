import type { Metadata } from 'next';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, Home, Mail, MessageCircle, Phone } from 'lucide-react';
import { loadPortalLeadQueue, leadQueueScopeForAccess } from '@/lib/proppd/backend';
import { requireAgentWorkspaceAccess } from '@/lib/proppd/dashboard-access';
import { buildWhatsAppHref, type LeadRecord } from '@/lib/leads/pipeline';

export const metadata: Metadata = {
  title: { absolute: 'Viewings | Proppd' },
  description: 'Your upcoming and past property viewings.',
  alternates: { canonical: '/dashboard/viewings' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type ViewingLead = LeadRecord & { viewingAt: string };

export default async function ViewingsPage() {
  const access = await requireAgentWorkspaceAccess('/dashboard/viewings');

  const leadPayload = await loadPortalLeadQueue(leadQueueScopeForAccess(access));
  const now = new Date();

  const allViewings = (leadPayload.items.filter(
    (l): l is ViewingLead => typeof l.viewingAt === 'string' && l.viewingAt.length > 0,
  ) as ViewingLead[]).sort(
    (a, b) => new Date(a.viewingAt).getTime() - new Date(b.viewingAt).getTime(),
  );

  const upcoming = allViewings.filter((l) => new Date(l.viewingAt) >= now);
  const past = allViewings.filter((l) => new Date(l.viewingAt) < now);

  return (
    <main>
      <div className="flex items-center gap-3">
        <a href="/dashboard/leads" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B7280] transition hover:text-[#4A3AFF]">
          <ArrowLeft size={15} /> Leads
        </a>
      </div>

      <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
            <CalendarClock size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Agent schedule</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A2E]">Viewing schedule</h1>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">
              {upcoming.length === 0
                ? 'No upcoming viewings. Book a viewing from a lead to add it here.'
                : `${upcoming.length} upcoming viewing${upcoming.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming viewings */}
      <section className="mt-6">
        <div className="flex items-center gap-3 mb-3">
          <Clock size={16} className="text-[#2563EB]" />
          <h2 className="text-base font-bold text-[#1A1A2E]">Upcoming</h2>
          {upcoming.length > 0 && (
            <span className="rounded-full bg-[#2563EB]/10 px-2.5 py-0.5 text-xs font-bold text-[#2563EB]">{upcoming.length}</span>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center">
            <CalendarClock size={32} className="mx-auto text-[#D1D5DB]" />
            <p className="mt-3 text-sm font-bold text-[#9CA3AF]">No upcoming viewings</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              When you move a lead to &ldquo;Viewing booked&rdquo; and set a date, it appears here.
            </p>
            <a
              href="/dashboard/leads?status=contacted"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              <MessageCircle size={14} /> Find leads to book
            </a>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((lead) => <ViewingCard key={lead.id} lead={lead} isPast={false} />)}
          </div>
        )}
      </section>

      {/* Past viewings */}
      {past.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 size={16} className="text-[#9CA3AF]" />
            <h2 className="text-base font-bold text-[#1A1A2E]">Past viewings</h2>
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-bold text-[#9CA3AF]">{past.length}</span>
          </div>
          <div className="grid gap-3">
            {past.slice(0, 10).map((lead) => <ViewingCard key={lead.id} lead={lead} isPast />)}
          </div>
          {past.length > 10 && (
            <p className="mt-3 text-xs text-[#9CA3AF]">Showing 10 of {past.length} past viewings.</p>
          )}
        </section>
      )}
    </main>
  );
}

function ViewingCard({ lead, isPast }: { lead: ViewingLead; isPast: boolean }) {
  const viewingDate = new Date(lead.viewingAt);
  const whatsappHref = buildWhatsAppHref(lead.phone, lead.name);

  const dayLabel = new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(viewingDate);
  const timeLabel = new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit' }).format(viewingDate);

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${isPast ? 'border-[#E5E7EB] opacity-75' : 'border-[#BFDBFE]'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        {/* Date/time block */}
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-center font-bold ${isPast ? 'bg-[#F3F4F6] text-[#9CA3AF]' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
            <span className="text-xs uppercase tracking-wider">
              {new Intl.DateTimeFormat('en-ZA', { month: 'short' }).format(viewingDate)}
            </span>
            <span className="text-2xl leading-none">
              {viewingDate.getDate()}
            </span>
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isPast ? 'text-[#9CA3AF]' : 'text-[#2563EB]'}`}>
              {isPast ? 'Completed' : 'Viewing'}
            </p>
            <p className="mt-0.5 text-base font-bold text-[#1A1A2E]">{dayLabel}</p>
            <p className="text-sm font-semibold text-[#6B7280]">{timeLabel}</p>
          </div>
        </div>

        {/* Lead / listing info */}
        <div className="min-w-0 sm:text-right">
          <p className="text-sm font-bold text-[#1A1A2E] truncate">{lead.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#9CA3AF] sm:justify-end">
            <Home size={11} className="shrink-0" /> {lead.listingTitle}
          </p>
        </div>
      </div>

      {/* Contact actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#F3F4F6] pt-4">
        <a
          href={`/dashboard/leads/${lead.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]/30 hover:text-[#4A3AFF]"
        >
          <MessageCircle size={13} /> View lead
        </a>
        <a
          href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your viewing — ${lead.listingTitle}`)}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]/30 hover:text-[#4A3AFF]"
        >
          <Mail size={13} /> Email
        </a>
        {lead.phone && (
          <a
            href={`tel:${lead.phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]/30 hover:text-[#4A3AFF]"
          >
            <Phone size={13} /> Call
          </a>
        )}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]/30 hover:text-[#4A3AFF]"
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
        )}
        <a
          href={`/property/${lead.listingSlug}`}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]/30 hover:text-[#4A3AFF]"
        >
          <Home size={13} /> Property
        </a>
      </div>
    </div>
  );
}
