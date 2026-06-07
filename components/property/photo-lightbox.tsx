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
  const [touchStart, setTouchStart] = useState<number | null>(null);

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
          <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
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

          {/* Image — swipeable on mobile */}
          <div
            className="flex flex-1 items-center justify-center px-2 py-1 sm:px-4 sm:py-2"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              setTouchStart(touch.clientX);
            }}
            onTouchEnd={(e) => {
              if (touchStart === null) return;
              const diff = touchStart - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) setIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
                else setIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
              }
              setTouchStart(null);
            }}
          >
            <img
              src={photos[index].src}
              alt={photos[index].alt}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Navigation — hidden on mobile (swipe instead) */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
                className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 sm:flex sm:h-12 sm:w-12"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
                className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 sm:flex sm:h-12 sm:w-12"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Thumbnails — scrollable on mobile */}
          {photos.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
              {photos.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg transition sm:h-16 sm:w-24 ${
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
