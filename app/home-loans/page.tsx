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

      <SiteFooter />
    </main>
  );
}
