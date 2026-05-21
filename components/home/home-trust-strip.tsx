import { ArrowRight, BadgeCheck, Building2, MapPinned, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { agencies, agents, listings } from '@/lib/demo-data';

const metroCount = new Set(listings.map((listing) => listing.city)).size;
const featuredCount = listings.filter((listing) => listing.featured).length;

export function HomeTrustStrip() {
  return (
    <section className="bg-white px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-4 shadow-sm lg:grid-cols-[1.3fr_.7fr] lg:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#3B49FF]">Why Proppd feels trustworthy</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.05em] text-[#050A30] sm:text-3xl">A quieter portal with enough proof to make the next click feel safe.</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <StatCard icon={<BadgeCheck size={18} />} label="Featured listings live" value={`${featuredCount}`} detail="Verified for home search" />
              <StatCard icon={<MapPinned size={18} />} label="Launch metros covered" value={`${metroCount}`} detail="Johannesburg, Cape Town, Durban" />
              <StatCard icon={<Building2 size={18} />} label="Verified partner agencies" value={`${agencies.length}`} detail="Agency-led stock on portal" />
            </div>
          </div>

          <aside className="rounded-[1.75rem] bg-[#050A30] p-6 text-white shadow-xl shadow-[#050A30]/10">
            <div className="flex items-center gap-3 text-[#12D6C5]">
              <Sparkles size={18} />
              <p className="text-xs font-black uppercase tracking-[.24em]">Next step</p>
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-[-.05em]">List with a portal that handles trust before it handles traffic.</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Proppd is set up for clear search, verified stock, and direct enquiry routing — the pieces buyers expect before they commit.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-black !text-[#050A30] transition hover:bg-[#12D6C5]" href="/list-with-us">
                List with us <ArrowRight size={16} />
              </a>
              <a className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10" href="/properties">
                Browse properties <ArrowRight size={16} />
              </a>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-white/45">
              {agents.length} agents · {agencies.length} agencies · direct lead handoff
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white bg-white p-4 shadow-sm">
      <div className="inline-flex rounded-2xl bg-[#eefcf9] p-2 text-[#0f766e]">{icon}</div>
      <p className="mt-4 text-2xl font-black tracking-[-.05em] text-[#050A30]">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{detail}</p>
    </div>
  );
}
