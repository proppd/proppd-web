import { BadgeCheck, Bot, ShieldCheck, Workflow } from 'lucide-react';

const values = [
  ['Verified lead culture', 'Lead capture is designed around cleaner buyer/tenant intent, duplicate checks, and agent feedback loops.', ShieldCheck],
  ['Modern portal UX', 'Fast search-first browsing, clean listing pages, mobile-first enquiry paths, and SEO-ready property routes.', BadgeCheck],
  ['AgentOS foundation', 'The MVP stays simple while preparing the data model for CRM, automations, AI listing tools, and WhatsApp workflows.', Bot],
  ['Fair property infrastructure', 'Built to challenge expensive legacy portals with transparent, professional, agent-friendly technology.', Workflow],
];

export function ValueProps() {
  return (
    <section className="bg-[#F5F7FA] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Why Proppd</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-.06em] text-[#050A30] sm:text-5xl">Property technology, rebuilt.</h2>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {values.map(([title, body, Icon]) => (
            <div key={title as string} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#050A30] text-[#12D6C5]"><Icon size={22} /></div>
              <h3 className="mt-6 text-2xl font-black tracking-[-.04em] text-[#050A30]">{title as string}</h3>
              <p className="mt-3 leading-7 text-slate-600">{body as string}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
