import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { buildLegalContactMailto, type LegalPage } from '@/lib/legal/policies';

export function LegalPageTemplate({ page }: { page: LegalPage }) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-xl bg-[#1A1A2E] text-white shadow-sm">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_340px] lg:p-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">{page.label}</p>
              <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-[-.07em] sm:text-6xl">{page.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">{page.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="rounded-full bg-white px-6 py-3 text-sm font-bold !text-[#1A1A2E]" href={buildLegalContactMailto(page)}>Ask a question</a>
                <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white" href="/list-with-us">List with Proppd</a>
              </div>
            </div>
            <aside className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <ShieldCheck className="text-[#2563EB]" size={34} />
              <h2 className="mt-5 text-3xl font-bold tracking-[-.05em]">Trust note</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                This page is written as a practical launch-stage policy foundation. It should be reviewed by a qualified South African legal professional before major production scale.
              </p>
              <div className="mt-6 rounded-2xl bg-white p-4 text-[#1A1A2E]">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">Last updated</p>
                <p className="mt-2 font-bold">{page.lastUpdated}</p>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {page.sections.map((section, index) => (
            <article key={section.title} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-[#EFF6FF] p-3 text-[#2563EB]">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4A3AFF]">0{index + 1}</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">{section.title}</h2>
                  <p className="mt-3 text-sm font-bold leading-7 text-[#6B7280]">{section.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-[#EFF6FF] p-6 text-[#2563EB] shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[.18em]">Need a correction?</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-3xl text-sm font-bold leading-6">
              If any policy wording is unclear or you need access, correction, deletion, or consent support, contact Proppd with the page context included.
            </p>
            <a className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold !text-white" href={buildLegalContactMailto(page)}>
              Contact info@proppd.com <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
