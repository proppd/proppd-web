import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  images: {
    // Optimized listing photos come from Unsplash (demo data), Sakstons
    // source listings, and Supabase Storage public URLs (agent uploads).
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.sakstons.com', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'sakstons.com', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
    ],
  },
};

export default nextConfig;
