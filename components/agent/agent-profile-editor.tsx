'use client';

import { useState } from 'react';
import { Save, User, MapPin, Building2, Phone, Mail, Globe } from 'lucide-react';

interface AgentProfile {
  name: string;
  agency: string;
  area: string;
  phone: string;
  email: string;
  bio: string;
  website: string;
  specializations: string[];
}

const defaultProfile: AgentProfile = {
  name: 'Lerato Mokoena',
  agency: 'Seeff Property Group',
  area: 'Sandton',
  phone: '+27 11 234 5678',
  email: 'lerato@seeff.co.za',
  bio: 'Experienced property agent specialising in residential sales and rentals in the Sandton area. 10+ years of market knowledge.',
  website: 'https://seeff.co.za',
  specializations: ['Residential sales', 'Luxury homes', 'First-time buyers'],
};

const availableSpecializations = [
  'Residential sales', 'Commercial', 'Luxury homes', 'First-time buyers',
  'Investment properties', 'Rentals', 'Land', 'Industrial',
  'Sectional title', 'Transfer duty', 'Property management',
];

export function AgentProfileEditor() {
  const [profile, setProfile] = useState<AgentProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  const update = (field: keyof AgentProfile, value: string | string[]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleSpec = (spec: string) => {
    const current = profile.specializations;
    const updated = current.includes(spec) ? current.filter((s) => s !== spec) : [...current, spec];
    update('specializations', updated);
    setSaved(false);
  };

  const handleSave = () => {
    // In production, this would save to the database
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <User size={18} className="text-[#4A3AFF]" />
          <h3 className="text-base font-bold text-[#1A1A2E]">Basic information</h3>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputField label="Full name" value={profile.name} onChange={(v) => update('name', v)} icon={<User size={14} />} />
          <InputField label="Agency" value={profile.agency} onChange={(v) => update('agency', v)} icon={<Building2 size={14} />} />
          <InputField label="Service area" value={profile.area} onChange={(v) => update('area', v)} icon={<MapPin size={14} />} />
          <InputField label="Phone" value={profile.phone} onChange={(v) => update('phone', v)} icon={<Phone size={14} />} type="tel" />
          <InputField label="Email" value={profile.email} onChange={(v) => update('email', v)} icon={<Mail size={14} />} type="email" />
          <InputField label="Website" value={profile.website} onChange={(v) => update('website', v)} icon={<Globe size={14} />} />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5 text-sm text-[#1A1A2E] outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/10"
            rows={3}
            placeholder="Tell buyers and tenants about your experience..."
          />
        </div>
      </div>

      {/* Specializations */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#1A1A2E]">Specializations</h3>
        <p className="mt-1 text-sm text-[#6B7280]">Select the areas you specialise in.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {availableSpecializations.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => toggleSpec(spec)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                profile.specializations.includes(spec)
                  ? 'bg-[#4A3AFF] text-white'
                  : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#4A3AFF] hover:text-[#4A3AFF]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <p className={`text-sm font-bold ${saved ? 'text-[#00C9A7]' : 'text-[#9CA3AF]'}`}>
          {saved ? '✓ Profile saved' : 'Unsaved changes'}
        </p>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4A3AFF] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
        >
          <Save size={14} /> Save profile
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', icon }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
      {label}
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-2.5">
        {icon && <span className="text-[#9CA3AF]">{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none" />
      </div>
    </label>
  );
}
