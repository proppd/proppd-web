import { Bath, BedDouble, Car, Heart, MapPin, ShieldCheck } from 'lucide-react';
import type { Listing } from '@/lib/demo-data';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
      <a href={`/property/${listing.slug}`} className="block">
        <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${listing.gradient} p-4 text-white`}>
          <img
            src={listing.photos[0]?.src}
            alt={listing.photos[0]?.alt ?? listing.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,48,.18)_0%,rgba(5,10,48,.08)_38%,rgba(5,10,48,.82)_100%)]" />
          <div className="relative flex items-center justify-between">
            <span className="rounded-md bg-white px-3 py-1 text-xs font-black uppercase tracking-[.08em] text-[#050A30] shadow-sm">{listing.purpose}</span>
            <button aria-label="Save property" className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-[#050A30] shadow-sm transition group-hover:text-[#3B49FF]">
              <Heart size={19} />
            </button>
          </div>
          <div className="relative mt-24 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-[#12D6C5] px-3 py-1 text-xs font-black text-[#050A30]"><ShieldCheck size={13} /> Verified</div>
              <div className="mt-2 text-3xl font-black tracking-[-.04em] drop-shadow-sm">{listing.price}</div>
            </div>
            <span className="rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-xs font-black backdrop-blur">1 / {listing.photos.length}</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 text-sm font-black text-[#050A30]">
            <span className="flex items-center gap-1"><BedDouble size={17} /> {listing.beds}</span>
            <span className="flex items-center gap-1"><Bath size={17} /> {listing.baths}</span>
            <span className="flex items-center gap-1"><Car size={17} /> {listing.parking}</span>
            <span className="text-slate-500">{listing.type}</span>
          </div>
          <h3 className="mt-3 line-clamp-2 text-lg font-black leading-snug tracking-[-.02em] text-[#050A30]">{listing.title}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500"><MapPin size={15} /> {listing.location}</p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="font-bold text-slate-600">{listing.agency}</span>
            <span className="font-black text-[#3B49FF]">View details</span>
          </div>
        </div>
      </a>
    </article>
  );
}
