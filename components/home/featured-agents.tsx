import { ArrowRight, BadgeCheck, Building2, MapPin, Users } from 'lucide-react';
import { agencies, agents } from '@/lib/demo-data';
import { slugifyDirectoryName } from '@/lib/directory';

const featuredAgents = agents.slice(0, 3);
const featuredAgencies = agencies.slice(0, 3);

export function FeaturedAgents() {
  return (
    <section className="bg-[#f7f9fd] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <p className="proppd-kicker">Verified network</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-.055em] text-[#050A30] sm:text-4xl">Agents and agencies that make listings feel real.</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              Explore named professionals, their service areas, and the active stock connected to them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a className="inline-flex items-center justify-center rounded-full bg-[#3344f5] px-5 py-3 text-sm font-black !text-white shadow-lg shadow-[#3344f5]/20 transition hover:bg-[#050A30]" href="/agents">
              Browse agents
            </a>
            <a className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#050A30] transition hover:border-[#3344f5] hover:text-[#3344f5]" href="/agencies">
              Browse agencies
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="proppd-card rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm font-black text-[#3344f5]">Featured agents</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-.04em] text-[#050A30]">Local contacts with active stock.</h3>
              </div>
              <div className="hidden rounded-2xl bg-[#eefcf9] p-3 text-[#0f766e] sm:block">
                <BadgeCheck size={20} />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {featuredAgents.map((agent) => (
                <a
                  key={agent.name}
                  href={`/agents/${slugifyDirectoryName(agent.name)}`}
                  className="group grid gap-4 py-4 transition sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#050A30,#3344f5)] text-sm font-black text-white shadow-sm">
                    {agent.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-lg font-black tracking-[-.03em] text-[#050A30]">{agent.name}</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eefcf9] px-2.5 py-1 text-[11px] font-black text-[#0f766e]">
                        <BadgeCheck size={12} /> Verified
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1"><Building2 size={14} /> {agent.agency}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {agent.area}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F5F7FA] px-4 py-3 sm:block sm:text-right">
                    <div className="text-2xl font-black tracking-[-.04em] text-[#050A30]">{agent.listings}</div>
                    <div className="text-xs font-black text-slate-500">listings</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="proppd-card overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm font-black text-[#0f766e]">Featured agencies</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-.04em] text-[#050A30]">Launch partners with visible reach.</h3>
              </div>
              <div className="hidden rounded-2xl bg-[#F5F7FA] p-3 text-[#3344f5] sm:block">
                <Users size={20} />
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {featuredAgencies.map((agency) => (
                <a
                  key={agency.name}
                  href={`/agencies/${slugifyDirectoryName(agency.name)}`}
                  className="group rounded-[1.35rem] border border-slate-200 bg-white/70 p-4 transition hover:border-[#3344f5]/30 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-lg font-black tracking-[-.03em] text-[#050A30]">{agency.name}</h4>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{agency.city}</p>
                    </div>
                    <Building2 className="shrink-0 text-[#3344f5]" size={20} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-600">
                    <span className="rounded-full bg-[#F5F7FA] px-3 py-1.5">{agency.agents} agents</span>
                    <span className="rounded-full bg-[#F5F7FA] px-3 py-1.5">{agency.listings} listings</span>
                    <span className="rounded-full bg-[#eefcf9] px-3 py-1.5 text-[#0f766e]">Ready</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-[#3344f5]/10 bg-[#3344f5]/[.06] p-4">
              <p className="text-sm font-bold leading-6 text-slate-700">
                Missing a market? Tell us where you are searching and we will prioritise the right verified agency or branch.
              </p>
              <a className="proppd-link-arrow mt-3 inline-flex items-center gap-2 text-sm" href="/contact">
                Talk to Proppd <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
