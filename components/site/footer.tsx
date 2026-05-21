import { ArrowRight, BadgeCheck, Mail, Search } from 'lucide-react';
import { ProppdLogo } from './logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#050A30] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_15%_20%,rgba(18,214,197,.16),transparent_16rem),radial-gradient(circle_at_85%_10%,rgba(59,73,255,.2),transparent_18rem),linear-gradient(135deg,#050A30_0%,#0B1447_55%,#081033_100%)] p-6 shadow-2xl shadow-[#050A30]/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <ProppdLogo />
              <p className="mt-5 text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Real property. Real opportunities.</p>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/72">
                Modern South African property technology for verified listings, clean enquiry routing, and launch-ready agent and agency growth.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-black">
                <a className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[#050A30] transition hover:bg-[#F5F7FA]" href="/properties">
                  <Search size={16} /> Browse properties
                </a>
                <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-white transition hover:bg-white/10" href="/list-with-us">
                  <BadgeCheck size={16} /> List with us
                </a>
                <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-white transition hover:bg-white/10" href="/contact">
                  <Mail size={16} /> Contact Proppd
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[31rem] lg:grid-cols-1 xl:w-[38rem] xl:grid-cols-3">
              {[
                ['Browse', '/properties', 'Search the market'],
                ['Professionals', '/agents', 'Find launch partners'],
                ['Support', '/contact', 'Route the right inbox'],
              ].map(([label, href, text]) => (
                <a
                  key={label}
                  href={href}
                  className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-[#12D6C5]/40 hover:bg-white/[.08]"
                >
                  <p className="text-xs font-black uppercase tracking-[.18em] text-white/45">{label}</p>
                  <p className="mt-2 text-lg font-black tracking-[-.03em] text-white">{text}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#12D6C5]">
                    Open <ArrowRight size={15} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr_.8fr_.8fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-white/45">Built for trust</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
              Verified enquiries, tidy mobile browsing, and commercial-grade portal flows instead of generic admin-style layout.
            </p>
            <a className="mt-5 inline-flex text-sm font-black text-[#12D6C5]" href="mailto:info@proppd.com">
              info@proppd.com
            </a>
          </div>
          <FooterGroup title="Browse" links={[["Properties", "/properties"], ["For sale", "/properties/for-sale"], ["To rent", "/properties/to-rent"], ["Home loans", "/home-loans"]]} />
          <FooterGroup title="Professionals" links={[["Agents", "/agents"], ["Agencies", "/agencies"], ["List with us", "/list-with-us"]]} />
          <FooterGroup title="Company" links={[["Business model", "/business"], ["Contact", "/contact"], ["Log in", "/login"]]} />
          <FooterGroup title="Trust" links={[["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"], ["Admin", "/admin"]]} />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Proppd. Real property. Real opportunities.</p>
          <p className="font-semibold">Verified listings, routed leads, and calm portal navigation.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[.18em] text-white/45">{title}</h3>
      <div className="mt-4 grid gap-3 text-sm font-bold text-white/80">
        {links.map(([label, href]) => (
          <a key={href} className="transition hover:text-[#12D6C5]" href={href}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
