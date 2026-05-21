import type React from 'react';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { buildAgencyApplicationMailto, launchPackages } from '@/lib/agents/onboarding';

export const metadata: Metadata = {
  title: 'List with Proppd',
  alternates: {
    canonical: '/list-with-us',
  },
  openGraph: {
    title: 'List with Proppd | Proppd',
    description: 'Join the Proppd launch rollout with verified profiles, cleaner enquiry handoff, and early AgentOS workflows.',
    url: '/list-with-us',
    siteName: 'Proppd',
    type: 'website',
    images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List with Proppd | Proppd',
    description: 'Join the Proppd launch rollout with verified profiles, cleaner enquiry handoff, and early AgentOS workflows.',
    images: ['/proppd-logo-horizontal.png'],
  },
};

const launchSignals = [
  ['Verified profiles', 'Agency details, areas, and listings are checked before exposure.'],
  ['Cleaner handoff', 'Enquiries carry the context your team needs to respond faster.'],
  ['Pilot review', 'Every request is assessed before onboarding is approved.'],
];

const onboardingSteps = [
  'Send your agency details and priority areas.',
  'Proppd confirms listing volume, agent profiles, and data handoff format.',
  'We prepare verified profiles and route enquiries through the pilot workflow.',
];

const launchChecklist = [
  'A main contact who can approve the profile details.',
  'Your current listing feed or a clean export of active stock.',
  'A few example enquiry scenarios so the pilot routes feel realistic.',
];

const launchFlow = [
  {
    step: '01',
    title: 'Submit the basics',
    text: 'Agency name, main contact, and service areas.',
  },
  {
    step: '02',
    title: 'We review the feed',
    text: 'We check stock freshness, routing, and profile details.',
  },
  {
    step: '03',
    title: 'Pilot starts',
    text: 'Live enquiries move through email handoff and feedback.',
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
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">List with Proppd</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Fair portal exposure for serious South African property professionals.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Join the Proppd launch rollout with verified profiles, cleaner enquiry handoff, and early access to AgentOS workflows without pretending the full backend is already automated.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="rounded-full bg-white px-6 py-3 text-sm font-black !text-[#050A30]" href={buildAgencyApplicationMailto({ packageName: 'Agency Growth' })}>Apply for launch access</a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white" href="/dashboard">See the AgentOS workspace</a>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {launchSignals.map(([title, text]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">{title}</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-white/72">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <Sparkles className="text-[#12D6C5]" size={32} />
                <h2 className="mt-5 text-3xl font-black tracking-[-.05em]">Launch partners first</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                  Proppd is prioritising agencies that can provide accurate listing data, fast lead response, and practical feedback on the AgentOS workflow.
                </p>
                <div className="mt-6 rounded-2xl bg-white p-4 text-[#050A30]">
                  <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Pilot promise</p>
                  <p className="mt-2 font-black">Measured launch, real review, and no fake “instant CRM” claim.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <TrustCard icon={<ShieldCheck size={22} />} title="Verified exposure" text="Profiles and listings are positioned around trust, accurate details, and fair marketplace discovery." />
            <TrustCard icon={<UsersRound size={22} />} title="Cleaner lead routing" text="Buyer and tenant enquiries include POPIA-aware handoff context before they reach your team." />
            <TrustCard icon={<CheckCircle2 size={22} />} title="AgentOS path" text="Launch partners help shape the workflow layer for follow-ups, seller reports, and WhatsApp-first operations." />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_.9fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">What we need from you</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">A clean pilot starts with clean inputs.</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {launchChecklist.map((item, index) => (
                  <div key={item} className="rounded-3xl bg-[#F5F7FA] p-4">
                    <p className="text-2xl font-black text-[#3B49FF]">0{index + 1}</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-[#eefcf9] p-6">
              <Sparkles className="text-[#0f766e]" size={30} />
              <h2 className="mt-4 text-2xl font-black tracking-[-.04em] text-[#0f766e]">Who should apply?</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#0f766e]">
                Agencies that already manage real stock, want a clearer enquiry handoff, and are comfortable giving direct feedback during rollout.
              </p>
            </div>
          </div>

          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            {launchPackages.map((item) => (
              <article key={item.id} className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[.18em] text-[#3B49FF]">{item.bestFor}</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">{item.name}</h2>
                <p className="mt-2 text-xl font-black text-[#0f766e]">{item.price}</p>
                <p className="mt-4 text-sm font-bold leading-6 text-slate-600">{item.summary}</p>
                <ul className="mt-5 flex-1 space-y-3 text-sm font-bold leading-6 text-slate-600">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-[#12D6C5]" size={16} /> {feature}</li>
                  ))}
                </ul>
                <a className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#050A30] px-5 py-3 text-sm font-black !text-white" href={buildAgencyApplicationMailto({ packageName: item.name })}>
                  Request {item.name} <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Onboarding flow</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">A controlled launch path, not a loose sign-up form.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {onboardingSteps.map((step, index) => (
                  <div key={step} className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-5">
                    <p className="text-3xl font-black text-[#3B49FF]">0{index + 1}</p>
                    <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-slate-200 bg-[#eefcf9] p-6">
              <ShieldCheck className="text-[#0f766e]" size={30} />
              <h2 className="mt-4 text-2xl font-black tracking-[-.04em] text-[#0f766e]">Data and consent gate</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#0f766e]">
                Agency launch requests use an email handoff for now. Production onboarding still needs Supabase-backed agency applications, tenant-scoped agent invites, audit events, and notification routing.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/80 p-4 text-sm font-bold leading-6 text-[#0f766e]">
                  <span className="block text-xs font-black uppercase tracking-[.14em] text-[#0f766e]/70">Launch rule</span>
                  Real stock and a reachable decision-maker only.
                </div>
                <div className="rounded-2xl bg-white/80 p-4 text-sm font-bold leading-6 text-[#0f766e]">
                  <span className="block text-xs font-black uppercase tracking-[.14em] text-[#0f766e]/70">Routing</span>
                  Enquiries need a clear fallback while the full automation layer is still being wired.
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-8 rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Pilot review</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">What Proppd checks before a launch partner gets approved.</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                  We keep the final step short: check the feed, confirm the contact, and route the pilot through a clean handoff.
                </p>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href={buildAgencyApplicationMailto({ packageName: 'Agency Growth' })}>
                Send launch details →
              </a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {launchFlow.map((item) => (
                <div key={item.step} className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-4">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-[#3B49FF]">{item.step}</p>
                  <p className="mt-2 text-lg font-black tracking-[-.04em]">{item.title}</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
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
