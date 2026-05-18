import { Bath, BedDouble, Car, MapPin } from 'lucide-react';
import type { Listing } from '@/lib/demo-data';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
      <div className={`h-56 bg-gradient-to-br ${listing.gradient} p-5 text-white`}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#050A30]">{listing.purpose}</span>
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">Verified</span>
        </div>
        <div className="mt-20 rounded-3xl bg-white/12 p-4 backdrop-blur">
          <div className="text-xs font-bold uppercase tracking-[.18em] text-white/70">{listing.type}</div>
          <div className="mt-1 text-2xl font-black tracking-tight">{listing.price}</div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-black tracking-[-.03em] text-[#050A30]">{listing.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500"><MapPin size={16} /> {listing.location}</p>
        <div className="mt-5 flex gap-3 text-sm font-bold text-slate-700">
          <span className="flex items-center gap-1"><BedDouble size={17} /> {listing.beds}</span>
          <span className="flex items-center gap-1"><Bath size={17} /> {listing.baths}</span>
          <span className="flex items-center gap-1"><Car size={17} /> {listing.parking}</span>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
          {listing.agent} · {listing.agency}
        </div>
      </div>
    </article>
  );
}
