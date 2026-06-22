'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ClipboardCopy, Download, Globe2, HardDrive, Wifi } from 'lucide-react';
import type { PortalBackendDiagnostics } from '@/lib/proppd/backend';

type BrowserState = {
  online: boolean;
  localStorageAvailable: boolean;
  origin: string;
  pathname: string;
};

const EMPTY_BROWSER_STATE: BrowserState = {
  online: false,
  localStorageAvailable: false,
  origin: '—',
  pathname: '—',
};

export function DiagnosticsClient({ diagnostics }: { diagnostics: PortalBackendDiagnostics }) {
  const [browserState, setBrowserState] = useState<BrowserState>(EMPTY_BROWSER_STATE);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const diagnosticsJson = useMemo(() => JSON.stringify(diagnostics, null, 2), [diagnostics]);

  useEffect(() => {
    const localStorageAvailable = probeLocalStorage();

    setBrowserState({
      online: navigator.onLine,
      localStorageAvailable,
      origin: window.location.origin,
      pathname: window.location.pathname,
    });

    const handleOnline = () => {
      setBrowserState((current) => ({ ...current, online: true }));
    };

    const handleOffline = () => {
      setBrowserState((current) => ({ ...current, online: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function copyDiagnostics() {
    try {
      await navigator.clipboard.writeText(diagnosticsJson);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  }

  function downloadDiagnostics() {
    const blob = new Blob([diagnosticsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'proppd-diagnostics.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Support bundle</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">Copy or download a ready-to-send backend snapshot</h2>
          </div>
          <div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyDiagnostics}
                className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
              >
                <ClipboardCopy size={16} className="mr-2" />
                {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy JSON'}
              </button>
              <button
                type="button"
                onClick={downloadDiagnostics}
 className="inline-flex items-center justify-center rounded-full bg-[#4A3AFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]"
              >
                <Download size={16} className="mr-2" />
                Download JSON
              </button>
            </div>
            <a className="mt-3 inline-flex text-sm font-bold text-[#4A3AFF]" href="/api/backend/status">
              Open JSON endpoint
            </a>
          </div>

          </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <InfoCard icon={<Wifi size={20} />} label="Online status" value={browserState.online ? 'Online' : 'Offline'} tone={browserState.online ? 'good' : 'warn'} />
          <InfoCard icon={<HardDrive size={20} />} label="Local storage" value={browserState.localStorageAvailable ? 'Available' : 'Unavailable'} tone={browserState.localStorageAvailable ? 'good' : 'warn'} />
          <InfoCard icon={<Globe2 size={20} />} label="Origin" value={browserState.origin} tone="neutral" />
          <InfoCard icon={<Globe2 size={20} />} label="Path" value={browserState.pathname} tone="neutral" />
        </div>

        <div className="mt-6 rounded-lg bg-[#F7F8FA] p-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9CA3AF]">Support note</p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">
            Send this JSON when login, database reads, or lead routing behave differently between local and deployed environments.
          </p>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-[#d7def4] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Readiness verdict</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">
            {diagnostics.canReadDatabase ? 'Ready for live reads' : 'Still in demo fallback'}
          </h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#6B7280]">
            {diagnostics.canReadDatabase
              ? 'The backend can read live records now, so listings, leads, agents, and agencies can move beyond seed data.'
              : 'The backend is not yet reading live records, so the page is showing fallback status instead of a production signal.'}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-bold uppercase tracking-[.14em] text-[#9CA3AF]">
            <div className="rounded-2xl bg-slate-50 px-3 py-4">
              <p className={diagnostics.databaseConfigured ? 'text-emerald-600' : 'text-amber-600'}>
                {diagnostics.databaseConfigured ? 'Configured' : 'Missing'}
              </p>
              <p className="mt-1">Database</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-4">
              <p className={diagnostics.browserSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}>
                {diagnostics.browserSupabaseConfigured ? 'Configured' : 'Missing'}
              </p>
              <p className="mt-1">Browser auth</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-4">
              <p className={diagnostics.serviceRoleConfigured ? 'text-emerald-600' : 'text-amber-600'}>
                {diagnostics.serviceRoleConfigured ? 'Configured' : 'Missing'}
              </p>
              <p className="mt-1">Service role</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-bold leading-6 text-[#6B7280]">
            {diagnostics.canReadDatabase
              ? 'No immediate blockers are visible from this check.'
              : 'To move this route into production mode, configure the database URL, browser auth, and service role settings.'}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Browser context</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">What the browser sees right now</h2>
          <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-[#6B7280]">
            <p>
              <span className="font-bold text-[#1A1A2E]">Online:</span> {browserState.online ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-bold text-[#1A1A2E]">Local storage:</span> {browserState.localStorageAvailable ? 'Available' : 'Unavailable'}
            </p>
            <p>
              <span className="font-bold text-[#1A1A2E]">Origin:</span> {browserState.origin}
            </p>
            <p>
              <span className="font-bold text-[#1A1A2E]">Path:</span> {browserState.pathname}
            </p>
          </div>
        </div>

        <div id="login-delivery-checklist" className="rounded-xl bg-[#EFF6FF] p-6 text-[#2563EB] shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[.2em]">Login delivery checklist</p>
          <ul className="mt-4 space-y-3 text-sm font-bold leading-6">
            <li>• Use the agency inbox that was invited for Proppd access.</li>
            <li>• Search spam, promotions, and other filtered folders.</li>
            <li>• If the link still does not arrive, copy the diagnostics JSON and send it with the inbox name.</li>
          </ul>
          <a className="mt-4 inline-flex text-sm font-bold text-[#1A1A2E]" href="mailto:info@proppd.com?subject=Proppd%20login%20delivery%20issue">
            Email login support
          </a>
        </div>

        <div className="rounded-xl proppd-panel p-6 ">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#2563EB]">Export shape</p>
          <ul className="mt-4 space-y-2 text-sm font-bold leading-6 text-white/70">
            <li>• Database configuration and read access.</li>
            <li>• Record counts for listings, leads, agents, and agencies.</li>
            <li>• Error message when backend reads fail.</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}

function probeLocalStorage() {
  try {
    const key = '__proppd_diag_probe__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function InfoCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: 'good' | 'warn' | 'neutral' }) {
  const toneClasses =
    tone === 'good'
      ? 'bg-[#EFF6FF] text-[#2563EB]'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-[#6B7280]';

  return (
    <div className="rounded-lg border border-[#E5E7EB] p-4">
      <div className={`inline-flex rounded-2xl p-3 ${toneClasses}`}>{icon}</div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-[#1A1A2E]">{value}</p>
    </div>
  );
}
