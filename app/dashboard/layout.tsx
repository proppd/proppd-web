import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
