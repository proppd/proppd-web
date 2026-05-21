import { ArrowRight, BadgeCheck, Building2, MapPin, Users } from 'lucide-react';
import { agencies, agents } from '@/lib/demo-data';
import { slugifyDirectoryName } from '@/lib/directory';

const featuredAgents = agents.slice(0, 3);
const featuredAgencies = agencies.slice(0, 3);

export function FeaturedAgents() {
  return (
    <section className="bg-[#F5F7FA] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Network</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.06em] text-[#050A30] sm:text-5xl">Featured agents and agencies</h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              Proppd starts with the people behind the listings. Surface the strongest launch partners first so users can move from search to trust quickly.
            </p>
          </div>
          <a className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 font-black text-[#050A30] transition hover:border-[#3B49FF] hover:text-[#3B49FF]" href="/agents">
            Browse agents and agencies →
          </a>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[.18em] text-[#12D6C5]">Featured agents</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-.04em] text-[#050A30]">Verified people, not faceless listings.</h3>
              </div>
              <div className="rounded-2xl bg-[#eefcf9] p-3 text-[#0f766e]">
                <BadgeCheck size={20} />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {featuredAgents.map((agent) => (
                <a
                  key={agent.name}
                  href={`/agents/${slugifyDirectoryName(agent.name)}`}
                  className="group flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-[#F5F7FA] p-4 transition hover:-translate-y-0.5 hover:border-[#3B49FF] hover:bg-white"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#050A30] via-[#3B49FF] to-[#12D6C5] text-xl font-black text-white">
                    {agent.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-lg font-black tracking-[-.03em] text-[#050A30]">{agent.name}</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eefcf9] px-2.5 py-1 text-[11px] font-black uppercase tracking-[.16em] text-[#0f766e]">
                        <BadgeCheck size={12} /> Verified
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <Building2 size={15} /> {agent.agency}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <MapPin size={15} /> {agent.area}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-right shadow-sm transition group-hover:shadow-md">
                    <div className="text-2xl font-black tracking-[-.04em] text-[#050A30]">{agent.listings}</div>
                    <div className="text-[11px] font-black uppercase tracking-[.16em] text-slate-400">listings</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[#050A30] p-6 text-white shadow-2xl shadow-[#050A30]/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[.18em] text-[#12D6C5]">Featured agencies</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-.04em]">Launch partners with visible stock.</h3>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-[#12D6C5]">
                <Users size={20} />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {featuredAgencies.map((agency) => (
                <a
                  key={agency.name}
                  href={`/agencies/${slugifyDirectoryName(agency.name)}`}
                  className="group rounded-[1.5rem] border border-white/10 bg-white/[.06] p-4 transition hover:border-[#12D6C5]/40 hover:bg-white/[.1]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#12D6C5]">
                        <Building2 size={22} />
                      </div>
                      <h4 className="mt-4 text-lg font-black tracking-[-.03em] text-white">{agency.name}</h4>
                      <p className="mt-1 text-sm font-semibold text-white/70">{agency.city}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[.16em] text-[#12D6C5]">
                      <BadgeCheck size={12} /> Ready
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <AgencyMetric label="Agents" value={agency.agents} />
                    <AgencyMetric label="Listings" value={agency.listings} />
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#12D6C5]">Need a launch partner?</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
                Keep the network useful even when inventory is thin: route missing markets into onboarding instead of leaving a blank space.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#050A30] transition hover:bg-[#F5F7FA]" href="/agencies">
                  View agencies <ArrowRight size={15} />
                </a>
                <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10" href="/contact">
                  Join as a partner
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgencyMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-2xl font-black tracking-[-.04em] text-white">{value}</div>
      <div className="text-[11px] font-black uppercase tracking-[.16em] text-white/45">{label}</div>
    </div>
  );
}
