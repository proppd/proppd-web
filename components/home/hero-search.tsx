import { ArrowRight, Search, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

export function HeroSearch() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F5F7FA] px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_5%,rgba(18,214,197,.22),transparent_28rem),radial-gradient(circle_at_85%_0%,rgba(59,73,255,.18),transparent_30rem)]" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.03fr_.97fr] lg:items-center">
        <div className="max-w-[22rem] sm:max-w-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#12D6C5]/30 bg-white px-4 py-2 text-sm font-black text-[#050A30] shadow-sm">
            <Sparkles size={16} className="text-[#3B49FF]" /> Real Property. Real Opportunities.
          </div>
          <h1 className="mt-7 max-w-4xl text-[2.35rem] font-black leading-[.96] tracking-[-.045em] text-[#050A30] sm:text-7xl sm:tracking-[-.075em] lg:text-8xl">
            Find property without the noise.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
            Proppd connects South Africans with real listings, verified enquiries, and modern property professionals — no fake-lead culture, no portal extortion.
          </p>
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/70">
            <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto]">
              <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-black text-slate-600">
                <button className="rounded-full bg-[#050A30] px-5 py-3 text-white">Buy</button>
                <button className="rounded-full px-5 py-3">Rent</button>
              </div>
              <label className="flex items-center gap-3 rounded-full border border-slate-100 bg-[#F5F7FA] px-5 py-3 text-sm font-semibold text-slate-500 sm:text-base">
                <Search size={19} className="text-[#3B49FF]" /> Search suburb, city, or listing ID
              </label>
              <a className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3B49FF] px-6 py-3 font-black text-white shadow-lg shadow-[#3B49FF]/20" href="/properties">
                Search <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
            {['Verified enquiries', 'POPIA-ready lead capture', 'Agent-first tools'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><ShieldCheck size={16} className="text-[#12D6C5]" /> {item}</span>
            ))}
          </div>
        </div>
        <div className="rounded-[2.5rem] border border-white bg-white/80 p-5 shadow-2xl shadow-slate-300/50 backdrop-blur">
          <div className="rounded-[2rem] bg-[#050A30] p-6 text-white">
            <div className="rounded-[1.5rem] bg-white p-8">
              <Image src="/proppd-logo-light.png" alt="Proppd logo" width={720} height={405} className="mx-auto h-auto w-full" priority />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['0', 'fake-lead tolerance'],
                ['SA', 'market focused'],
                ['AI', 'AgentOS-ready'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/[.08] p-4">
                  <div className="text-2xl font-black text-[#12D6C5]">{value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
