import { ShieldCheck } from 'lucide-react';

// Green "PPRA verified" badge shown on agents who have passed Property
// Practitioners Regulatory Authority / Fidelity Fund validation
// (agents.is_verified). A South African market first for a property portal.
export function PpraVerifiedBadge({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const sizing =
    size === 'sm' ? 'gap-1 px-2.5 py-1 text-[10px]' : 'gap-1.5 px-3 py-1.5 text-xs';
  const iconSize = size === 'sm' ? 12 : 15;

  return (
    <span
      title="Verified against the Property Practitioners Regulatory Authority (PPRA) — valid Fidelity Fund Certificate."
      className={`inline-flex items-center rounded-full border border-[#A7F3D0] bg-[#ECFDF5] font-bold uppercase tracking-[.12em] text-[#047857] ${sizing} ${className}`}
    >
      <ShieldCheck size={iconSize} className="text-[#059669]" aria-hidden="true" />
      PPRA verified
    </span>
  );
}
