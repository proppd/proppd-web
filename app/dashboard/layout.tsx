import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F8FA]">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <DashboardNav />
        <div className="min-w-0">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
