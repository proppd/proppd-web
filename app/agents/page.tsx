import { BadgeCheck, Building2, MapPin, Search } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { agents } from '@/lib/demo-data';
import { slugifyDirectoryName } from '@/lib/directory';

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Agents</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Verified property professionals</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Browse early Proppd agent profiles by area, agency, verification status, and active listing count.
            </p>
            <div className="mt-8 grid gap-3 rounded-[2rem] bg-[#F5F7FA] p-3 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-bold text-slate-500">
                <Search size={18} className="text-[#3B49FF]" /> Search by agent, agency, or service area
              </div>
              <a className="inline-flex justify-center rounded-full bg-[#050A30] px-6 py-4 text-sm font-black text-white" href="mailto:info@proppd.com?subject=Join Proppd agents">
                Join directory
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {agents.map((agent) => (
              <a
                key={agent.name}
                href={`/agents/${slugifyDirectoryName(agent.name)}`}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3B49FF] to-[#12D6C5] text-2xl font-black text-white">
                  {agent.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#12D6C5]">
                  <BadgeCheck size={16} /> Verified agent
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-[-.04em]">{agent.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500"><Building2 size={16} /> {agent.agency}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500"><MapPin size={16} /> {agent.area}</p>
                <div className="mt-6 rounded-3xl bg-[#F5F7FA] p-4">
                  <div className="text-3xl font-black text-[#050A30]">{agent.listings}</div>
                  <div className="text-xs font-black uppercase tracking-[.16em] text-slate-400">portfolio listings</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
