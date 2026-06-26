import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { CalendarClock, CheckCircle2, Clock, ExternalLink, Home, MessageCircle, Send } from 'lucide-react';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { getPortalServerUser } from '@/lib/supabase/server';
import { loadConsumerEnquiries, type ConsumerEnquiryRecord } from '@/lib/proppd/backend';
import type { LeadStatus } from '@/lib/leads/pipeline';
import { buildWhatsAppHref } from '@/lib/leads/pipeline';

export const metadata: Metadata = {
  title: { absolute: 'My enquiries | Proppd' },
  description: 'Track your property enquiries and viewing bookings.',
  alternates: { canonical: '/account/enquiries' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<LeadStatus, { label: string; detail: string; chip: string }> = {
  new:             { label: 'Sent',              detail: 'Your enquiry was received. The agent will be in touch shortly.',       chip: 'bg-[#4A3AFF]/10 text-[#4A3AFF]' },
  contacted:       { label: 'Agent replied',     detail: 'The agent has been in contact. Check your email or phone.',           chip: 'bg-amber-50 text-amber-700' },
  viewing_booked:  { label: 'Viewing scheduled', detail: 'A viewing has been confirmed. Check the date and time below.',        chip: 'bg-[#EFF6FF] text-[#2563EB]' },
  qualified:       { label: 'In discussion',     detail: 'The agent has qualified your enquiry and is following up.',           chip: 'bg-[#EFF6FF] text-[#2563EB]' },
  converted:       { label: 'Progressing',       detail: 'Your enquiry has progressed. The agent will guide you on next steps.', chip: 'bg-[#DCFCE7] text-[#166534]' },
  not_interested:  { label: 'Closed',            detail: 'This enquiry has been closed.',                                      chip: 'bg-slate-100 text-slate-500' },
  fake_spam:       { label: 'Closed',            detail: '',                                                                   chip: 'bg-slate-100 text-slate-500' },
};

export default async function Page() {
  const user = await getPortalServerUser();
  if (!user?.email) redirect('/login?next=%2Faccount%2Fenquiries');

  const payload = await loadConsumerEnquiries(user.email);
  const enquiries = payload.items;

  return (
    <main className="proppd-page">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">My account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">My enquiries</h1>
          <p className="mt-2 text-sm font-semibold text-[#6B7280]">
            Track the status of every property you have enquired about on Proppd.
          </p>

          {enquiries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-8 space-y-4">
              {enquiries.map((enquiry) => (
                <EnquiryCard key={enquiry.id} enquiry={enquiry} />
              ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Your saved homes</p>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">
              View properties you have shortlisted and your saved search alerts.
            </p>
            <a href="/saved" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
              <Home size={14} /> Go to saved homes →
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function EnquiryCard({ enquiry }: { enquiry: ConsumerEnquiryRecord }) {
  const cfg = STATUS_CONFIG[enquiry.status] ?? STATUS_CONFIG.new;
  const date = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(enquiry.createdAt));

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        {enquiry.listingCoverImage ? (
          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
            <Image src={enquiry.listingCoverImage} alt={enquiry.listingTitle} fill className="object-cover" sizes="96px" />
          </div>
        ) : (
          <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6]">
            <Home size={24} className="text-[#D1D5DB]" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold text-[#1A1A2E] leading-tight">{enquiry.listingTitle}</p>
              <p className="mt-0.5 text-xs font-semibold text-[#9CA3AF]">{enquiry.agentName} · {date}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${cfg.chip}`}>{cfg.label}</span>
          </div>

          {cfg.detail && (
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{cfg.detail}</p>
          )}

          {enquiry.viewingAt && enquiry.status === 'viewing_booked' && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-sm font-bold text-[#2563EB]">
              <CalendarClock size={14} />
              {new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(enquiry.viewingAt))}
            </div>
          )}

          {enquiry.listingSlug && (
            <div className="mt-3">
              <a href={`/property/${enquiry.listingSlug}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
                <ExternalLink size={12} /> View property →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-[#E5E7EB] p-12 text-center">
      <Send size={32} className="mx-auto text-[#D1D5DB]" />
      <h2 className="mt-4 text-lg font-bold text-[#1A1A2E]">No enquiries yet</h2>
      <p className="mt-2 text-sm text-[#6B7280]">
        When you enquire about a property on Proppd, it will appear here so you can track the agent&apos;s response.
      </p>
      <a href="/properties" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
        Browse properties
      </a>
    </div>
  );
}
