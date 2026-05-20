export function AgentCta() {
  return (
    <section className="bg-[#050A30] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-white/10 bg-white/[.08] p-8 shadow-2xl shadow-[#050A30]/30 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
        <div>
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">For agents and agencies</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.06em] sm:text-5xl">Built for modern property professionals.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">Join the early rollout for a cleaner portal foundation, quality lead capture, and future Proppd AgentOS tools.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-left">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#12D6C5]">Start here</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Choose the route that fits your next step.</p>
          </div>
          <a className="rounded-full bg-white px-6 py-3 text-center font-black text-[#050A30]" href="/list-with-us">List With Proppd</a>
          <a className="rounded-full border border-white/20 px-6 py-3 text-center font-black text-white" href="/request-valuation">Request Valuation</a>
        </div>
      </div>
    </section>
  );
}
