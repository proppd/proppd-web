import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
