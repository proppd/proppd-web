import type { Metadata } from 'next';
import { CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import { HomeLoanCalculator } from '@/components/finance/home-loan-calculator';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export const metadata: Metadata = {
  title: 'Home loans',
  alternates: {
    canonical: '/home-loans',
  },
};

const steps = [
  ['Check readiness', 'Income, debt, deposit, credit standing, and purchase costs are reviewed before buyers are routed to a partner.'],
  ['Match the property journey', 'Bond readiness should sit next to listing search, viewing requests, and agent follow-up — not after the buyer has already lost time.'],
  ['Route with consent', 'Finance enquiries must keep POPIA consent, buyer context, and handoff history clear for the agency and finance partner.'],
];

const readinessFacts = [
  ['Fast estimate', 'Use the calculator first, then move into a clearer next step.'],
  ['Document-ready', 'Keep payslips, statements, and deposit context close to the enquiry.'],
  ['Clear handoff', 'Finance interest should route with consent and property context.'],
];

const handoffSteps = [
  ['Register interest', 'Send a finance-ready enquiry with your budget and property context.'],
  ['Share the essentials', 'Attach the right documents so the request does not stall at the first reply.'],
  ['Route with consent', 'Proppd keeps the handoff tied to the property journey and buyer permission.'],
  ['Continue the search', 'If the buyer is still deciding, the flow should bring them back to live homes.'],
];

const trustPoints = [
  'Consent stays attached to the request instead of disappearing into a generic inbox thread.',
  'Property context should travel with the finance enquiry so the follow-up feels relevant.',
  'The handoff should feel like a next step, not a dead end or an opaque form submit.',
];

export default function HomeLoansPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(59,73,255,.18),transparent_22rem),radial-gradient(circle_at_80%_10%,rgba(18,214,197,.22),transparent_20rem)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
          <div className="rounded-xl border border-[#E5E7EB] bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4A3AFF]/20 bg-[#4A3AFF]/10 px-4 py-2 text-sm font-bold text-[#4A3AFF]">
              <ShieldCheck size={16} /> Home loan readiness
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">
              Make finance readiness part of the property search.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#6B7280]">
              Proppd is preparing a buyer-friendly home loan handoff: practical affordability guidance, document readiness, and partner routing before the enquiry becomes a dead lead.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="inline-flex rounded-full bg-[#4A3AFF] px-6 py-3 font-bold text-white shadow-xl shadow-[#4A3AFF]/20 transition hover:bg-[#1A1A2E]" href="mailto:info@proppd.com?subject=Home%20loan%20readiness">
                Register finance interest
              </a>
              <a className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="/properties/for-sale">
                Browse homes for sale
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {readinessFacts.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-[#E5E7EB] bg-white/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#4A3AFF]">{title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <HomeLoanCalculator />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(([title, body], index) => (
              <div key={title} className="rounded-[1.75rem] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DBEAFE] text-[#2563EB]">
                  {index === 0 ? <FileCheck2 size={22} /> : <CheckCircle2 size={22} />}
                </div>
                <h2 className="mt-5 text-2xl font-bold tracking-[-.04em]">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#6B7280]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Finance handoff</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-.06em]">3 document-ready steps before you apply</h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                Keep the buyer journey moving by preparing the right documents early, then let Proppd route the finance request with clean context.
              </p>
            </div>
            <a className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="mailto:info@proppd.com?subject=Home%20loan%20readiness">
              Register finance interest →
            </a>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <SupportCard
              title="What to prepare"
              body="Recent payslips, bank statements, ID copies, proof of address, and a realistic deposit picture all help the handoff move faster."
            />
            <SupportCard
              title="How the handoff works"
              body="Use the calculator, register interest, then Proppd can connect the finance request to the property search and enquiry trail."
              actionHref="/properties/for-sale"
              actionLabel="Browse properties"
            />
            <SupportCard
              title="Need a quick intro?"
              body="If you are already looking at a home, send the listing context with your finance request so the partner sees the right budget band."
              actionHref="mailto:info@proppd.com?subject=Home%20loan%20readiness"
              actionLabel="Email Proppd"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-xl bg-[#1A1A2E] p-6 text-white shadow-[0_30px_80px_rgba(5,10,48,.16)] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-cyan-300">What happens next</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-[-.06em]">A clear handoff after the calculator.</h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-white/70">
              Buyers should be able to move from affordability to action without losing the context that makes a finance request useful.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {handoffSteps.map(([title, body], index) => (
                <div key={title} className="rounded-lg border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/15 text-sm font-bold text-cyan-200">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-bold tracking-[-.03em]">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/70">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="inline-flex rounded-full bg-white px-5 py-3 font-bold text-[#1A1A2E] transition hover:bg-cyan-100" href="mailto:info@proppd.com?subject=Home%20loan%20readiness">
                Register finance interest
              </a>
              <a className="inline-flex rounded-full border border-white/20 px-5 py-3 font-bold text-white transition hover:border-cyan-200 hover:text-cyan-200" href="/properties/for-sale">
                Browse homes for sale
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Response guide</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Why the handoff feels safe.</h2>
            <ul className="mt-6 space-y-4">
              {trustPoints.map((point) => (
                <li key={point} className="flex gap-3 rounded-[1.25rem] bg-[#F7F8FA] p-4">
                  <div className="mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
                    <ShieldCheck size={16} />
                  </div>
                  <p className="text-sm font-semibold leading-6 text-[#6B7280]">{point}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-lg border border-[#4A3AFF]/10 bg-[#4A3AFF]/6 p-4">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4A3AFF]">Good fit when</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">
                the buyer is still comparing homes, wants a realistic budget check, or needs a clearer next step before a full application.
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9CA3AF]">Sample finance note</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">
                “We are looking around R1.1m, have a deposit ready, and want finance guidance before booking more viewings.”
              </p>
            </div>
          </div>
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
