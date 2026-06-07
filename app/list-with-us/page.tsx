import type React from 'react';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { AgencyApplicationForm } from '@/components/agency-application-form';
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
  {
    title: 'Verified profiles',
    text: 'Agency details, areas, and listings are checked before exposure.',
    icon: <ShieldCheck size={16} />,
  },
  {
    title: 'Cleaner handoff',
    text: 'Enquiries carry the context your team needs to respond faster.',
    icon: <UsersRound size={16} />,
  },
];

const onboardingSteps = [
  'Share agency details, priority areas, and a clean listing feed.',
  'Proppd reviews the stock, confirms the contact, and opens the pilot handoff.',
];

const launchChecklist = [
  'A main contact who can approve the profile details.',
  'A current listing feed or clean export of active stock, plus a few enquiry examples.',
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
    text: 'Live enquiries move through a clear pilot route with feedback.',
  },
];

const launchPromiseNotes = [
  { icon: ShieldCheck, title: 'Manual review', text: 'A real person checks the launch request before approval.' },
  { icon: CheckCircle2, title: 'Real stock only', text: 'We want live inventory and a reachable decision-maker.' },
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
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#00C9A7]">List with Proppd</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-[-.07em] sm:text-6xl">Fair portal exposure for serious South African property professionals.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Join the Proppd launch rollout with verified profiles, cleaner enquiry routing, and early access to agent workflow tools while the network grows deliberately.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="rounded-full bg-white px-6 py-3 text-sm font-bold !text-[#1A1A2E]" href="#launch-application">Open launch application</a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white" href="/dashboard">See the AgentOS workspace</a>
                </div>
                <div className="mt-8 rounded-lg border border-white/10 bg-white/6 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/45">
                    <ShieldCheck size={14} className="text-[#00C9A7]" />
                    Launch trust
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {launchSignals.map(({ title, text, icon }) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-[#1A1A2E]/65 p-5 shadow-[0_20px_50px_rgba(5,10,48,.18)]">
                        <div className="inline-flex rounded-2xl bg-white/8 p-2 text-[#00C9A7]">
                          {icon}
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[.16em] text-[#00C9A7]">{title}</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-white/75">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <Sparkles className="text-[#00C9A7]" size={32} />
                <h2 className="mt-5 text-3xl font-bold tracking-[-.05em]">Launch partners first</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                  Proppd prioritises agencies with clean stock, fast lead response, and real feedback on the workflow.
                </p>
                <div className="mt-6 space-y-3">
                  {launchPromiseNotes.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <div className="flex items-center gap-2 text-[#00C9A7]">
                        <Icon size={16} />
                        <p className="text-xs font-bold uppercase tracking-[.14em]">{title}</p>
                      </div>
                      <p className="mt-2 text-sm font-bold leading-6 text-white/70">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-white p-4 text-[#1A1A2E]">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Pilot promise</p>
                  <p className="mt-2 font-bold">Measured launch, real review, and no fake “instant CRM” claim.</p>
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
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">What we need from you</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">A clean pilot starts with clean inputs.</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {launchChecklist.map((item, index) => (
                  <div key={item} className="rounded-3xl bg-[#F7F8FA] p-4">
                    <p className="text-2xl font-bold text-[#4A3AFF]">0{index + 1}</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#E6FBF7] p-6">
              <Sparkles className="text-[#00C9A7]" size={30} />
              <h2 className="mt-4 text-2xl font-bold tracking-[-.04em] text-[#00C9A7]">Who should apply?</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#00C9A7]">
                Agencies that already manage real stock, want a clearer enquiry handoff, and are comfortable giving direct feedback during rollout.
              </p>
            </div>
          </div>

          <AgencyApplicationForm />

          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            {launchPackages.map((item) => (
              <article key={item.id} className="flex flex-col rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[.18em] text-[#4A3AFF]">{item.bestFor}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">{item.name}</h2>
                <p className="mt-2 text-xl font-bold text-[#00C9A7]">{item.price}</p>
                <p className="mt-4 text-sm font-bold leading-6 text-[#6B7280]">{item.summary}</p>
                <ul className="mt-5 flex-1 space-y-3 text-sm font-bold leading-6 text-[#6B7280]">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-[#00C9A7]" size={16} /> {feature}</li>
                  ))}
                </ul>
                <a className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold !text-white" href={buildAgencyApplicationMailto({ packageName: item.name })}>
                  Request {item.name} <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Launch review</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">A controlled launch path, not a loose sign-up form.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {onboardingSteps.map((step, index) => (
                  <div key={step} className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                    <p className="text-3xl font-bold text-[#4A3AFF]">0{index + 1}</p>
                    <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#6B7280]">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">Launch rule</span>
                Real stock and a reachable decision-maker only.
              </div>
            </div>

            <aside className="rounded-xl border border-[#E5E7EB] bg-[#E6FBF7] p-6">
              <ShieldCheck className="text-[#00C9A7]" size={30} />
              <h2 className="mt-4 text-2xl font-bold tracking-[-.04em] text-[#00C9A7]">Who gets approved?</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#00C9A7]">
                Agencies with live stock, a reachable contact, and enough feedback to shape the pilot workflow.
              </p>
              <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm font-bold leading-6 text-[#00C9A7]">
                <span className="block text-xs font-bold uppercase tracking-[.14em] text-[#00C9A7]/70">Approval criteria</span>
                Enquiries need a clear fallback, and launch details should confirm the feed is real before the pilot is opened.
              </div>
              <a className="mt-5 inline-flex items-center justify-center rounded-full border border-[#00C9A7]/20 bg-white px-5 py-3 text-sm font-bold text-[#00C9A7] shadow-sm transition hover:border-[#00C9A7]" href={buildAgencyApplicationMailto({ packageName: 'Agency Growth' })}>
                Send launch details →
              </a>
            </aside>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function TrustCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="inline-flex rounded-2xl bg-[#E6FBF7] p-3 text-[#00C9A7]">{icon}</div>
      <h2 className="mt-4 text-xl font-bold tracking-[-.03em]">{title}</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-[#9CA3AF]">{text}</p>
    </div>
  );
}
