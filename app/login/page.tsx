import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadPortalDiagnostics } from '@/lib/proppd/backend';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: {
    absolute: 'Agent login | Proppd',
  },
  description: 'Invite-only login for verified Proppd agents and admins.',
  alternates: {
    canonical: '/login',
  },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = getSupabaseBrowserConfig();
  const diagnostics = await loadPortalDiagnostics();

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-start">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Secure access</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-bold tracking-[-.07em] sm:text-6xl">Agent and admin login.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B7280]">
              Proppd uses passwordless login links so verified agents and admins can access the control room without weak shared passwords.
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#E6FBF7] px-4 py-2 text-sm font-bold text-[#00C9A7]">Admin bootstrap: info@proppd.com</p>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#9CA3AF]">
              First admins use the bootstrap inbox above; everyone else signs in with the invited agency email that received the magic link.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#E6FBF7] px-4 py-2 text-sm font-bold text-[#00C9A7]">Invite-only access</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-[#6B7280]">Magic-link sign-in</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-[#6B7280]">Admin-ready</span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <AccessCard icon={<ShieldCheck size={19} />} label="Passwordless" detail="One-time email links" />
              <AccessCard icon={<UserCheck size={19} />} label="Verified users" detail="No open sign-ups" />
              <AccessCard icon={<Mail size={19} />} label="Email first" detail="Access routed via inbox" />
            </div>

            <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <p className="text-sm font-bold uppercase tracking-[.16em] text-[#9CA3AF]">Need access approved?</p>
              <p className="mt-2 max-w-xl text-sm font-bold leading-6 text-[#6B7280]">
                Ask from your agency email and include the company name. We review new access manually before the login link is enabled.
              </p>
              <a className="mt-4 inline-flex rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]" href="mailto:info@proppd.com?subject=Proppd%20access%20request">
                Email info@proppd.com
              </a>
            </div>
          </div>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm sm:p-7">
            <div className="rounded-xl bg-[#1A1A2E] p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-[#00C9A7]">Login link</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Access Proppd</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-white/70">
                Enter the email already invited to Proppd. New agency access is reviewed manually before login is enabled.
              </p>
            </div>

            {!supabase && (
              <div className="mt-5 rounded-[1.75rem] border border-[#c8f6ec] bg-[#E6FBF7] p-5">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#00C9A7]">Local dev session</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#00C9A7]">
                  On localhost without Supabase config, open a temporary admin session for <span className="font-bold">info@proppd.com</span>.
                </p>
                <a className="mt-4 inline-flex rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]" href="/auth/dev-admin?next=%2Fdashboard%2Flistings">
                  Open local admin session
                </a>
              </div>
            )}

            <div className="mt-5 rounded-[1.75rem] border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4A3AFF]">Invite flow</p>
              <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-[#6B7280]">
                <div className="flex gap-3"><span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1A1A2E]">1</span> Request the link from your agency inbox.</div>
                <div className="flex gap-3"><span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1A1A2E]">2</span> We manually review new access before activation.</div>
                <div className="flex gap-3"><span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1A1A2E]">3</span> Use the link to open your dashboard or listings workspace.</div>
              </div>
            </div>

            <div className="mt-5">
              <SupabaseLoginForm supabaseUrl={supabase?.url} publishableKey={supabase?.publishableKey} nextPath="/dashboard/listings" />
            </div>

            <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9CA3AF]">Live backend check</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill label="Backend" value={diagnostics.backendMode === 'database' ? 'Connected' : 'Demo fallback'} tone={diagnostics.backendMode === 'database' ? 'good' : 'warn'} />
                <StatusPill label="Auth" value={diagnostics.browserSupabaseConfigured ? 'Configured' : 'Missing'} tone={diagnostics.browserSupabaseConfigured ? 'good' : 'warn'} />
                <StatusPill label="Service role" value={diagnostics.serviceRoleConfigured ? 'Configured' : 'Missing'} tone={diagnostics.serviceRoleConfigured ? 'good' : 'warn'} />
              </div>
              <a className="mt-3 inline-flex text-sm font-bold text-[#4A3AFF]" href="/admin/diagnostics#login-delivery-checklist">
                Open login delivery checklist
              </a>
            </div>

            <p className="mt-5 text-sm font-bold leading-6 text-[#9CA3AF]">
              Need an invite? Contact <a className="text-[#4A3AFF]" href="mailto:info@proppd.com">info@proppd.com</a> from your agency email.
            </p>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function AccessCard({ icon, label, detail }: { icon: ReactNode; label: string; detail: string }) {
  return (
    <div className="rounded-3xl bg-[#F7F8FA] p-4">
      <div className="inline-flex rounded-2xl bg-[#E6FBF7] p-3 text-[#00C9A7]">{icon}</div>
      <h2 className="mt-4 font-bold">{label}</h2>
      <p className="mt-1 text-sm font-bold text-[#9CA3AF]">{detail}</p>
    </div>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[.12em] ${tone === 'good' ? 'bg-[#E6FBF7] text-[#00C9A7]' : 'bg-amber-50 text-amber-700'}`}>
      <span className="text-[10px] font-bold opacity-70">{label}</span>
      <span className="text-[10px] font-bold">{value}</span>
    </div>
  );
}
