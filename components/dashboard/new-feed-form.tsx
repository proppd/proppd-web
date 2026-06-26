'use client';

import { useState } from 'react';
import { Loader2, X, Rss } from 'lucide-react';
import type { FeedSourceRecord } from '@/lib/proppd/backend';

type Props = {
  onCreated: (feed: FeedSourceRecord) => void;
};

export function NewFeedButton({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
      >
        <Rss size={15} /> Add feed
      </button>

      {open && (
        <NewFeedModal
          onCreated={(feed) => { setOpen(false); onCreated(feed); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function NewFeedModal({ onCreated, onClose }: { onCreated: (f: FeedSourceRecord) => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('');
  const [recordTag, setRecordTag] = useState('');
  const [frequencyMinutes, setFrequencyMinutes] = useState('1440');
  const [defaultStatus, setDefaultStatus] = useState('pending_review');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch('/api/dashboard/feeds', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        url: url.trim(),
        format: format || null,
        recordTag: recordTag.trim() || null,
        frequencyMinutes: Number(frequencyMinutes),
        defaultStatus,
        isActive: true,
      }),
    });

    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(json.error ?? 'Failed to create feed.'); return; }
    onCreated(json.item as FeedSourceRecord);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl overflow-y-auto max-h-[90dvh]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Feed sources</p>
            <h2 className="text-lg font-bold text-[#1A1A2E]">Add feed</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-[#1A1A2E]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Feed name *">
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main stock feed"
              className={inputCls}
            />
          </Field>

          <Field label="Feed URL *">
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://feeds.youragency.co.za/listings.xml"
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-[#9CA3AF]">Must be a public https URL. Paste the listing feed link from your CRM or website export.</p>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Format">
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputCls}>
                <option value="">Auto-detect</option>
                <option value="xml">XML</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </Field>
            <Field label="Pull every">
              <select value={frequencyMinutes} onChange={(e) => setFrequencyMinutes(e.target.value)} className={inputCls}>
                <option value="60">Every hour</option>
                <option value="360">Every 6 hours</option>
                <option value="720">Every 12 hours</option>
                <option value="1440">Daily (recommended)</option>
                <option value="10080">Weekly</option>
              </select>
            </Field>
          </div>

          <Field label="XML record tag (optional)">
            <input
              value={recordTag}
              onChange={(e) => setRecordTag(e.target.value)}
              placeholder="e.g. Property or Listing"
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-[#9CA3AF]">Only needed for XML feeds with a non-standard root element.</p>
          </Field>

          <Field label="Import listings as">
            <select value={defaultStatus} onChange={(e) => setDefaultStatus(e.target.value)} className={inputCls}>
              <option value="pending_review">Pending review</option>
              <option value="available">Available (publish immediately)</option>
              <option value="draft">Draft</option>
            </select>
          </Field>

          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-bold text-[#6B7280] hover:border-[#4A3AFF]/30 hover:text-[#4A3AFF] disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim() || !url.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#4A3AFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Add feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-[#374151]">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-semibold text-[#1A1A2E] outline-none placeholder:text-[#D1D5DB] focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF]/20';
