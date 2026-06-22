import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, Building2, FileText, Mail, MapPin, PhoneCall, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Proppd for property support, agency onboarding, valuation requests, or directory questions.',
  alternates: { canonical: '/contact' },
};

const contactRoutes = [
  {
    title: 'General support',
    description: 'Questions about the portal, listing pages, or how a route works right now.',
    href: 'mailto:info@proppd.com?subject=Proppd support request',
    cta: 'Email support',
    icon: Mail,
  },
  {
    title: 'List with Proppd',
    description: 'For agencies that want verified profiles, cleaner enquiry handoff, and a stronger public route.',
    href: '/list-with-us',
    cta: 'Apply to list',
    icon: Building2,
  },
  {
    title: 'Request a valuation',
    description: 'For sellers and landlords who want a sensible first step before they launch.',
    href: '/request-valuation',
    cta: 'Start valuation flow',
    icon: FileText,
  },
  {
    title: 'Browse the marketplace',
    description: 'For buyers and tenants who want to jump straight into active inventory.',
    href: '/properties',
    cta: 'Search properties',
    icon: Search,
  },
];

const contactReasons = [
  ['Property ID or slug', 'If you already have a listing in mind, include the exact page so Proppd can route the request faster.'],
  ['Area and intent', 'Tell us whether you are buying, renting, selling, or checking agency fit.'],
  ['Best email / phone', 'Use a reachable contact so the handoff can move quickly once it is reviewed.'],
];

const responseGuide = [
  ['Support', 'Use info@proppd.com for route questions, page fixes, or general help.'],
  ['Launch access', 'Agencies can ask about onboarding, profiles, and listing exposure.'],
  ['Live page link', 'Paste the exact property or profile URL so the team can jump straight to it.'],
];

export default function ContactPage() {
  return (
    <main className="proppd-page">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl bg-[#1A1A2E] text-white shadow-sm">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-12">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Contact Proppd</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-[-.07em] sm:text-6xl">Talk to the right part of the portal.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Use this page when you want property support, agency onboarding, valuation routing, or a quicker path to the right route on Proppd.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="rounded-full bg-white px-6 py-3 text-sm font-bold !text-[#1A1A2E]" href="mailto:info@proppd.com?subject=Contact%20Proppd">
                    Email info@proppd.com
                  </a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white" href="/properties">
                    Browse properties
                  </a>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">Fastest route</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/72">Send the page link, suburb, and what you need fixed or routed.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">Agency onboarding</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/72">Agencies can ask about onboarding, profiles, and listing exposure.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2563EB]">Verified enquiry</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/72">Buyer and seller requests stay tied to a clear next step.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <ShieldCheck className="text-[#2563EB]" size={34} />
                <h2 className="mt-5 text-3xl font-bold tracking-[-.05em]">Route first, then reply.</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                  Contact requests are designed to move quickly into the correct public route or agency workflow rather than disappear into a generic inbox.
                </p>
                <div className="mt-6 rounded-2xl bg-white p-4 text-[#1A1A2E]">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Primary inbox</p>
                  <p className="mt-2 font-bold">info@proppd.com</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">Best for support, agency onboarding, and property route questions.</p>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {contactRoutes.map(({ title, description, href, cta, icon: Icon }) => (
              <a key={title} href={href} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
                <div className="inline-flex rounded-2xl bg-[#EFF6FF] p-3 text-[#2563EB]"><Icon size={22} /></div>
                <h2 className="mt-4 text-2xl font-bold tracking-[-.04em]">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#6B7280]">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF]">
                  {cta} <ArrowRight size={15} />
                </span>
              </a>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">What to include</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">A good contact note saves everyone time.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {contactReasons.map(([title, text]) => (
                  <article key={title} className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                    <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{title}</p>
                    <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
                  </article>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-[#EFF6FF] bg-[#F8FBFF] p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">Quick handoff hint</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#2563EB]">
                  If you are enquiring about a specific property, include the address or slug and we can route it to the listing or directory profile without extra back-and-forth.
                </p>
              </div>
              <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#1A1A2E] p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">Example note</p>
                <p className="mt-2 text-sm font-bold leading-6 text-white/78">
                  “I’m enquiring about 12 Example Road, Sandton. We are planning to launch within 30 days and need the right route for a seller appraisal.”
                </p>
              </div>
            </div>

            <aside className="rounded-xl bg-[#1A1A2E] p-6 text-white shadow-sm sm:p-8">
              <UsersRound className="text-[#2563EB]" size={30} />
              <h2 className="mt-4 text-2xl font-bold tracking-[-.04em]">Response guide</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-white/68">
                Pick the right route first, then send a short note so the team can respond without extra back-and-forth.
              </p>
              <div className="mt-6 space-y-3">
                {responseGuide.map(([label, text]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">{label}</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/78">{text}</p>
                  </div>
                ))}
              </div>
              <a className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-[#1A1A2E]" href="mailto:info@proppd.com?subject=Contact%20Proppd">
                <Mail size={18} /> Email info@proppd.com
              </a>
              <p className="mt-4 flex items-center gap-2 text-sm font-bold leading-6 text-white/60">
                <PhoneCall size={16} className="text-[#2563EB]" /> Response via email until a richer helpdesk workflow lands.
              </p>
            </aside>
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">What happens after you send it</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">A routed request reads better than a blank inbox.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">1. Submitted</p>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">Your note and route choice are captured together so the request has context from the start.</p>
                </div>
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">2. Reviewed</p>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">The team checks the page link, suburb, and intent before routing it to the best surface.</p>
                </div>
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">3. Routed</p>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">The right route gets the request, and the user gets a clearer next step instead of a dead end.</p>
                </div>
              </div>
              <div className="mt-6 rounded-lg border border-[#EFF6FF] bg-[#F8FBFF] p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">Sample routed note</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#2563EB]">
                  “General support for /property/sandton-modern-house-123: the listing needs a quick route check and I want the enquiry sent to the right contact without extra steps.”
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Need a faster route?</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">Go directly to the most relevant page.</h2>
              <div className="mt-6 grid gap-4">
                <RoutePill title="Properties" href="/properties" icon={Search} text="Browse the live marketplace and use search-first filters." />
                <RoutePill title="List with us" href="/list-with-us" icon={BadgeCheck} text="Apply to list or request agency onboarding." />
                <RoutePill title="Valuation" href="/request-valuation" icon={MapPin} text="Send a seller or landlord request through the right flow." />
              </div>
              <a className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-[#E5E7EB] px-5 py-3 font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]" href="mailto:info@proppd.com?subject=Proppd%20contact%20request">
                Email Proppd →
              </a>
              <p className="mt-3 text-sm font-bold leading-6 text-[#9CA3AF]">
                Still unsure? Email info@proppd.com with your property link and we’ll route it.
              </p>
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function RoutePill({ title, href, icon: Icon, text }: { title: string; href: string; icon: typeof Search; text: string }) {
  return (
    <a href={href} className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-5 transition hover:border-[#4A3AFF] hover:bg-white">
      <div className="inline-flex rounded-2xl bg-white p-3 text-[#4A3AFF] shadow-sm"><Icon size={18} /></div>
      <h3 className="mt-4 text-lg font-bold tracking-[-.03em] text-[#1A1A2E]">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
    </a>
  );
}
