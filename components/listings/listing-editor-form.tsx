'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, MapPin, Home, DollarSign, FileText, BedDouble, Bath, Car, Image as ImageIcon, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { PortalListingDraft } from '@/lib/proppd/backend';
import { portalPropertyTypeOptions } from '@/lib/proppd/listing-editor';
import { PhotoUpload, type ListingPhoto } from '@/components/listings/photo-upload';

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
  photos: ListingPhoto[];
};

type Props = {
  initialListing?: Partial<PortalListingDraft>;
  mode: 'create' | 'edit';
  submitUrl: string;
  submitLabel?: string;
  redirectTo?: string;
  aiEnabled?: boolean;
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
    photos: initialListing?.photos ?? [],
  };
}

const steps = [
  { id: 'basics', label: 'Basics', icon: Home },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'details', label: 'Details', icon: BedDouble },
  { id: 'photos', label: 'Photos', icon: ImageIcon },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'review', label: 'Review', icon: FileText },
];

export function ListingEditorForm({ initialListing, mode, submitUrl, submitLabel, redirectTo, aiEnabled = false }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ListingFormState>(() => buildInitialState(initialListing));
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<{ kind: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    kind: 'idle',
    message: mode === 'create' ? 'Fill in the listing details and save as a draft.' : 'Update the listing details and save changes.',
  });

  const [ai, setAi] = useState<{ kind: 'idle' | 'loading' | 'error'; message: string }>({ kind: 'idle', message: '' });

  async function generateDescription() {
    setAi({ kind: 'loading', message: '' });
    try {
      const response = await fetch('/api/dashboard/listings/ai-description', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: state.title,
          purpose: state.purpose,
          propertyTypeSlug: state.propertyTypeSlug,
          suburb: state.suburb,
          city: state.city,
          province: state.province,
          price: state.price,
          bedrooms: state.bedrooms,
          bathrooms: state.bathrooms,
          parking: state.parking,
          floorSizeSqm: state.floorSizeSqm,
          erfSizeSqm: state.erfSizeSqm,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAi({ kind: 'error', message: data?.error || 'Could not generate a description.' });
        return;
      }
      setState((prev) => ({ ...prev, description: data.description }));
      setAi({ kind: 'idle', message: '' });
    } catch {
      setAi({ kind: 'error', message: 'Could not reach the AI service. Try again.' });
    }
  }

  const buttonLabel = submitLabel ?? (mode === 'create' ? 'Create listing' : 'Save changes');
  const method = mode === 'create' ? 'POST' : 'PATCH';
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const propertyTypeLabel = useMemo(
    () => portalPropertyTypeOptions.find((option) => option.slug === state.propertyTypeSlug)?.label ?? 'Property type',
    [state.propertyTypeSlug],
  );

  const update = (field: keyof ListingFormState, value: string | boolean) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const canAdvance = () => {
    if (currentStep === 0) return state.title.trim().length > 0;
    if (currentStep === 1) return state.suburb.trim().length > 0 && state.city.trim().length > 0;
    if (currentStep === 2) return true;
    if (currentStep === 3) return true;
    if (currentStep === 4) return state.price.length > 0;
    return true;
  };

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
    const destination = redirectTo ?? '/dashboard/listings';
    setTimeout(() => router.push(destination), 1000);
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      {/* Progress bar */}
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                i < currentStep ? 'bg-[#00C9A7] text-white' : i === currentStep ? 'bg-[#4A3AFF] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'
              }`}>
                {i < currentStep ? <Check size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 sm:w-12 ${i < currentStep ? 'bg-[#00C9A7]' : 'bg-[#E5E7EB]'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold text-[#9CA3AF]">Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}</p>
      </div>

      <form onSubmit={isLastStep ? submit : undefined} className="p-5">
        {/* Step 1: Basics */}
        {currentStep === 0 && (
          <div className="grid gap-4">
            <InputField label="Listing title" value={state.title} onChange={(v) => update('title', v)} placeholder="e.g. Modern 3-bed house in Sandton" required />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Purpose" value={state.purpose} onChange={(v) => update('purpose', v)}>
                <option value="sale">For sale</option>
                <option value="rent">To rent</option>
              </SelectField>
              <SelectField label="Property type" value={state.propertyTypeSlug} onChange={(v) => update('propertyTypeSlug', v)}>
                {portalPropertyTypeOptions.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>{opt.label}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Description</label>
                {aiEnabled && (
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={ai.kind === 'loading' || state.title.trim().length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#4A3AFF]/30 bg-[#4A3AFF]/5 px-3 py-1.5 text-xs font-bold text-[#4A3AFF] transition hover:bg-[#4A3AFF]/10 disabled:opacity-50"
                    title={state.title.trim().length === 0 ? 'Add a listing title first' : 'Generate a description from the listing facts'}
                  >
                    {ai.kind === 'loading' ? <><Loader2 size={13} className="animate-spin" /> Writing…</> : <><Sparkles size={13} /> {state.description.trim() ? 'Regenerate' : 'Write with AI'}</>}
                  </button>
                )}
              </div>
              <textarea
                value={state.description}
                onChange={(e) => update('description', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
                rows={4}
                placeholder="Describe the property, its features, and what makes it special..."
              />
              {ai.kind === 'error' && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600"><AlertCircle size={13} /> {ai.message}</p>
              )}
              {aiEnabled && (
                <p className="mt-1.5 text-xs text-[#9CA3AF]">AI drafts from the facts you enter — always review and edit before publishing.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 1 && (
          <div className="grid gap-4">
            <InputField label="Suburb" value={state.suburb} onChange={(v) => update('suburb', v)} placeholder="e.g. Sandton" required />
            <InputField label="City" value={state.city} onChange={(v) => update('city', v)} placeholder="e.g. Johannesburg" required />
            <InputField label="Province" value={state.province} onChange={(v) => update('province', v)} placeholder="e.g. Gauteng" />
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 2 && (
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <NumberField label="Bedrooms" value={state.bedrooms} onChange={(v) => update('bedrooms', v)} icon={<BedDouble size={16} />} />
              <NumberField label="Bathrooms" value={state.bathrooms} onChange={(v) => update('bathrooms', v)} icon={<Bath size={16} />} />
              <NumberField label="Parking" value={state.parking} onChange={(v) => update('parking', v)} icon={<Car size={16} />} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Floor size (m²)" value={state.floorSizeSqm} onChange={(v) => update('floorSizeSqm', v)} type="number" placeholder="e.g. 150" />
              <InputField label="Erf size (m²)" value={state.erfSizeSqm} onChange={(v) => update('erfSizeSqm', v)} type="number" placeholder="e.g. 500" />
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {currentStep === 3 && (
          <PhotoUpload
            existingPhotos={state.photos}
            onChange={(photos) => setState((prev) => ({ ...prev, photos }))}
          />
        )}

        {/* Step 5: Pricing */}
        {currentStep === 4 && (
          <div className="grid gap-4">
            <InputField label={`Price ${state.purpose === 'rent' ? '(monthly)' : ''}`} value={state.price} onChange={(v) => update('price', v)} type="number" placeholder="e.g. 3500000" required />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Rates & taxes (monthly)" value={state.ratesAndTaxes} onChange={(v) => update('ratesAndTaxes', v)} placeholder="e.g. R 2 500" />
              <InputField label="Levies (monthly)" value={state.levies} onChange={(v) => update('levies', v)} placeholder="e.g. R 1 800" />
            </div>
            <SelectField label="Listing status" value={state.status} onChange={(v) => update('status', v)}>
              <option value="draft">Save as draft (only you can see it)</option>
              <option value="available">Publish — available now</option>
              <option value="under_offer">Published — under offer</option>
              <option value="sold">Sold / no longer available</option>
              <option value="rented">Rented / no longer available</option>
            </SelectField>
            <p className="-mt-2 text-xs text-[#9CA3AF]">Drafts stay private until you publish. You can change this any time.</p>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-[#F7F8FA] p-4">
              <h3 className="text-sm font-bold text-[#1A1A2E]">Listing summary</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-[#9CA3AF]">Title:</span> <span className="font-bold text-[#1A1A2E]">{state.title || '—'}</span></div>
                <div><span className="text-[#9CA3AF]">Purpose:</span> <span className="font-bold text-[#1A1A2E]">{state.purpose === 'sale' ? 'For sale' : 'To rent'}</span></div>
                <div><span className="text-[#9CA3AF]">Location:</span> <span className="font-bold text-[#1A1A2E]">{state.suburb || '—'}, {state.city || '—'}</span></div>
                <div><span className="text-[#9CA3AF]">Price:</span> <span className="font-bold text-[#1A1A2E]">{state.price ? `R ${Number(state.price).toLocaleString('en-ZA')}` : '—'}</span></div>
                <div><span className="text-[#9CA3AF]">Beds:</span> <span className="font-bold text-[#1A1A2E]">{state.bedrooms || '—'}</span></div>
                <div><span className="text-[#9CA3AF]">Baths:</span> <span className="font-bold text-[#1A1A2E]">{state.bathrooms || '—'}</span></div>
                <div><span className="text-[#9CA3AF]">Type:</span> <span className="font-bold text-[#1A1A2E]">{propertyTypeLabel}</span></div>
                <div><span className="text-[#9CA3AF]">Status:</span> <span className="font-bold text-[#1A1A2E]">{statusLabel(state.status)}</span></div>
                <div><span className="text-[#9CA3AF]">Photos:</span> <span className="font-bold text-[#1A1A2E]">{state.photos.length}</span></div>
              </div>
            </div>
            {state.description && (
              <div className="rounded-lg bg-[#F7F8FA] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Description</p>
                <p className="mt-1 text-sm text-[#6B7280]">{state.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Status message */}
        {status.kind !== 'idle' && (
          <div className={`mt-4 rounded-lg p-3 text-sm font-bold ${
            status.kind === 'error' ? 'bg-red-50 text-red-600' : status.kind === 'success' ? 'bg-[#E6FBF7] text-[#00C9A7]' : 'bg-[#F7F8FA] text-[#6B7280]'
          }`}>
            {status.message}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {!isFirstStep ? (
            <button type="button" onClick={() => setCurrentStep((s) => s - 1)} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B7280] hover:text-[#1A1A2E]">
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          {isLastStep ? (
            <button type="submit" disabled={status.kind === 'loading'} className="inline-flex items-center gap-2 rounded-lg bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50">
              {status.kind === 'loading' ? 'Saving…' : buttonLabel}
            </button>
          ) : (
            <button type="button" onClick={() => setCurrentStep((s) => s + 1)} disabled={!canAdvance()} className="inline-flex items-center gap-2 rounded-lg bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50">
              Next <ArrowRight size={14} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function statusLabel(status: ListingFormState['status']): string {
  const labels: Record<ListingFormState['status'], string> = {
    draft: 'Draft (private)',
    pending_review: 'Pending review',
    available: 'Published — available',
    under_offer: 'Under offer',
    sold: 'Sold',
    rented: 'Rented',
    archived: 'Archived',
  };
  return labels[status] ?? status;
}

function InputField({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
        placeholder={placeholder} />
    </label>
  );
}

function NumberField({ label, value, onChange, icon }: {
  label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
      {label}
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5">
        {icon && <span className="text-[#9CA3AF]">{icon}</span>}
        <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none" placeholder="0" />
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]">
        {children}
      </select>
    </label>
  );
}
