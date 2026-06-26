'use client';

import { useState } from 'react';
import {
  CheckCircle2, XCircle, Clock, Loader2, RefreshCw, Trash2, Pencil,
  AlertTriangle, Rss, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { FeedSourceRecord } from '@/lib/proppd/backend';
import { NewFeedButton } from './new-feed-form';

type Props = {
  initialFeeds: FeedSourceRecord[];
};

type SyncState = { kind: 'idle' } | { kind: 'syncing' } | { kind: 'done'; result: SyncResult };
type SyncResult = { ok: boolean; created?: number; updated?: number; failed?: number; invalid?: number; error?: string };

export function FeedSourcesList({ initialFeeds }: Props) {
  const [feeds, setFeeds] = useState<FeedSourceRecord[]>(initialFeeds);

  function handleCreated(feed: FeedSourceRecord) {
    setFeeds((prev) => [feed, ...prev]);
  }

  function handleUpdated(feed: FeedSourceRecord) {
    setFeeds((prev) => prev.map((f) => (f.id === feed.id ? feed : f)));
  }

  function handleDeleted(id: string) {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-[#6B7280]">
          {feeds.length === 0
            ? 'No feed sources configured yet.'
            : `${feeds.length} feed source${feeds.length === 1 ? '' : 's'}`}
        </p>
        <NewFeedButton onCreated={handleCreated} />
      </div>

      {feeds.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#E5E7EB] py-14 text-center">
          <Rss size={32} className="text-[#D1D5DB]" />
          <p className="text-sm font-bold text-[#6B7280]">No feeds yet</p>
          <p className="max-w-xs text-xs text-[#9CA3AF]">
            Add your listing feed URL and Proppd will pull your stock
            automatically on your chosen schedule.
          </p>
          <div className="mt-2">
            <NewFeedButton onCreated={handleCreated} />
          </div>
        </div>
      )}

      {feeds.length > 0 && (
        <div className="mt-4 space-y-3">
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual feed card
// ---------------------------------------------------------------------------

function FeedCard({
  feed: initialFeed,
  onUpdated,
  onDeleted,
}: {
  feed: FeedSourceRecord;
  onUpdated: (feed: FeedSourceRecord) => void;
  onDeleted: (id: string) => void;
}) {
  const [feed, setFeed] = useState(initialFeed);
  const [expanded, setExpanded] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>({ kind: 'idle' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function triggerSync() {
    setSyncState({ kind: 'syncing' });
    setActionError(null);
    const res = await fetch(`/api/dashboard/feeds/${feed.id}/sync`, { method: 'POST' });
    const json = await res.json().catch(() => ({}));
    // Refresh the feed record to get updated last_run_at etc.
    const refetch = await fetch(`/api/dashboard/feeds`).then((r) => r.json()).catch(() => null);
    if (refetch?.items) {
      const updated = (refetch.items as FeedSourceRecord[]).find((f) => f.id === feed.id);
      if (updated) { setFeed(updated); onUpdated(updated); }
    }
    setSyncState({ kind: 'done', result: json });
  }

  async function toggleActive() {
    setActionError(null);
    const res = await fetch(`/api/dashboard/feeds/${feed.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isActive: !feed.isActive }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setActionError(json.error ?? 'Failed to update feed.'); return; }
    setFeed(json.item as FeedSourceRecord);
    onUpdated(json.item as FeedSourceRecord);
  }

  async function handleDelete() {
    const res = await fetch(`/api/dashboard/feeds/${feed.id}`, { method: 'DELETE' });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setActionError(j.error ?? 'Failed to delete.'); return; }
    onDeleted(feed.id);
  }

  function handleUpdated(updated: FeedSourceRecord) {
    setFeed(updated);
    onUpdated(updated);
    setEditing(false);
  }

  const syncing = syncState.kind === 'syncing';

  return (
    <div className={`rounded-xl border bg-white shadow-sm transition-all ${feed.isActive ? 'border-[#E5E7EB]' : 'border-[#E5E7EB] opacity-70'}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${feed.isActive ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              {feed.isActive ? 'Active' : 'Paused'}
            </span>
            <FormatBadge format={feed.format} />
            <FrequencyLabel minutes={feed.frequencyMinutes} />
          </div>
          <p className="mt-1.5 text-base font-bold text-[#1A1A2E]">{feed.name}</p>
          <p className="mt-0.5 max-w-full truncate text-xs text-[#9CA3AF]">{feed.url}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={triggerSync}
            disabled={syncing}
            title="Sync now"
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#2563EB] disabled:opacity-50"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
          <button
            type="button"
            onClick={() => { setEditing(true); setExpanded(true); }}
            title="Edit feed"
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#4A3AFF]"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6]"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Last sync status strip */}
      <SyncStatusStrip feed={feed} lastSyncResult={syncState.kind === 'done' ? syncState.result : null} />

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#F3F4F6] p-5 space-y-4">
          {editing ? (
            <EditFeedForm
              feed={feed}
              onUpdated={handleUpdated}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <InfoRow label="Default status" value={feed.defaultStatus.replace(/_/g, ' ')} />
                {feed.recordTag && <InfoRow label="XML record tag" value={feed.recordTag} />}
                <InfoRow label="Agency" value={feed.agencyName ?? feed.agencyId} />
                <InfoRow label="Added" value={new Date(feed.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </div>

              {feed.lastMessage && (
                <div className={`rounded-lg px-3 py-2 text-xs ${feed.lastStatus === 'ok' ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#FEF2F2] text-[#991B1B]'}`}>
                  {feed.lastMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F3F4F6] pt-3">
                <button
                  type="button"
                  onClick={toggleActive}
                  className="text-xs font-bold text-[#6B7280] hover:text-[#4A3AFF]"
                >
                  {feed.isActive ? 'Pause feed' : 'Resume feed'}
                </button>

                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">Delete this feed?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs font-bold text-[#9CA3AF] hover:text-[#4A3AFF]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9CA3AF] hover:text-red-600"
                  >
                    <Trash2 size={13} /> Delete feed
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {actionError && (
        <p className="px-5 pb-3 text-xs font-bold text-red-600">{actionError}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sync status strip (below header, above expanded)
// ---------------------------------------------------------------------------

function SyncStatusStrip({ feed, lastSyncResult }: { feed: FeedSourceRecord; lastSyncResult: SyncResult | null }) {
  if (lastSyncResult) {
    return (
      <div className={`flex items-center gap-2 border-t px-5 py-2.5 text-xs font-bold ${lastSyncResult.ok ? 'border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]' : 'border-[#FEE2E2] bg-[#FEF2F2] text-[#991B1B]'}`}>
        {lastSyncResult.ok
          ? <><CheckCircle2 size={13} /> Sync complete — created {lastSyncResult.created ?? 0}, updated {lastSyncResult.updated ?? 0}{lastSyncResult.invalid ? `, ${lastSyncResult.invalid} skipped` : ''}</>
          : <><XCircle size={13} /> Sync failed — {lastSyncResult.error ?? 'unknown error'}</>
        }
      </div>
    );
  }

  if (!feed.lastRunAt) {
    return (
      <div className="flex items-center gap-2 border-t border-[#F3F4F6] px-5 py-2.5 text-xs text-[#9CA3AF]">
        <Clock size={13} /> Never synced
      </div>
    );
  }

  const when = new Date(feed.lastRunAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex items-center gap-2 border-t px-5 py-2.5 text-xs font-bold ${feed.lastStatus === 'ok' ? 'border-[#F3F4F6] text-[#6B7280]' : 'border-[#FEE2E2] bg-[#FEF2F2] text-[#991B1B]'}`}>
      {feed.lastStatus === 'ok'
        ? <><CheckCircle2 size={13} className="text-[#10B981]" /> Last synced {when} — {feed.lastMessage}</>
        : <><AlertTriangle size={13} /> Last sync failed {when} — {feed.lastMessage}</>
      }
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline edit form
// ---------------------------------------------------------------------------

function EditFeedForm({
  feed, onUpdated, onCancel,
}: {
  feed: FeedSourceRecord;
  onUpdated: (f: FeedSourceRecord) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(feed.name);
  const [url, setUrl] = useState(feed.url);
  const [format, setFormat] = useState(feed.format ?? '');
  const [frequencyMinutes, setFrequencyMinutes] = useState(String(feed.frequencyMinutes));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/dashboard/feeds/${feed.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name,
        url,
        format: format || null,
        frequencyMinutes: Number(frequencyMinutes),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(json.error ?? 'Failed to save.'); return; }
    onUpdated(json.item as FeedSourceRecord);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Edit feed</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FeedField label="Feed name *">
          <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} />
        </FeedField>
        <FeedField label="Pull every">
          <select value={frequencyMinutes} onChange={(e) => setFrequencyMinutes(e.target.value)} className={fieldCls}>
            {FREQUENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </FeedField>
      </div>
      <FeedField label="Feed URL *">
        <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={fieldCls} />
      </FeedField>
      <FeedField label="Format">
        <select value={format} onChange={(e) => setFormat(e.target.value)} className={fieldCls}>
          <option value="">Auto-detect</option>
          <option value="xml">XML</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </FeedField>
      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#6B7280] hover:text-[#4A3AFF] disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#4A3AFF] px-3 py-2 text-xs font-bold text-white hover:bg-[#3A2AE0] disabled:opacity-50">
          {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function FormatBadge({ format }: { format: string | null }) {
  const label = format ? format.toUpperCase() : 'Auto';
  return (
    <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB]">{label}</span>
  );
}

function FrequencyLabel({ minutes }: { minutes: number }) {
  const opt = FREQUENCY_OPTIONS.find((o) => Number(o.value) === minutes);
  return (
    <span className="text-xs text-[#9CA3AF]">{opt?.label ?? `every ${minutes}m`}</span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{label}</span>
      <span className="mt-0.5 block font-semibold text-[#374151] capitalize">{value}</span>
    </div>
  );
}

function FeedField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-[#374151]">{label}</span>
      {children}
    </label>
  );
}

const FREQUENCY_OPTIONS = [
  { value: '60', label: 'Every hour' },
  { value: '360', label: 'Every 6 hours' },
  { value: '720', label: 'Every 12 hours' },
  { value: '1440', label: 'Daily' },
  { value: '10080', label: 'Weekly' },
];

const fieldCls =
  'w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-[#1A1A2E] outline-none placeholder:text-[#D1D5DB] focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF]/20';
