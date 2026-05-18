import { ProppdLogo } from './logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr_.8fr_.8fr]">
        <div>
          <ProppdLogo />
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
            Modern South African property technology for real listings, verified enquiries, and agent-friendly growth.
          </p>
          <a className="mt-5 inline-flex text-sm font-black text-[#3B49FF]" href="mailto:info@proppd.com">info@proppd.com</a>
        </div>
        <FooterGroup title="Browse" links={[['Properties','/properties'], ['For sale','/properties/for-sale'], ['To rent','/properties/to-rent']]} />
        <FooterGroup title="Professionals" links={[["Agents","/agents"], ["Agencies","/agencies"], ["List with us","/list-with-us"]]} />
        <FooterGroup title="Company" links={[["Business model","/business"], ["Contact","mailto:info@proppd.com"], ["Log in","/login"]]} />
        <FooterGroup title="Trust" links={[["Privacy","/privacy"], ["Terms","/terms"], ["Cookies","/cookies"]]} />
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[.18em] text-slate-400">{title}</h3>
      <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
        {links.map(([label, href]) => <a key={href} className="hover:text-[#3B49FF]" href={href}>{label}</a>)}
      </div>
    </div>
  );
}
