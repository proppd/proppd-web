import type { Metadata } from 'next';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Inbox,
  LayoutDashboard,
  ListPlus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export const metadata: Metadata = {
  title: { absolute: 'Proppd for Agents | Lead CRM & listing tools' },
  description:
    'Proppd for Agents is the operating system for South African estate agents: routed verified leads, a simple CRM, listing tools, and seller/landlord enquiries delivered straight to you.',
  alternates: { canonical: '/for-agents' },
};

const features = [
  {
    icon: <Inbox size={22} />,
    title: 'Routed, verified leads',
    text: 'Enquiries are checked for quality and spam, then routed to the right agent — no noise, no shared inbox scramble.',
  },
  {
    icon: <LayoutDashboard size={22} />,
    title: 'A CRM built for the work',
    text: 'A plain task queue: reply to new leads, review flagged ones, move them through to qualified. Designed mobile-first.',
  },
  {
    icon: <ListPlus size={22} />,
    title: 'Listing tools (AgentOS)',
    text: 'Create and edit stock, manage photos and pricing, and watch listing performance from one workspace.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Seller & landlord leads',
    text: 'Owners who value their property on Proppd can request an agent valuation — those land in your queue as warm leads.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Verified profiles & directory',
    text: 'A clean public profile in the agent directory, so buyers and sellers can find and trust you.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Fair, transparent exposure',
    text: 'Not another expensive, noisy portal. Real listings and clear routing, built to grow with serious professionals.',
  },
];

const flow = [
  ['1. An owner or buyer enquires', 'A seller values their home, or a buyer asks about a listing, on the consumer portal.'],
  ['2. Proppd verifies & routes', 'The enquiry is quality-checked and routed to the right agent with full context and consent.'],
  ['3. You close it in the CRM', 'Reply, track, and move the lead through your pipeline — all in your Proppd workspace.'],
];

export default function Page() {
  return (
    <main className="proppd-page">
      <SiteHeader />

      {/* Hero */}
      <section className="relative border-b border-[#D7E3F4] bg-gradient-to-b from-[#CFE0FB] via-[#E6EFFE] to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFD3F2] bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            <Sparkles size={13} /> Proppd for agents
          </span>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-.04em] text-[#1A1A2E] sm:text-6xl lg:text-[4rem] lg:leading-[1.05]">
            The operating system for South African estate agents.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-[#4B5563] sm:text-xl">
            Verified leads routed to the right agent, a CRM that matches how you actually work, and listing tools in one place — while the consumer portal brings you buyers, sellers, and landlords.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
              Request agency access <ArrowRight size={16} />
            </a>
            <a href="/login" className="rounded-full border border-[#BFD3F2] bg-white px-6 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
              Agent sign in
            </a>
            <a href="/dashboard" className="inline-flex items-center gap-1.5 self-center text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
              Go to your dashboard <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">What you get</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#1A1A2E] sm:text-4xl">Everything an agent needs, nothing they don&apos;t.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">{feature.icon}</span>
                <h3 className="mt-4 text-xl font-bold tracking-[-.02em] text-[#1A1A2E]">{feature.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it flows */}
      <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl proppd-panel p-6 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">How a lead reaches you</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#1A1A2E] sm:text-4xl">The portal works, so you can close.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {flow.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-[#BFDBFE] bg-white/70 p-5">
                <h3 className="text-lg font-bold tracking-[-.02em] text-[#1A1A2E]">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#6B7280]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-.03em] text-[#1A1A2E] sm:text-3xl">Ready to list with Proppd?</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#6B7280]">
              Access is invite-based while we onboard launch partners. Request access, or explore the workspace and the model behind Proppd.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/list-with-us#launch-application" className="inline-flex items-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
              <Users size={16} /> Apply to join
            </a>
            <a href="/business" className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-6 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
              <Building2 size={16} /> The Proppd model
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
