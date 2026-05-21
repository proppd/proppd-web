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

export default function HomeLoansPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="relative isolate overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(59,73,255,.18),transparent_22rem),radial-gradient(circle_at_80%_10%,rgba(18,214,197,.22),transparent_20rem)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3B49FF]/20 bg-[#3B49FF]/10 px-4 py-2 text-sm font-black text-[#3B49FF]">
              <ShieldCheck size={16} /> Home loan readiness
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-7xl">
              Make finance readiness part of the property search.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
              Proppd is preparing a buyer-friendly home loan handoff: practical affordability guidance, document readiness, and partner routing before the enquiry becomes a dead lead.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="inline-flex rounded-full bg-[#3B49FF] px-6 py-3 font-black text-white shadow-xl shadow-[#3B49FF]/20 transition hover:bg-[#050A30]" href="mailto:info@proppd.com?subject=Home%20loan%20readiness">
                Register finance interest
              </a>
              <a className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/properties/for-sale">
                Browse homes for sale
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {readinessFacts.map(([title, body]) => (
                <div key={title} className="rounded-[1.5rem] border border-white/12 bg-white/8 p-4 text-white/90 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">{title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/72">{body}</p>
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
              <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#12D6C5]/15 text-[#057a70]">
                  {index === 0 ? <FileCheck2 size={22} /> : <CheckCircle2 size={22} />}
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-[-.04em]">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Finance handoff</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">3 document-ready steps before you apply</h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                Keep the buyer journey moving by preparing the right documents early, then let Proppd route the finance request with clean context.
              </p>
            </div>
            <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="mailto:info@proppd.com?subject=Home%20loan%20readiness">
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
