'use client';

import { useEffect } from 'react';
import { trackRecentlyViewed } from '@/components/properties/recently-viewed';

interface TrackingProps {
  slug: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  photo: string;
}

export function PropertyTracking({ slug, title, price, location, beds, baths, photo }: TrackingProps) {
  useEffect(() => {
    trackRecentlyViewed({ slug, title, price, location, beds, baths, photo });
  }, [slug, title, price, location, beds, baths, photo]);

  useEffect(() => {
    // Record a server-side view for agent performance stats (best-effort).
    const controller = new AbortController();
    fetch('/api/listings/view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, source: 'listing-page' }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => undefined);
    return () => controller.abort();
  }, [slug]);

  return null;
}
