'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

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

  const imgSize = size === 'sm' ? 44 : 72;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Click to view PPRA verification details"
        className={`inline-flex cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
        aria-haspopup="dialog"
      >
        <Image
          src="/ppra-verified-badge.png"
          alt="Agent Verified by the PPRA — click for details"
          width={imgSize}
          height={imgSize}
          className="drop-shadow-md"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ppra-dialog-title"
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Green header with badge */}
            <div className="relative flex flex-col items-center bg-gradient-to-b from-[#166534] to-[#15803d] px-6 pb-8 pt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <Image
                src="/ppra-verified-badge.png"
                alt="Agent Verified by the PPRA"
                width={100}
                height={100}
                className="drop-shadow-xl"
              />
              <h2 id="ppra-dialog-title" className="mt-3 text-center text-lg font-bold text-white">
                PPRA Verified Agent
              </h2>
              <p className="mt-1 text-center text-xs font-semibold text-white/70">
                Property Practitioners Regulatory Authority
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="grid gap-4">
                <div className="rounded-xl bg-[#F0FDF4] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#16a34a]">Agent name</p>
                  <p className="mt-1 text-lg font-bold text-[#1A1A2E]">{agentName}</p>
                </div>
                <div className="rounded-xl bg-[#F0FDF4] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#16a34a]">Fidelity Fund Certificate</p>
                  <p className="mt-1 font-mono text-base font-bold tracking-wider text-[#1A1A2E]">{ffcNumber}</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#6B7280]">
                This agent holds a valid Fidelity Fund Certificate issued by the PPRA. You can cross-check this number on the official PPRA register at <span className="font-semibold text-[#15803d]">ppra.org.za</span>.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9CA3AF]">www.proppd.com</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[#15803d] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#166534]"
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
