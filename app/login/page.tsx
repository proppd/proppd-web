import type React from 'react';
import { Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

export default function Page() {
  const supabase = getSupabaseBrowserConfig();

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Secure access</p>
            <h1 className="mt-4 text-5xl font-black tracking-[-.07em] sm:text-6xl">Agent and admin login.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Proppd uses passwordless Supabase magic links so verified agents and admins can access the control room without weak shared passwords.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <AccessCard icon={<ShieldCheck size={19} />} label="Passwordless" detail="One-time email links" />
              <AccessCard icon={<UserCheck size={19} />} label="Verified users" detail="No open sign-ups" />
              <AccessCard icon={<Mail size={19} />} label="Email first" detail="Access routed via inbox" />
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

            <div className="mt-5">
              <SupabaseLoginForm supabaseUrl={supabase?.url} publishableKey={supabase?.publishableKey} />
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

function AccessCard({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F7FA] p-4">
      <div className="inline-flex rounded-2xl bg-[#eefcf9] p-3 text-[#0f766e]">{icon}</div>
      <h2 className="mt-4 font-black">{label}</h2>
      <p className="mt-1 text-sm font-bold text-slate-500">{detail}</p>
    </div>
  );
}
