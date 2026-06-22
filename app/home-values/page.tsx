import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { InstantValuationForm } from '@/components/valuation/instant-valuation-form';

export const metadata: Metadata = {
  title: 'Instant home value estimate',
  description: 'Get an instant indicative property value range from Proppd using comparable portal listings and local market signals.',
  alternates: {
    canonical: '/home-values',
  },
};

const steps = [
  ['Enter the property basics', 'Suburb, city, property type, bedrooms, bathrooms and optional floor size.'],
  ['See an indicative range', 'Proppd compares available portal stock and shows confidence before overpromising.'],
  ['Request a local appraisal', 'Owners can send the estimate to Proppd for a human market opinion and agent handoff.'],
];

export default function Page() {
  return (
    <main className="proppd-page">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Home values</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-[-.07em] text-[#1A1A2E] sm:text-6xl">Get an instant market range before you list.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B7280]">
                  A Zoopla-style valuation flow for Proppd: fast enough for owners, honest enough for agents, and grounded in comparable listings instead of a fake exact price.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="inline-flex items-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white" href="#instant-estimate">
                    Start estimate <ArrowRight size={16} />
                  </a>
                  <a className="rounded-full border border-[#E5E7EB] px-6 py-3 text-sm font-bold text-[#1A1A2E]" href="/request-valuation">Request agent valuation</a>
                  <a className="rounded-full border border-[#E5E7EB] px-6 py-3 text-sm font-bold text-[#1A1A2E]" href="/my-properties">Track in my workspace</a>
                </div>
              </div>
              <div className="rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-white to-white p-6 text-[#1A1A2E]">
                <BarChart3 className="text-[#2563EB]" size={34} />
                <h2 className="mt-5 text-3xl font-bold tracking-[-.05em]">Indicative, not formal.</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">
                  The range is a starting point. Proppd keeps bank valuations, legal valuations and final pricing decisions with qualified professionals.
                </p>
                <div className="mt-6 grid gap-3">
                  <TrustPill icon={<TrendingUp size={16} />} text="Comparable listing range" />
                  <TrustPill icon={<CheckCircle2 size={16} />} text="Confidence level shown" />
                  <TrustPill icon={<ShieldCheck size={16} />} text="Agent follow-up ready" />
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(([title, text], index) => (
              <article key={title} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <p className="text-3xl font-bold text-[#4A3AFF]">0{index + 1}</p>
                <h2 className="mt-3 text-xl font-bold tracking-[-.03em]">{title}</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
              </article>
            ))}
          </section>

          <section id="instant-estimate" className="mt-8 scroll-mt-24">
            <InstantValuationForm />
          </section>

          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-5 lg:grid-cols-3">
              <Explainer title="Why it helps owners" text="They get a quick market range before committing to list, rent, renovate, or hold." />
              <Explainer title="Why it helps agencies" text="The estimate becomes a warmer valuation lead with property context and buyer/seller intent already attached." />
              <Explainer title="Why confidence matters" text="Thin markets should route to agents instead of showing false precision. That keeps Proppd trustworthy." />
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function TrustPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#BFDBFE] bg-white/70 p-3 text-sm font-bold text-[#1A1A2E]">
      <span className="text-[#2563EB]">{icon}</span>
      {text}
    </div>
  );
}

function Explainer({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] p-5">
      <h2 className="text-xl font-bold tracking-[-.03em]">{title}</h2>
      <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
    </div>
  );
}
