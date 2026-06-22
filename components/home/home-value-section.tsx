import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';

export function HomeValueSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {/* Home value estimator */}
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Home values</p>
                <h2 className="text-xl font-bold text-[#1A1A2E]">What's your home worth?</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              Get an instant indicative market range from comparable Proppd listings, then request a local agent appraisal when you are ready.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter suburb or city"
                className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10 placeholder:text-[#9CA3AF]"
              />
              <a
                href="/home-values#instant-estimate"
                className="shrink-0 rounded-lg bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
              >
                Get estimate
              </a>
            </div>
            <p className="mt-3 text-xs text-[#9CA3AF]">
              Free indicative estimate. Formal pricing still belongs with a local property professional.
            </p>
          </div>

          {/* Mortgage rates */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Calculator size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Mortgage rates</p>
                <h2 className="text-xl font-bold text-[#1A1A2E]">Current bond rates</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <RateRow term="20-year fixed" rate="11.75%" change="+0.25%" />
              <RateRow term="15-year fixed" rate="11.25%" change="+0.15%" />
              <RateRow term="Variable rate" rate="10.95%" change="-0.10%" />
            </div>
            <a
              href="/home-loans"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
            >
              Calculate affordability <ArrowRight size={14} />
            </a>
            <p className="mt-3 text-xs text-[#9CA3AF]">
              Indicative rates. Actual rates depend on lender and credit profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RateRow({ term, rate, change }: { term: string; rate: string; change: string }) {
  const isDown = change.startsWith('-');
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3">
      <span className="text-sm font-bold text-[#1A1A2E]">{term}</span>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-[#1A1A2E]">{rate}</span>
        <span className={`text-xs font-bold ${isDown ? 'text-[#2563EB]' : 'text-red-500'}`}>{change}</span>
      </div>
    </div>
  );
}
