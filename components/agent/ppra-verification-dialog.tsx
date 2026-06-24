'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export function PpraVerificationDialog({
  agentName,
  ffcNumber,
  size = 'md',
  className = '',
}: {
  agentName: string;
  ffcNumber: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const sizing = size === 'sm' ? 'gap-1 px-2.5 py-1 text-[10px]' : 'gap-1.5 px-3 py-1.5 text-xs';
  const iconSize = size === 'sm' ? 12 : 15;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Click to view PPRA verification details"
        className={`inline-flex cursor-pointer items-center rounded-full border border-[#A7F3D0] bg-[#ECFDF5] font-bold uppercase tracking-[.12em] text-[#047857] transition hover:border-[#6EE7B7] hover:bg-[#D1FAE5] ${sizing} ${className}`}
        aria-haspopup="dialog"
      >
        <ShieldCheck size={iconSize} className="text-[#059669]" aria-hidden="true" />
        PPRA verified
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

          {/* Dialog */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ppra-dialog-title"
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#059669]" aria-hidden="true" />
                <span id="ppra-dialog-title" className="font-bold text-[#1A1A2E]">PPRA Verification</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#1A1A2E]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#059669]">Agent name</p>
                <p className="mt-1 text-lg font-bold text-[#1A1A2E]">{agentName}</p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#059669]">Fidelity Fund Certificate</p>
                <p className="mt-1 font-mono text-base font-bold tracking-wider text-[#1A1A2E]">{ffcNumber}</p>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#6B7280]">
                This agent holds a valid Fidelity Fund Certificate issued by the Property Practitioners Regulatory Authority (PPRA). The certificate number above can be cross-checked on the PPRA register.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#047857]">
                <ShieldCheck size={11} className="text-[#059669]" aria-hidden="true" /> South Africa&apos;s first verified portal
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[#1A1A2E] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4A3AFF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
