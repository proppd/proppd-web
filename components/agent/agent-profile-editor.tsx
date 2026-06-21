'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, User, MapPin, Building2, Phone, Mail, MessageCircle, X, Plus, BadgeCheck, AlertCircle, Loader2 } from 'lucide-react';

type AgentProfile = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  bio: string;
  agencyName: string;
  areasServed: string[];
};

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; isNew: boolean; backendMode: 'database' | 'demo'; verified: boolean }
  | { kind: 'error'; message: string };

const emptyProfile: AgentProfile = {
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  bio: '',
  agencyName: '',
  areasServed: [],
};

export function AgentProfileEditor() {
  const [profile, setProfile] = useState<AgentProfile>(emptyProfile);
  const [load, setLoad] = useState<LoadState>({ kind: 'loading' });
  const [areaDraft, setAreaDraft] = useState('');
  const [save, setSave] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; message: string }>({ kind: 'idle', message: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch('/api/dashboard/profile');
        const payload = await response.json().catch(() => ({}));
        if (!active) return;

        if (!response.ok) {
          setLoad({ kind: 'error', message: payload?.error || 'Could not load your profile.' });
          return;
        }

        const backendMode = payload.backendMode === 'database' ? 'database' : 'demo';

        if (payload.profile) {
          setProfile({
            name: payload.profile.name ?? '',
            phone: payload.profile.phone ?? '',
            whatsapp: payload.profile.whatsapp ?? '',
            email: payload.profile.email ?? '',
            bio: payload.profile.bio ?? '',
            agencyName: payload.profile.agencyName ?? '',
            areasServed: payload.profile.areasServed ?? [],
          });
          setLoad({ kind: 'ready', isNew: false, backendMode, verified: Boolean(payload.profile.isVerified) });
        } else {
          const prefill = payload.prefill ?? {};
          setProfile({
            ...emptyProfile,
            name: prefill.name ?? '',
            phone: prefill.phone ?? '',
            email: prefill.email ?? '',
            agencyName: prefill.agencyName ?? '',
            areasServed: prefill.areasServed ?? [],
          });
          setLoad({ kind: 'ready', isNew: true, backendMode, verified: false });
        }
      } catch {
        if (active) setLoad({ kind: 'error', message: 'Could not reach the server. Check your connection and try again.' });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isNew = load.kind === 'ready' && load.isNew;
  const demoMode = load.kind === 'ready' && load.backendMode === 'demo';

  const update = (field: keyof AgentProfile, value: string | string[]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSave({ kind: 'idle', message: '' });
  };

  const addArea = () => {
    const area = areaDraft.trim();
    if (!area) return;
    if (!profile.areasServed.some((existing) => existing.toLowerCase() === area.toLowerCase())) {
      update('areasServed', [...profile.areasServed, area]);
    }
    setAreaDraft('');
  };

  const removeArea = (area: string) => update('areasServed', profile.areasServed.filter((item) => item !== area));

  const canSave = useMemo(
    () => profile.name.trim().length >= 3 && profile.phone.trim().length >= 7 && profile.agencyName.trim().length >= 2 && profile.areasServed.length > 0,
    [profile],
  );

  const handleSave = async () => {
    if (!canSave || save.kind === 'saving') return;
    setSave({ kind: 'saving', message: '' });

    try {
      const response = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSave({ kind: 'error', message: payload?.error || 'Could not save your profile.' });
        return;
      }

      setProfile((prev) => ({ ...prev, areasServed: payload.profile?.areasServed ?? prev.areasServed }));
      setSave({ kind: 'saved', message: isNew ? 'Profile created — opening your dashboard…' : 'Profile saved.' });
      if (load.kind === 'ready') setLoad({ ...load, isNew: false });
      if (isNew) {
        window.location.assign('/dashboard');
      }
    } catch {
      setSave({ kind: 'error', message: 'Could not reach the server. Try again.' });
    }
  };

  if (load.kind === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-8 text-sm font-bold text-[#9CA3AF] shadow-sm">
        <Loader2 size={18} className="animate-spin text-[#4A3AFF]" /> Loading your profile…
      </div>
    );
  }

  if (load.kind === 'error') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600">
        <AlertCircle size={18} className="mt-0.5 shrink-0" /> {load.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isNew && (
        <div className="rounded-xl border border-[#4A3AFF]/20 bg-[#4A3AFF]/5 p-5">
          <div className="flex items-center gap-2 text-[#4A3AFF]">
            <BadgeCheck size={18} />
            <h3 className="text-base font-bold">Finish setting up your agent profile</h3>
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">
            This is the last step before you can publish listings and receive leads. We&apos;ve pre-filled what we can from your sign-up.
          </p>
        </div>
      )}

      {demoMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          Preview mode: the database isn&apos;t connected, so changes here won&apos;t be saved permanently yet.
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <User size={18} className="text-[#4A3AFF]" />
          <h3 className="text-base font-bold text-[#1A1A2E]">Basic information</h3>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputField label="Full name" value={profile.name} onChange={(v) => update('name', v)} icon={<User size={14} />} placeholder="e.g. Lerato Mokoena" required />
          <InputField label="Agency" value={profile.agencyName} onChange={(v) => update('agencyName', v)} icon={<Building2 size={14} />} placeholder="e.g. Seeff (or your own name)" required />
          <InputField label="Phone" value={profile.phone} onChange={(v) => update('phone', v)} icon={<Phone size={14} />} type="tel" placeholder="+27 ..." required />
          <InputField label="WhatsApp" value={profile.whatsapp} onChange={(v) => update('whatsapp', v)} icon={<MessageCircle size={14} />} type="tel" placeholder="+27 ... (optional)" />
          <InputField label="Public email" value={profile.email} onChange={(v) => update('email', v)} icon={<Mail size={14} />} type="email" placeholder="you@agency.co.za (optional)" />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
            rows={3}
            placeholder="Tell buyers and tenants about your experience and the areas you know best…"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-[#4A3AFF]" />
          <h3 className="text-base font-bold text-[#1A1A2E]">Areas you serve</h3>
        </div>
        <p className="mt-1 text-sm text-[#6B7280]">Add the suburbs and cities where you work. These help buyers find you.</p>
        <div className="mt-4 flex gap-2">
          <input
            value={areaDraft}
            onChange={(e) => setAreaDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArea();
              }
            }}
            className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
            placeholder="e.g. Sandton"
          />
          <button
            type="button"
            onClick={addArea}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold text-[#4A3AFF] transition hover:border-[#4A3AFF]"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {profile.areasServed.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.areasServed.map((area) => (
              <span key={area} className="inline-flex items-center gap-1.5 rounded-full bg-[#4A3AFF]/10 px-3 py-1.5 text-xs font-bold text-[#4A3AFF]">
                {area}
                <button type="button" onClick={() => removeArea(area)} aria-label={`Remove ${area}`} className="text-[#4A3AFF]/60 transition hover:text-[#4A3AFF]">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          {save.kind === 'saved' && <span className="text-[#00C9A7]">✓ {save.message}</span>}
          {save.kind === 'error' && <span className="flex items-center gap-1.5 text-red-600"><AlertCircle size={15} /> {save.message}</span>}
          {save.kind === 'idle' && <span className="text-[#9CA3AF]">{canSave ? 'Ready to save.' : 'Name, agency, phone, and at least one area are required.'}</span>}
          {save.kind === 'saving' && <span className="flex items-center gap-1.5 text-[#4A3AFF]"><Loader2 size={15} className="animate-spin" /> Saving…</span>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || save.kind === 'saving'}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
        >
          <Save size={14} /> {isNew ? 'Create profile' : 'Save profile'}
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', icon, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
      {label} {required && <span className="text-[#4A3AFF]">*</span>}
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 focus-within:border-[#4A3AFF] focus-within:ring-2 focus-within:ring-[#4A3AFF]/10">
        {icon && <span className="text-[#9CA3AF]">{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder:font-semibold placeholder:text-[#9CA3AF]" />
      </div>
    </label>
  );
}
