import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { CookieNotice } from '@/components/site/cookie-notice';
import { SavedHomesSync } from '@/components/properties/saved-homes-sync';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com'),
  title: {
    default: 'Proppd | Property for Sale & Rent in South Africa',
    template: '%s | Proppd',
  },
  description:
    'Search PPRA-verified property listings across South Africa. Buy, rent, and connect with verified estate agents on Proppd — South Africa\'s transparent property portal.',
  keywords: [
    'property for sale south africa',
    'property to rent south africa',
    'real estate south africa',
    'PPRA verified estate agents',
    'property portal',
    'houses for sale',
    'apartments for rent',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    title: 'Proppd | Real Property. Real Opportunities.',
    description:
      'Search PPRA-verified property listings across South Africa. Buy, rent, and connect with verified estate agents.',
    url: 'https://proppd.com',
    siteName: 'Proppd',
    images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd — South African property portal' }],
  },
  twitter: {
    card: 'summary_large_image',
    // TODO: add `site: '@proppd'` / `creator: '@proppd'` once the X/Twitter account exists.
    title: 'Proppd | Real Property. Real Opportunities.',
    description:
      'Search PPRA-verified property listings across South Africa.',
    images: ['/proppd-logo-horizontal.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  // TODO: once Google Search Console is set up, add:
  //   verification: { google: '<real-token-from-search-console>' }
  // A placeholder token verifies nothing, so it is omitted until the real one exists.
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SavedHomesSync />
        <CookieNotice />
      </body>
    </html>
  );
}
