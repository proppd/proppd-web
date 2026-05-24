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
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Support bundle</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Copy or download a ready-to-send backend snapshot</h2>
          </div>
          <div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyDiagnostics}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-[#3B49FF] hover:text-[#3B49FF]"
              >
                <ClipboardCopy size={16} className="mr-2" />
                {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy JSON'}
              </button>
              <button
                type="button"
                onClick={downloadDiagnostics}
                className="inline-flex items-center justify-center rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]"
              >
                <Download size={16} className="mr-2" />
                Download JSON
              </button>
            </div>
            <a className="mt-3 inline-flex text-sm font-black text-[#3B49FF]" href="/api/backend/status">
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

        <div className="mt-6 rounded-[1.5rem] bg-[#F5F7FA] p-5">
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Support note</p>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
            Send this JSON when login, database reads, or lead routing behave differently between local and deployed environments.
          </p>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Browser context</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-.04em]">What the browser sees right now</h2>
          <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-slate-600">
            <p>
              <span className="font-black text-[#050A30]">Online:</span> {browserState.online ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-black text-[#050A30]">Local storage:</span> {browserState.localStorageAvailable ? 'Available' : 'Unavailable'}
            </p>
            <p>
              <span className="font-black text-[#050A30]">Origin:</span> {browserState.origin}
            </p>
            <p>
              <span className="font-black text-[#050A30]">Path:</span> {browserState.pathname}
            </p>
          </div>
        </div>

        <div id="login-delivery-checklist" className="rounded-[2rem] bg-[#eefcf9] p-6 text-[#0f766e] shadow-sm">
          <p className="text-sm font-black uppercase tracking-[.2em]">Login delivery checklist</p>
          <ul className="mt-4 space-y-3 text-sm font-bold leading-6">
            <li>• Use the agency inbox that was invited for Proppd access.</li>
            <li>• Search spam, promotions, and other filtered folders.</li>
            <li>• If the link still does not arrive, copy the diagnostics JSON and send it with the inbox name.</li>
          </ul>
          <a className="mt-4 inline-flex text-sm font-black text-[#050A30]" href="mailto:info@proppd.com?subject=Proppd%20login%20delivery%20issue">
            Email login support
          </a>
        </div>

        <div className="rounded-[2rem] bg-[#050A30] p-6 text-white">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Export shape</p>
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
      ? 'bg-[#eefcf9] text-[#0f766e]'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-slate-700';

  return (
    <div className="rounded-[1.5rem] border border-slate-200 p-4">
      <div className={`inline-flex rounded-2xl p-3 ${toneClasses}`}>{icon}</div>
      <p className="mt-4 text-xs font-black uppercase tracking-[.16em] text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-black text-[#050A30]">{value}</p>
    </div>
  );
}
