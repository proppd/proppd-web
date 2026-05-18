import { ArrowRight, BadgeCheck, Building2, Search, ShieldCheck, Sparkles } from 'lucide-react';

const featuredStats = [
  ['Verified enquiries', 'Lead quality built into the platform from day one.'],
  ['Agent-first tools', 'A portal foundation designed for future CRM and automation.'],
  ['South Africa focused', 'Built around local buyers, tenants, agents, sellers, and landlords.'],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070a10] text-white">
      <section className="relative isolate px-6 py-8 sm:px-10 lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(88,224,183,.22),transparent_32rem),radial-gradient(circle_at_80%_16%,rgba(96,165,250,.18),transparent_30rem)]" />
        <header className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[.04] px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3 font-black tracking-tight">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#58e0b7] text-[#03110d]">
              <Building2 size={19} />
            </div>
            <span className="text-xl">Proppd</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
            <a href="/properties">Search</a>
            <a href="/agents">Agents</a>
            <a href="/agencies">Agencies</a>
            <a href="/list-with-us">List with us</a>
          </nav>
          <a className="rounded-full bg-white px-4 py-2 text-sm font800 text-slate-950" href="mailto:info@proppd.com">
            Contact
          </a>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100">
              <Sparkles size={16} /> Real listings. Real leads. Fair property technology.
            </div>
            <h1 className="mt-8 max-w-4xl text-6xl font-black leading-[.9] tracking-[-.075em] sm:text-7xl lg:text-8xl">
              Find property without the noise.
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-slate-300">
              Proppd connects South Africans with real listings, verified enquiries, and modern property professionals.
            </p>

            <div className="mt-9 rounded-[2rem] border border-white/12 bg-white/[.07] p-3 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="grid gap-3 md:grid-cols-[auto_1fr_auto]">
                <div className="flex rounded-full bg-black/25 p-1 text-sm font-bold text-slate-300">
                  <button className="rounded-full bg-white px-5 py-3 text-slate-950">Buy</button>
                  <button className="rounded-full px-5 py-3">Rent</button>
                </div>
                <label className="flex items-center gap-3 rounded-full bg-black/25 px-5 py-3 text-slate-300">
                  <Search size={19} />
                  <span>Search by suburb, city, agency, or listing ID</span>
                </label>
                <a className="inline-flex items-center justify-center gap-2 rounded-full bg-[#58e0b7] px-6 py-3 font-black text-[#03110d]" href="/properties">
                  Search Properties <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/12 bg-white/[.07] p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="rounded-[2rem] bg-gradient-to-br from-emerald-300/25 via-sky-300/10 to-white/5 p-6">
              <div className="mb-24 inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-950">Launching MVP</div>
              <div className="grid gap-4">
                {featuredStats.map(([title, body]) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                    <div className="flex items-center gap-3 text-lg font-black">
                      <BadgeCheck className="text-[#58e0b7]" /> {title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.035] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {['No fake-lead culture', 'Premium portal UX', 'Future AgentOS ready'].map((title) => (
            <div key={title} className="rounded-[2rem] border border-white/10 bg-black/20 p-7">
              <ShieldCheck className="mb-5 text-[#58e0b7]" />
              <h2 className="text-2xl font-black tracking-tight">{title}</h2>
              <p className="mt-3 leading-7 text-slate-400">
                Built for trust, speed, and long-term real estate workflow automation without overbuilding phase one.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
