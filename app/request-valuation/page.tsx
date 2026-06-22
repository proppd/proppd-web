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
    detail: 'Ask Proppd to route the request to a suitable agent or agency.',
    example: 'Family home in Durban North',
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl bg-[#1A1A2E] text-white shadow-sm">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-12">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Request valuation</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-[-.07em] sm:text-6xl">A cleaner first step for sellers and landlords.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Proppd’s valuation route is a readiness and handoff flow: capture the right property context, set expectations clearly, and route serious requests to suitable agents or agencies.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="rounded-full bg-white px-6 py-3 text-sm font-bold !text-[#1A1A2E]" href="/home-values#instant-estimate">Get instant estimate</a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white" href={buildValuationRequestMailto({ reason: 'selling' })}>Start manual request</a>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <BarChart3 className="text-[#2563EB]" size={34} />
                <h2 className="mt-5 text-3xl font-bold tracking-[-.05em]">Indicative, not a bank valuation</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                  This page does not promise an automated valuation model. It prepares the information an agent needs for a responsible market opinion.
                </p>
                <div className="mt-6 rounded-2xl bg-white p-4 text-[#1A1A2E]">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Owner consent first</p>
                  <p className="mt-2 font-bold">Requests open with a clear owner-approved summary so the right person can respond.</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">Handoff style</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/78">Clear summary first, then route to a suitable agent or Proppd review.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">Best for</p>
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
              <article key={reason.id} className="flex flex-col rounded-xl bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4A3AFF]">{formatValuationReason(reason.id)}</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">{reason.title}</h2>
                <p className="mt-3 flex-1 text-sm font-bold leading-6 text-[#6B7280]">{reason.detail}</p>
                <p className="mt-4 rounded-2xl bg-[#F7F8FA] p-3 text-sm font-bold text-[#6B7280]">Example: {reason.example}</p>
                <a className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold !text-white" href={buildValuationRequestMailto({ reason: reason.id })}>
                  Request this route <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Readiness checklist</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">What Proppd asks for before routing a valuation.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {valuationReadinessSteps.map((step, index) => (
                  <div key={step.title} className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                    <p className="text-3xl font-bold text-[#4A3AFF]">0{index + 1}</p>
                    <h3 className="mt-3 font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{step.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-[#EFF6FF] bg-[#F8FBFF] p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">What happens next</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 text-sm font-bold text-[#6B7280] shadow-sm">
                    <p className="font-bold text-[#1A1A2E]">1. Draft email</p>
                    <p className="mt-2 leading-6">A structured summary is built from the details you enter.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm font-bold text-[#6B7280] shadow-sm">
                    <p className="font-bold text-[#1A1A2E]">2. Review consent</p>
                    <p className="mt-2 leading-6">The handoff stays explicit about owner permission and POPIA.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm font-bold text-[#6B7280] shadow-sm">
                    <p className="font-bold text-[#1A1A2E]">3. Route to agent</p>
                    <p className="mt-2 leading-6">The request can be sent to a suitable agent or reviewed internally.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-bold leading-6 text-[#2563EB]">
                  If the timing is urgent, mention it in the note so the right partner can prioritise the response.
                </p>
              </div>
              <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">Good to include</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#F7F8FA] p-4 text-sm font-bold leading-6 text-[#6B7280]">
                    The exact property address or listing slug.
                  </div>
                  <div className="rounded-2xl bg-[#F7F8FA] p-4 text-sm font-bold leading-6 text-[#6B7280]">
                    A realistic timing window if you plan to sell or rent soon.
                  </div>
                  <div className="rounded-2xl bg-[#F7F8FA] p-4 text-sm font-bold leading-6 text-[#6B7280]">
                    One reachable owner contact so the handoff can move quickly.
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-[#EFF6FF] bg-[#F8FBFF] p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">Sample request wording</p>
                <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">
                  “I’d like an indicative market range for a 3-bedroom house in Sandton. The owner consents to a follow-up from a suitable agent and can be reached by email.”
                </p>
              </div>
            </div>

            <ValuationRequestForm reasons={reasons.map((reason) => reason.id)} initialReason="selling" />
          </section>

          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Valuation handoff</p>
                <h2 className="mt-3 text-4xl font-bold tracking-[-.06em]">Three small checks before you hit send</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                  The goal is a clean request that an agent can action quickly, without making the form feel like a dead end.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href={buildValuationRequestMailto({ reason: 'selling' })}>
                Start valuation request →
              </a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MiniFact title="What agents receive" body="A concise owner brief with property basics, reason, and consent status." />
              <MiniFact title="Typical turnaround" body="The first response should route quickly once the right agent is chosen." />
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
    <article className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
      <h3 className="text-xl font-bold tracking-[-.03em]">{title}</h3>
      <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">{body}</p>
      {actionHref && actionLabel && (
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF]" href={actionHref}>
          {actionLabel} →
        </a>
      )}
    </article>
  );
}

function MiniFact({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{body}</p>
    </div>
  );
}

function TrustCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="inline-flex rounded-2xl bg-[#EFF6FF] p-3 text-[#2563EB]">{icon}</div>
      <h2 className="mt-4 text-xl font-bold tracking-[-.03em]">{title}</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-[#9CA3AF]">{text}</p>
    </div>
  );
}
