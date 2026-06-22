import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, Clock, BarChart3 } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { SignUpForm } from '@/components/auth/signup-form';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: { absolute: 'Request access | Proppd' },
  description: 'Request invite-only Proppd agency access and continue with a passwordless login link.',
  alternates: { canonical: '/signup' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = getSupabaseBrowserConfig();

  return (
    <main className="proppd-page">
      <SiteHeader />

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          {/* Left — value prop */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1A1A2E] sm:text-5xl">
              List your properties on Proppd
            </h1>
            <p className="mt-4 max-w-lg text-lg text-[#6B7280]">
              Request invite-only agency access to manage listings, track leads, and reach verified buyers and tenants.
            </p>

            <div className="mt-10 space-y-4">
              <Benefit
                icon={<ShieldCheck size={20} />}
                title="Verified listings"
                text="Every listing is checked for quality before going live."
              />
              <Benefit
                icon={<BarChart3 size={20} />}
                title="Track performance"
                text="See views, leads, and enquiries in your dashboard."
              />
              <Benefit
                icon={<Clock size={20} />}
                title="Fast review"
                text="Send the essentials now; approved users continue by secure login link."
              />
            </div>

            <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <p className="text-sm font-bold text-[#1A1A2E]">Already have an account?</p>
              <a href="/login" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
                Sign in <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Right — signup form */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]">Request agency access</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              We’ll send a passwordless link if your email is already approved for Proppd.
            </p>

            <div className="mt-6">
              <SignUpForm
                supabaseUrl={supabase?.url}
                publishableKey={supabase?.publishableKey}
              />
            </div>

            <p className="mt-6 text-xs text-[#9CA3AF]">
              By requesting access you agree to our{' '}
              <a href="/terms" className="font-bold text-[#4A3AFF]">Terms</a> and{' '}
              <a href="/privacy" className="font-bold text-[#4A3AFF]">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#1A1A2E]">{title}</h3>
        <p className="mt-0.5 text-sm text-[#6B7280]">{text}</p>
      </div>
    </div>
  );
}
