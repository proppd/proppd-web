import type { Metadata } from 'next';
import { LegalPageTemplate } from '@/components/legal/legal-page';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { getLegalPage } from '@/lib/legal/policies';

export const metadata: Metadata = {
  title: {
    absolute: 'Terms of use | Proppd',
  },
  description: 'The operating terms for listings, enquiries, routing, onboarding, and pilot-stage features on Proppd.',
  alternates: { canonical: '/terms' },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />
      <LegalPageTemplate page={getLegalPage('terms')} />
      <SiteFooter />
    </main>
  );
}
