import { ListingCard } from '@/components/properties/listing-card';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { listings } from '@/lib/demo-data';

export default function PropertiesPage() {
  return <PropertyIndex title="Search property in South Africa" subtitle="Browse verified sale and rental opportunities while the Proppd MVP data layer comes online." items={listings} />;
}

function PropertyIndex({ title, subtitle, items }: { title: string; subtitle: string; items: typeof listings }) {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Property search</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-[-.07em] sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{subtitle}</p>
          <div className="mt-8 grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-4">
            {['Location', 'Property type', 'Price range', 'Bedrooms'].map((filter) => <div key={filter} className="rounded-full bg-[#F5F7FA] px-5 py-3 text-sm font-bold text-slate-500">{filter}</div>)}
          </div>
          <div className="mt-9 grid gap-6 lg:grid-cols-3">
            {items.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
