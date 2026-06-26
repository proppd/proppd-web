'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export function ListingVerifyToggle({ slug, initialVerified }: { slug: string; initialVerified: boolean }) {
  const [verified, setVerified] = useState(initialVerified);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/listings/${slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !verified }),
      });
      if (res.ok) setVerified((v) => !v);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={verified ? 'Remove verification' : 'Mark as verified'}
      className={`rounded-lg p-2 transition ${
        verified
          ? 'bg-[#DCFCE7] text-[#166534] hover:bg-red-50 hover:text-red-600'
          : 'text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#166534]'
      } disabled:opacity-50`}
    >
      {verified ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
    </button>
  );
}
