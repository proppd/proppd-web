export function AgentCta() {
  return (
    <section className="proppd-panel px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-xl border border-white/10 bg-white/5 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">For agents and agencies</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold sm:text-4xl">
            Built for modern property professionals.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            Join the early rollout for a cleaner portal foundation, quality lead capture, and future Proppd AgentOS tools.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a className="rounded-lg bg-white px-6 py-3 text-center text-sm font-semibold text-[#1A1A2E] transition hover:bg-[#F7F8FA]" href="/list-with-us">
            List with us
          </a>
          <a className="rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10" href="/request-valuation">
            Request valuation
          </a>
        </div>
      </div>
    </section>
  );
}
