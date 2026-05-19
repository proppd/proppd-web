import type React from 'react';
import type { Metadata } from 'next';
import { Bot, Building2, CheckCircle2, Handshake, MessageCircle, Search, ShieldCheck, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export const metadata: Metadata = {
  title: 'Business model',
  alternates: {
    canonical: '/business',
  },
};

const problems = [
  'Expensive listing platforms that make visibility feel pay-to-play.',
  'Fake, duplicated, spam, and low-quality enquiries that waste agent time.',
  'Outdated property CRMs that are not mobile-first or automation-ready.',
  'Fragmented workflows across listings, leads, documents, reporting, and communication.',
  'Poor consumer experience caused by stale listings, slow responses, and low transparency.',
];

const phases = [
  {
    title: 'Phase 1',
    label: 'Property Portal',
    text: 'A high-quality marketplace for buying, renting, browsing agents, connecting with agencies, and submitting verified enquiries.',
    points: ['Listings and advanced search', 'Agent and agency profiles', 'Verified enquiries', 'Mobile-first UX'],
  },
  {
    title: 'Phase 2',
    label: 'AgentOS',
    text: 'A modern operating system for estate agents and agencies, built around lead tracking, CRM, automation, reporting, and WhatsApp workflows.',
    points: ['CRM and lead tracking', 'Automated follow-ups', 'Seller reports', 'Performance analytics'],
  },
  {
    title: 'Phase 3',
    label: 'AI Infrastructure',
    text: 'An AI-native automation layer for property matching, lead qualification, marketing generation, valuation support, and workflow optimisation.',
    points: ['AI lead qualification', 'AI property matching', 'AI marketing tools', 'Workflow automation'],
  },
];

const advantages: Array<[string, string, LucideIcon]> = [
  ['Verified leads', 'Reduce fake, duplicate, spam, and low-intent enquiries before they waste agent time.', ShieldCheck],
  ['Fair pricing', 'Create sustainable pricing without exploitative subscription pressure.', Handshake],
  ['AI-native architecture', 'Design the platform from day one for smart workflows, scoring, and matching.', Bot],
  ['WhatsApp-first communication', 'Meet South African consumers and agents where they already communicate.', MessageCircle],
  ['Modern UX', 'Keep the product fast, simple, mobile-first, clean, and intuitive.', Sparkles],
];

const revenue = [
  ['Featured listings', 'Promoted listings, homepage exposure, and premium search positioning.'],
  ['Agency packages', 'Subscription plans for listing capacity, branding, analytics, and team accounts.'],
  ['AgentOS subscription', 'CRM, AI tools, automation, reporting, and communication workflows.'],
  ['Lead verification services', 'Premium lead protection, quality scoring, and duplicate/spam filtering.'],
  ['AI subscriptions', 'Assistant tools, marketing generation, workflow optimisation, and automation.'],
  ['Marketplace partnerships', 'Referral revenue from bond originators, attorneys, insurers, moving companies, and utilities.'],
];

export default function BusinessPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="overflow-hidden bg-[#050A30] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[.24em] text-[#12D6C5]">Business concept</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.075em] sm:text-7xl">
              The operating system for African real estate.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Proppd starts as a modern South African property portal for real listings and verified enquiries, then evolves into a complete AI-powered workflow platform for agents and agencies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-white px-6 py-3 text-sm font-black text-[#050A30]" href="/properties"><span className="text-[#050A30]">Browse marketplace</span></a>
              <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white" href="/list-with-us"><span className="text-white">Partner with Proppd</span></a>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/12 bg-white/8 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="rounded-[2rem] bg-white p-6 text-[#050A30]">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#3B49FF]">Mission</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Build the fairest and most intelligent property platform in South Africa.</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Metric value="SA" label="First market" />
              <Metric value="AI" label="Native tools" />
              <Metric value="Trust" label="Verified leads" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">The problem</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">Traditional portals are expensive, noisy, and disconnected.</h2>
            <p className="mt-5 leading-8 text-slate-600">
              Agents pay to compete for visibility while chasing poor-quality leads. Consumers deal with stale listings, slow responses, and weak transparency.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {problems.map((problem) => (
              <div key={problem} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <CheckCircle2 className="text-[#12D6C5]" />
                <p className="mt-4 text-sm font-bold leading-6 text-slate-700">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.75rem] bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Product ecosystem</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">From marketplace to agent operating system.</h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {phases.map((phase) => (
              <article key={phase.title} className="rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-6">
                <p className="text-xs font-black uppercase tracking-[.2em] text-[#12D6C5]">{phase.title}</p>
                <h3 className="mt-3 text-2xl font-black tracking-[-.04em]">{phase.label}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">{phase.text}</p>
                <ul className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
                  {phase.points.map((point) => <li key={point}>• {point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-5">
          {advantages.map(([title, text, Icon]) => (
            <article key={title as string} className="rounded-[2rem] bg-[#050A30] p-5 text-white">
              <Icon className="text-[#12D6C5]" />
              <h3 className="mt-4 text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/68">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2.5rem] bg-white p-7 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Target market</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Built for agents and consumers first.</h2>
            <div className="mt-6 grid gap-4">
              <Audience icon={<Users />} title="Agents and agencies" text="Better exposure, better leads, modern tools, and fairer pricing." />
              <Audience icon={<Search />} title="Property seekers" text="Trustworthy listings, easy search, verified agents, and faster communication." />
              <Audience icon={<Building2 />} title="Future partners" text="Developers, landlords, brokers, mortgage originators, attorneys, insurers, and investors." />
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-7 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Revenue model</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Multiple revenue lines without portal exploitation.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {revenue.map(([title, text]) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-[#F5F7FA] p-4">
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.75rem] bg-gradient-to-br from-[#050A30] via-[#1b2cff] to-[#12D6C5] p-8 text-white shadow-2xl shadow-slate-900/10 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[.2em] text-white/65">Long-term opportunity</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">Not another listing portal. The infrastructure layer for modern real estate.</h2>
            <p className="mt-5 text-lg leading-8 text-white/74">
              Proppd combines listings, leads, communication, transactions, automation, AI infrastructure, agent productivity, and property intelligence into one modern ecosystem.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-full bg-white px-6 py-3 text-sm font-black text-[#050A30]" href="/agents"><span className="text-[#050A30]">Explore agents</span></a>
            <a className="rounded-full border border-white/25 px-6 py-3 text-sm font-black text-white" href="mailto:info@proppd.com"><span className="text-white">Contact Proppd</span></a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/10 p-4 text-center">
      <div className="text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs font-bold text-white/62">{label}</div>
    </div>
  );
}

function Audience({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-slate-200 bg-[#F5F7FA] p-4">
      <div className="text-[#3B49FF]">{icon}</div>
      <div>
        <h3 className="font-black">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
