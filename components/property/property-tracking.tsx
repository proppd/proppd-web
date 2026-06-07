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

  return null;
}
