'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PortalListingDraft } from '@/lib/proppd/backend';
import { portalPropertyTypeOptions } from '@/lib/proppd/listing-editor';

type ListingFormState = {
  title: string;
  purpose: 'sale' | 'rent';
  status: 'draft' | 'pending_review' | 'available' | 'under_offer' | 'sold' | 'rented' | 'archived';
  price: string;
  description: string;
  suburb: string;
  city: string;
  province: string;
  propertyTypeSlug: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  floorSizeSqm: string;
  erfSizeSqm: string;
  ratesAndTaxes: string;
  levies: string;
  isFeatured: boolean;
};

type Props = {
  initialListing?: Partial<PortalListingDraft>;
  mode: 'create' | 'edit';
  submitUrl: string;
  submitLabel?: string;
  redirectTo?: string;
};

function toFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function buildInitialState(initialListing?: Partial<PortalListingDraft>): ListingFormState {
  const propertyTypeSlug = initialListing?.propertyTypeSlug && initialListing.propertyTypeSlug.length > 0 ? initialListing.propertyTypeSlug : portalPropertyTypeOptions[0]?.slug ?? 'house';

  return {
    title: toFieldValue(initialListing?.title),
    purpose: (initialListing?.purpose as 'sale' | 'rent' | undefined) ?? 'sale',
    status: (initialListing?.status as ListingFormState['status'] | undefined) ?? 'draft',
    price: toFieldValue(initialListing?.price ?? ''),
    description: toFieldValue(initialListing?.description),
    suburb: toFieldValue(initialListing?.suburb),
    city: toFieldValue(initialListing?.city),
    province: toFieldValue(initialListing?.province),
    propertyTypeSlug,
    bedrooms: toFieldValue(initialListing?.bedrooms),
    bathrooms: toFieldValue(initialListing?.bathrooms),
    parking: toFieldValue(initialListing?.parking),
    floorSizeSqm: toFieldValue(initialListing?.floorSizeSqm),
    erfSizeSqm: toFieldValue(initialListing?.erfSizeSqm),
    ratesAndTaxes: toFieldValue(initialListing?.ratesAndTaxes),
    levies: toFieldValue(initialListing?.levies),
    isFeatured: Boolean(initialListing?.isFeatured),
  };
}

export function ListingEditorForm({ initialListing, mode, submitUrl, submitLabel, redirectTo }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ListingFormState>(() => buildInitialState(initialListing));
  const [status, setStatus] = useState<{ kind: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    kind: 'idle',
    message: mode === 'create' ? 'Fill in the listing details and save as a draft.' : 'Update the listing details and save changes.',
  });

  const buttonLabel = submitLabel ?? (mode === 'create' ? 'Create listing' : 'Save changes');
  const method = mode === 'create' ? 'POST' : 'PATCH';

  const propertyTypeLabel = useMemo(
    () => portalPropertyTypeOptions.find((option) => option.slug === state.propertyTypeSlug)?.label ?? 'Property type',
    [state.propertyTypeSlug],
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: 'loading', message: 'Saving listing…' });

    const response = await fetch(submitUrl, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(state),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus({ kind: 'error', message: payload?.error || 'Could not save the listing.' });
      return;
    }

    setStatus({ kind: 'success', message: 'Listing saved successfully.' });
    const destination = redirectTo ?? (mode === 'create' ? '/dashboard/listings' : '/dashboard/listings');
    if (payload?.item?.slug && mode === 'create') {
      router.push(`/dashboard/listings/${payload.item.slug}/edit`);
      return;
    }
    router.push(destination);
    router.refresh();
  }

  return (
    <form className="grid gap-5 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input value={state.title} onChange={(event) => setState({ ...state, title: event.target.value })} className={inputClass} required minLength={6} />
        </Field>
        <Field label="Property type">
          <select value={state.propertyTypeSlug} onChange={(event) => setState({ ...state, propertyTypeSlug: event.target.value })} className={inputClass} required>
            {portalPropertyTypeOptions.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Purpose">
          <select value={state.purpose} onChange={(event) => setState({ ...state, purpose: event.target.value as ListingFormState['purpose'] })} className={inputClass}>
            <option value="sale">For sale</option>
            <option value="rent">To rent</option>
          </select>
        </Field>
        <Field label="Status">
          <select value={state.status} onChange={(event) => setState({ ...state, status: event.target.value as ListingFormState['status'] })} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="available">Available</option>
            <option value="under_offer">Under offer</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Price">
          <input type="number" min="0" step="1" value={state.price} onChange={(event) => setState({ ...state, price: event.target.value })} className={inputClass} required />
        </Field>
        <Field label="Bedrooms">
          <input type="number" min="0" step="1" value={state.bedrooms} onChange={(event) => setState({ ...state, bedrooms: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Bathrooms">
          <input type="number" min="0" step="0.5" value={state.bathrooms} onChange={(event) => setState({ ...state, bathrooms: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Parking">
          <input type="number" min="0" step="1" value={state.parking} onChange={(event) => setState({ ...state, parking: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Floor size (sqm)">
          <input type="number" min="0" step="0.1" value={state.floorSizeSqm} onChange={(event) => setState({ ...state, floorSizeSqm: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Erf size (sqm)">
          <input type="number" min="0" step="0.1" value={state.erfSizeSqm} onChange={(event) => setState({ ...state, erfSizeSqm: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Rates & taxes">
          <input type="number" min="0" step="0.01" value={state.ratesAndTaxes} onChange={(event) => setState({ ...state, ratesAndTaxes: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Levies">
          <input type="number" min="0" step="0.01" value={state.levies} onChange={(event) => setState({ ...state, levies: event.target.value })} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Suburb">
          <input value={state.suburb} onChange={(event) => setState({ ...state, suburb: event.target.value })} className={inputClass} required minLength={2} />
        </Field>
        <Field label="City">
          <input value={state.city} onChange={(event) => setState({ ...state, city: event.target.value })} className={inputClass} required minLength={2} />
        </Field>
        <Field label="Province">
          <input value={state.province} onChange={(event) => setState({ ...state, province: event.target.value })} className={inputClass} required minLength={2} />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={state.description}
          onChange={(event) => setState({ ...state, description: event.target.value })}
          className={`${inputClass} min-h-[180px]`}
          required
          minLength={20}
        />
      </Field>

      <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-[#6B7280]">
        <input
          type="checkbox"
          checked={state.isFeatured}
          onChange={(event) => setState({ ...state, isFeatured: event.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-[#4A3AFF] focus:ring-[#4A3AFF]"
        />
        Featured listing
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-[#1A1A2E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF] disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={status.kind === 'loading'}
        >
          {status.kind === 'loading' ? 'Saving…' : buttonLabel}
        </button>
        <span className="text-sm font-bold text-[#9CA3AF]">Current type: {propertyTypeLabel}</span>
        <span aria-live="polite" className={`text-sm font-bold ${status.kind === 'error' ? 'text-red-600' : status.kind === 'success' ? 'text-[#00C9A7]' : 'text-[#9CA3AF]'}`}>
          {status.message}
        </span>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#6B7280]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function BackendCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
    </div>
  );
}

const inputClass =
  'rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#4A3AFF] focus:ring-4 focus:ring-[#4A3AFF]/10';
