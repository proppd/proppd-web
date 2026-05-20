import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, Building2, FileText, Mail, MapPin, PhoneCall, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Proppd for property support, agency onboarding, valuation requests, or launch partner questions.',
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
    description: 'For agencies that want launch access, verified profiles, and cleaner enquiry handoff.',
    href: '/list-with-us',
    cta: 'Apply for launch access',
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
  ['Area and intent', 'Tell us whether you are buying, renting, selling, or checking a launch partner fit.'],
  ['Best email / phone', 'Use a reachable contact so the handoff can move quickly once it is reviewed.'],
];

const quickLinks = [
  ['Agents', '/agents'],
  ['Agencies', '/agencies'],
  ['Home loans', '/home-loans'],
  ['Business model', '/business'],
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.5rem] bg-[#050A30] text-white shadow-sm">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-12">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Contact Proppd</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Talk to the right part of the portal.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Use this page when you want property support, launch access, valuation routing, or a quicker path to the right route on Proppd.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="rounded-full bg-white px-6 py-3 text-sm font-black !text-[#050A30]" href="mailto:info@proppd.com?subject=Contact%20Proppd">
                    Email info@proppd.com
                  </a>
                  <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white" href="/properties">
                    Browse properties
                  </a>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Fastest route</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/72">Send the page link, suburb, and what you need fixed or routed.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Launch partners</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/72">Agencies can ask about onboarding, profiles, and listing exposure.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">Verified enquiry</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/72">Buyer and seller requests stay tied to a clear next step.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <ShieldCheck className="text-[#12D6C5]" size={34} />
                <h2 className="mt-5 text-3xl font-black tracking-[-.05em]">Route first, then reply.</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                  Contact requests are designed to move quickly into the correct public route or launch partner workflow rather than disappear into a generic inbox.
                </p>
                <div className="mt-6 rounded-2xl bg-white p-4 text-[#050A30]">
                  <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Primary inbox</p>
                  <p className="mt-2 font-black">info@proppd.com</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-600">Best for support, launch access, and property route questions.</p>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {contactRoutes.map(({ title, description, href, cta, icon: Icon }) => (
              <a key={title} href={href} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
                <div className="inline-flex rounded-2xl bg-[#eefcf9] p-3 text-[#0f766e]"><Icon size={22} /></div>
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#3B49FF]">
                  {cta} <ArrowRight size={15} />
                </span>
              </a>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">What to include</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">A good contact note saves everyone time.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {contactReasons.map(([title, text]) => (
                  <article key={title} className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-5">
                    <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-[#3B49FF]">{title}</p>
                    <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{text}</p>
                  </article>
                ))}
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-[#eefcf9] bg-[#f8fffd] p-5">
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#0f766e]">Quick handoff hint</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#0f766e]">
                  If you are enquiring about a specific property, include the address or slug and we can route it to the listing or directory profile without extra back-and-forth.
                </p>
              </div>
            </div>

            <aside className="rounded-[2.5rem] bg-[#050A30] p-6 text-white shadow-sm sm:p-8">
              <UsersRound className="text-[#12D6C5]" size={30} />
              <h2 className="mt-4 text-2xl font-black tracking-[-.04em]">Quick routes</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-white/68">
                Jump straight to the page that matches your request instead of waiting in a general inbox.
              </p>
              <div className="mt-6 grid gap-3">
                {quickLinks.map(([label, href]) => (
                  <a key={label} href={href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10">
                    {label}
                  </a>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-white p-4 text-[#050A30]">
                <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Direct support</p>
                <p className="mt-2 text-sm font-black">info@proppd.com</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600">
                  <PhoneCall size={16} className="text-[#3B49FF]" />
                  Response via email until a richer helpdesk workflow lands.
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-8 rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Need a faster route?</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">Go directly to the most relevant page.</h2>
              </div>
              <a className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="mailto:info@proppd.com?subject=Proppd%20contact%20request">
                Email Proppd →
              </a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <RoutePill title="Properties" href="/properties" icon={Search} text="Browse the live marketplace and use search-first filters." />
              <RoutePill title="List with us" href="/list-with-us" icon={BadgeCheck} text="Apply for launch access or agency onboarding." />
              <RoutePill title="Valuation" href="/request-valuation" icon={MapPin} text="Send a seller or landlord request through the right flow." />
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
    <a href={href} className="rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-5 transition hover:border-[#3B49FF] hover:bg-white">
      <div className="inline-flex rounded-2xl bg-white p-3 text-[#3B49FF] shadow-sm"><Icon size={18} /></div>
      <h3 className="mt-4 text-lg font-black tracking-[-.03em] text-[#050A30]">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{text}</p>
    </a>
  );
}
