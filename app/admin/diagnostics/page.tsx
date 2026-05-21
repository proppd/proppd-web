import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AlertTriangle, Database, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { DiagnosticsClient } from '@/components/admin/diagnostics-client';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalDiagnostics } from '../../../lib/proppd/backend';

export const metadata: Metadata = {
  title: 'Backend diagnostics | Proppd',
  description: 'Live backend readiness, auth config, and database connectivity for Proppd.',
  alternates: { canonical: '/admin/diagnostics' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const diagnostics = await loadPortalDiagnostics();

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.5rem] bg-[#050A30] text-white shadow-sm">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-12">
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-[#12D6C5]">Backend diagnostics</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">See whether Proppd is ready for live listings, login, and lead persistence.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  This page shows the current database mode, browser auth config, and the live record counts the backend can read right now.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[.18em] text-white/60">Backend mode</p>
                <h2 className="mt-4 text-3xl font-black tracking-[-.05em]">{diagnostics.backendMode === 'database' ? 'Database connected' : 'Demo fallback'}</h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <StatCard label="Listings" value={diagnostics.listingCount ?? '—'} />
                  <StatCard label="Leads" value={diagnostics.leadCount ?? '—'} />
                  <StatCard label="Agents" value={diagnostics.agentCount ?? '—'} />
                  <StatCard label="Agencies" value={diagnostics.agencyCount ?? '—'} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CheckCard icon={<Database size={20} />} label="Database URL" value={diagnostics.databaseConfigured ? 'Configured' : 'Missing'} tone={diagnostics.databaseConfigured ? 'good' : 'warn'} />
            <CheckCard icon={<Sparkles size={20} />} label="Browser auth" value={diagnostics.browserSupabaseConfigured ? 'Configured' : 'Missing'} tone={diagnostics.browserSupabaseConfigured ? 'good' : 'warn'} />
            <CheckCard icon={<ShieldCheck size={20} />} label="Service role" value={diagnostics.serviceRoleConfigured ? 'Configured' : 'Missing'} tone={diagnostics.serviceRoleConfigured ? 'good' : 'warn'} />
            <CheckCard icon={<Users size={20} />} label="Read access" value={diagnostics.canReadDatabase ? 'Healthy' : 'Blocked'} tone={diagnostics.canReadDatabase ? 'good' : 'warn'} />
          </div>

          {diagnostics.error ? (
            <div className="mt-8 rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle size={22} />
                <h2 className="text-xl font-black">Backend error</h2>
              </div>
              <p className="mt-3 text-sm font-bold leading-6">{diagnostics.error}</p>
            </div>
          ) : null}

          <DiagnosticsClient diagnostics={diagnostics} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-[.14em] text-white/60">{label}</p>
    </div>
  );
}

function CheckCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: 'good' | 'warn' }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl p-3 ${tone === 'good' ? 'bg-[#eefcf9] text-[#0f766e]' : 'bg-amber-50 text-amber-700'}`}>{icon}</div>
      <p className="mt-4 text-xs font-black uppercase tracking-[.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-[#050A30]">{value}</p>
    </div>
  );
}
