import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com'),
  title: {
    default: 'Proppd | Real Property. Real Opportunities.',
    template: '%s | Proppd',
  },
  description:
    'Proppd is a modern South African prop-tech platform for real listings, verified enquiries, and agent-friendly property technology.',
  openGraph: {
    title: 'Proppd | Real Property. Real Opportunities.',
    description: 'Modern South African property technology for real listings and verified enquiries.',
    url: 'https://proppd.com',
    siteName: 'Proppd',
    images: [{ url: '/proppd-logo-horizontal.png', width: 1200, height: 315, alt: 'Proppd logo' }],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
