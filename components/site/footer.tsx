import type { ReactNode } from 'react';
import { BadgeCheck, Mail, Search } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-[#050A30] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div className="max-w-2xl">
            <a href="/" aria-label="Proppd home" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg font-black tracking-[-.04em] text-[#050A30]">P</span>
              <span className="text-3xl font-black tracking-[-.08em] text-white">Proppd</span>
            </a>
            <p className="mt-5 text-sm font-black text-[#12D6C5]">Real property. Real opportunities.</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              A cleaner South African property portal for verified listings, direct enquiries, and agent-led stock across trusted local markets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <FooterAction href="/properties" icon={<Search size={16} />} label="Browse properties" primary />
            <FooterAction href="/list-with-us" icon={<BadgeCheck size={16} />} label="List with us" />
            <FooterAction href="/contact" icon={<Mail size={16} />} label="Contact" />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr_.8fr_.8fr_.8fr]">
          <div>
            <p className="text-sm font-black text-white/50">Built for trust</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
              Verified enquiries, tidy mobile browsing, and commercial-grade portal flows for buyers, renters, agents, and agencies.
            </p>
            <a className="mt-5 inline-flex text-sm font-black text-[#12D6C5] transition hover:text-white" href="mailto:info@proppd.com">
              info@proppd.com
            </a>
          </div>
          <FooterGroup title="Browse" links={[["Properties", "/properties"], ["For sale", "/properties/for-sale"], ["To rent", "/properties/to-rent"], ["Home loans", "/home-loans"]]} />
          <FooterGroup title="Professionals" links={[["Agents", "/agents"], ["Agencies", "/agencies"], ["List with us", "/list-with-us"]]} />
          <FooterGroup title="Company" links={[["Business model", "/business"], ["Contact", "/contact"], ["Log in", "/login"]]} />
          <FooterGroup title="Trust" links={[["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"], ["Admin", "/admin"]]} />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Proppd. Real property. Real opportunities.</p>
          <p className="font-semibold">Verified listings, routed leads, and calm portal navigation.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterAction({ href, icon, label, primary = false }: { href: string; icon: ReactNode; label: string; primary?: boolean }) {
  return (
    <a
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${primary ? 'bg-[#12D6C5] text-[#050A30] hover:bg-white' : 'border border-white/15 text-white hover:border-[#12D6C5]/50 hover:bg-white/8'}`}
      href={href}
    >
      {icon} {label}
    </a>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="text-sm font-black text-white/50">{title}</h3>
      <div className="mt-4 grid gap-3 text-sm font-bold text-white/78">
        {links.map(([label, href]) => (
          <a key={href} className="transition hover:text-[#12D6C5]" href={href}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
