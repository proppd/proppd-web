'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

// Renders a listing photo with a clean, branded fallback when the image is
// missing or fails to load — so cards never show a broken/empty box.
// Uses next/image (fill) for automatic resizing, WebP/AVIF, and lazy loading.
// The parent element must be positioned (relative/absolute) for fill to work.
export function ListingImage({
  src,
  alt,
  gradient,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
}: {
  src?: string;
  alt: string;
  gradient?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient ?? 'from-[#1A1A2E] via-[#4A3AFF] to-[#60A5FA]'}`}>
        <span className="flex flex-col items-center gap-1.5 text-white/85">
          <ImageOff size={26} />
          <span className="text-xs font-bold uppercase tracking-wide">Photo coming soon</span>
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
