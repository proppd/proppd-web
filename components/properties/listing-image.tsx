'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Renders a listing photo with a clean, branded fallback when the image is
// missing or fails to load — so cards never show a broken/empty box.
export function ListingImage({
  src,
  alt,
  gradient,
  className,
}: {
  src?: string;
  alt: string;
  gradient?: string;
  className?: string;
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
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
