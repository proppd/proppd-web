import Link from 'next/link';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';

export default function NotFound() {
  return (
    <main className="proppd-page">
      <SiteHeader />
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <p className="text-8xl font-bold tracking-tight text-[#4A3AFF]/10 sm:text-9xl">404</p>
        <h1 className="mt-4 text-3xl font-bold text-[#1A1A2E] sm:text-4xl">Page not found</h1>
        <p className="mt-3 max-w-md text-base text-[#6B7280]">
          The page you're looking for doesn't exist or has been moved. Try searching for a property or browsing our listings.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/properties"
            className="rounded-lg bg-[#4A3AFF] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
          >
            Browse properties
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF]"
          >
            Go home
          </Link>
        </div>
        <div className="mt-10 grid max-w-sm grid-cols-3 gap-4 text-sm">
          <Link href="/properties/for-sale" className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
            Buy
          </Link>
          <Link href="/properties/to-rent" className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
            Rent
          </Link>
          <Link href="/agents" className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]">
            Agents
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
