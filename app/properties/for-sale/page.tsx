import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';

export default function ForSalePage() {
  const saleListings = listings.filter((listing) => listing.purpose === 'For sale');
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">For sale</p><h1 className="mt-3 text-5xl font-black tracking-[-.07em] sm:text-6xl">Property for sale</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">A clean, SEO-ready route for sale listings, ready to connect to Supabase search.</p><div className="mt-9 grid gap-6 lg:grid-cols-3">{saleListings.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}</div></div></section>
      <SiteFooter />
    </main>
  );
}
