'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Photo {
  src: string;
  alt: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  startIndex?: number;
}

export function PhotoLightbox({ photos, startIndex = 0 }: PhotoLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowLeft') setIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
      if (e.key === 'ArrowRight') setIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, photos.length]);

  if (!photos.length) return null;

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setIndex(startIndex); setOpen(true); }}
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label="Open photo gallery"
      />

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-bold text-white">
              {index + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X size={20} />
            </button>
          </div>

          {/* Image */}
          <div className="flex flex-1 items-center justify-center px-4 py-2">
            <img
              src={photos[index].src}
              alt={photos[index].alt}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
              {photos.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition ${
                    i === index ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
