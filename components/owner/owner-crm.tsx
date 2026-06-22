'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Cloud,
  Home,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { formatValuationAmount, type InstantValuationResult } from '@/lib/valuation/instant';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { ValuationRequestDialog } from '@/components/owner/valuation-request-dialog';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import {
  cloudCreateProperty,
  cloudImportProperties,
  cloudListProperties,
  cloudRemoveProperty,
  cloudUpdateProperty,
} from '@/lib/owner/cloud';
import {
  OWNER_PROPERTY_TYPES,
  OWNER_STAGES,
  createOwnerPropertyId,
  ownerStageIndex,
  readOwnerProperties,
  removeOwnerProperty,
  subscribeOwnerProperties,
  upsertOwnerProperty,
  writeOwnerProperties,
  type OwnerIntent,
  type OwnerProperty,
  type OwnerStage,
} from '@/lib/owner/properties';

type EstimateState = { status: 'loading' | 'done' | 'error'; result?: InstantValuationResult; error?: string };
type AuthStatus = 'unknown' | 'in' | 'out';

type OwnerCrmProps = { supabaseUrl?: string; supabaseKey?: string };

const blankForm = {
  nickname: '',
  intent: 'sell' as OwnerIntent,
  suburb: '',
  city: '',
  propertyType: 'House',
  bedrooms: '3',
  bathrooms: '2',
  floorSize: '',
  askingPrice: '',
  notes: '',
};

export function OwnerCrm({ supabaseUrl, supabaseKey }: OwnerCrmProps) {
  const [hydrated, setHydrated] = useState(false);
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [estimates, setEstimates] = useState<Record<string, EstimateState>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState<AuthStatus>('unknown');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [showSignIn, setShowSignIn] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [requesting, setRequesting] = useState<OwnerProperty | null>(null);

  const cloudEnabled = auth === 'in';

  // Track auth so the workspace can sync to the owner's account when signed in.
  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setAuth('out');
      return;
    }
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setAuth(data.user ? 'in' : 'out');
      setUserEmail(data.user?.email ?? undefined);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ? 'in' : 'out');
      setUserEmail(session?.user?.email ?? undefined);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load the workspace: from the account when signed in (migrating any device
  // copy on first login), otherwise from localStorage.
  useEffect(() => {
    if (auth === 'unknown') return;

    if (auth === 'out') {
      setProperties(readOwnerProperties());
      setHydrated(true);
      return subscribeOwnerProperties(() => setProperties(readOwnerProperties()));
    }

    let cancelled = false;
    (async () => {
      try {
        const local = readOwnerProperties();
        const list = local.length ? await cloudImportProperties(local) : await cloudListProperties();
        if (cancelled) return;
        if (local.length) writeOwnerProperties([]);
        setProperties(list);
        setSyncError('');
      } catch {
        if (!cancelled) {
          setProperties(readOwnerProperties());
          setSyncError('We could not reach your account, so changes are saved on this device for now.');
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  async function signOut() {
    await getBrowserSupabaseClient()?.auth.signOut();
  }

  const fetchEstimate = useCallback(async (property: OwnerProperty) => {
    setEstimates((current) => ({ ...current, [property.id]: { status: 'loading' } }));
    try {
      const response = await fetch('/api/valuations/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suburb: property.suburb,
          city: property.city,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          floorSize: property.floorSize,
          purpose: property.intent === 'rent' ? 'rent' : 'sale',
        }),
      });
      const data = (await response.json()) as { ok: boolean; estimate?: InstantValuationResult; error?: string };
      if (data.ok && data.estimate) {
        setEstimates((current) => ({ ...current, [property.id]: { status: 'done', result: data.estimate } }));
      } else {
        setEstimates((current) => ({ ...current, [property.id]: { status: 'error', error: data.error ?? 'No estimate available.' } }));
      }
    } catch {
      setEstimates((current) => ({ ...current, [property.id]: { status: 'error', error: 'Could not reach the estimate service.' } }));
    }
  }, []);

  // Fetch an estimate for any property we haven't priced yet.
  useEffect(() => {
    if (!hydrated) return;
    for (const property of properties) {
      if (!estimates[property.id]) fetchEstimate(property);
    }
  }, [hydrated, properties, estimates, fetchEstimate]);

  const stats = useMemo(() => {
    const selling = properties.filter((entry) => entry.intent === 'sell').length;
    const letting = properties.filter((entry) => entry.intent === 'rent').length;
    const totalSaleMid = properties.reduce((sum, entry) => {
      const estimate = estimates[entry.id]?.result;
      return entry.intent === 'sell' && estimate ? sum + estimate.midValue : sum;
    }, 0);
    return { total: properties.length, selling, letting, totalSaleMid };
  }, [properties, estimates]);

  function update<K extends keyof typeof blankForm>(key: K, value: (typeof blankForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  }

  function resetForm() {
    setForm(blankForm);
    setShowForm(false);
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.suburb.trim() || !form.city.trim() || !form.propertyType.trim() || !form.bedrooms.trim()) {
      setError('Add a suburb, city, property type, and bedrooms so we can value it.');
      return;
    }
    const property: OwnerProperty = {
      id: createOwnerPropertyId(),
      nickname: form.nickname.trim(),
      suburb: form.suburb.trim(),
      city: form.city.trim(),
      propertyType: form.propertyType.trim(),
      bedrooms: Number(form.bedrooms) || 1,
      bathrooms: form.bathrooms.trim() ? Number(form.bathrooms) : undefined,
      floorSize: form.floorSize.trim() ? Number(form.floorSize) : undefined,
      intent: form.intent,
      askingPrice: form.askingPrice.trim() ? Number(form.askingPrice) : undefined,
      stage: 'researching',
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    resetForm();
    if (cloudEnabled) {
      try {
        setProperties(await cloudCreateProperty(property));
        setSyncError('');
        return;
      } catch {
        setSyncError('Saved on this device — we could not reach your account.');
      }
    }
    setProperties(upsertOwnerProperty(property));
  }

  async function changeStage(property: OwnerProperty, stage: OwnerStage) {
    setProperties((current) => current.map((entry) => (entry.id === property.id ? { ...entry, stage } : entry)));
    if (cloudEnabled) {
      try {
        setProperties(await cloudUpdateProperty(property.id, { stage }));
        return;
      } catch {
        setSyncError('Stage saved on this device — we could not reach your account.');
      }
    }
    upsertOwnerProperty({ ...property, stage });
  }

  async function remove(id: string) {
    setProperties((current) => current.filter((entry) => entry.id !== id));
    setEstimates((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (cloudEnabled) {
      try {
        setProperties(await cloudRemoveProperty(id));
        return;
      } catch {
        setSyncError('Removed on this device — we could not reach your account.');
      }
    }
    removeOwnerProperty(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-3xl proppd-panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#2563EB]">Sellers &amp; landlords</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#1A1A2E] sm:text-5xl">Your property workspace</h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#4B5563]">
              Track every home you plan to sell or rent out, see an instant market range, and move it forward — all in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((open) => !open)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Close' : 'Add a property'}
          </button>
        </div>

        {hydrated && properties.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill icon={<Home size={16} />} value={String(stats.total)} label="Properties" />
            <StatPill icon={<TrendingUp size={16} />} value={String(stats.selling)} label="To sell" />
            <StatPill icon={<Building2 size={16} />} value={String(stats.letting)} label="To rent" />
            <StatPill
              icon={<BarChart3 size={16} />}
              value={stats.totalSaleMid ? formatValuationAmount(stats.totalSaleMid, 'sale') : '—'}
              label="Est. sale value"
            />
          </div>
        )}
      </div>

      {/* Account / sync banner */}
      {auth === 'in' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-[#1A1A2E]">
            <CheckCircle2 size={16} className="text-[#2563EB]" /> Synced to your account across devices.
          </p>
          <button type="button" onClick={signOut} className="text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
            Sign out
          </button>
        </div>
      ) : auth === 'out' ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#6B7280]">
              <Cloud size={16} className="text-[#9CA3AF]" /> Saved on this device. Sign in to sync across devices.
            </p>
            <button
              type="button"
              onClick={() => setShowSignIn((open) => !open)}
              className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
            >
              {showSignIn ? 'Close' : 'Sign in to sync'}
            </button>
          </div>
          {showSignIn && (
            <div className="mt-4 max-w-md border-t border-[#F3F4F6] pt-4">
              <p className="mb-3 text-sm font-semibold text-[#6B7280]">
                Enter your email and we&apos;ll send a secure link — your saved properties move into your account automatically.
              </p>
              <SupabaseLoginForm supabaseUrl={supabaseUrl} publishableKey={supabaseKey} nextPath="/my-properties" allowSignUp />
            </div>
          )}
        </div>
      ) : null}

      {syncError && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">{syncError}</p>
      )}

      {/* Add property form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-[-.03em] text-[#1A1A2E]">Add a property</h2>
          <p className="mt-1 text-sm font-semibold text-[#6B7280]">We use the basics to build an indicative market range.</p>

          <div className="mt-5 inline-flex rounded-full bg-[#EFF6FF] p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => update('intent', 'sell')}
              className={`rounded-full px-4 py-2 transition ${form.intent === 'sell' ? 'bg-[#4A3AFF] text-white' : 'text-[#2563EB]'}`}
            >
              I want to sell
            </button>
            <button
              type="button"
              onClick={() => update('intent', 'rent')}
              className={`rounded-full px-4 py-2 transition ${form.intent === 'rent' ? 'bg-[#4A3AFF] text-white' : 'text-[#2563EB]'}`}
            >
              I want to rent it out
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nickname (optional)" value={form.nickname} onChange={(v) => update('nickname', v)} placeholder="e.g. Mom's flat" />
            <Field label="Suburb" value={form.suburb} onChange={(v) => update('suburb', v)} placeholder="Sea Point" required />
            <Field label="City" value={form.city} onChange={(v) => update('city', v)} placeholder="Cape Town" required />
            <SelectField label="Property type" value={form.propertyType} onChange={(v) => update('propertyType', v)}>
              {OWNER_PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </SelectField>
            <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={(v) => update('bedrooms', v)} required />
            <Field label="Bathrooms" type="number" value={form.bathrooms} onChange={(v) => update('bathrooms', v)} />
            <Field label="Floor size (m²)" type="number" value={form.floorSize} onChange={(v) => update('floorSize', v)} placeholder="Optional" />
            <Field
              label={form.intent === 'rent' ? 'Target rent (R p/m)' : 'Asking price (R)'}
              type="number"
              value={form.askingPrice}
              onChange={(v) => update('askingPrice', v)}
              placeholder="Optional"
            />
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
              Save property <ArrowRight size={16} />
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-[#E5E7EB] px-6 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {hydrated && properties.length === 0 && !showForm && (
        <div className="rounded-3xl border border-dashed border-[#BFDBFE] bg-white p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <Home size={26} />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-[-.03em] text-[#1A1A2E]">Start with the property you own</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[#6B7280]">
            Add a home you&apos;re thinking of selling or renting out. You&apos;ll get an instant market range and a clear next step — no account needed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-full bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
              <Plus size={16} /> Add your first property
            </button>
            <a href="/home-values" className="rounded-full border border-[#E5E7EB] px-6 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
              What&apos;s my home worth?
            </a>
          </div>
        </div>
      )}

      {/* Property cards */}
      {properties.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              estimate={estimates[property.id]}
              onStageChange={changeStage}
              onRemove={remove}
              onRetry={() => fetchEstimate(property)}
              onRequestValuation={setRequesting}
            />
          ))}
        </div>
      )}

      {/* Privacy note */}
      {hydrated && properties.length > 0 && (
        <p className="px-1 text-xs font-semibold text-[#9CA3AF]">
          {cloudEnabled
            ? 'Your workspace is saved to your account. Nothing is shared with an agent until you request a valuation.'
            : 'Your workspace is saved privately on this device. Nothing is shared until you choose to request an agent valuation.'}
        </p>
      )}

      {requesting && (
        <ValuationRequestDialog
          property={requesting}
          estimate={estimates[requesting.id]?.result}
          defaultEmail={userEmail}
          onClose={() => setRequesting(null)}
        />
      )}
    </div>
  );
}

function PropertyCard({
  property,
  estimate,
  onStageChange,
  onRemove,
  onRetry,
  onRequestValuation,
}: {
  property: OwnerProperty;
  estimate: EstimateState | undefined;
  onStageChange: (property: OwnerProperty, stage: OwnerStage) => void;
  onRemove: (id: string) => void;
  onRetry: () => void;
  onRequestValuation: (property: OwnerProperty) => void;
}) {
  const title = property.nickname || `${property.propertyType} in ${property.suburb}`;
  const purpose = property.intent === 'rent' ? 'rent' : 'sale';
  const progress = ((ownerStageIndex(property.stage) + 1) / OWNER_STAGES.length) * 100;

  return (
    <article className="flex flex-col rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${property.intent === 'rent' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#4A3AFF]/10 text-[#4A3AFF]'}`}>
            {property.intent === 'rent' ? 'Letting' : 'Selling'}
          </span>
          <h3 className="mt-2 truncate text-xl font-bold tracking-[-.02em] text-[#1A1A2E]">{title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#6B7280]">
            <MapPin size={14} className="text-[#9CA3AF]" /> {property.suburb}, {property.city}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(property.id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F7F8FA] hover:text-red-500"
          aria-label="Remove property"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-[#6B7280]">
        <span>{property.bedrooms} bed</span>
        {property.bathrooms ? <span>{property.bathrooms} bath</span> : null}
        {property.floorSize ? <span>{property.floorSize} m²</span> : null}
        {property.askingPrice ? <span className="text-[#1A1A2E]">{formatValuationAmount(property.askingPrice, purpose)}</span> : null}
      </div>

      {/* Valuation */}
      <div className="mt-4 rounded-2xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-white p-4">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2563EB]">Indicative {purpose === 'rent' ? 'rental' : 'market'} range</p>
        {!estimate || estimate.status === 'loading' ? (
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#6B7280]"><Loader2 size={15} className="animate-spin" /> Estimating…</p>
        ) : estimate.status === 'error' ? (
          <div className="mt-2">
            <p className="text-sm font-semibold text-[#6B7280]">{estimate.error}</p>
            <button type="button" onClick={onRetry} className="mt-1 text-sm font-bold text-[#4A3AFF]">Try again</button>
          </div>
        ) : estimate.result && estimate.result.status === 'needs_agent' ? (
          <p className="mt-2 text-sm font-semibold text-[#6B7280]">Too few comparables for a range — an agent valuation is the best next step.</p>
        ) : estimate.result ? (
          <>
            <p className="mt-2 text-2xl font-bold tracking-[-.03em] text-[#1A1A2E]">
              {formatValuationAmount(estimate.result.lowValue, purpose)} – {formatValuationAmount(estimate.result.highValue, purpose)}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">{estimate.result.confidence} confidence · indicative only</p>
          </>
        ) : null}
      </div>

      {/* Stage pipeline */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-[.14em] text-[#6B7280]">Stage</label>
          <select
            value={property.stage}
            onChange={(event) => onStageChange(property, event.target.value as OwnerStage)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-bold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF]"
          >
            {OWNER_STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>{stage.label}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EFF6FF]">
          <div className="h-full rounded-full bg-[#4A3AFF] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F3F4F6] pt-4">
        <button
          type="button"
          onClick={() => onRequestValuation(property)}
          className="inline-flex items-center gap-2 rounded-full bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
        >
          <ShieldCheck size={15} /> Request agent valuation
        </button>
        <a href="/agents" className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2.5 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
          <Building2 size={15} /> Connect with an agent
        </a>
      </div>
    </article>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#BFDBFE] bg-white/70 p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">{icon}</span>
      <p className="mt-2 text-lg font-bold tracking-[-.02em] text-[#1A1A2E]">{value}</p>
      <p className="text-xs font-semibold text-[#6B7280]">{label}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 0 : undefined}
        className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10 placeholder:font-normal placeholder:text-[#9CA3AF]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] outline-none transition focus:border-[#4A3AFF]"
      >
        {children}
      </select>
    </label>
  );
}
