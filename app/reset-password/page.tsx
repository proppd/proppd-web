import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export const metadata: Metadata = {
  title: 'Reset password | Proppd',
  description: 'Set a new password for your Proppd account.',
  alternates: { canonical: '/reset-password' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_.9fr] lg:items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1A1A2E] sm:text-5xl">Reset your password</h1>
            <p className="mt-4 max-w-lg text-lg text-[#6B7280]">
              You followed a secure reset link. Choose a new password and you&apos;ll be signed straight into your dashboard.
            </p>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#00C9A7]" />
              <p className="text-sm text-[#6B7280]">
                For your security, reset links expire after a short time and can only be used once. If yours has expired, request a new one from the sign-in screen.
              </p>
            </div>
          </div>
          <ResetPasswordForm />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
