import type { Metadata } from 'next';
import { Mail, ShieldCheck, ArrowRight, Building2, BarChart3, Users } from 'lucide-react';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: 'Sign in | Proppd',
  description: 'Sign in to manage your listings, track leads, and access your agent dashboard.',
  alternates: { canonical: '/login' },
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
              Welcome back
            </h1>
            <p className="mt-4 max-w-lg text-lg text-[#6B7280]">
              Sign in to manage your listings, track leads, and access your agent dashboard.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon={<Building2 size={20} />}
                title="Listings"
                text="Create, edit, and publish property listings."
              />
              <FeatureCard
                icon={<BarChart3 size={20} />}
                title="Dashboard"
                text="Track views, leads, and performance."
              />
              <FeatureCard
                icon={<Users size={20} />}
                title="Leads"
                text="Manage enquiries and follow up fast."
              />
            </div>

            <div className="mt-10 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#1A1A2E]">Secure, passwordless login</h3>
              </div>
              <p className="mt-2 text-sm text-[#6B7280]">
                We send a one-time login link to your email. No passwords to remember, no weak credentials to steal.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#2563EB]">Magic link</span>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-bold text-[#6B7280]">Invite-only</span>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-bold text-[#6B7280]">No passwords</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-bold text-[#9CA3AF]">New to Proppd?</p>
              <a
                href="/list-with-us"
                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
              >
                Apply to list your agency <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Right — login form */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#1A1A2E]">Sign in to your account</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Enter the email linked to your Proppd agent or agency profile.
            </p>

            <div className="mt-6">
              <SupabaseLoginForm
                supabaseUrl={supabase?.url}
                publishableKey={supabase?.publishableKey}
                nextPath="/dashboard"
              />
            </div>

            <div className="mt-6 border-t border-[#E5E7EB] pt-6">
              <p className="text-sm font-bold text-[#1A1A2E]">Don&apos;t have an account?</p>
              <a
                href="/signup"
                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
              >
                Create account <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-bold text-[#1A1A2E]">{title}</h3>
      <p className="mt-1 text-xs text-[#6B7280]">{text}</p>
    </div>
  );
}
