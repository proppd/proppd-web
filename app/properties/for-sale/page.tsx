import { Bell, Search } from 'lucide-react';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';

export default function ForSalePage() {
  const saleListings = listings.filter((listing) => listing.purpose === 'For sale');
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-14 flex-1 items-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-500 shadow-sm">
            <Search size={21} className="text-[#3B49FF]" /> Search for-sale homes by suburb, city, or listing ID
          </label>
          <div className="flex flex-wrap gap-2">
            {['For sale', 'Price', 'Beds & baths', 'Home type'].map((item) => (
              <button key={item} className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-black shadow-sm">{item}</button>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">For sale</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">Homes for sale in South Africa</h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">Price-first cards, verified status, and quick facts for buyers.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#050A30] px-5 py-3 text-sm font-black text-white"><Bell size={15} /> Save search</button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {saleListings.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
