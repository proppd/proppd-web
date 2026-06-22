import { ArrowRight, BadgeCheck, Building2, MapPin } from 'lucide-react';
import { agents } from '@/lib/demo-data';
import { slugifyDirectoryName } from '@/lib/directory';

const featuredAgents = agents.slice(0, 6);

export function FeaturedAgents() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Find an agent</p>
            <h2 className="mt-2 text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
              Connect with a local agent
            </h2>
            <p className="mt-2 text-[#6B7280]">
              Verified agents who know your area and can help you buy or rent.
            </p>
          </div>
          <a
            href="/agents"
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
          >
            Browse all agents <ArrowRight size={15} />
          </a>
        </div>

        {/* Agent grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredAgents.map((agent) => (
            <a
              key={agent.name}
              href={`/agents/${slugifyDirectoryName(agent.name)}`}
              className="group rounded-xl border border-[#E5E7EB] bg-white p-5 transition hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4A3AFF] text-sm font-bold text-white">
                  {agent.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold text-[#1A1A2E]">{agent.name}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                      <BadgeCheck size={10} /> Verified
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Building2 size={13} className="text-[#9CA3AF]" /> {agent.agency}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#9CA3AF]" /> {agent.area}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-3">
                <span className="text-sm font-bold text-[#1A1A2E]">{agent.listings} listings</span>
                <span className="text-xs font-semibold text-[#4A3AFF] transition group-hover:text-[#3A2AE0]">
                  View profile <ArrowRight size={12} className="inline" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
