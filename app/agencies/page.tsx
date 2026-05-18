import { Building2, MapPin, Search, ShieldCheck, Users } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { agencies } from '@/lib/demo-data';
import { slugifyDirectoryName } from '@/lib/directory';

export default function AgenciesPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Agencies</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Modern agency profiles</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A browsable directory foundation for branches, teams, locations, verified enquiries, and active stock.
            </p>
            <div className="mt-8 grid gap-3 rounded-[2rem] bg-[#F5F7FA] p-3 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-bold text-slate-500">
                <Search size={18} className="text-[#3B49FF]" /> Search agency, city, or operating area
              </div>
              <a className="inline-flex justify-center rounded-full bg-[#050A30] px-6 py-4 text-sm font-black text-white" href="mailto:info@proppd.com?subject=Add my agency to Proppd">
                Add agency
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {agencies.map((agency) => (
              <a
                key={agency.name}
                href={`/agencies/${slugifyDirectoryName(agency.name)}`}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <div className="bg-gradient-to-br from-[#050A30] via-[#3B49FF] to-[#12D6C5] p-6 text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                    <Building2 size={30} />
                  </div>
                  <h2 className="mt-8 text-2xl font-black tracking-[-.04em]">{agency.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/75"><MapPin size={16} /> {agency.city}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                  <AgencyStat icon={<Users size={17} />} value={agency.agents} label="agents" />
                  <AgencyStat icon={<ShieldCheck size={17} />} value={agency.listings} label="portfolio listings" />
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

function AgencyStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F7FA] p-4">
      <div className="flex items-center gap-2 text-[#3B49FF]">{icon}<span className="text-2xl font-black text-[#050A30]">{value}</span></div>
      <div className="mt-1 text-xs font-black uppercase tracking-[.16em] text-slate-400">{label}</div>
    </div>
  );
}
