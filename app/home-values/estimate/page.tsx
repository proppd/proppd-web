import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowLeft, BarChart3, CheckCircle2, Home, Mail, ShieldCheck, TrendingUp } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalListings } from '@/lib/proppd/backend';
import { estimateInstantValuation, formatValuationAmount, type InstantValuationInput, type InstantValuationResult, type ValuationComparable } from '@/lib/valuation/instant';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Home value estimate result',
  description: 'Review your Proppd instant property estimate range, comparable homes, confidence level, and local agent handoff.',
  alternates: { canonical: '/home-values/estimate' },
};

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const input = parseValuationSearchParams(params);
  const portalListings = await loadPortalListings();
  const estimate = input ? estimateInstantValuation(input, portalListings.items) : null;

  return (
    <main className="proppd-page">
      <SiteHeader />
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <a href="/home-values#instant-estimate" className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-4 py-2 text-sm font-bold text-[#2563EB] shadow-sm">
            <ArrowLeft size={16} /> Adjust estimate
          </a>

          {estimate ? <EstimateResult estimate={estimate} source={portalListings.source} /> : <MissingEstimate />}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function EstimateResult({ estimate, source }: { estimate: InstantValuationResult; source: string }) {
  const appraisalHref = buildAgentAppraisalMailto(estimate);
  const topComparable = estimate.comparables[0];

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <section className="overflow-hidden rounded-3xl border border-[#BFDBFE] bg-white shadow-sm">
        <div className="bg-gradient-to-br from-[#DBEAFE] via-white to-white p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">{estimate.label}</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-[-.06em] text-[#1A1A2E] sm:text-5xl">
                {estimate.status === 'estimate' ? 'Your instant market range' : 'A local appraisal is the right next step'}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#6B7280]">
                {estimate.reason}
              </p>
            </div>
            <ConfidenceBadge confidence={estimate.confidence} />
          </div>
        </div>

        {estimate.status === 'estimate' ? (
          <div className="grid gap-4 border-t border-[#E5E7EB] p-6 sm:grid-cols-3 sm:p-8">
            <RangeCard label="Low guide" value={formatValuationAmount(estimate.lowValue, estimate.purpose)} />
            <RangeCard label="Midpoint" value={formatValuationAmount(estimate.midValue, estimate.purpose)} featured />
            <RangeCard label="High guide" value={formatValuationAmount(estimate.highValue, estimate.purpose)} />
          </div>
        ) : (
          <div className="border-t border-[#E5E7EB] p-6 sm:p-8">
            <div className="rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-white p-6">
              <h2 className="text-2xl font-bold tracking-[-.04em]">Not enough clean comparisons yet.</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">Proppd should route this to a local agent instead of showing a false precise estimate.</p>
            </div>
          </div>
        )}

        <div className="border-t border-[#E5E7EB] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Comparison breakdown</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">Homes used to shape this range</h2>
            </div>
            <p className="rounded-full bg-[#EFF6FF] px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#2563EB]">{estimate.comparables.length} comps · {source}</p>
          </div>

          {estimate.comparables.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {estimate.comparables.map((comparable, index) => (
                <ComparableRow key={comparable.slug} comparable={comparable} estimate={estimate} index={index} topComparable={topComparable} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-6 text-sm font-bold leading-6 text-[#6B7280]">
              No reliable public comparisons were found for this exact property profile yet.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <ShieldCheck className="text-[#2563EB]" size={32} />
        <h2 className="mt-4 text-2xl font-bold tracking-[-.04em]">What this estimate means</h2>
        <div className="mt-5 grid gap-3">
          <SideFact icon={<BarChart3 size={17} />} title="Indicative range" text="Useful for early pricing direction, not a bank or legal valuation." />
          <SideFact icon={<TrendingUp size={17} />} title="Comparable-led" text="The range uses visible Proppd listings weighted by location, type and bedrooms." />
          <SideFact icon={<CheckCircle2 size={17} />} title="Human final step" text="A local agent should confirm condition, improvements, street position and timing." />
        </div>
        <a href={appraisalHref} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold !text-white">
          <Mail size={17} /> Request agent appraisal
        </a>
        <a href="/request-valuation" className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#BFDBFE] px-5 py-3 text-sm font-bold !text-[#2563EB]">
          Open valuation handoff
        </a>
        <a href="/my-properties" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
          Save this to my property workspace →
        </a>
      </aside>
    </div>
  );
}

function RangeCard({ label, value, featured = false }: { label: string; value: string; featured?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 ${featured ? 'border-[#93C5FD] bg-gradient-to-br from-[#DBEAFE] to-white shadow-sm' : 'border-[#E5E7EB] bg-[#F7F8FA]'}`}>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6B7280]">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#1A1A2E]">{value}</p>
    </div>
  );
}

function ComparableRow({ comparable, estimate, index, topComparable }: { comparable: ValuationComparable; estimate: InstantValuationResult; index: number; topComparable?: ValuationComparable }) {
  const againstMid = estimate.midValue ? Math.round(((comparable.priceValue - estimate.midValue) / estimate.midValue) * 100) : 0;
  const pricePosition = againstMid === 0 ? 'At midpoint' : againstMid > 0 ? `${againstMid}% above midpoint` : `${Math.abs(againstMid)}% below midpoint`;
  const strongest = topComparable?.slug === comparable.slug;

  return (
    <a href={`/property/${comparable.slug}`} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:border-[#93C5FD] hover:shadow-md">
      <div className="grid gap-4 lg:grid-cols-[1fr_180px] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB]">Comp {index + 1}</span>
            {strongest ? <span className="rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-bold text-[#1A1A2E]">Strongest match</span> : null}
          </div>
          <h3 className="mt-3 text-xl font-bold tracking-[-.03em] text-[#1A1A2E]">{comparable.title}</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">
            {comparable.suburb}, {comparable.city} · {comparable.bedrooms} beds · {comparable.bathrooms} baths · {comparable.propertyType}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">{comparable.agency} · {comparable.agent}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-white p-4 text-right">
          <p className="text-lg font-bold text-[#1A1A2E]">{formatValuationAmount(comparable.priceValue, estimate.purpose)}</p>
          <p className="mt-1 text-xs font-bold text-[#2563EB]">{pricePosition}</p>
          <p className="mt-2 text-xs font-bold text-[#9CA3AF]">Match score {comparable.similarityScore}</p>
        </div>
      </div>
    </a>
  );
}

function SideFact({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-white p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-[#2563EB]">{icon} {title}</div>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: InstantValuationResult['confidence'] }) {
  return (
    <div className="w-fit rounded-3xl border border-[#BFDBFE] bg-white px-5 py-4 text-right shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Confidence</p>
      <p className="mt-1 text-xl font-bold capitalize text-[#2563EB]">{confidence}</p>
    </div>
  );
}

function MissingEstimate() {
  return (
    <section className="mt-6 rounded-3xl border border-[#BFDBFE] bg-white p-8 shadow-sm">
      <h1 className="text-4xl font-bold tracking-[-.06em]">Start with the estimate form.</h1>
      <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-[#6B7280]">Enter the property basics first so Proppd can build a clean comparable range.</p>
      <a href="/home-values#instant-estimate" className="mt-6 inline-flex rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white">Go to estimate form</a>
    </section>
  );
}

function parseValuationSearchParams(params: Record<string, string | string[] | undefined>): InstantValuationInput | null {
  const suburb = stringParam(params.suburb);
  const city = stringParam(params.city);
  const propertyType = stringParam(params.propertyType);
  const bedrooms = numberParam(params.bedrooms);
  if (!suburb || !city || !propertyType || !bedrooms) return null;

  return {
    purpose: stringParam(params.purpose) === 'rent' ? 'rent' : 'sale',
    suburb,
    city,
    propertyType,
    bedrooms,
    bathrooms: numberParam(params.bathrooms),
    floorSize: numberParam(params.floorSize),
  };
}

function stringParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0]?.trim() ?? '' : value?.trim() ?? '';
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const parsed = Number.parseInt(stringParam(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function buildAgentAppraisalMailto(estimate: InstantValuationResult): string {
  const subject = encodeURIComponent(`Valuation appraisal request: ${estimate.inputs.suburb}`);
  const range = estimate.status === 'estimate'
    ? `${formatValuationAmount(estimate.lowValue, estimate.purpose)} – ${formatValuationAmount(estimate.highValue, estimate.purpose)}`
    : 'Agent appraisal recommended';
  const body = encodeURIComponent([
    'Please help me confirm this Proppd instant estimate.',
    '',
    `Property: ${estimate.inputs.bedrooms ?? '?'} bedroom ${estimate.inputs.propertyType} in ${estimate.inputs.suburb}, ${estimate.inputs.city}`,
    `Indicative range: ${range}`,
    `Confidence: ${estimate.confidence}`,
    `Reason: ${estimate.reason}`,
    '',
    'Owner name:',
    'Email:',
    'Phone:',
  ].join('\n'));

  return `mailto:info@proppd.com?subject=${subject}&body=${body}`;
}
