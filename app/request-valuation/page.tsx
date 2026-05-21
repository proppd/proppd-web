import type React from 'react';
import type { Metadata } from 'next';
import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Home, ShieldCheck } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { ValuationRequestForm } from '@/components/valuation/valuation-request-form';
import { buildValuationRequestMailto, formatValuationReason, valuationReadinessSteps, type ValuationReason } from '@/lib/valuation/request';

export const metadata: Metadata = {
  title: 'Request valuation',
  alternates: {
    canonical: '/request-valuation',
  },
};

const reasons: { id: ValuationReason; title: string; detail: string; example: string }[] = [
  {
    id: 'selling',
    title: 'Seller readiness',
    detail: 'Understand whether your property is ready for a serious launch campaign.',
    example: 'Townhouse in Umhlanga',
  },
  {
    id: 'renting',
    title: 'Landlord rental check',
    detail: 'Sense-check rental demand before listing a home or apartment.',
    example: 'Apartment in Sea Point',
  },
  {
    id: 'market_check',
    title: 'Market pulse',
    detail: 'Get a practical range before deciding whether to sell, rent, or hold.',
    example: 'House in Sandton',
  },
  {
    id: 'agent_appraisal',
    title: 'Agent handoff',
    detail: 'Ask Proppd to route the request to a suitable launch partner agent.',
    example: 'Family home in Durban North',
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.5rem] bg-[#050A30] text-white shadow-sm">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-12">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Request valuation</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">A cleaner first step for sellers and landlords.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Proppd’s valuation route is a readiness and handoff flow: capture the right property context, set expectations clearly, and route serious requests to suitable launch partner agents.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="rounded-full bg-white px-6 py-3 text-sm font-black !text-[#050A30]" href={buildValuationRequestMailto({ reason: 'selling' })}>Start valuation request</a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white" href="/properties/for-sale">Browse sale stock</a>
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <BarChart3 className="text-[#12D6C5]" size={34} />
                <h2 className="mt-5 text-3xl font-black tracking-[-.05em]">Indicative, not a bank valuation</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                  This page does not promise an automated valuation model. It prepares the information an agent needs for a responsible market opinion.
                </p>
                <div className="mt-6 rounded-2xl bg-white p-4 text-[#050A30]">
                  <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Owner consent first</p>
                  <p className="mt-2 font-black">Requests are sent by email handoff until Supabase-backed seller workflows are live.</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[.14em] text-[#12D6C5]">Handoff style</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/78">Email first, then route to a launch partner or internal review.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[.14em] text-[#12D6C5]">Best for</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/78">Owners who want a realistic starting point before listing or holding.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <TrustCard icon={<Home size={22} />} title="Useful property context" text="Collect suburb, property type, bedroom count, timeframe, and owner contact basics before routing." />
            <TrustCard icon={<ClipboardCheck size={22} />} title="Comparable-ready handoff" text="Frame the request around practical market evidence, recent improvements, and listing readiness." />
            <TrustCard icon={<ShieldCheck size={22} />} title="POPIA-aware routing" text="Make it clear that owner details are used to respond and coordinate a suitable agent handoff." />
          </div>

          <section className="mt-8 grid gap-5 lg:grid-cols-4">
            {reasons.map((reason) => (
              <article key={reason.id} className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#3B49FF]">{formatValuationReason(reason.id)}</p>
                <h2 className="mt-3 text-2xl font-black tracking-[-.04em]">{reason.title}</h2>
                <p className="mt-3 flex-1 text-sm font-bold leading-6 text-slate-600">{reason.detail}</p>
                <p className="mt-4 rounded-2xl bg-[#F5F7FA] p-3 text-sm font-black text-slate-600">Example: {reason.example}</p>
                <a className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#050A30] px-5 py-3 text-sm font-black !text-white" href={buildValuationRequestMailto({ reason: reason.id })}>
                  Request this route <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Readiness checklist</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">What Proppd asks for before routing a valuation.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {valuationReadinessSteps.map((step, index) => (
                  <div key={step.title} className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-5">
                    <p className="text-3xl font-black text-[#3B49FF]">0{index + 1}</p>
                    <h3 className="mt-3 font-black">{step.title}</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{step.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-[#eefcf9] bg-[#f8fffd] p-5">
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#0f766e]">What happens next</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-600 shadow-sm">
                    <p className="font-black text-[#050A30]">1. Draft email</p>
                    <p className="mt-2 leading-6">A structured summary is built from the details you enter.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-600 shadow-sm">
                    <p className="font-black text-[#050A30]">2. Review consent</p>
                    <p className="mt-2 leading-6">The handoff stays explicit about owner permission and POPIA.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-600 shadow-sm">
                    <p className="font-black text-[#050A30]">3. Route to agent</p>
                    <p className="mt-2 leading-6">The request can be sent to a launch partner or reviewed internally.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-bold leading-6 text-[#0f766e]">
                  If the timing is urgent, mention it in the note so the right partner can prioritise the response.
                </p>
              </div>
              <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#3B49FF]">Good to include</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#F5F7FA] p-4 text-sm font-bold leading-6 text-slate-600">
                    The exact property address or listing slug.
                  </div>
                  <div className="rounded-2xl bg-[#F5F7FA] p-4 text-sm font-bold leading-6 text-slate-600">
                    A realistic timing window if you plan to sell or rent soon.
                  </div>
                  <div className="rounded-2xl bg-[#F5F7FA] p-4 text-sm font-bold leading-6 text-slate-600">
                    One reachable owner contact so the handoff can move quickly.
                  </div>
                </div>
              </div>
            </div>

            <ValuationRequestForm reasons={reasons.map((reason) => reason.id)} initialReason="selling" />
          </section>

          <section className="mt-8 rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Valuation handoff</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">Three small checks before you hit send</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                  The goal is a clean request that an agent can action quickly, without making the form feel like a dead end.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href={buildValuationRequestMailto({ reason: 'selling' })}>
                Start valuation request →
              </a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MiniFact title="What agents receive" body="A concise owner brief with property basics, reason, and consent status." />
              <MiniFact title="Typical turnaround" body="The first response should route quickly once the right launch partner is chosen." />
              <MiniFact title="Best for" body="Owners who want a sensible market opinion before they list, rent, or hold." />
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <SupportCard
                title="Have the basics ready"
                body="Suburb, property type, owner contact, and a realistic timeline are the minimum context needed for a useful handoff."
              />
              <SupportCard
                title="Choose the right reason"
                body="Seller readiness, rental check, market pulse, or agent handoff each shape the request summary and routing path."
              />
              <SupportCard
                title="Need a faster route?"
                body="If you already know the market or agent you want, send the request with that context and Proppd can prioritise the right partner."
                actionHref="mailto:info@proppd.com?subject=Valuation%20request"
                actionLabel="Email Proppd"
              />
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function SupportCard({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-5">
      <h3 className="text-xl font-black tracking-[-.03em]">{title}</h3>
      <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{body}</p>
      {actionHref && actionLabel && (
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#3B49FF]" href={actionHref}>
          {actionLabel} →
        </a>
      )}
    </article>
  );
}

function MiniFact({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-4">
      <p className="text-xs font-black uppercase tracking-[.14em] text-[#3B49FF]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function TrustCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="inline-flex rounded-2xl bg-[#eefcf9] p-3 text-[#0f766e]">{icon}</div>
      <h2 className="mt-4 text-xl font-black tracking-[-.03em]">{title}</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{text}</p>
    </div>
  );
}
