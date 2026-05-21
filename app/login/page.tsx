import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
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

export default function Page() {
  const supabase = getSupabaseBrowserConfig();

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-start">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Secure access</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black tracking-[-.07em] sm:text-6xl">Agent and admin login.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Proppd uses passwordless login links so verified agents and admins can access the control room without weak shared passwords.
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#eefcf9] px-4 py-2 text-sm font-black text-[#0f766e]">Admin bootstrap: info@proppd.com</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#eefcf9] px-4 py-2 text-sm font-black text-[#0f766e]">Invite-only access</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">Magic-link sign-in</span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">Admin-ready</span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <AccessCard icon={<ShieldCheck size={19} />} label="Passwordless" detail="One-time email links" />
              <AccessCard icon={<UserCheck size={19} />} label="Verified users" detail="No open sign-ups" />
              <AccessCard icon={<Mail size={19} />} label="Email first" detail="Access routed via inbox" />
            </div>

            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-[#F5F7FA] p-5">
              <p className="text-sm font-black uppercase tracking-[.16em] text-slate-500">Need access approved?</p>
              <p className="mt-2 max-w-xl text-sm font-bold leading-6 text-slate-600">
                Ask from your agency email and include the company name. We review new access manually before the login link is enabled.
              </p>
              <a className="mt-4 inline-flex rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]" href="mailto:info@proppd.com?subject=Proppd%20access%20request">
                Email info@proppd.com
              </a>
            </div>
          </div>

          <aside className="h-fit rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-7">
            <div className="rounded-[2rem] bg-[#050A30] p-6 text-white">
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#12D6C5]">Login link</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Access Proppd</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-white/70">
                Enter the email already invited to Proppd. New agency access is reviewed manually before login is enabled.
              </p>
            </div>

            {!supabase && (
              <div className="mt-5 rounded-[1.75rem] border border-[#c8f6ec] bg-[#eefcf9] p-5">
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#0f766e]">Local dev session</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#0f766e]">
                  On localhost without Supabase config, open a temporary admin session for <span className="font-black">info@proppd.com</span>.
                </p>
                <a className="mt-4 inline-flex rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3B49FF]" href="/auth/dev-admin?next=%2Fdashboard%2Flistings">
                  Open local admin session
                </a>
              </div>
            )}

            <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-[#F5F7FA] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#3B49FF]">Invite flow</p>
              <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-slate-600">
                <div className="flex gap-3"><span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#050A30]">1</span> Request the link from your agency inbox.</div>
                <div className="flex gap-3"><span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#050A30]">2</span> We manually review new access before activation.</div>
                <div className="flex gap-3"><span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#050A30]">3</span> Use the link to open your dashboard or listings workspace.</div>
              </div>
            </div>

            <div className="mt-5">
              <SupabaseLoginForm supabaseUrl={supabase?.url} publishableKey={supabase?.publishableKey} nextPath="/dashboard/listings" />
            </div>

            <p className="mt-5 text-sm font-bold leading-6 text-slate-500">
              Need an invite? Contact <a className="text-[#3B49FF]" href="mailto:info@proppd.com">info@proppd.com</a> from your agency email.
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
    <div className="rounded-3xl bg-[#F5F7FA] p-4">
      <div className="inline-flex rounded-2xl bg-[#eefcf9] p-3 text-[#0f766e]">{icon}</div>
      <h2 className="mt-4 font-black">{label}</h2>
      <p className="mt-1 text-sm font-bold text-slate-500">{detail}</p>
    </div>
  );
}
