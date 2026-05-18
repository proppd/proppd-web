import { notFound } from 'next/navigation';
import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) notFound();
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px]"><div><ListingCard listing={listing} /><div className="mt-6 rounded-[2rem] bg-white p-7 shadow-sm"><h1 className="text-3xl font-black tracking-[-.05em]">{listing.title}</h1><p className="mt-4 leading-8 text-slate-600">Demo listing detail route. Next slice will add gallery, full facts, features, map-ready location, structured data, and POPIA enquiry capture.</p></div></div><aside className="rounded-[2rem] bg-white p-7 shadow-sm"><p className="text-sm font-black uppercase tracking-[.18em] text-[#3B49FF]">Enquire</p><h2 className="mt-3 text-2xl font-black">Contact {listing.agent}</h2><p className="mt-3 text-sm leading-6 text-slate-600">Lead form stub ready for Supabase integration.</p><a className="mt-6 inline-flex w-full justify-center rounded-full bg-[#050A30] px-5 py-3 font-black text-white" href={`mailto:info@proppd.com?subject=Enquiry: ${listing.title}`}>Email enquiry</a></aside></div></section>
      <SiteFooter />
    </main>
  );
}
