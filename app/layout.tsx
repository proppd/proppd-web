import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com'),
  title: {
    default: 'Proppd | Real listings. Real leads. Fair property technology.',
    template: '%s | Proppd',
  },
  description:
    'Proppd connects South Africans with real listings, verified enquiries, and modern property professionals.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
