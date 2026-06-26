import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api', '/auth', '/saved', '/login', '/signup', '/account', '/my-properties', '/reset-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
